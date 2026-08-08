package com.oakland.tutor.ui.workspace

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
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
import com.oakland.tutor.workspace.InkStroke
import com.oakland.tutor.workspace.WorkspaceTool

/**
 * Persistent ink surface — the primary work area, styled like a Goodnotes
 * page (off-white background, light grid). Renders committed strokes plus
 * the in-progress stroke, and reports lifecycle to the controller.
 */
@Composable
fun WorkCanvas(
    strokes: List<InkStroke>,
    tool: WorkspaceTool,
    eraserRadiusDp: Float,
    onStrokeStart: () -> Unit,
    onStrokePoint: (Offset) -> Unit,
    onStrokeEnd: (InkStroke?) -> Unit,
    onErase: (Offset, Float) -> Unit,
    modifier: Modifier = Modifier,
) {
    // In-progress stroke state (Compose-only until pointer-up).
    var currentPoints by remember { mutableStateOf<List<Offset>>(emptyList()) }

    Canvas(
        modifier = modifier
            .background(Color(0xFFFAFAF7))
            .pointerInput(tool) {
                awaitEachGesture {
                    val down = awaitFirstDown(requireUnconsumed = false)
                    val startPoint = down.position
                    when (tool) {
                        is WorkspaceTool.Pen, is WorkspaceTool.Highlighter -> {
                            onStrokeStart()
                            currentPoints = listOf(startPoint)
                            onStrokePoint(startPoint)
                        }
                        is WorkspaceTool.Eraser -> {
                            onErase(startPoint, eraserRadiusDp)
                        }
                        is WorkspaceTool.Ask -> {
                            // Ask mode taps are handled by AnnotationLayer, not here.
                            return@awaitEachGesture
                        }
                    }
                    var change = down
                    while (change.pressed) {
                        val e = awaitPointerEvent()
                        val p = e.changes.first()
                        if (!p.pressed) break
                        when (tool) {
                            is WorkspaceTool.Pen, is WorkspaceTool.Highlighter -> {
                                currentPoints = currentPoints + p.position
                                onStrokePoint(p.position)
                            }
                            is WorkspaceTool.Eraser -> onErase(p.position, eraserRadiusDp)
                            is WorkspaceTool.Ask -> {}
                        }
                        p.consume()
                        change = p
                    }
                    val committed = when (tool) {
                        is WorkspaceTool.Pen -> InkStroke(
                            points = currentPoints,
                            color = tool.color,
                            widthDp = tool.widthDp,
                        )
                        is WorkspaceTool.Highlighter -> InkStroke(
                            points = currentPoints,
                            color = tool.color,
                            widthDp = tool.widthDp,
                            isHighlighter = true,
                        )
                        else -> null
                    }
                    currentPoints = emptyList()
                    onStrokeEnd(committed)
                }
            }
    ) {
        drawGrid()
        strokes.forEach { s -> drawStroke(s.points, s.color, s.widthDp.dp.toPx(), s.isHighlighter) }
        if (currentPoints.isNotEmpty()) {
            val (color, width, isHi) = when (tool) {
                is WorkspaceTool.Pen -> Triple(tool.color, tool.widthDp, false)
                is WorkspaceTool.Highlighter -> Triple(tool.color, tool.widthDp, true)
                else -> Triple(Color.Transparent, 0f, false)
            }
            if (width > 0f) drawStroke(currentPoints, color, width.dp.toPx(), isHi)
        }
    }
}

private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawStroke(
    pts: List<Offset>,
    color: Color,
    widthPx: Float,
    isHighlighter: Boolean,
) {
    if (pts.isEmpty()) return
    val path = Path().apply {
        moveTo(pts.first().x, pts.first().y)
        pts.drop(1).forEach { lineTo(it.x, it.y) }
    }
    drawPath(
        path = path,
        color = if (isHighlighter) color.copy(alpha = 0.35f) else color,
        style = Stroke(
            width = widthPx,
            cap = StrokeCap.Round,
            join = StrokeJoin.Round,
        )
    )
}

private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawGrid() {
    val gridPx = 40.dp.toPx()
    val stroke = 1f
    val color = Color(0xFFE5E5DC)
    var x = 0f
    while (x < size.width) {
        drawLine(color, Offset(x, 0f), Offset(x, size.height), stroke)
        x += gridPx
    }
    var y = 0f
    while (y < size.height) {
        drawLine(color, Offset(0f, y), Offset(size.width, y), stroke)
        y += gridPx
    }
}
