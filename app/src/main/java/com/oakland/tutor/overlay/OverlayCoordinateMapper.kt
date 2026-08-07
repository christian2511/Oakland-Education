package com.oakland.tutor.overlay

/**
 * Turns normalized backend coordinates into screen pixels and picks a card
 * placement that doesn't cover the target. Plan §13.
 *
 * All rectangles use top-left origin. `IntBox` is in device screen pixels.
 */
object OverlayCoordinateMapper {

    data class IntBox(val x: Int, val y: Int, val width: Int, val height: Int) {
        val right: Int get() = x + width
        val bottom: Int get() = y + height
    }

    data class IntSize(val width: Int, val height: Int)

    data class IntPoint(val x: Int, val y: Int)

    fun normalizedToPixel(nx: Float, ny: Float, screen: IntSize): IntPoint =
        IntPoint((nx * screen.width).toInt(), (ny * screen.height).toInt())

    fun normalizedBboxToPixel(
        nx: Float, ny: Float, nw: Float, nh: Float, screen: IntSize
    ): IntBox = IntBox(
        (nx * screen.width).toInt(),
        (ny * screen.height).toInt(),
        (nw * screen.width).toInt(),
        (nh * screen.height).toInt(),
    )

    /**
     * Place a card of [card] size relative to [target] within [screen].
     * Tries right → left → below → above; falls back to placement below the
     * target, then clamps into the screen.
     */
    fun placeCard(
        card: IntSize,
        target: IntBox,
        screen: IntSize,
        margin: Int = 16,
    ): IntPoint {
        val candidates = listOf(
            IntPoint(target.right + margin, target.y),                               // right
            IntPoint(target.x - card.width - margin, target.y),                      // left
            IntPoint(target.x, target.bottom + margin),                              // below
            IntPoint(target.x, target.y - card.height - margin),                     // above
        )
        val fitting = candidates.firstOrNull { fitsInScreen(it, card, screen) }
        val chosen = fitting ?: IntPoint(target.x, target.bottom + margin)
        return clamp(chosen, card, screen, margin)
    }

    private fun fitsInScreen(p: IntPoint, card: IntSize, screen: IntSize): Boolean =
        p.x >= 0 && p.y >= 0 && p.x + card.width <= screen.width && p.y + card.height <= screen.height

    private fun clamp(p: IntPoint, card: IntSize, screen: IntSize, margin: Int): IntPoint {
        val maxX = (screen.width - card.width - margin).coerceAtLeast(margin)
        val maxY = (screen.height - card.height - margin).coerceAtLeast(margin)
        return IntPoint(
            p.x.coerceIn(margin, maxX),
            p.y.coerceIn(margin, maxY),
        )
    }
}
