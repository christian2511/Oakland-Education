package com.oakland.tutor.capture

import android.graphics.Bitmap
import android.media.Image
import android.media.ImageReader
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

/**
 * Bridges [ImageReader]'s async surface into a coroutine-friendly single-shot
 * `awaitLatest()`. Handles ImageReader row-padding correctly by copying pixel
 * rows into a Bitmap of the requested dimensions.
 */
class FrameReader(
    private val reader: ImageReader,
    private val width: Int,
    private val height: Int,
) : ImageReader.OnImageAvailableListener {

    @Volatile private var latest: Bitmap? = null
    private val waiters = mutableListOf<(Bitmap?) -> Unit>()
    private val lock = Any()

    override fun onImageAvailable(reader: ImageReader) {
        val image: Image? = try { reader.acquireLatestImage() } catch (_: Throwable) { null }
        if (image == null) return
        val bmp = imageToBitmap(image, width, height)
        image.close()

        val toDeliver: List<(Bitmap?) -> Unit>
        synchronized(lock) {
            latest = bmp
            toDeliver = waiters.toList()
            waiters.clear()
        }
        toDeliver.forEach { it(bmp) }
    }

    suspend fun awaitLatest(): Bitmap? = suspendCancellableCoroutine { cont ->
        val existing = synchronized(lock) { latest }
        if (existing != null) {
            cont.resume(existing)
            return@suspendCancellableCoroutine
        }
        val cb: (Bitmap?) -> Unit = { cont.resume(it) }
        synchronized(lock) { waiters.add(cb) }
        cont.invokeOnCancellation { synchronized(lock) { waiters.remove(cb) } }
    }

    private fun imageToBitmap(image: Image, w: Int, h: Int): Bitmap {
        val plane = image.planes[0]
        val buffer = plane.buffer
        val pixelStride = plane.pixelStride
        val rowStride = plane.rowStride
        val rowPadding = rowStride - pixelStride * w
        val paddedWidth = w + rowPadding / pixelStride
        val padded = Bitmap.createBitmap(paddedWidth, h, Bitmap.Config.ARGB_8888)
        padded.copyPixelsFromBuffer(buffer)
        return if (rowPadding == 0) padded
        else Bitmap.createBitmap(padded, 0, 0, w, h).also { padded.recycle() }
    }
}
