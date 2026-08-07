package com.oakland.tutor.permissions

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import androidx.activity.result.ActivityResultLauncher

class MediaProjectionPermissionManager(private val context: Context) {

    private val manager: MediaProjectionManager =
        context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager

    private var launcher: ActivityResultLauncher<Intent>? = null

    fun attach(launcher: ActivityResultLauncher<Intent>) {
        this.launcher = launcher
    }

    fun request() {
        val l = launcher ?: error("MediaProjectionPermissionManager not attached to a launcher")
        l.launch(manager.createScreenCaptureIntent())
    }
}
