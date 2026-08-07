package com.oakland.tutor.tutor

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class TutorResponse(
    val selection_detected: Boolean,
    val target_description: String,
    val point: NormalizedPoint,
    val bbox: NormalizedBox,
    val confidence: Float,
    val hint: String,
)

@JsonClass(generateAdapter = true)
data class NormalizedPoint(val x: Float, val y: Float)

@JsonClass(generateAdapter = true)
data class NormalizedBox(val x: Float, val y: Float, val width: Float, val height: Float)

@JsonClass(generateAdapter = true)
data class Geometry(
    val screen_width_px: Int,
    val screen_height_px: Int,
    val image_width_px: Int,
    val image_height_px: Int,
    val orientation: String,
    val density_dpi: Int,
)
