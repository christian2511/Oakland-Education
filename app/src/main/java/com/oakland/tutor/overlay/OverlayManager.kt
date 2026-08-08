package com.oakland.tutor.overlay

import android.content.Context
import android.util.DisplayMetrics
import android.view.WindowManager
import com.oakland.tutor.ink.AnnotationState
import com.oakland.tutor.tutor.SessionState

/**
 * Single owner of the three overlay windows and the current OverlayMode.
 * All mutations go through this class so mode transitions stay consistent.
 * Plan §10.
 */
class OverlayManager(
    private val context: Context,
    private val onBubbleTapped: () -> Unit,
    private val onAnnotationComplete: (AnnotationState) -> Unit,
) {
    private val windowManager: WindowManager =
        context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

    private val bubble = BubbleOverlay(context, windowManager) { onBubbleTapped() }
    private val card = TutorCardOverlay(context, windowManager)
    private val annotation = AnnotationOverlay(context, windowManager) { state ->
        setMode(OverlayMode.RESPONSE)
        onAnnotationComplete(state)
    }

    var mode: OverlayMode = OverlayMode.PASSIVE
        private set

    fun start() {
        bubble.attach()
        mode = OverlayMode.PASSIVE
    }

    fun stop() {
        annotation.detach()
        card.hide()
        bubble.detach()
        mode = OverlayMode.PASSIVE
    }

    fun updateSessionState(state: SessionState) {
        bubble.updateState(state)
    }

    fun setMode(next: OverlayMode) {
        if (next == mode) return
        when (next) {
            OverlayMode.PASSIVE -> {
                annotation.detach()
                card.hide()
            }
            OverlayMode.ANNOTATE -> {
                card.hide()
                annotation.attach()
            }
            OverlayMode.RESPONSE -> {
                annotation.detach()
            }
        }
        mode = next
    }

    fun showTutorCard(hint: String, normalizedX: Float, normalizedY: Float,
                      normalizedW: Float = 0.1f, normalizedH: Float = 0.07f) {
        val screen = screenSize()
        val target = OverlayCoordinateMapper.normalizedBboxToPixel(
            normalizedX - normalizedW / 2f,
            normalizedY - normalizedH / 2f,
            normalizedW, normalizedH, screen,
        )
        // Estimated card size; refined in-view once measured, but usable up-front.
        val estCard = OverlayCoordinateMapper.IntSize(width = 640, height = 220)
        val pos = OverlayCoordinateMapper.placeCard(estCard, target, screen)
        card.show(hint, pos.x, pos.y)
        mode = OverlayMode.RESPONSE
    }

    fun screenSize(): OverlayCoordinateMapper.IntSize {
        val metrics = DisplayMetrics()
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getRealMetrics(metrics)
        return OverlayCoordinateMapper.IntSize(metrics.widthPixels, metrics.heightPixels)
    }
}
