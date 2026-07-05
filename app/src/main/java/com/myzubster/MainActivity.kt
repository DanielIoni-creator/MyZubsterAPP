package com.myzubster

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.myzubster.activities.BookingHistoryActivity
import com.myzubster.payment.ui.PaymentActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Pulsanti
        val btnTest = findViewById<Button>(R.id.btnTest)
        val btnBookingHistory = findViewById<Button>(R.id.btnBookingHistory)
        val btnSettings = findViewById<Button>(R.id.btnSettings)

        // Test App
        btnTest.setOnClickListener {
            Toast.makeText(this, "✅ App funzionante!", Toast.LENGTH_SHORT).show()
        }

        // Storico Prenotazioni
        btnBookingHistory.setOnClickListener {
            // Usa un ID di test per ora
            val intent = Intent(this, BookingHistoryActivity::class.java)
            intent.putExtra("userId", "65f1a2b3c4d5e6f7g8h9i0j1")
            startActivity(intent)
        }

        // Impostazioni
        btnSettings.setOnClickListener {
            Toast.makeText(this, "⚙️ Impostazioni", Toast.LENGTH_SHORT).show()
        }
    }
}