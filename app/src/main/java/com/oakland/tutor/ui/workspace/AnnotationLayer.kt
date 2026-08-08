package com.oakland.tutor.ui.workspace

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.oakland.tutor.ink.AnnotationState
import com.oakland.tutor.workspace.PenColors

/**
 * Transient "circle this" layer. Only visible in Ask mode. Draws in red on
 * top of the work canvas without touching the persistent stroke list.
 * On pointer-up it fires [onStrokeComplete] so the controller can kick off
 * the capture → composite → upload flow.
 */
@Composable
fun AnnotationLayer(
    state: AnnotationState,
    onStrokeComplete: () -> Unit,
    modifier: Modifier = Modifier,
    strokeColor: Color = PenColors.AnnotationRed,
    strokeWidthDp: Float = 5f,
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
                    val e = awaitPointerEvent()
                    val p = e.changes.first()
                    if (!p.pressed) break
                    state.addPoint(p.position.x, p.position.y)
                    tick++
                    p.consume()
                    change = p
                }
                onStrokeComplete()
            }
        }
    ) {
        tick.let { _ ->
            val widthPx = strokeWidthDp.dp.toPx()
            state.strokes.forEach { s ->
                if (s.points.isEmpty()) return@forEach
                val path = Path().apply {
                    moveTo(s.points.first().x, s.points.first().y)
                    s.points.drop(1).forEach { lineTo(it.x, it.y) }
                }
                drawPath(
                    path = path,
                    color = strokeColor,
                    style = Stroke(
                        width = widthPx,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round,
                    ),
                )
            }
        }
    }
}
