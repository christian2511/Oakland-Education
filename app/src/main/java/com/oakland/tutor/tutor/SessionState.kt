package com.oakland.tutor.tutor

/**
 * Explicit session state machine. Plan §19 step 31.
 */
enum class SessionState {
    IDLE,
    CAPTURING,
    AWAITING_RESPONSE,
    SHOWING_HINT,
}

/**
 * Record of an individual interaction during a tutoring session.
 */
data class InteractionRecord(
    val timestampMs: Long = System.currentTimeMillis(),
    val targetDescription: String,
    val hint: String,
    val pointX: Float,
    val pointY: Float,
)

/**
 * Aggregated summary of a tutoring session for teacher/student review.
 */
data class SessionSummaryData(
    val startTimeMs: Long = System.currentTimeMillis(),
    var endTimeMs: Long = System.currentTimeMillis(),
    val interactions: MutableList<InteractionRecord> = mutableListOf(),
) {
    val totalHints: Int get() = interactions.size
    val durationSeconds: Long get() = ((endTimeMs - startTimeMs) / 1000).coerceAtLeast(0)
}
