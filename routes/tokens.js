const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tokenService = require('../services/tokenService');

// GET /api/tokens - Lista token attivi
router.get('/', async (req, res) => {
  try {
    const tokens = await tokenService.getActiveTokens();
    res.json(tokens);
  } catch (error) {
    console.error('Errore recupero token:', error);
    res.status(500).json({ error: 'Errore nel recupero dei token' });
  }
});

// GET /api/tokens/holdings - Holding utente (DEVE essere PRIMA di /:id)
router.get('/holdings', auth, async (req, res) => {
  try {
    const holdings = await tokenService.getUserHoldings(req.user._id);
    res.json(holdings);
  } catch (error) {
    console.error('Errore recupero holding:', error);
    res.status(500).json({ error: 'Errore nel recupero del token' });
  }
});

// GET /api/tokens/:id - Dettaglio token
router.get('/:id', async (req, res) => {
  try {
    const token = await tokenService.getTokenById(req.params.id);
    if (!token) return res.status(404).json({ error: 'Token non trovato' });
    res.json(token);
  } catch (error) {
    console.error('Errore recupero token:', error);
    res.status(500).json({ error: 'Errore nel recupero del token' });
  }
});

// POST /api/tokens - Crea token (solo issuer)
router.post('/', auth, async (req, res) => {
  try {
    const { name, symbol, totalSupply, assetValue, tokenPrice, assetType, assetDescription, assetLocation, blockchain } = req.body;
    const tokenData = {
      name,
      symbol,
      totalSupply,
      assetValue,
      tokenPrice,
      assetType,
      assetDescription,
      assetLocation: assetLocation || '',
      blockchain: blockchain || 'tari',
      issuer: req.user._id,
    };
    const token = await tokenService.createToken(tokenData);
    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error('Errore creazione token:', error);
    res.status(500).json({ error: 'Errore nella creazione del token' });
  }
});

// POST /api/tokens/:id/purchase - Acquista token
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const { amount, moneroTxid } = req.body;
    const holding = await tokenService.purchaseTokens(req.user._id, req.params.id, amount, moneroTxid);
    res.json({ success: true, holding });
  } catch (error) {
    console.error('Errore acquisto token:', error);
    res.status(500).json({ error: 'Errore nell\'acquisto dei token' });
  }
});

module.exports = router;
