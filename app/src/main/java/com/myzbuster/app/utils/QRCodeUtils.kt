package com.myzbuster.app.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.widget.ImageView
import com.myzbuster.app.qr.QRCodeGenerator
import java.io.File
import java.io.FileOutputStream

object QRCodeUtils {
    
    /**
     * Mostra un QR in un ImageView
     */
    fun displayQRCode(context: Context, data: String, imageView: ImageView, size: Int = 400) {
        val qrBitmap = QRCodeGenerator.generateQRCode(data, size)
        qrBitmap?.let {
            imageView.setImageBitmap(it)
        }
    }
    
    /**
     * Crea un QR con overlay di testo sotto
     */
    fun createQRWithText(
        data: String,
        text: String,
        size: Int = 400,
        textSize: Float = 20f
    ): Bitmap? {
        val qrBitmap = QRCodeGenerator.generateQRCode(data, size) ?: return null
        
        val padding = 40
        val totalHeight = size + padding + textSize.toInt() + 20
        val result = Bitmap.createBitmap(size, totalHeight, Bitmap.Config.RGB_565)
        val canvas = Canvas(result)
        
        canvas.drawColor(Color.WHITE)
        canvas.drawBitmap(qrBitmap, 0f, 0f, null)
        
        val paint = Paint().apply {
            color = Color.BLACK
            this.textSize = textSize
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        
        val x = (size / 2).toFloat()
        val y = (size + padding + textSize).toFloat()
        canvas.drawText(text, x, y, paint)
        
        return result
    }
    
    /**
     * Salva un QR su file
     */
    fun saveQRToFile(context: Context, bitmap: Bitmap, fileName: String): String? {
        return try {
            val file = File(context.filesDir, fileName)
            val outputStream = FileOutputStream(file)
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
            outputStream.close()
            file.absolutePath
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
    
    /**
     * Condividi un QR via intent
     */
    fun shareQRCode(context: Context, bitmap: Bitmap) {
        try {
            val path = saveQRToFile(context, bitmap, "qr_code.png")
            if (path != null) {
                val uri = androidx.core.content.FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    File(path)
                )
                
                val shareIntent = android.content.Intent().apply {
                    action = android.content.Intent.ACTION_SEND
                    putExtra(android.content.Intent.EXTRA_STREAM, uri)
                    type = "image/png"
                    addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                
                context.startActivity(android.content.Intent.createChooser(shareIntent, "Condividi QR Code"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}