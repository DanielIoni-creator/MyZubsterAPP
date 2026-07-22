const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Escrow = require('../models/Escrow');
const OrderBook = require('../models/OrderBook');
const disputeService = require('../services/disputeService');

// POST /api/escrow – Crea un escrow
router.post('/', auth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await OrderBook.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Ordine non trovato' });

    const existing = await Escrow.findOne({ orderId });
    if (existing) return res.status(400).json({ error: 'Escrow già esistente' });

    const escrow = new Escrow({
      orderId,
      buyerId: req.user._id,
      sellerId: order.seller,
      amount: order.totalPrice,
      currency: 'XMR',
      status: 'held'
    });
    await escrow.save();

    res.status(201).json({ success: true, escrow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/escrow – Lista escrow (admin)
router.get('/', auth, async (req, res) => {
  try {
    const escrows = await Escrow.find()
      .populate('buyerId', 'username email')
      .populate('sellerId', 'username email')
      .populate('orderId');
    res.json(escrows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/escrow/:id – Dettaglio escrow
router.get('/:id', auth, async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id)
      .populate('buyerId', 'username email reputationScore')
      .populate('sellerId', 'username email reputationScore')
      .populate('orderId');
    if (!escrow) return res.status(404).json({ error: 'Escrow non trovato' });
    res.json(escrow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/release – Rilascia fondi
router.post('/:id/release', auth, async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) return res.status(404).json({ error: 'Escrow non trovato' });

    if (req.user._id !== escrow.buyerId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    if (escrow.status !== 'held') {
      return res.status(400).json({ error: 'Escrow non è in stato "held"' });
    }

    escrow.status = 'released';
    escrow.resolvedAt = new Date();
    await escrow.save();

    await OrderBook.findByIdAndUpdate(escrow.orderId, { status: 'filled' });

    res.json({ success: true, escrow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/dispute – Apre una disputa
router.post('/:id/dispute', auth, async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) return res.status(404).json({ error: 'Escrow non trovato' });

    if (escrow.status !== 'held' && escrow.status !== 'pending') {
      return res.status(400).json({ error: 'Escrow non può essere disputato' });
    }

    escrow.status = 'disputed';
    escrow.disputedAt = new Date();
    await escrow.save();

    // Avvia la risoluzione AI in background
    disputeService.resolveDisputeWithAI(req.params.id);

    res.json({ success: true, escrow, message: 'Disputa aperta. AI sta analizzando...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
