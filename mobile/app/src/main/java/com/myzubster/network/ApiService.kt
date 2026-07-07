package com.myzubster.network

import com.myzubster.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // =============================================
    // AUTH ENDPOINTS
    // =============================================
    
    @POST("api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>
    
    @POST("api/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<AuthResponse>
    
    @POST("api/auth/refresh")
    suspend fun refreshToken(
        @Body request: RefreshTokenRequest
    ): Response<AuthResponse>
    
    @POST("api/auth/logout")
    suspend fun logout(): Response<Void>

    // =============================================
    // USER ENDPOINTS
    // =============================================
    
    @GET("api/users/profile")
    suspend fun getProfile(): Response<UserResponse>
    
    @PUT("api/users/profile")
    suspend fun updateProfile(
        @Body request: UpdateProfileRequest
    ): Response<UserResponse>
    
    @GET("api/users/{id}")
    suspend fun getUserById(
        @Path("id") id: String
    ): Response<UserResponse>

    // =============================================
    // SKILL ENDPOINTS
    // =============================================
    
    @GET("api/skills")
    suspend fun getSkills(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("category") category: String? = null,
        @Query("search") search: String? = null
    ): Response<SkillsResponse>
    
    @GET("api/skills/{id}")
    suspend fun getSkillById(
        @Path("id") id: String
    ): Response<SkillResponse>
    
    @POST("api/skills")
    suspend fun createSkill(
        @Body request: CreateSkillRequest
    ): Response<SkillResponse>
    
    @PUT("api/skills/{id}")
    suspend fun updateSkill(
        @Path("id") id: String,
        @Body request: UpdateSkillRequest
    ): Response<SkillResponse>
    
    @DELETE("api/skills/{id}")
    suspend fun deleteSkill(
        @Path("id") id: String
    ): Response<SkillResponse>
    
    @GET("api/skills/categories")
    suspend fun getSkillCategories(): Response<SkillCategoriesResponse>

    // =============================================
    // BOOKING ENDPOINTS
    // =============================================
    
    @GET("api/bookings")
    suspend fun getBookings(
        @Query("status") status: String? = null,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<BookingsResponse>
    
    @GET("api/bookings/{id}")
    suspend fun getBookingById(
        @Path("id") id: String
    ): Response<BookingResponse>
    
    @POST("api/bookings")
    suspend fun createBooking(
        @Body request: CreateBookingRequest
    ): Response<BookingResponse>
    
    @PUT("api/bookings/{id}/status")
    suspend fun updateBookingStatus(
        @Path("id") id: String,
        @Body request: UpdateBookingStatusRequest
    ): Response<BookingResponse>
    
    @DELETE("api/bookings/{id}")
    suspend fun deleteBooking(
        @Path("id") id: String
    ): Response<BookingResponse>

    // =============================================
    // BOOKING HISTORY ENDPOINTS
    // =============================================
    
    @GET("api/bookings/history")
    suspend fun getBookingHistory(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<BookingHistoryResponse>

    // =============================================
    // QUOTES ENDPOINTS
    // =============================================
    
    @POST("api/quotes")
    suspend fun createQuote(
        @Body request: CreateQuoteRequest
    ): Response<QuoteResponse>
    
    @GET("api/quotes")
    suspend fun getQuotes(
        @Query("status") status: String? = null
    ): Response<QuotesResponse>
    
    @GET("api/quotes/{id}")
    suspend fun getQuoteById(
        @Path("id") id: String
    ): Response<QuoteResponse>
    
    @PUT("api/quotes/{id}/status")
    suspend fun updateQuoteStatus(
        @Path("id") id: String,
        @Body request: UpdateQuoteStatusRequest
    ): Response<QuoteResponse>
    
    @DELETE("api/quotes/{id}")
    suspend fun deleteQuote(
        @Path("id") id: String
    ): Response<QuoteResponse>

    // =============================================
    // PAYMENT ENDPOINTS
    // =============================================
    
    @POST("api/payments")
    suspend fun createPayment(
        @Body request: CreatePaymentRequest
    ): Response<PaymentResponse>
    
    @GET("api/payments/{id}/status")
    suspend fun getPaymentStatus(
        @Path("id") id: String
    ): Response<PaymentStatusResponse>

    // =============================================
    // ESCROW ENDPOINTS
    // =============================================
    
    @POST("api/escrow")
    suspend fun createEscrow(
        @Body request: EscrowRequest
    ): Response<EscrowResponse>
    
    @GET("api/escrow/{id}")
    suspend fun getEscrowById(
        @Path("id") id: String
    ): Response<EscrowResponse>
    
    @PUT("api/escrow/{id}/release")
    suspend fun releasePayment(
        @Path("id") id: String,
        @Body request: ReleasePaymentRequest
    ): Response<EscrowResponse>

    // =============================================
    // REVIEW ENDPOINTS
    // =============================================
    
    @POST("api/reviews")
    suspend fun createReview(
        @Body request: CreateReviewRequest
    ): Response<ReviewResponse>
    
    @GET("api/reviews/{id}")
    suspend fun getReviewById(
        @Path("id") id: String
    ): Response<ReviewResponse>
    
    @GET("api/reviews/user/{userId}")
    suspend fun getReviewsByUser(
        @Path("userId") userId: String,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<ReviewsResponse>
    
    @GET("api/reviews/target/{targetId}")
    suspend fun getReviewsByTarget(
        @Path("targetId") targetId: String,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<ReviewsResponse>
    
    @DELETE("api/reviews/{id}")
    suspend fun deleteReview(
        @Path("id") id: String
    ): Response<ReviewResponse>

    // =============================================
    // NOTIFICATION ENDPOINTS
    // =============================================
    
    @POST("api/notifications/register")
    suspend fun registerDeviceToken(
        @Body request: RegisterDeviceTokenRequest
    ): Response<RegisterDeviceTokenResponse>
    
    @DELETE("api/notifications/unregister")
    suspend fun unregisterDeviceToken(): Response<Void>

    // =============================================
    // MONERO PAYMENT ENDPOINTS
    // =============================================
    
    @POST("api/payment/monero/create")
    suspend fun createMoneroPayment(
        @Body request: CreateMoneroPaymentRequest
    ): Response<MoneroPaymentResponse>
    
    @GET("api/payment/monero/status/{paymentId}")
    suspend fun checkMoneroPaymentStatus(
        @Path("paymentId") paymentId: String
    ): Response<PaymentStatusResponse>
}