const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const TokenHolding = require('../models/TokenHolding');

// GET /api/users/me/reputation - Reputazione utente
router.get('/me/reputation', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('reputationScore completedTrades rating username');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/me/value - Valore totale
router.get('/me/value', auth, async (req, res) => {
  try {
    const holdings = await TokenHolding.find({ user: req.user._id }).populate('token');

    let totalValue = 0;
    holdings.forEach(h => totalValue += h.amount * h.token.tokenPrice);
    nfts.forEach(n => totalValue += n.value || 0);

    res.json({
      success: true,
      totalValue,
      holdings: holdings.map(h => ({
        token: h.token.symbol,
        amount: h.amount,
        value: h.amount * h.token.tokenPrice
      })),
      nfts: nfts.map(n => ({ name: n.name, value: n.value }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/leaderboard - Classifica
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ reputationScore: -1 })
      .limit(10)
      .select('username reputationScore');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
