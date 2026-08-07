package com.oakland.tutor.overlay

import android.content.Context
import android.graphics.PixelFormat
import android.view.Gravity
import android.view.WindowManager
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import com.oakland.tutor.ink.AnnotationState
import com.oakland.tutor.ink.InkCanvas

/**
 * Full-screen transparent touchable Canvas. Plan §4B, §5.
 *
 * Only attached to the window in ANNOTATE mode. In PASSIVE / RESPONSE it is
 * removed entirely so touches pass through to the underlying app.
 */
class AnnotationOverlay(
    private val context: Context,
    private val windowManager: WindowManager,
    private val onStrokeComplete: (AnnotationState) -> Unit,
) {

    private val state = AnnotationState()

    private val host = OverlayComposeHost(context).apply {
        setContent {
            InkCanvas(
                modifier = Modifier.fillMaxSize(),
                state = state,
                onStrokeComplete = { onStrokeComplete(state) },
            )
        }
    }

    private val params = WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
        PixelFormat.TRANSLUCENT,
    ).apply { gravity = Gravity.TOP or Gravity.START }

    private var attached = false

    fun attach() {
        if (attached) return
        state.clear()
        windowManager.addView(host.asView(), params)
        host.onAttached()
        attached = true
    }

    fun detach() {
        if (!attached) return
        try { windowManager.removeView(host.asView()) } catch (_: IllegalArgumentException) {}
        host.onDetached()
        attached = false
    }

    fun snapshotState(): AnnotationState = state.snapshot()
}
