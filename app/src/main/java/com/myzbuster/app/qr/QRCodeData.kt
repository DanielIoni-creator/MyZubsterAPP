package com.myzbuster.app.qr

import com.google.gson.Gson

/**
 * Modello dati per il QR Code
 * Contiene tutte le informazioni che possono essere codificate
 */
data class QRCodeData(
    val type: QRType,
    val userId: String? = null,
    val bookingId: String? = null,
    val paymentAddress: String? = null,
    val amount: Double? = null,
    val serviceName: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val signature: String? = null // Per verificare l'autenticità
) {
    /**
     * Converte i dati in JSON per il QR
     */
    fun toJson(): String {
        return Gson().toJson(this)
    }
    
    companion object {
        /**
         * Crea un QR per il profilo utente
         */
        fun forUser(userId: String, username: String): QRCodeData {
            return QRCodeData(
                type = QRType.USER_PROFILE,
                userId = userId,
                serviceName = username
            )
        }
        
        /**
         * Crea un QR per un pagamento
         */
        fun forPayment(address: String, amount: Double, bookingId: String): QRCodeData {
            return QRCodeData(
                type = QRType.PAYMENT,
                paymentAddress = address,
                amount = amount,
                bookingId = bookingId
            )
        }
        
        /**
         * Crea un QR per una prenotazione
         */
        fun forBooking(bookingId: String, serviceName: String): QRCodeData {
            return QRCodeData(
                type = QRType.BOOKING,
                bookingId = bookingId,
                serviceName = serviceName
            )
        }
        
        /**
         * Decodifica un QR da JSON
         */
        fun fromJson(json: String): QRCodeData? {
            return try {
                Gson().fromJson(json, QRCodeData::class.java)
            } catch (e: Exception) {
                null
            }
        }
    }
}

/**
 * Tipi di QR Code supportati
 */
enum class QRType {
    USER_PROFILE,
    PAYMENT,
    BOOKING,
    SERVICE,
    CONTACT
}