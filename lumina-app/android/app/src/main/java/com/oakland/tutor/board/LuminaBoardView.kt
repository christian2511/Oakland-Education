package com.oakland.tutor.board

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.util.AttributeSet
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.widget.FrameLayout
import androidx.ink.brush.Brush
import androidx.ink.brush.InputToolType
import androidx.ink.brush.StockBrushes
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import androidx.ink.strokes.InProgressStroke
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import androidx.ink.strokes.StrokeInput
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

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
 *  1. [PaperSurface] child: warm-cream paper + optional ruled / grid / dot
 *     guides drawn with plain [Canvas] primitives.
 *  2. [BoardSurface] child: rasterises the live [InProgressStroke] plus the
 *     committed [Stroke]s of all three ink layers with [CanvasStrokeRenderer].
 *     Kept separate from the paper surface so its canvas is never touched by
 *     `drawLine` / `drawCircle` first.
 *
 * Authoring is done directly with [InProgressStroke] fed from [onTouchEvent]
 * and committed synchronously on ACTION_UP. We deliberately do NOT use
 * ink-authoring's InProgressStrokesView: its front-buffered low-latency
 * pipeline fails silently on emulators (live stroke never renders and
 * onStrokesFinished never fires, so strokes were authored but never drawn).
 * The plain-canvas path works everywhere; revisit front-buffering only with
 * real-hardware S Pen latency numbers in hand.
 *
 * No fallback: if androidx.ink can't initialise the View throws at
 * construction — intentional so the failure is visible.
 */
class LuminaBoardView(context: Context, attrs: AttributeSet? = null) :
    FrameLayout(context, attrs) {

    enum class Tool { PEN, MARKER, HIGHLIGHTER, ERASER }
    enum class Paper { BLANK, RULED, GRID, DOT }
    enum class Mode { WRITE, ANNOTATE }

    private sealed class Op {
        data class Add(val stroke: Stroke) : Op()
        data class Erase(val strokes: List<Stroke>) : Op()
    }

    // forcePathRendering: the default renderer draws with Canvas.drawMesh,
    // which never shows up on emulator GPUs. Path rendering is visually
    // equivalent at our brush sizes and works on every canvas.
    private val strokeRenderer: CanvasStrokeRenderer =
        CanvasStrokeRenderer.create(forcePathRendering = true)
    private val workStrokes: MutableList<Stroke> = ArrayList()
    private val annotationStrokes: MutableList<Stroke> = ArrayList()
    private val aiStrokes: MutableList<Stroke> = ArrayList()
    private var aiAlpha: Int = 255
    private var aiFade: ValueAnimator? = null
    var aiHoldMs: Long = 8000L
    private val undoStack: ArrayDeque<Op> = ArrayDeque()
    private val redoStack: ArrayDeque<Op> = ArrayDeque()

    private val paperSurface = PaperSurface(context)
    private val board = BoardSurface(context)

    var tool: Tool = Tool.PEN
    var mode: Mode = Mode.WRITE
    var paper: Paper = Paper.RULED
        set(value) { field = value; paperSurface.invalidate() }
    var guidesEnabled: Boolean = true
        set(value) { field = value; paperSurface.invalidate() }
    var penColor: Int = INK_DEFAULT
    var penSize: Float = 3.2f
    var eraserRadius: Float = 32f

    private var pointerId: Int = -1
    private var liveStroke: InProgressStroke? = null
    private var liveMode: Mode = Mode.WRITE
    private var lastX = Float.NaN
    private var lastY = Float.NaN
    private var lastT = -1L
    private val realInputs = MutableStrokeInputBatch()
    private val noPrediction = MutableStrokeInputBatch()
    private val pendingErase: MutableList<Stroke> = ArrayList()
    private val tmpInput = StrokeInput()

    init {
        // Force the FrameLayout itself to receive touch events even when its
        // children (PaperSurface, BoardSurface) don't consume them.
        isClickable = true
        isFocusable = true
        // Paper below, ink above — separate child views on purpose so the
        // stroke renderer's canvas is never mixed with line/circle draws.
        addView(paperSurface)
        addView(board)
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
                    val stroke = InProgressStroke()
                    stroke.start(brushForCurrentMode(event))
                    liveStroke = stroke
                    liveMode = mode
                    lastX = Float.NaN
                    lastY = Float.NaN
                    lastT = -1L
                    appendInputs(stroke, event)
                    board.invalidate()
                }
                true
            }
            MotionEvent.ACTION_MOVE -> {
                if (erasing()) {
                    eraseAt(event.x, event.y)
                } else {
                    val stroke = liveStroke ?: return false
                    appendInputs(stroke, event)
                    board.invalidate()
                }
                true
            }
            MotionEvent.ACTION_UP -> {
                if (erasing()) {
                    commitEraseIfAny()
                } else {
                    val stroke = liveStroke ?: return false
                    appendInputs(stroke, event)
                    stroke.finishInput()
                    stroke.updateShape(event.eventTime - event.downTime)
                    liveStroke = null
                    commitStroke(stroke.toImmutable(), liveMode)
                    emitStrokeEnd()
                }
                true
            }
            MotionEvent.ACTION_CANCEL -> {
                liveStroke = null
                pendingErase.clear()
                board.invalidate()
                true
            }
            else -> false
        }
    }

    private fun appendInputs(stroke: InProgressStroke, event: MotionEvent) {
        val index = event.findPointerIndex(pointerId)
        if (index < 0) return
        val toolType = when (event.getToolType(index)) {
            MotionEvent.TOOL_TYPE_STYLUS -> InputToolType.STYLUS
            MotionEvent.TOOL_TYPE_MOUSE -> InputToolType.MOUSE
            else -> InputToolType.TOUCH
        }
        realInputs.clear()
        for (h in 0 until event.historySize) {
            addPoint(
                toolType,
                event.getHistoricalX(index, h),
                event.getHistoricalY(index, h),
                event.getHistoricalEventTime(h) - event.downTime,
                event.getHistoricalPressure(index, h),
            )
        }
        addPoint(
            toolType,
            event.getX(index),
            event.getY(index),
            event.eventTime - event.downTime,
            event.getPressure(index),
        )
        try {
            stroke.enqueueInputs(realInputs, noPrediction)
        } catch (e: IllegalArgumentException) {
            // Out-of-order or otherwise invalid points (synthetic input
            // streams produce them) are safe to drop — the stroke keeps
            // its shape from the batches already accepted.
            Log.w(TAG, "enqueueInputs rejected a batch: ${e.message}")
        }
        stroke.updateShape(event.eventTime - event.downTime)
    }

    // The ink runtime rejects a whole batch if any point repeats the previous
    // one's position AND timestamp (taps and ACTION_UP echoes do this).
    private fun addPoint(toolType: InputToolType, x: Float, y: Float, t: Long, pressure: Float) {
        if (x == lastX && y == lastY && t == lastT) return
        // Named argument: add()'s 5th positional parameter is
        // strokeUnitLengthCm, not pressure. Passing pressure positionally put
        // it in the wrong slot — the pressure-pen brush never saw real stylus
        // pressure, and pressure-0 events tripped the native
        // "stroke_unit_length 1cm vs 0cm" batch rejection.
        realInputs.add(toolType, x, y, t, pressure = pressure)
        lastX = x
        lastY = y
        lastT = t
    }

    private fun commitStroke(stroke: Stroke, layer: Mode) {
        when (layer) {
            Mode.WRITE -> {
                workStrokes.add(stroke)
                undoStack.addLast(Op.Add(stroke))
                redoStack.clear()
                board.invalidate()
                emitStrokeCount()
            }
            Mode.ANNOTATE -> {
                annotationStrokes.add(stroke)
                board.invalidate()
                emitAnnotationChange()
            }
        }
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

    // ---------------------------------------------------- frame export (D-024)
    /**
     * Rasterizes paper + work + annotation — never the AI layer, the model
     * must not see its own ink — into a PNG in cacheDir, and emits
     * `onFrameExported {requestId, path, sceneGraph}`. The scene graph
     * carries per-stroke normalized bboxes so the backend can ground on
     * real geometry instead of guessing from pixels.
     */
    fun exportFrame(requestId: String) {
        val safeId = requestId.replace(Regex("[^A-Za-z0-9_-]"), "")
        if (width == 0 || height == 0 || safeId.isEmpty()) {
            emitFrameExported(safeId, null, null, "not_laid_out")
            return
        }
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val exportCanvas = Canvas(bitmap)
        // Software canvas: paper's drawLine/drawCircle and the stroke
        // renderer don't conflict here (the mesh-invisibility bug is
        // hardware-canvas-only, see PaperSurface).
        paperSurface.draw(exportCanvas)
        board.renderTo(exportCanvas, includeAi = false)
        val sceneGraph = buildSceneGraph().toString()
        Thread {
            try {
                val file = File(context.cacheDir, "lumina-frame-$safeId.png")
                FileOutputStream(file).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                }
                bitmap.recycle()
                post { emitFrameExported(safeId, "file://${file.absolutePath}", sceneGraph, null) }
            } catch (e: IOException) {
                bitmap.recycle()
                post { emitFrameExported(safeId, null, null, e.message ?: "io_error") }
            }
        }.start()
    }

    private fun buildSceneGraph(): JSONObject {
        val strokesJson = JSONArray()
        appendStrokes(strokesJson, workStrokes, "work", "w")
        appendStrokes(strokesJson, annotationStrokes, "annotation", "a")
        return JSONObject()
            .put("width_px", width)
            .put("height_px", height)
            .put("density", resources.displayMetrics.density.toDouble())
            .put("strokes", strokesJson)
    }

    private fun appendStrokes(out: JSONArray, list: List<Stroke>, layer: String, prefix: String) {
        val w = width.toFloat()
        val h = height.toFloat()
        for ((index, stroke) in list.withIndex()) {
            val inputs = stroke.inputs
            val n = inputs.size
            if (n == 0) continue
            var minX = Float.MAX_VALUE
            var minY = Float.MAX_VALUE
            var maxX = -Float.MAX_VALUE
            var maxY = -Float.MAX_VALUE
            var i = 0
            while (i < n) {
                inputs.populate(i, tmpInput)
                if (tmpInput.x < minX) minX = tmpInput.x
                if (tmpInput.y < minY) minY = tmpInput.y
                if (tmpInput.x > maxX) maxX = tmpInput.x
                if (tmpInput.y > maxY) maxY = tmpInput.y
                i++
            }
            out.put(
                JSONObject()
                    .put("id", "$prefix$index")
                    .put("layer", layer)
                    .put(
                        "bbox",
                        JSONObject()
                            .put("x", (minX / w).toDouble())
                            .put("y", (minY / h).toDouble())
                            .put("width", ((maxX - minX) / w).toDouble())
                            .put("height", ((maxY - minY) / h).toDouble()),
                    ),
            )
        }
    }

    private fun emitFrameExported(
        requestId: String,
        path: String?,
        sceneGraph: String?,
        error: String?,
    ) {
        val ctx = context as? ReactContext ?: return
        val payload = Arguments.createMap().apply {
            putString("requestId", requestId)
            if (path != null) putString("path", path)
            if (sceneGraph != null) putString("sceneGraph", sceneGraph)
            if (error != null) putString("error", error)
        }
        ctx.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onFrameExported", payload)
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

    // ------------------------------------------------------ paper + guides
    // Drawn on its own child View so its drawLine / drawCircle calls never
    // share a canvas with CanvasStrokeRenderer (which uses drawMesh and
    // renders as invisible when mixed with prior line draws on hardware).
    private inner class PaperSurface(context: Context) : View(context) {
        override fun onDraw(canvas: Canvas) {
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

    // ------------------------------------------------------- finished ink
    // Renders only committed strokes. Kept as a separate transparent child
    // so the CanvasStrokeRenderer draws to a canvas untouched by drawLine /
    // drawCircle — see PaperSurface for the reasoning.
    private inner class BoardSurface(context: Context) : View(context) {
        private val identity = Matrix()

        override fun onDraw(canvas: Canvas) {
            renderTo(canvas, includeAi = true)
            liveStroke?.let { strokeRenderer.draw(canvas, it, identity) }
        }

        fun renderTo(canvas: Canvas, includeAi: Boolean) {
            drawStrokes(canvas, workStrokes)
            if (includeAi && aiStrokes.isNotEmpty()) {
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
        private const val TAG = "LuminaBoard"
        // Noteshelf-inspired warm cream + hairline rules.
        private val PAPER_BG = 0xFFFBF7EE.toInt()
        private val RULE_COLOR = 0x1A2A3547.toInt()
        private val MARGIN_COLOR = 0x33C4685E.toInt()
        private val DOT_COLOR = 0x33253247.toInt()
        val INK_DEFAULT = 0xFF2C2836.toInt()
        private val ANNOTATION_RED = 0xFFFF3B30.toInt()
    }
}
