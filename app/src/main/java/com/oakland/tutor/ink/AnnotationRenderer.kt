package com.oakland.tutor.ink

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path

/**
 * Renders an AnnotationState onto a raw Android Canvas at the given scale.
 * Used by FrameComposer to overlay strokes on the captured screen Bitmap.
 */
object AnnotationRenderer {

    fun render(
        canvas: Canvas,
        state: AnnotationState,
        strokeColor: Int = Color.rgb(0xE9, 0x4E, 0x1B),
        strokeWidthPx: Float = 8f,
        scaleX: Float = 1f,
        scaleY: Float = 1f,
    ) {
        val paint = Paint().apply {
            isAntiAlias = true
            color = strokeColor
            style = Paint.Style.STROKE
            strokeWidth = strokeWidthPx
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
        }
        state.strokes.forEach { stroke ->
            if (stroke.points.isEmpty()) return@forEach
            val path = Path().apply {
                val first = stroke.points.first()
                moveTo(first.x * scaleX, first.y * scaleY)
                stroke.points.drop(1).forEach { lineTo(it.x * scaleX, it.y * scaleY) }
            }
            canvas.drawPath(path, paint)
        }
    }
}
