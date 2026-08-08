package com.oakland.tutor.capture

import android.graphics.Bitmap
import android.graphics.Color
import kotlin.math.abs

/**
 * Detects whether screen content has meaningfully changed between captures
 * by comparing downsampled (32x32) average luminance hashes.
 * Plan §18, §19 step 30.
 */
class FrameChangeDetector(
    private val thresholdRatio: Float = 0.05f,
    private val sampleSize: Int = 32,
) {
    private var lastHash: FloatArray? = null

    /**
     * Checks if [bitmap] differs significantly from the last observed frame.
     * Updates internal hash reference if significant change is detected or on first frame.
     */
    fun hasChanged(bitmap: Bitmap): Boolean {
        val currentHash = computeHash(bitmap)
        val prevHash = lastHash

        if (prevHash == null) {
            lastHash = currentHash
            return true
        }

        var totalDiff = 0f
        for (i in currentHash.indices) {
            totalDiff += abs(currentHash[i] - prevHash[i])
        }
        val avgDiff = totalDiff / currentHash.size

        return if (avgDiff >= thresholdRatio) {
            lastHash = currentHash
            true
        } else {
            false
        }
    }

    /**
     * Downsamples bitmap to sampleSize x sampleSize and extracts normalized luminance values (0..1).
     */
    private fun computeHash(bitmap: Bitmap): FloatArray {
        val scaled = Bitmap.createScaledBitmap(bitmap, sampleSize, sampleSize, true)
        val hash = FloatArray(sampleSize * sampleSize)
        val pixels = IntArray(sampleSize * sampleSize)
        scaled.getPixels(pixels, 0, sampleSize, 0, 0, sampleSize, sampleSize)
        if (scaled != bitmap) {
            scaled.recycle()
        }

        for (i in pixels.indices) {
            val color = pixels[i]
            val r = Color.red(color)
            val g = Color.green(color)
            val b = Color.blue(color)
            // Standard relative luminance formula
            hash[i] = (0.299f * r + 0.587f * g + 0.114f * b) / 255f
        }
        return hash
    }

    fun reset() {
        lastHash = null
    }
}
