package com.oakland.tutor.permissions

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings

class OverlayPermissionManager(private val context: Context) {

    fun isGranted(): Boolean = Settings.canDrawOverlays(context)

    fun request() {
        if (isGranted()) return
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${context.packageName}")
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }
}
