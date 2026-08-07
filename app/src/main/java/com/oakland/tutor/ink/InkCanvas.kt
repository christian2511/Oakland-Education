package com.oakland.tutor.ink

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp

/**
 * Compose Canvas that captures pointer input in screen-local coordinates and
 * writes into [state]. Repaints on stroke changes via [tick].
 */
@Composable
fun InkCanvas(
    modifier: Modifier = Modifier,
    state: AnnotationState,
    strokeColor: Color = Color(0xFFE94E1B),
    strokeWidthDp: Float = 4f,
    onStrokeComplete: () -> Unit,
) {
    var tick by remember { mutableIntStateOf(0) }

    Canvas(
        modifier = modifier.pointerInput(Unit) {
            awaitEachGesture {
                val down = awaitFirstDown()
                state.beginStroke()
                state.addPoint(down.position.x, down.position.y)
                tick++
                var change = down
                while (change.pressed) {
                    val event = awaitPointerEvent()
                    val ptr = event.changes.first()
                    if (!ptr.pressed) break
                    state.addPoint(ptr.position.x, ptr.position.y)
                    tick++
                    ptr.consume()
                    change = ptr
                }
                onStrokeComplete()
            }
        }
    ) {
        tick.let { _ ->
            val strokeWidthPx = strokeWidthDp.dp.toPx()
            state.strokes.forEach { stroke ->
                if (stroke.points.isEmpty()) return@forEach
                val path = Path().apply {
                    moveTo(stroke.points.first().x, stroke.points.first().y)
                    stroke.points.drop(1).forEach { lineTo(it.x, it.y) }
                }
                drawPath(
                    path = path,
                    color = strokeColor,
                    style = Stroke(
                        width = strokeWidthPx,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round,
                    )
                )
            }
        }
    }
}
