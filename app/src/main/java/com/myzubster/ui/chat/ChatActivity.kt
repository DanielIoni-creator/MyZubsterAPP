package com.myzubster.ui.chat

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.myzubster.R
import com.myzubster.ui.dialogs.QuoteDialog
import com.myzubster.utils.UserSession

class ChatActivity : AppCompatActivity() {

    private lateinit var bookingId: String
    private lateinit var btnSendQuote: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        // Ricevi l'ID della prenotazione dall'Intent
        bookingId = intent.getStringExtra("bookingId") ?: ""

        // Inizializza il pulsante
        btnSendQuote = findViewById(R.id.btnSendQuote)

        // Mostra il pulsante solo se l'utente è un professionista
        if (UserSession.isProfessional(this)) {
            btnSendQuote.visibility = View.VISIBLE
            btnSendQuote.setOnClickListener {
                if (bookingId.isNotEmpty()) {
                    val quoteDialog = QuoteDialog(bookingId)
                    quoteDialog.show(supportFragmentManager, "quote_dialog")
                } else {
                    Toast.makeText(this, "ID prenotazione non valido", Toast.LENGTH_SHORT).show()
                }
            }
        } else {
            btnSendQuote.visibility = View.GONE
        }

        // ... il resto del codice della chat (es. caricamento messaggi)
    }

    // Funzione per ottenere il bookingId (se necessario)
    private fun getCurrentBookingId(): String {
        return bookingId
    }
}