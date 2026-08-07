package com.oakland.tutor.ink

/**
 * Purely-data representation of the student's ink strokes.
 * Uses raw screen-pixel coordinates so it composites cleanly onto the captured
 * frame at identical dimensions. Plan §11 Option B.
 */
class AnnotationState {

    data class Point(val x: Float, val y: Float)
    data class Stroke(val points: List<Point>)

    private val _strokes = mutableListOf<MutableList<Point>>()
    val strokes: List<Stroke> get() = _strokes.map { Stroke(it.toList()) }

    fun beginStroke() { _strokes.add(mutableListOf()) }
    fun addPoint(x: Float, y: Float) {
        (_strokes.lastOrNull() ?: run { beginStroke(); _strokes.last() }).add(Point(x, y))
    }
    fun clear() { _strokes.clear() }

    fun snapshot(): AnnotationState {
        val copy = AnnotationState()
        _strokes.forEach { s ->
            copy.beginStroke()
            s.forEach { copy.addPoint(it.x, it.y) }
        }
        return copy
    }
}
