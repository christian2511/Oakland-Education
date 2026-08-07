package com.oakland.tutor.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.oakland.tutor.MainActivity
import com.oakland.tutor.R
import com.oakland.tutor.tutor.TutorSession
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob

/**
 * Foreground service that owns all overlay windows. Started when the user
 * grants overlay permission and taps "Start". Plan §10.
 */
class TutorOverlayService : Service() {

    private lateinit var manager: OverlayManager
    private lateinit var session: TutorSession
    private val scope = CoroutineScope(SupervisorJob() + kotlinx.coroutines.Dispatchers.Main)

    override fun onCreate() {
        super.onCreate()
        startForegroundInternal()
        session = TutorSession(this, scope)
        manager = OverlayManager(
            this,
            onBubbleTapped = { manager.setMode(OverlayMode.ANNOTATE) },
            onAnnotationComplete = { state ->
                session.onAnnotationComplete(state, manager.screenSize()) { response ->
                    manager.showTutorCard(
                        hint = response.hint,
                        normalizedX = response.point.x,
                        normalizedY = response.point.y,
                        normalizedW = response.bbox.width,
                        normalizedH = response.bbox.height,
                    )
                }
            }
        )
        manager.start()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_DEV_SHOW_CARD -> {
                val nx = intent.getFloatExtra(EXTRA_NX, 0.5f)
                val ny = intent.getFloatExtra(EXTRA_NY, 0.5f)
                manager.showTutorCard(
                    hint = "Dev card at (${"%.2f".format(nx)}, ${"%.2f".format(ny)})",
                    normalizedX = nx,
                    normalizedY = ny,
                )
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        manager.stop()
        scope.coroutineContext[Job]?.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startForegroundInternal() {
        val channelId = getString(R.string.notif_channel_id)
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                getString(R.string.notif_channel_name),
                NotificationManager.IMPORTANCE_LOW,
            )
            nm.createNotificationChannel(channel)
        }
        val notif: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(getString(R.string.notif_overlay_title))
            .setContentText(getString(R.string.notif_overlay_text))
            .setSmallIcon(android.R.drawable.ic_menu_info_details)
            .setContentIntent(
                android.app.PendingIntent.getActivity(
                    this, 0, Intent(this, MainActivity::class.java),
                    android.app.PendingIntent.FLAG_IMMUTABLE,
                )
            )
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID,
                notif,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
            )
        } else {
            startForeground(NOTIFICATION_ID, notif)
        }
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val ACTION_DEV_SHOW_CARD = "com.oakland.tutor.DEV_SHOW_CARD"
        private const val EXTRA_NX = "nx"
        private const val EXTRA_NY = "ny"

        fun start(context: Context) {
            val intent = Intent(context, TutorOverlayService::class.java)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, TutorOverlayService::class.java))
        }

        fun devShowCard(context: Context, nx: Float, ny: Float) {
            val intent = Intent(context, TutorOverlayService::class.java).apply {
                action = ACTION_DEV_SHOW_CARD
                putExtra(EXTRA_NX, nx)
                putExtra(EXTRA_NY, ny)
            }
            context.startForegroundService(intent)
        }
    }
}
