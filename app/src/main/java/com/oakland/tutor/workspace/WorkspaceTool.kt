package com.oakland.tutor.workspace

import androidx.compose.ui.graphics.Color

/**
 * The active pen / highlighter / eraser / AI mode in the in-app workspace.
 * See decision D-019 for the tool set.
 */
sealed interface WorkspaceTool {
    data class Pen(val color: Color, val widthDp: Float = 3f) : WorkspaceTool
    data class Highlighter(
        val color: Color = Color(0x88FFEB3B),
        val widthDp: Float = 24f,
    ) : WorkspaceTool
    data object Eraser : WorkspaceTool
    /** Ask AI — the next stroke goes onto the transient annotation layer. */
    data object Ask : WorkspaceTool
}

object PenColors {
    val Black = Color(0xFF111111)
    val Blue = Color(0xFF1E63FF)
    val Red = Color(0xFFE94E1B)
    val AnnotationRed = Color(0xFFE53935)

    val Quick: List<Color> = listOf(Black, Blue, Red)
}
