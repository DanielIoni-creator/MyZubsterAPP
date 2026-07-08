package com.myzbuster.app.qr

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.MultiFormatWriter
import com.google.zxing.common.BitMatrix
import java.util.EnumMap

object QRCodeGenerator {
    
    private const val DEFAULT_SIZE = 400
    
    /**
     * Genera un QR Code da una stringa di dati
     */
    fun generateQRCode(
        data: String,
        size: Int = DEFAULT_SIZE,
        margin: Int = 1
    ): Bitmap? {
        return try {
            val hints = EnumMap<EncodeHintType, Any>(EncodeHintType::class.java)
            hints[EncodeHintType.MARGIN] = margin
            
            val writer = MultiFormatWriter()
            val bitMatrix: BitMatrix = writer.encode(
                data,
                BarcodeFormat.QR_CODE,
                size,
                size,
                hints
            )
            
            createBitmapFromMatrix(bitMatrix, size)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
    
    /**
     * Genera un QR Code da un oggetto QRCodeData
     */
    fun generateQRCode(qrData: QRCodeData, size: Int = DEFAULT_SIZE): Bitmap? {
        return generateQRCode(qrData.toJson(), size)
    }
    
    /**
     * Genera un QR Code per un indirizzo di pagamento
     */
    fun generatePaymentQR(
        address: String,
        amount: Double,
        bookingId: String,
        size: Int = DEFAULT_SIZE
    ): Bitmap? {
        val qrData = QRCodeData.forPayment(address, amount, bookingId)
        return generateQRCode(qrData, size)
    }
    
    /**
     * Genera un QR Code per il profilo utente
     */
    fun generateProfileQR(
        userId: String,
        username: String,
        size: Int = DEFAULT_SIZE
    ): Bitmap? {
        val qrData = QRCodeData.forUser(userId, username)
        return generateQRCode(qrData, size)
    }
    
    /**
     * Genera un QR Code per una prenotazione
     */
    fun generateBookingQR(
        bookingId: String,
        serviceName: String,
        size: Int = DEFAULT_SIZE
    ): Bitmap? {
        val qrData = QRCodeData.forBooking(bookingId, serviceName)
        return generateQRCode(qrData, size)
    }
    
    /**
     * Crea un Bitmap dalla BitMatrix
     */
    private fun createBitmapFromMatrix(matrix: BitMatrix, size: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
        
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(x, y, if (matrix[x, y]) Color.BLACK else Color.WHITE)
            }
        }
        
        return bitmap
    }
    
    /**
     * Genera QR con logo al centro (opzionale)
     */
    fun generateQRCodeWithLogo(
        data: String,
        logo: Bitmap,
        size: Int = DEFAULT_SIZE
    ): Bitmap? {
        val qrBitmap = generateQRCode(data, size) ?: return null
        
        val logoSize = (size * 0.2).toInt()
        val scaledLogo = Bitmap.createScaledBitmap(logo, logoSize, logoSize, true)
        
        val left = (size - logoSize) / 2
        val top = (size - logoSize) / 2
        
        val result = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
        val canvas = android.graphics.Canvas(result)
        canvas.drawBitmap(qrBitmap, 0f, 0f, null)
        canvas.drawBitmap(scaledLogo, left.toFloat(), top.toFloat(), null)
        
        return result
    }
}