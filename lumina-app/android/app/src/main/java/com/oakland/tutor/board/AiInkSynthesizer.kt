package com.oakland.tutor.board

import android.graphics.Color
import android.util.Log
import androidx.ink.brush.Brush
import androidx.ink.brush.InputToolType
import androidx.ink.brush.StockBrushes
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin

/**
 * Turns the backend's semantic `ai_strokes` payload into androidx.ink
 * [Stroke]s. Quality is deliberately client-side (D-024): the model only
 * sends geometry (circle / arrow / underline in normalized 0..1 coords);
 * here we synthesize input batches that read hand-drawn — angular wobble,
 * closure overshoot, and a pressure taper the pressure-pen brush turns
 * into variable-width ink.
 */
object AiInkSynthesizer {

    private const val TAG = "AiInkSynthesizer"
    private const val DEFAULT_COLOR = 0xFFC4685E.toInt()
    private const val POINT_MS = 6L

    fun synthesize(
        payload: JSONObject,
        width: Float,
        height: Float,
        density: Float,
    ): List<Stroke> {
        val out = ArrayList<Stroke>()
        val arr: JSONArray = payload.optJSONArray("strokes") ?: return out
        for (i in 0 until arr.length()) {
            val s = arr.optJSONObject(i) ?: continue
            val brush = brushFor(s, density)
            try {
                when (s.optString("kind")) {
                    "circle" -> circle(s, width, height, brush)?.let(out::add)
                    "arrow" -> out.addAll(arrow(s, width, height, density, brush))
                    "underline" -> underline(s, width, height, brush)?.let(out::add)
                    // "label" lands with the vector-font phase; unknown kinds are skipped.
                }
            } catch (e: IllegalArgumentException) {
                // alpha07's native input validation rejects whole batches for
                // reasons outside our control; drop the one primitive instead
                // of losing the entire injection (and the UI command with it).
                Log.w(TAG, "ai stroke $i rejected: ${e.message}")
            }
        }
        return out
    }

    private fun brushFor(s: JSONObject, density: Float): Brush = Brush.createWithColorIntArgb(
        family = StockBrushes.pressurePen(),
        colorIntArgb = parseColor(s.optString("color")),
        size = (s.optDouble("width_dp", 4.0).toFloat() * density).coerceAtLeast(1f),
        epsilon = 0.1f,
    )

    private fun parseColor(hex: String?): Int {
        if (hex.isNullOrBlank()) return DEFAULT_COLOR
        return try {
            Color.parseColor(hex)
        } catch (_: IllegalArgumentException) {
            DEFAULT_COLOR
        }
    }

    private fun point(s: JSONObject, key: String, width: Float, height: Float): Pair<Float, Float>? {
        val p = s.optJSONObject(key) ?: return null
        if (!p.has("x") || !p.has("y")) return null
        return p.optDouble("x").toFloat() * width to p.optDouble("y").toFloat() * height
    }

    private fun stroke(brush: Brush, points: List<Triple<Float, Float, Float>>): Stroke {
        val batch = MutableStrokeInputBatch()
        var t = 0L
        for ((x, y, pressure) in points) {
            // Named argument: the 5th positional parameter of add() is
            // strokeUnitLengthCm, not pressure — passing the taper there makes
            // the native runtime reject the whole batch ("all inputs must
            // report the same stroke_unit_length").
            batch.add(InputToolType.STYLUS, x, y, t, pressure = pressure)
            t += POINT_MS
        }
        return Stroke(brush, batch)
    }

    /** Light in, fuller middle, light out — reads like a confident hand. */
    private fun taper(t: Float): Float = 0.3f + 0.4f * sin(Math.PI.toFloat() * t)

    private fun circle(s: JSONObject, width: Float, height: Float, brush: Brush): Stroke? {
        val (cx, cy) = point(s, "center", width, height) ?: return null
        val rx = s.optDouble("rx", 0.05).toFloat() * width
        val ry = s.optDouble("ry", 0.04).toFloat() * height
        if (rx <= 0f || ry <= 0f) return null

        val n = 84
        val startAngle = -1.9f
        val sweep = (2.0 * Math.PI).toFloat() + 0.55f
        val points = ArrayList<Triple<Float, Float, Float>>(n)
        for (i in 0 until n) {
            val t = i / (n - 1).toFloat()
            val angle = startAngle + sweep * t
            val wobble = 1f + 0.025f * sin(angle * 3f + 0.7f) + 0.015f * sin(angle * 7f)
            points.add(
                Triple(
                    cx + rx * wobble * cos(angle),
                    cy + ry * wobble * sin(angle),
                    taper(t),
                ),
            )
        }
        return stroke(brush, points)
    }

    private fun arrow(
        s: JSONObject,
        width: Float,
        height: Float,
        density: Float,
        brush: Brush,
    ): List<Stroke> {
        val (x0, y0) = point(s, "start", width, height) ?: return emptyList()
        val (x1, y1) = point(s, "end", width, height) ?: return emptyList()
        val len = hypot(x1 - x0, y1 - y0)
        if (len <= 0f) return emptyList()

        val n = 28
        val angle = atan2(y1 - y0, x1 - x0)
        val bow = 0.04f * len
        val shaft = ArrayList<Triple<Float, Float, Float>>(n)
        for (i in 0 until n) {
            val t = i / (n - 1).toFloat()
            // Ease-out spacing so the tip lands slower, like a real flick.
            val e = 1f - (1f - t) * (1f - t)
            val px = x0 + (x1 - x0) * e
            val py = y0 + (y1 - y0) * e
            val perp = sin(Math.PI.toFloat() * e) * bow
            shaft.add(
                Triple(
                    px + perp * sin(angle),
                    py - perp * cos(angle),
                    taper(t),
                ),
            )
        }

        val wing = minOf(0.28f * len, 16f * density)
        val spread = 0.5f
        val head = listOf(
            Triple(x1 - wing * cos(angle - spread), y1 - wing * sin(angle - spread), 0.45f),
            Triple(x1, y1, 0.65f),
            Triple(x1 - wing * cos(angle + spread), y1 - wing * sin(angle + spread), 0.4f),
        )
        return listOf(stroke(brush, shaft), stroke(brush, densify(head)))
    }

    private fun underline(s: JSONObject, width: Float, height: Float, brush: Brush): Stroke? {
        val (x0, y0) = point(s, "start", width, height) ?: return null
        val (x1, y1) = point(s, "end", width, height) ?: return null
        val len = hypot(x1 - x0, y1 - y0)
        if (len <= 0f) return null

        val n = 24
        val sag = 0.03f * len
        val points = ArrayList<Triple<Float, Float, Float>>(n)
        for (i in 0 until n) {
            val t = i / (n - 1).toFloat()
            points.add(
                Triple(
                    x0 + (x1 - x0) * t,
                    y0 + (y1 - y0) * t + sag * sin(Math.PI.toFloat() * t),
                    taper(t),
                ),
            )
        }
        return stroke(brush, points)
    }

    /** The brush needs a handful of inputs per segment to shade the taper. */
    private fun densify(corners: List<Triple<Float, Float, Float>>): List<Triple<Float, Float, Float>> {
        val out = ArrayList<Triple<Float, Float, Float>>()
        for (i in 0 until corners.size - 1) {
            val (ax, ay, ap) = corners[i]
            val (bx, by, bp) = corners[i + 1]
            val steps = 6
            for (j in 0 until steps) {
                val t = j / steps.toFloat()
                out.add(Triple(ax + (bx - ax) * t, ay + (by - ay) * t, ap + (bp - ap) * t))
            }
        }
        out.add(corners.last())
        return out
    }
}
