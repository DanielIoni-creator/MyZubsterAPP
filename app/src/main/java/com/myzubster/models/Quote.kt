package com.myzubster.models

data class Quote(
    val id: String? = null,
    val bookingId: String,
    val amount: Double,
    val description: String? = null,
    val status: String = "pending", // pending, accepted, rejected
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class QuoteRequest(
    val bookingId: String,
    val amount: Double,
    val description: String? = null
)

data class QuoteResponse(
    val success: Boolean,
    val data: Quote?,
    val error: String?
)

data class QuoteListResponse(
    val success: Boolean,
    val data: List<Quote>?,
    val pagination: Pagination?,
    val error: String?
)