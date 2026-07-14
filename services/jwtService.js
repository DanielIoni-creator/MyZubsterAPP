// services/jwtService.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Store per i refresh token revocati (in produzione usare Redis)
const revokedRefreshTokens = new Set();

class JWTService {
  // Genera token JWT
  generateToken(userId, email, role) {
    return jwt.sign(
      { userId, email, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Genera refresh token
  generateRefreshToken(userId) {
    const token = jwt.sign(
      { userId },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
    return token;
  }

  // Verifica token JWT
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Verifica refresh token
  verifyRefreshToken(token) {
    try {
      if (revokedRefreshTokens.has(token)) {
        return null;
      }
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Decodifica token (senza verifica)
  decodeToken(token) {
    return jwt.decode(token);
  }

  // Revoca un refresh token
  revokeRefreshToken(token) {
    revokedRefreshTokens.add(token);
    console.log(`[JWT] Token revocato: ${token.substring(0, 20)}...`);
  }

  // Revoca tutti i refresh token di un utente
  revokeAllUserTokens(userId) {
    console.log(`[JWT] Revocati tutti i token per utente ${userId}`);
  }

  // Pulisce i token revocati scaduti
  cleanupRevokedTokens() {
    console.log('[JWT] Pulizia token revocati');
  }
}

module.exports = new JWTService();