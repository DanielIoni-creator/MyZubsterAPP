package com.myzubster.network

import com.myzubster.BuildConfig
import com.myzubster.models.Skill
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import java.util.concurrent.TimeUnit

data class ApiPaymentCreateRequest(
    val amount: Double,
    val description: String,
    val sellerId: String,
    val confirmations: Int = 0
)

data class PaymentApiResponse(
    val paymentId: String,
    val address: String,
    val amount: Double? = null,
    val amountXmr: String,
    val amountAtomic: String? = null,
    val description: String? = null,
    val sellerId: String? = null,
    val requiredConfirmations: Int = 0,
    val status: String,
    val paidXmr: String? = null,
    val paidAtomic: String? = null,
    val confirmations: Int = 0,
    val txIds: List<String> = emptyList(),
    val uri: String? = null
)

data class PaymentWebhookRequest(
    val paymentId: String,
    val amountAtomic: String? = null,
    val paidAtomic: String? = null,
    val confirmations: Int = 0,
    val txIds: List<String> = emptyList()
)

interface ApiService {
    @GET("api/skills/{skillId}")
    suspend fun getSkillDetail(@Path("skillId") skillId: String): Skill

    @POST("api/payment/create")
    suspend fun createPayment(@Body request: ApiPaymentCreateRequest): PaymentApiResponse

    @GET("api/payment/status/{paymentId}")
    suspend fun getPaymentStatus(@Path("paymentId") paymentId: String): PaymentApiResponse

    @POST("api/payment/webhook")
    suspend fun updatePaymentFromWebhook(@Body request: PaymentWebhookRequest): PaymentApiResponse

    companion object {
        fun create(
            baseUrl: String = BuildConfig.API_BASE_URL,
            okHttpClient: OkHttpClient? = null
        ): ApiService {
            val client = okHttpClient ?: OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
                .build()

            return Retrofit.Builder()
                .baseUrl(baseUrl.trimEnd('/') + "/")
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
    }
}
