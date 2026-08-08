package com.oakland.tutor.ui.workspace

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.oakland.tutor.tutor.SessionState

/**
 * In-app AI dot. Draggable within [parentSize]. Tap fires [onTap]. Colored
 * by [state] so students know when a request is in flight. See D-020.
 */
@Composable
fun WorkspaceBubble(
    state: SessionState,
    parentSize: IntSize,
    onTap: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val density = LocalDensity.current
    val sizeDp = 52.dp
    val sizePx = with(density) { sizeDp.toPx() }
    // Default position: bottom-right, above nav bar.
    val defaultX = (parentSize.width - sizePx - with(density) { 24.dp.toPx() }).coerceAtLeast(0f)
    val defaultY = (parentSize.height - sizePx - with(density) { 120.dp.toPx() }).coerceAtLeast(0f)
    var offset by remember(parentSize) { mutableStateOf(Offset(defaultX, defaultY)) }
    var selfSize by remember { mutableStateOf(IntSize.Zero) }

    val target = when (state) {
        SessionState.IDLE -> Color(0xFF3F51B5)
        SessionState.CAPTURING -> Color(0xFFFF9800)
        SessionState.AWAITING_RESPONSE -> Color(0xFFFFC107)
        SessionState.SHOWING_HINT -> Color(0xFF4CAF50)
    }
    val bg by animateColorAsState(targetValue = target, label = "bubble-bg")

    Box(
        modifier = modifier
            .offset { IntOffset(offset.x.toInt(), offset.y.toInt()) }
            .size(sizeDp)
            .shadow(6.dp, CircleShape)
            .clip(CircleShape)
            .background(bg)
            .onGloballyPositioned { selfSize = it.size }
            .pointerInput(parentSize) {
                detectTapGestures(onTap = { onTap() })
            }
            .pointerInput(parentSize) {
                detectDragGestures { change, drag ->
                    change.consume()
                    val nx = (offset.x + drag.x)
                        .coerceIn(0f, (parentSize.width - selfSize.width).toFloat().coerceAtLeast(0f))
                    val ny = (offset.y + drag.y)
                        .coerceIn(0f, (parentSize.height - selfSize.height).toFloat().coerceAtLeast(0f))
                    offset = Offset(nx, ny)
                }
            },
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            Icons.Filled.AutoAwesome,
            contentDescription = "Ask AI",
            tint = Color.White,
        )
    }
}
