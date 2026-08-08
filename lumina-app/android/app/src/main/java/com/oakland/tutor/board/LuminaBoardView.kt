package com.oakland.tutor.board

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import android.widget.FrameLayout
import androidx.ink.authoring.InProgressStrokeId
import androidx.ink.authoring.InProgressStrokesFinishedListener
import androidx.ink.authoring.InProgressStrokesView
import androidx.ink.brush.Brush
import androidx.ink.brush.StockBrushes
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import androidx.ink.strokes.Stroke
import androidx.ink.strokes.StrokeInput
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import org.json.JSONException
import org.json.JSONObject

/**
 * Noteshelf-style handwriting board on top of androidx.ink.
 *
 * Three ink layers, bottom → top (D-024, Shared_Brain task 25):
 *  - work: the student's permanent ink. The only layer undo/eraser touch.
 *  - ai: tutor explanation ink, injected — never interactive, fades (phase 3).
 *  - annotation: fixed red "ask about this" ink, drawn only in ANNOTATE mode,
 *    cleared after every upload.
 *
 * Pipeline (bottom → top):
 *  1. [BoardSurface] child: paints the warm-cream paper + optional ruled/grid/
 *     dot guides, then rasterises the committed [Stroke]s of all three layers
 *     with [CanvasStrokeRenderer].
 *  2. [InProgressStrokesView] overlay: low-latency live stroke while the pen
 *     is down. When the stroke finishes we drain it out of the overlay into
 *     the layer it was started on so it stays visible under the same
 *     rendering pipeline.
 *
 * No fallback: if androidx.ink can't initialise the View throws at
 * construction — intentional so the failure is visible.
 */
class LuminaBoardView(context: Context, attrs: AttributeSet? = null) :
    FrameLayout(context, attrs), InProgressStrokesFinishedListener {

    enum class Tool { PEN, MARKER, HIGHLIGHTER, ERASER }
    enum class Paper { BLANK, RULED, GRID, DOT }
    enum class Mode { WRITE, ANNOTATE }

    private sealed class Op {
        data class Add(val stroke: Stroke) : Op()
        data class Erase(val strokes: List<Stroke>) : Op()
    }

    private val strokeRenderer: CanvasStrokeRenderer = CanvasStrokeRenderer.create()
    private val workStrokes: MutableList<Stroke> = ArrayList()
    private val annotationStrokes: MutableList<Stroke> = ArrayList()
    private val aiStrokes: MutableList<Stroke> = ArrayList()
    private var aiAlpha: Int = 255
    private var aiFade: ValueAnimator? = null
    var aiHoldMs: Long = 8000L
    private val undoStack: ArrayDeque<Op> = ArrayDeque()
    private val redoStack: ArrayDeque<Op> = ArrayDeque()
    private val strokeLayer: MutableMap<InProgressStrokeId, Mode> = HashMap()

    private val board = BoardSurface(context)
    private val ink = InProgressStrokesView(context)

    var tool: Tool = Tool.PEN
    var mode: Mode = Mode.WRITE
    var paper: Paper = Paper.RULED
        set(value) { field = value; board.invalidate() }
    var guidesEnabled: Boolean = true
        set(value) { field = value; board.invalidate() }
    var penColor: Int = INK_DEFAULT
    var penSize: Float = 3.2f
    var eraserRadius: Float = 32f

    private var pointerId: Int = -1
    private var currentStrokeId: InProgressStrokeId? = null
    private val pendingErase: MutableList<Stroke> = ArrayList()
    private val tmpInput = StrokeInput()

    init {
        // Force the FrameLayout itself to receive touch events even when its
        // children (BoardSurface, InProgressStrokesView) don't consume them.
        isClickable = true
        isFocusable = true
        addView(board)
        addView(ink)
        ink.addFinishedStrokesListener(this)
    }

    // ------------------------------------------------------------- brushes
    private fun activeBrush(event: MotionEvent): Brush {
        // pressurePen modulates line width by pressure. Finger touches on
        // Android report constant / zero pressure, so pressurePen renders a
        // zero-width (invisible) line for fingers. Fall back to the
        // constant-width marker family whenever the input is not a real
        // stylus so finger drawing works out of the box.
        val isStylus = event.getToolType(0) == MotionEvent.TOOL_TYPE_STYLUS
        return when (tool) {
            Tool.PEN -> Brush.createWithColorIntArgb(
                family = if (isStylus) StockBrushes.pressurePen() else StockBrushes.marker(),
                colorIntArgb = penColor,
                size = penSize,
                epsilon = 0.1f,
            )
            Tool.MARKER -> Brush.createWithColorIntArgb(
                family = StockBrushes.marker(),
                colorIntArgb = penColor,
                size = maxOf(penSize * 2.4f, 6f),
                epsilon = 0.1f,
            )
            Tool.HIGHLIGHTER -> Brush.createWithColorIntArgb(
                family = StockBrushes.marker(),
                // Force alpha to ~40% so overlapping strokes read like highlighter.
                colorIntArgb = (penColor and 0x00FFFFFF) or 0x66000000.toInt(),
                size = maxOf(penSize * 5f, 16f),
                epsilon = 0.1f,
            )
            // Eraser is hit-tested locally — the ink authoring path is unused.
            Tool.ERASER -> Brush.createWithColorIntArgb(
                family = StockBrushes.marker(),
                colorIntArgb = Color.TRANSPARENT,
                size = eraserRadius,
                epsilon = 0.1f,
            )
        }
    }

    // ANNOTATE ignores tool/color selection: always the fixed red marker.
    private fun annotationBrush(): Brush = Brush.createWithColorIntArgb(
        family = StockBrushes.marker(),
        colorIntArgb = ANNOTATION_RED,
        size = 6f,
        epsilon = 0.1f,
    )

    private fun brushForCurrentMode(event: MotionEvent): Brush =
        if (mode == Mode.ANNOTATE) annotationBrush() else activeBrush(event)

    private fun erasing(): Boolean = mode == Mode.WRITE && tool == Tool.ERASER

    // --------------------------------------------------------------- touch
    override fun onTouchEvent(event: MotionEvent): Boolean {
        return when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                pointerId = event.getPointerId(0)
                if (erasing()) {
                    eraseAt(event.x, event.y)
                } else {
                    val id = ink.startStroke(event, pointerId, brushForCurrentMode(event))
                    currentStrokeId = id
                    strokeLayer[id] = mode
                }
                true
            }
            MotionEvent.ACTION_MOVE -> {
                if (erasing()) {
                    eraseAt(event.x, event.y)
                } else {
                    val id = currentStrokeId ?: return false
                    ink.addToStroke(event, pointerId, id)
                }
                true
            }
            MotionEvent.ACTION_UP -> {
                if (erasing()) {
                    commitEraseIfAny()
                } else {
                    val id = currentStrokeId ?: return false
                    ink.finishStroke(event, pointerId, id)
                    currentStrokeId = null
                    emitStrokeEnd()
                }
                true
            }
            MotionEvent.ACTION_CANCEL -> {
                val id = currentStrokeId
                if (id != null) {
                    ink.cancelStroke(id, event)
                    strokeLayer.remove(id)
                }
                currentStrokeId = null
                pendingErase.clear()
                true
            }
            else -> false
        }
    }

    // ------------------------------------------------------------ ink drain
    override fun onStrokesFinished(strokesMap: Map<InProgressStrokeId, Stroke>) {
        if (strokesMap.isEmpty()) return
        var workChanged = false
        var annotationChanged = false
        for ((id, s) in strokesMap) {
            when (strokeLayer.remove(id) ?: Mode.WRITE) {
                Mode.WRITE -> {
                    workStrokes.add(s)
                    undoStack.addLast(Op.Add(s))
                    workChanged = true
                }
                Mode.ANNOTATE -> {
                    annotationStrokes.add(s)
                    annotationChanged = true
                }
            }
        }
        if (workChanged) redoStack.clear()
        ink.removeFinishedStrokes(strokesMap.keys)
        board.invalidate()
        if (workChanged) emitStrokeCount()
        if (annotationChanged) emitAnnotationChange()
    }

    // ------------------------------------------------------------- eraser
    private fun eraseAt(x: Float, y: Float) {
        val r2 = eraserRadius * eraserRadius
        val iter = workStrokes.iterator()
        var changed = false
        while (iter.hasNext()) {
            val s = iter.next()
            if (strokeIntersectsPoint(s, x, y, r2)) {
                pendingErase.add(s)
                iter.remove()
                changed = true
            }
        }
        if (changed) {
            board.invalidate()
            emitStrokeCount()
        }
    }

    private fun strokeIntersectsPoint(stroke: Stroke, x: Float, y: Float, r2: Float): Boolean {
        val inputs = stroke.inputs
        val n = inputs.size
        var i = 0
        while (i < n) {
            inputs.populate(i, tmpInput)
            val dx = tmpInput.x - x
            val dy = tmpInput.y - y
            if (dx * dx + dy * dy <= r2) return true
            i++
        }
        return false
    }

    private fun commitEraseIfAny() {
        if (pendingErase.isEmpty()) return
        undoStack.addLast(Op.Erase(pendingErase.toList()))
        redoStack.clear()
        pendingErase.clear()
    }

    // --------------------------------------------------------- public API
    fun undo() {
        val op = undoStack.removeLastOrNull() ?: return
        when (op) {
            is Op.Add -> workStrokes.remove(op.stroke)
            is Op.Erase -> workStrokes.addAll(op.strokes)
        }
        redoStack.addLast(op)
        board.invalidate()
        emitStrokeCount()
    }

    fun redo() {
        val op = redoStack.removeLastOrNull() ?: return
        when (op) {
            is Op.Add -> workStrokes.add(op.stroke)
            is Op.Erase -> workStrokes.removeAll(op.strokes.toHashSet())
        }
        undoStack.addLast(op)
        board.invalidate()
        emitStrokeCount()
    }

    fun clear() {
        if (workStrokes.isEmpty()) return
        undoStack.addLast(Op.Erase(ArrayList(workStrokes)))
        redoStack.clear()
        workStrokes.clear()
        board.invalidate()
        emitStrokeCount()
    }

    fun clearAnnotation() {
        if (annotationStrokes.isEmpty()) return
        annotationStrokes.clear()
        board.invalidate()
        emitAnnotationChange()
    }

    fun clearAi() {
        aiFade?.cancel()
        aiFade = null
        if (aiStrokes.isEmpty()) return
        aiStrokes.clear()
        aiAlpha = 255
        board.invalidate()
    }

    /**
     * Payload (task 25 / D-024 contract, normalized 0..1 coords):
     * {"strokes":[{kind: circle|arrow|underline, center/rx/ry | start/end,
     * color, width_dp}...], "holdMs": 8000?}. Replace semantics: a new
     * injection drops whatever AI ink was still showing.
     */
    fun injectAiInk(payloadJson: String) {
        if (width == 0 || height == 0) return
        val payload = try {
            JSONObject(payloadJson)
        } catch (_: JSONException) {
            return
        }
        val synthesized = AiInkSynthesizer.synthesize(
            payload,
            width.toFloat(),
            height.toFloat(),
            resources.displayMetrics.density,
        )
        clearAi()
        if (synthesized.isEmpty()) return
        aiStrokes.addAll(synthesized)
        aiAlpha = 255
        board.invalidate()
        startAiFade(payload.optLong("holdMs", aiHoldMs))
    }

    private fun startAiFade(holdMs: Long) {
        val fade = ValueAnimator.ofInt(255, 0).apply {
            startDelay = holdMs.coerceAtLeast(0L)
            duration = 800
            addUpdateListener {
                aiAlpha = it.animatedValue as Int
                board.invalidate()
            }
            addListener(object : AnimatorListenerAdapter() {
                private var canceled = false
                override fun onAnimationCancel(animation: Animator) {
                    canceled = true
                }

                override fun onAnimationEnd(animation: Animator) {
                    if (canceled) return
                    aiFade = null
                    aiStrokes.clear()
                    aiAlpha = 255
                    board.invalidate()
                }
            })
        }
        aiFade = fade
        fade.start()
    }

    override fun onDetachedFromWindow() {
        aiFade?.cancel()
        aiFade = null
        super.onDetachedFromWindow()
    }

    // ---------------------------------------------------------- RN events
    private fun emitStrokeEnd() {
        val ctx = context as? ReactContext ?: return
        ctx.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onStrokeEnd", Arguments.createMap())
    }

    private fun emitStrokeCount() {
        val ctx = context as? ReactContext ?: return
        val payload = Arguments.createMap().apply {
            putInt("count", workStrokes.size)
            putBoolean("canUndo", undoStack.isNotEmpty())
            putBoolean("canRedo", redoStack.isNotEmpty())
        }
        ctx.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onStrokeCountChange", payload)
    }

    private fun emitAnnotationChange() {
        val ctx = context as? ReactContext ?: return
        val payload = Arguments.createMap().apply {
            putInt("count", annotationStrokes.size)
        }
        ctx.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onAnnotationChange", payload)
    }

    // --------------------------------------------------- paper + finished ink
    private inner class BoardSurface(context: Context) : View(context) {
        private val identity = Matrix()

        override fun onDraw(canvas: Canvas) {
            drawPaper(canvas)
            drawStrokes(canvas, workStrokes)
            if (aiStrokes.isNotEmpty()) {
                // CanvasStrokeRenderer has no per-draw alpha; fade via layer alpha.
                val checkpoint = canvas.saveLayerAlpha(
                    0f, 0f, width.toFloat(), height.toFloat(), aiAlpha,
                )
                drawStrokes(canvas, aiStrokes)
                canvas.restoreToCount(checkpoint)
            }
            drawStrokes(canvas, annotationStrokes)
        }

        private fun drawStrokes(canvas: Canvas, list: List<Stroke>) {
            val n = list.size
            var i = 0
            while (i < n) {
                strokeRenderer.draw(canvas, list[i], identity)
                i++
            }
        }

        private fun drawPaper(canvas: Canvas) {
            canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paperFill)
            if (!guidesEnabled) return
            when (paper) {
                Paper.BLANK -> Unit
                Paper.RULED -> drawRuled(canvas)
                Paper.GRID -> drawGrid(canvas)
                Paper.DOT -> drawDots(canvas)
            }
        }

        private fun drawRuled(canvas: Canvas) {
            val step = 44f
            var y = step * 1.5f
            while (y < height) {
                canvas.drawLine(0f, y, width.toFloat(), y, ruleLine)
                y += step
            }
            val marginX = 72f
            canvas.drawLine(marginX, 0f, marginX, height.toFloat(), marginLine)
        }

        private fun drawGrid(canvas: Canvas) {
            val step = 32f
            var x = step
            while (x < width) {
                canvas.drawLine(x, 0f, x, height.toFloat(), ruleLine)
                x += step
            }
            var y = step
            while (y < height) {
                canvas.drawLine(0f, y, width.toFloat(), y, ruleLine)
                y += step
            }
        }

        private fun drawDots(canvas: Canvas) {
            val step = 26f
            var x = step
            while (x < width) {
                var y = step
                while (y < height) {
                    canvas.drawCircle(x, y, 1.1f, dotFill)
                    y += step
                }
                x += step
            }
        }
    }

    private val paperFill = Paint().apply {
        color = PAPER_BG
        style = Paint.Style.FILL
    }
    private val ruleLine = Paint().apply {
        color = RULE_COLOR
        strokeWidth = 1f
        isAntiAlias = true
    }
    private val marginLine = Paint().apply {
        color = MARGIN_COLOR
        strokeWidth = 1.4f
        isAntiAlias = true
    }
    private val dotFill = Paint().apply {
        color = DOT_COLOR
        isAntiAlias = true
        style = Paint.Style.FILL
    }

    companion object {
        // Noteshelf-inspired warm cream + hairline rules.
        private val PAPER_BG = 0xFFFBF7EE.toInt()
        private val RULE_COLOR = 0x1A2A3547.toInt()
        private val MARGIN_COLOR = 0x33C4685E.toInt()
        private val DOT_COLOR = 0x33253247.toInt()
        val INK_DEFAULT = 0xFF2C2836.toInt()
        private val ANNOTATION_RED = 0xFFFF3B30.toInt()
    }
}
