package com.oakland.tutor.network

import android.graphics.Bitmap
import com.oakland.tutor.BuildConfig
import com.oakland.tutor.tutor.Geometry
import com.oakland.tutor.tutor.TutorResponse
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.io.ByteArrayOutputStream
import java.util.concurrent.TimeUnit

object TutorClient {

    private val moshi: Moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val http: OkHttpClient = OkHttpClient.Builder()
        .callTimeout(30, TimeUnit.SECONDS)
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG)
                HttpLoggingInterceptor.Level.HEADERS else HttpLoggingInterceptor.Level.NONE
        })
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.TUTOR_BASE_URL)
        .client(http)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    private val api: TutorApi = retrofit.create(TutorApi::class.java)

    suspend fun query(image: Bitmap, geometry: Geometry): TutorResponse {
        val png = ByteArrayOutputStream().use { s ->
            image.compress(Bitmap.CompressFormat.PNG, 90, s); s.toByteArray()
        }
        val imagePart = MultipartBody.Part.createFormData(
            "image", "frame.png",
            png.toRequestBody("image/png".toMediaType()),
        )
        val geometryJson = moshi.adapter(Geometry::class.java).toJson(geometry)
        val geometryPart = geometryJson.toRequestBody("application/json".toMediaType())
        return api.query(imagePart, geometryPart)
    }
}
