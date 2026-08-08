package com.oakland.tutor.overlay

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.PixelFormat
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.oakland.tutor.tutor.SessionState
import kotlin.math.abs

/**
 * Small persistent draggable bubble. TYPE_APPLICATION_OVERLAY, WRAP_CONTENT so
 * it does not intercept touches outside its own rectangle. Plan §4A.
 * Displays state feedback based on [SessionState].
 */
class BubbleOverlay(
    private val context: Context,
    private val windowManager: WindowManager,
    private val onTap: () -> Unit,
) {
    private var currentState by mutableStateOf(SessionState.IDLE)

    private val host = OverlayComposeHost(context).apply {
        setContent {
            val (bgColor, label) = when (currentState) {
                SessionState.IDLE -> Color(0xFF3F51B5) to "AI"
                SessionState.CAPTURING -> Color(0xFFFF9800) to "..."
                SessionState.AWAITING_RESPONSE -> Color(0xFFFFC107) to "..."
                SessionState.SHOWING_HINT -> Color(0xFF4CAF50) to "💡"
            }
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(bgColor),
                contentAlignment = Alignment.Center,
            ) {
                Text(label, color = Color.White, style = MaterialTheme.typography.labelLarge)
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
    ).apply {
        gravity = Gravity.TOP or Gravity.START
        x = 40
        y = 200
    }

    private var attached = false

    fun updateState(state: SessionState) {
        currentState = state
    }

    @SuppressLint("ClickableViewAccessibility")
    fun attach() {
        if (attached) return
        host.asView().setOnTouchListener(DragTouch())
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

    private inner class DragTouch : View.OnTouchListener {
        private var startX = 0
        private var startY = 0
        private var touchStartX = 0f
        private var touchStartY = 0f
        private var moved = false

        override fun onTouch(v: View, event: MotionEvent): Boolean {
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    startX = params.x
                    startY = params.y
                    touchStartX = event.rawX
                    touchStartY = event.rawY
                    moved = false
                    return true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = event.rawX - touchStartX
                    val dy = event.rawY - touchStartY
                    if (abs(dx) > TOUCH_SLOP || abs(dy) > TOUCH_SLOP) moved = true
                    params.x = (startX + dx).toInt()
                    params.y = (startY + dy).toInt()
                    windowManager.updateViewLayout(host.asView(), params)
                    return true
                }
                MotionEvent.ACTION_UP -> {
                    if (!moved) onTap()
                    v.performClick()
                    return true
                }
            }
            return false
        }
    }

    companion object {
        private const val TOUCH_SLOP = 8
    }
}
