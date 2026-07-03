package com.myzubster.escrow

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.commit
import com.myzubster.R

class EscrowActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_escrow)

        // Ricevi i dati dalla chat
        val transactionId = intent.getStringExtra("transactionId")
        val amount = intent.getDoubleExtra("amount", 0.0)
        val professionalId = intent.getStringExtra("professionalId")
        val clientId = intent.getStringExtra("clientId")
        val description = intent.getStringExtra("description")

        // Carica il fragment di stato
        if (savedInstanceState == null) {
            supportFragmentManager.commit {
                replace(
                    R.id.fragment_container,
                    EscrowStatusFragment.newInstance(
                        transactionId,
                        amount,
                        professionalId,
                        clientId,
                        description
                    )
                )
            }
        }

        // Gestione back button
        findViewById<com.google.android.material.appbar.MaterialToolbar>(R.id.toolbar).setNavigationOnClickListener {
            onBackPressed()
        }
    }

    companion object {
        const val EXTRA_TRANSACTION_ID = "transactionId"
        const val EXTRA_AMOUNT = "amount"
        const val EXTRA_PROFESSIONAL_ID = "professionalId"
        const val EXTRA_CLIENT_ID = "clientId"
        const val EXTRA_DESCRIPTION = "description"
    }
}