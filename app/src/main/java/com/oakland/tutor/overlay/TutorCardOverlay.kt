package com.oakland.tutor.overlay

import android.content.Context
import android.graphics.PixelFormat
import android.view.Gravity
import android.view.WindowManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/**
 * Floating hint card positioned near a target on screen. Plan §4C.
 * Position is set by OverlayCoordinateMapper via [move].
 */
class TutorCardOverlay(
    private val context: Context,
    private val windowManager: WindowManager,
) {
    private val text = mutableStateOf("")

    private val host = OverlayComposeHost(context).apply {
        setContent {
            Box(
                modifier = Modifier
                    .widthIn(max = 260.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xF2222831))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
            ) {
                Text(text.value, color = Color.White)
            }
        }
    }

    private val params = WindowManager.LayoutParams(
        WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT,
    ).apply { gravity = Gravity.TOP or Gravity.START }

    private var attached = false

    fun show(hint: String, x: Int, y: Int) {
        text.value = hint
        params.x = x
        params.y = y
        if (!attached) {
            windowManager.addView(host.asView(), params)
            host.onAttached()
            attached = true
        } else {
            windowManager.updateViewLayout(host.asView(), params)
        }
    }

    fun move(x: Int, y: Int) {
        if (!attached) return
        params.x = x
        params.y = y
        windowManager.updateViewLayout(host.asView(), params)
    }

    fun hide() {
        if (!attached) return
        try { windowManager.removeView(host.asView()) } catch (_: IllegalArgumentException) {}
        host.onDetached()
        attached = false
    }
}
