package com.oakland.tutor.workspace

import android.content.Context
import android.content.res.Configuration
import androidx.compose.ui.geometry.Offset
import com.oakland.tutor.capture.FrameComposer
import com.oakland.tutor.capture.ScreenCaptureService
import com.oakland.tutor.ink.AnnotationState
import com.oakland.tutor.network.TutorClient
import com.oakland.tutor.tutor.Geometry
import com.oakland.tutor.tutor.InteractionRecord
import com.oakland.tutor.tutor.NormalizedBox
import com.oakland.tutor.tutor.NormalizedPoint
import com.oakland.tutor.tutor.SessionState
import com.oakland.tutor.tutor.SessionSummaryData
import com.oakland.tutor.tutor.TutorResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * State holder + orchestrator for the in-app workspace. Replaces the old
 * `OverlayManager` + `TutorOverlayService` combo. Lives inside the workspace
 * screen scope; no `WindowManager`, no foreground service.
 *
 * Concurrency: all mutations happen on the main dispatcher via the passed
 * `scope`. Capture + upload jump to IO/Default as needed.
 */
class WorkspaceController(
    private val context: Context,
    private val scope: CoroutineScope,
) {
    // ---- Tool state ----
    private val _tool = MutableStateFlow<WorkspaceTool>(WorkspaceTool.Pen(PenColors.Black))
    val tool: StateFlow<WorkspaceTool> = _tool.asStateFlow()

    // ---- Work canvas (persistent ink) ----
    private val _workStrokes = MutableStateFlow<List<InkStroke>>(emptyList())
    val workStrokes: StateFlow<List<InkStroke>> = _workStrokes.asStateFlow()
    private val undone: ArrayDeque<InkStroke> = ArrayDeque()

    // ---- Annotation layer (transient red "circle this") ----
    private val _annotationVisible = MutableStateFlow(false)
    val annotationVisible: StateFlow<Boolean> = _annotationVisible.asStateFlow()
    val annotationState = AnnotationState()

    // ---- Session state + hint ----
    private val _sessionState = MutableStateFlow(SessionState.IDLE)
    val sessionState: StateFlow<SessionState> = _sessionState.asStateFlow()

    private val _hint = MutableStateFlow<HintPlacement?>(null)
    val hint: StateFlow<HintPlacement?> = _hint.asStateFlow()

    val summary = SessionSummaryData()

    data class HintPlacement(
        val response: TutorResponse,
        val screenSize: CoordinateMapper.IntSize,
    )

    // ---- Tool selection ----
    fun selectTool(next: WorkspaceTool) {
        _tool.value = next
        _annotationVisible.value = next is WorkspaceTool.Ask
        if (next !is WorkspaceTool.Ask) annotationState.clear()
    }

    // ---- Persistent ink ----
    fun addStroke(stroke: InkStroke) {
        _workStrokes.value = _workStrokes.value + stroke
        undone.clear()
    }

    fun undo() {
        val list = _workStrokes.value
        if (list.isEmpty()) return
        undone.addLast(list.last())
        _workStrokes.value = list.dropLast(1)
    }

    fun redo() {
        if (undone.isEmpty()) return
        _workStrokes.value = _workStrokes.value + undone.removeLast()
    }

    fun clearWork() {
        undone.clear()
        _workStrokes.value = emptyList()
    }

    /** Stroke-eraser: drop any work stroke whose bounding box the eraser touched. */
    fun eraseAt(point: Offset, radius: Float) {
        val kept = _workStrokes.value.filter { stroke ->
            stroke.points.none { it.distanceTo(point) <= radius }
        }
        if (kept.size != _workStrokes.value.size) _workStrokes.value = kept
    }

    private fun Offset.distanceTo(o: Offset): Float {
        val dx = x - o.x
        val dy = y - o.y
        return kotlin.math.sqrt(dx * dx + dy * dy)
    }

    // ---- Ask AI flow ----
    /**
     * Called by AnnotationLayer when the student lifts their finger after
     * drawing an annotation stroke.
     */
    fun onAnnotationComplete(canvasSize: CoordinateMapper.IntSize) {
        if (_sessionState.value == SessionState.CAPTURING ||
            _sessionState.value == SessionState.AWAITING_RESPONSE) return
        scope.launch { runAskFlow(canvasSize) }
    }

    fun dismissHint() { _hint.value = null; _sessionState.value = SessionState.IDLE }

    private suspend fun runAskFlow(canvasSize: CoordinateMapper.IntSize) {
        _sessionState.value = SessionState.CAPTURING
        val screen = ScreenCaptureService.current()
        val frame = screen?.captureOnce()
        if (frame == null) {
            deliver(errorResponse("Screen capture not available"), canvasSize)
            return
        }
        val composite = withContext(Dispatchers.Default) {
            FrameComposer.compose(frame, annotationState.snapshot())
        }
        _sessionState.value = SessionState.AWAITING_RESPONSE
        val geometry = Geometry(
            screen_width_px = canvasSize.width,
            screen_height_px = canvasSize.height,
            image_width_px = composite.width,
            image_height_px = composite.height,
            orientation = orientation(),
            density_dpi = context.resources.displayMetrics.densityDpi,
        )
        val response = try {
            withContext(Dispatchers.IO) { TutorClient.query(composite, geometry) }
        } catch (t: Throwable) {
            errorResponse("Tutor request failed: ${t.message}")
        }
        annotationState.clear()
        _annotationVisible.value = false
        deliver(response, canvasSize)
    }

    private fun deliver(response: TutorResponse, canvasSize: CoordinateMapper.IntSize) {
        if (response.selection_detected) {
            summary.interactions.add(
                InteractionRecord(
                    targetDescription = response.target_description,
                    hint = response.hint,
                    pointX = response.point.x,
                    pointY = response.point.y,
                )
            )
        }
        summary.endTimeMs = System.currentTimeMillis()
        _hint.value = HintPlacement(response, canvasSize)
        _sessionState.value = SessionState.SHOWING_HINT
        // Return the tool to the pen so the student can keep writing.
        val previousTool = _tool.value
        if (previousTool is WorkspaceTool.Ask) selectTool(WorkspaceTool.Pen(PenColors.Black))
    }

    private fun orientation(): String =
        when (context.resources.configuration.orientation) {
            Configuration.ORIENTATION_LANDSCAPE -> "landscape"
            else -> "portrait"
        }

    private fun errorResponse(msg: String): TutorResponse = TutorResponse(
        selection_detected = false,
        target_description = "error",
        point = NormalizedPoint(0.5f, 0.5f),
        bbox = NormalizedBox(0.45f, 0.45f, 0.1f, 0.1f),
        confidence = 0f,
        hint = msg,
    )
}
