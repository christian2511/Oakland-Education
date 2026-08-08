package com.oakland.tutor.workspace

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color

/**
 * A single ink stroke in the persistent work canvas. Pixel coordinates are
 * relative to the workspace layout (top-left origin).
 */
data class InkStroke(
    val points: List<Offset>,
    val color: Color,
    val widthDp: Float,
    val isHighlighter: Boolean = false,
)
