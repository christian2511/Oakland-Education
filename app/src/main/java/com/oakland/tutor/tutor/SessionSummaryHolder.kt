package com.oakland.tutor.tutor

/**
 * Process-scoped holder for the most recent SessionSummaryData so the Summary
 * screen can render it even after the workspace scope has been torn down.
 * Post-refactor replacement for the equivalent companion object on the old
 * TutorSession class.
 */
object SessionSummaryHolder {
    @Volatile
    private var last: SessionSummaryData? = null

    fun set(summary: SessionSummaryData) { last = summary }
    fun get(): SessionSummaryData? = last
}
