package com.oakland.tutor.workspace

/**
 * Turns normalized backend coordinates into workspace pixels and picks a card
 * placement that doesn't cover the target. Reuses the in-app screen size —
 * the workspace fills the display, so screen space and workspace space are
 * effectively the same (minus system bars, handled by insets in Compose).
 *
 * See plan §13 for the algorithm.
 */
object CoordinateMapper {

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

    /** Right → left → below → above → clamp. */
    fun placeCard(
        card: IntSize,
        target: IntBox,
        screen: IntSize,
        margin: Int = 16,
    ): IntPoint {
        val candidates = listOf(
            IntPoint(target.right + margin, target.y),
            IntPoint(target.x - card.width - margin, target.y),
            IntPoint(target.x, target.bottom + margin),
            IntPoint(target.x, target.y - card.height - margin),
        )
        val chosen = candidates.firstOrNull { fits(it, card, screen) }
            ?: IntPoint(target.x, target.bottom + margin)
        return clamp(chosen, card, screen, margin)
    }

    private fun fits(p: IntPoint, card: IntSize, screen: IntSize): Boolean =
        p.x >= 0 && p.y >= 0 &&
            p.x + card.width <= screen.width &&
            p.y + card.height <= screen.height

    private fun clamp(p: IntPoint, card: IntSize, screen: IntSize, margin: Int): IntPoint {
        val maxX = (screen.width - card.width - margin).coerceAtLeast(margin)
        val maxY = (screen.height - card.height - margin).coerceAtLeast(margin)
        return IntPoint(
            p.x.coerceIn(margin, maxX),
            p.y.coerceIn(margin, maxY),
        )
    }
}
