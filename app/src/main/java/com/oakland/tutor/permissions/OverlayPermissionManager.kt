package com.oakland.tutor.permissions

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.util.Log
import android.widget.Toast

class OverlayPermissionManager(private val context: Context) {

    fun isGranted(): Boolean = Settings.canDrawOverlays(context)

    fun request() {
        if (isGranted()) {
            Log.i(TAG, "Overlay permission already granted")
            Toast.makeText(context, "Overlay permission already granted", Toast.LENGTH_SHORT).show()
            return
        }
        val perApp = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${context.packageName}")
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(perApp)
            Log.i(TAG, "Launched per-app overlay settings")
        } catch (_: ActivityNotFoundException) {
            val listFallback = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            try {
                context.startActivity(listFallback)
                Log.i(TAG, "Launched overlay settings list (fallback)")
            } catch (e: ActivityNotFoundException) {
                Log.e(TAG, "No settings activity handles ACTION_MANAGE_OVERLAY_PERMISSION", e)
                Toast.makeText(
                    context,
                    "This device has no overlay-permission settings screen",
                    Toast.LENGTH_LONG,
                ).show()
            }
        }
    }

    private companion object {
        const val TAG = "OverlayPermission"
    }
}
