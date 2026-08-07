package com.oakland.tutor.capture

import android.graphics.Bitmap
import android.graphics.Canvas
import com.oakland.tutor.ink.AnnotationRenderer
import com.oakland.tutor.ink.AnnotationState

/**
 * Renders an [AnnotationState] onto a copy of the captured [screen] Bitmap at
 * identical pixel dimensions, producing the composite inference image.
 * Plan §11 Option B.
 */
object FrameComposer {

    fun compose(
        screen: Bitmap,
        annotation: AnnotationState,
        strokeWidthPx: Float = 8f,
    ): Bitmap {
        val out = screen.copy(Bitmap.Config.ARGB_8888, /* isMutable = */ true)
        val canvas = Canvas(out)
        AnnotationRenderer.render(
            canvas = canvas,
            state = annotation,
            strokeWidthPx = strokeWidthPx,
            scaleX = 1f,
            scaleY = 1f,
        )
        return out
    }
}
