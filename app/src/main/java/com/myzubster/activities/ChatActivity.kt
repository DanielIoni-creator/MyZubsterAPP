// Pulsante Richiedi Escrow
val requestEscrowButton = findViewById<Button>(R.id.request_escrow_button)
requestEscrowButton.setOnClickListener {
    showEscrowDialog()
}

private fun showEscrowDialog() {
    val dialogView = layoutInflater.inflate(R.layout.dialog_escrow_request, null)
    val etAmount = dialogView.findViewById<EditText>(R.id.etEscrowAmount)
    val etDescription = dialogView.findViewById<EditText>(R.id.etEscrowDescription)

    AlertDialog.Builder(this)
        .setTitle("Richiedi Escrow")
        .setView(dialogView)
        .setPositiveButton("Invia Richiesta") { _, _ ->
            val amount = etAmount.text.toString().toDoubleOrNull()
            val description = etDescription.text.toString()
            if (amount != null && amount > 0) {
                startEscrow(amount, description)
            } else {
                Toast.makeText(this, "Inserisci un importo valido", Toast.LENGTH_SHORT).show()
            }
        }
        .setNegativeButton("Annulla", null)
        .show()
}

private fun startEscrow(amount: Double, description: String) {
    val intent = Intent(this, EscrowActivity::class.java).apply {
        putExtra(EscrowActivity.EXTRA_AMOUNT, amount)
        putExtra(EscrowActivity.EXTRA_PROFESSIONAL_ID, professionalId)
        putExtra(EscrowActivity.EXTRA_CLIENT_ID, currentUserId)
        putExtra(EscrowActivity.EXTRA_DESCRIPTION, description)
    }
    startActivity(intent)
}