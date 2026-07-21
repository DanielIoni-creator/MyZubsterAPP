const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// POST /api/payments - Crea un pagamento Monero
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    
    // Per ora, restituisci solo un messaggio di test
    res.json({
      success: true,
      message: 'Pagamento creato con successo',
      orderId: orderId,
      amount: amount,
      address: '4A...test_address',
      transactionId: 'test_' + Date.now()
    });
  } catch (error) {
    console.error('Errore creazione pagamento:', error);
    res.status(500).json({ error: error.message || 'Errore nella creazione del pagamento' });
  }
});

module.exports = router;
