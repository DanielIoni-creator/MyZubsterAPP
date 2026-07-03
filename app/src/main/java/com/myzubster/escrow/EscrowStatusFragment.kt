package com.myzubster.escrow

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.myzubster.R
import com.myzubster.models.Escrow
import com.myzubster.network.ApiClient
import com.myzubster.utils.TokenManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class EscrowStatusFragment : Fragment() {

    private lateinit var tvStatus: TextView
    private lateinit var tvStatusDate: TextView
    private lateinit var tvTransactionId: TextView
    private lateinit var tvAmount: TextView
    private lateinit var tvClient: TextView
    private lateinit var tvProfessional: TextView
    private lateinit var tvFee: TextView
    private lateinit var tvNetAmount: TextView
    private lateinit var tvDescription: TextView
    private lateinit var btnAction: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var tvError: TextView

    private var transactionId: String? = null
    private var amount: Double = 0.0
    private var professionalId: String? = null
    private var clientId: String? = null
    private var description: String? = null
    private var currentEscrow: Escrow? = null

    companion object {
        fun newInstance(
            transactionId: String?,
            amount: Double,
            professionalId: String?,
            clientId: String?,
            description: String?
        ): EscrowStatusFragment {
            val fragment = EscrowStatusFragment()
            val args = Bundle()
            args.putString("transactionId", transactionId)
            args.putDouble("amount", amount)
            args.putString("professionalId", professionalId)
            args.putString("clientId", clientId)
            args.putString("description", description)
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_escrow_status, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Inizializza view
        tvStatus = view.findViewById(R.id.tvStatus)
        tvStatusDate = view.findViewById(R.id.tvStatusDate)
        tvTransactionId = view.findViewById(R.id.tvTransactionId)
        tvAmount = view.findViewById(R.id.tvAmount)
        tvClient = view.findViewById(R.id.tvClient)
        tvProfessional = view.findViewById(R.id.tvProfessional)
        tvFee = view.findViewById(R.id.tvFee)
        tvNetAmount = view.findViewById(R.id.tvNetAmount)
        tvDescription = view.findViewById(R.id.tvDescription)
        btnAction = view.findViewById(R.id.btnAction)
        progressBar = view.findViewById(R.id.progressBar)
        tvError = view.findViewById(R.id.tvError)

        // Recupera dati
        arguments?.let {
            transactionId = it.getString("transactionId")
            amount = it.getDouble("amount")
            professionalId = it.getString("professionalId")
            clientId = it.getString("clientId")
            description = it.getString("description")
        }

        if (transactionId != null) {
            loadEscrowStatus()
        } else {
            tvError.text = "ID transazione non valido"
            tvError.visibility = View.VISIBLE
        }
    }

    private fun loadEscrowStatus() {
        progressBar.visibility = View.VISIBLE
        tvError.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getEscrowStatus(transactionId!!)
                if (response.success && response.data != null) {
                    currentEscrow = response.data
                    updateUI(response.data)
                } else {
                    tvError.text = response.error ?: "Errore nel caricamento"
                    tvError.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                tvError.text = "Errore di connessione: ${e.message}"
                tvError.visibility = View.VISIBLE
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }

    private fun updateUI(escrow: Escrow) {
        val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

        // Stato
        tvStatus.text = getStatusText(escrow.status)
        tvStatusDate.text = escrow.updatedAt?.let { dateFormat.format(it) } ?: ""

        // Dettagli
        tvTransactionId.text = "ID: ${escrow.transactionId}"
        tvAmount.text = "Importo: ${escrow.amount} XMR"
        tvClient.text = "Cliente: ${escrow.clientName ?: "N/A"}"
        tvProfessional.text = "Professionista: ${escrow.professionalName ?: "N/A"}"
        tvFee.text = "Commissione: ${escrow.feeAmount ?: 0.0} XMR"
        tvNetAmount.text = "Netto: ${escrow.netAmount ?: 0.0} XMR"
        tvDescription.text = "Descrizione: ${description ?: "N/A"}"

        // Aggiorna bottone
        updateActionButton(escrow.status)
    }

    private fun getStatusText(status: String): String {
        return when (status) {
            "pending" -> "⏳ In attesa"
            "funded" -> "🔒 Fondi bloccati"
            "in_progress" -> "🛠️ Lavoro in corso"
            "completed" -> "✅ Lavoro completato"
            "released" -> "💰 Fondi rilasciati"
            "disputed" -> "⚠️ Controversia"
            else -> status
        }
    }

    private fun updateActionButton(status: String) {
        btnAction.visibility = View.VISIBLE

        when (status) {
            "pending" -> {
                btnAction.text = "🔒 Blocca Fondi"
                btnAction.setOnClickListener { fundEscrow() }
            }
            "funded" -> {
                btnAction.text = "✅ Conferma Completamento"
                btnAction.setOnClickListener { confirmCompletion() }
            }
            "in_progress" -> {
                btnAction.text = "💰 Rilascia Fondi"
                btnAction.setOnClickListener { releaseFunds() }
            }
            "completed" -> {
                btnAction.text = "💰 Rilascia Fondi"
                btnAction.setOnClickListener { releaseFunds() }
            }
            "released" -> {
                btnAction.visibility = View.GONE
            }
            "disputed" -> {
                btnAction.text = "📞 Contatta Supporto"
                btnAction.setOnClickListener { /* Apri chat supporto */ }
            }
            else -> {
                btnAction.visibility = View.GONE
            }
        }
    }

    private fun fundEscrow() {
        if (transactionId == null) return
        progressBar.visibility = View.VISIBLE
        btnAction.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.fundEscrow(mapOf("transactionId" to transactionId!!))
                if (response.success) {
                    Toast.makeText(requireContext(), "Fondi bloccati in escrow!", Toast.LENGTH_SHORT).show()
                    loadEscrowStatus()
                } else {
                    Toast.makeText(requireContext(), response.error ?: "Errore", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Errore: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
                btnAction.isEnabled = true
            }
        }
    }

    private fun confirmCompletion() {
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("Conferma Completamento")
            .setMessage("Il lavoro è stato completato con successo?")
            .setPositiveButton("Sì, completato") { _, _ ->
                Toast.makeText(requireContext(), "Lavoro completato!", Toast.LENGTH_SHORT).show()
                // Simula aggiornamento stato
                val updatedEscrow = currentEscrow?.copy(status = "completed")
                if (updatedEscrow != null) {
                    updateUI(updatedEscrow)
                    updateActionButton("completed")
                }
            }
            .setNegativeButton("Ancora no", null)
            .show()
    }

    private fun releaseFunds() {
        if (transactionId == null) return
        progressBar.visibility = View.VISIBLE
        btnAction.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.releaseEscrow(mapOf("transactionId" to transactionId!!))
                if (response.success) {
                    Toast.makeText(requireContext(), "Fondi rilasciati con successo!", Toast.LENGTH_SHORT).show()
                    loadEscrowStatus()
                } else {
                    Toast.makeText(requireContext(), response.error ?: "Errore", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Errore: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
                btnAction.isEnabled = true
            }
        }
    }
}