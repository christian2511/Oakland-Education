package com.oakland.tutor.tutor

import android.content.Context
import android.content.res.Configuration
import com.oakland.tutor.capture.FrameComposer
import com.oakland.tutor.capture.ScreenCaptureService
import com.oakland.tutor.ink.AnnotationState
import com.oakland.tutor.network.TutorClient
import com.oakland.tutor.overlay.OverlayCoordinateMapper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Orchestrates: capture → composite → upload → hand response back to overlay.
 * The overlay layer decides where to render the returned point.
 */
class TutorSession(
    private val context: Context,
    private val scope: CoroutineScope,
) {

    fun onAnnotationComplete(
        annotation: AnnotationState,
        screen: OverlayCoordinateMapper.IntSize,
        onResult: (TutorResponse) -> Unit,
    ) {
        scope.launch {
            val capture = ScreenCaptureService.current()
            val screenBitmap = capture?.captureOnce() ?: run {
                onResult(errorResponse("Screen capture not available")); return@launch
            }
            val composite = withContext(Dispatchers.Default) {
                FrameComposer.compose(screenBitmap, annotation.snapshot())
            }
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
            onResult(response)
        }
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
