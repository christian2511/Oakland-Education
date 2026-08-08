package com.oakland.tutor.network

import com.oakland.tutor.tutor.TutorResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface TutorApi {
    @Multipart
    @POST("v1/tutor/query")
    suspend fun query(
        @Part image: MultipartBody.Part,
        @Part("geometry") geometry: RequestBody,
    ): TutorResponse
}
