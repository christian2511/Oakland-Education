package com.oakland.tutor.capture

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Handler
import android.os.HandlerThread
import android.util.DisplayMetrics
import android.view.WindowManager

class MediaProjectionController(private val context: Context) {

    private val projectionManager: MediaProjectionManager =
        context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager

    private var projection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private var handlerThread: HandlerThread? = null
    private var handler: Handler? = null
    private lateinit var frameReader: FrameReader

    fun start(resultCode: Int, data: Intent) {
        val proj = projectionManager.getMediaProjection(resultCode, data)
            ?: error("MediaProjection was not granted")
        proj.registerCallback(object : MediaProjection.Callback() {
            override fun onStop() { stop() }
        }, null)
        projection = proj

        val metrics = DisplayMetrics()
        val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        @Suppress("DEPRECATION")
        wm.defaultDisplay.getRealMetrics(metrics)

        val reader = ImageReader.newInstance(
            metrics.widthPixels,
            metrics.heightPixels,
            android.graphics.PixelFormat.RGBA_8888,
            2,
        )
        imageReader = reader
        frameReader = FrameReader(reader, metrics.widthPixels, metrics.heightPixels)

        val ht = HandlerThread("oakland-capture").apply { start() }
        handlerThread = ht
        handler = Handler(ht.looper)
        reader.setOnImageAvailableListener(frameReader, handler)

        virtualDisplay = proj.createVirtualDisplay(
            "oakland-tutor-capture",
            metrics.widthPixels,
            metrics.heightPixels,
            metrics.densityDpi,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            reader.surface,
            null,
            handler,
        )
    }

    suspend fun captureOnce(): Bitmap? = frameReader.awaitLatest()

    fun stop() {
        virtualDisplay?.release(); virtualDisplay = null
        imageReader?.close(); imageReader = null
        projection?.stop(); projection = null
        handlerThread?.quitSafely(); handlerThread = null
        handler = null
    }
}
