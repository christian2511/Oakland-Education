package com.oakland.tutor.tutor

import android.content.Context
import android.content.res.Configuration
import com.oakland.tutor.capture.FrameChangeDetector
import com.oakland.tutor.capture.FrameComposer
import com.oakland.tutor.capture.ScreenCaptureService
import com.oakland.tutor.ink.AnnotationState
import com.oakland.tutor.network.TutorClient
import com.oakland.tutor.overlay.OverlayCoordinateMapper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Orchestrates: capture → composite → upload → hand response back to overlay.
 * Maintains session state machine, periodic frame change monitoring, and interaction summary history.
 * Plan §18, §19 Phase 7.
 */
class TutorSession(
    private val context: Context,
    private val scope: CoroutineScope,
) {
    private val _state = MutableStateFlow(SessionState.IDLE)
    val state: StateFlow<SessionState> = _state.asStateFlow()

    val summaryData = SessionSummaryData()
    private val frameDetector = FrameChangeDetector()
    private var monitoringJob: Job? = null

    fun onAnnotationComplete(
        annotation: AnnotationState,
        screen: OverlayCoordinateMapper.IntSize,
        onResult: (TutorResponse) -> Unit,
    ) {
        scope.launch {
            _state.value = SessionState.CAPTURING
            val capture = ScreenCaptureService.current()
            val screenBitmap = capture?.captureOnce() ?: run {
                _state.value = SessionState.IDLE
                onResult(errorResponse("Screen capture not available"))
                return@launch
            }

            val composite = withContext(Dispatchers.Default) {
                FrameComposer.compose(screenBitmap, annotation.snapshot())
            }

            _state.value = SessionState.AWAITING_RESPONSE
            val geometry = Geometry(
                screen_width_px = screen.width,
                screen_height_px = screen.height,
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

            if (response.selection_detected) {
                summaryData.interactions.add(
                    InteractionRecord(
                        targetDescription = response.target_description,
                        hint = response.hint,
                        pointX = response.point.x,
                        pointY = response.point.y,
                    )
                )
            }
            summaryData.endTimeMs = System.currentTimeMillis()

            _state.value = SessionState.SHOWING_HINT
            onResult(response)
        }
    }

    /**
     * Periodic frame change monitoring loop (Plan §18, §19 step 30).
     * Periodically captures frames and invokes [onFrameChanged] only when the screen content changes.
     */
    fun startPeriodicMonitoring(
        intervalMs: Long = 3000L,
        onFrameChanged: suspend (FrameChangeDetector) -> Unit,
    ) {
        stopPeriodicMonitoring()
        monitoringJob = scope.launch {
            while (isActive) {
                delay(intervalMs)
                if (_state.value != SessionState.IDLE) continue
                val capture = ScreenCaptureService.current() ?: continue
                val frame = capture.captureOnce() ?: continue
                if (frameDetector.hasChanged(frame)) {
                    onFrameChanged(frameDetector)
                }
            }
        }
    }

    fun stopPeriodicMonitoring() {
        monitoringJob?.cancel()
        monitoringJob = null
    }

    fun setState(newState: SessionState) {
        _state.value = newState
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

    companion object {
        @Volatile private var activeSessionSummary: SessionSummaryData? = null

        fun setLastSummary(summary: SessionSummaryData) {
            activeSessionSummary = summary
        }

        fun getLastSummary(): SessionSummaryData? = activeSessionSummary
    }
}
