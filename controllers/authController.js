// controllers/authController.js
const User = require('../models/User');
const jwtService = require('../services/jwtService');

// ========== REGISTRAZIONE ==========
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Dati mancanti. Richiesti: email, password, name'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwtService.generateToken(user._id, user.email, user.role);
    const refreshToken = jwtService.generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({
      error: 'Errore interno del server',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== LOGIN ==========
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwtService.generateToken(user._id, user.email, user.role);
    const refreshToken = jwtService.generateRefreshToken(user._id);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({
      error: 'Errore interno del server',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== LOGOUT ==========
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      jwtService.revokeRefreshToken(refreshToken);
    }
    res.json({
      success: true,
      message: 'Logout effettuato con successo'
    });
  } catch (error) {
    console.error('Errore logout:', error);
    res.status(500).json({ error: 'Errore durante il logout' });
  }
};

// ========== PROFILO ==========
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.json(user);
  } catch (error) {
    console.error('Errore profilo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};

// ========== AGGIORNA PROFILO ==========
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email già in uso da un altro utente' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Errore aggiornamento profilo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
};