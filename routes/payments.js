const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const moneroService = require('../services/moneroService');
const MoneroTransaction = require('../models/MoneroTransaction');

router.post('/', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const payment = await moneroService.createPayment(orderId, req.user._id, amount);
    res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error('Errore creazione pagamento:', error);
    res.status(500).json({ error: error.message || 'Errore nella creazione del pagamento' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await MoneroTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transazione non trovata' });
    const status = await moneroService.checkPayment(req.params.id);
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Errore verifica pagamento:', error);
    res.status(500).json({ error: error.message || 'Errore nella verifica del pagamento' });
  }
});

module.exports = router;
