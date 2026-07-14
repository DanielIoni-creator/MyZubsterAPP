// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const xss = require('xss');
const csrf = require('csurf');
const connectDB = require('./config/database');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const jwtService = require('./services/jwtService');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🔄 Avvio server...');

// ========== HTTPS REDIRECT (produzione) ==========
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
  console.log('🔒 HTTPS redirect attivo (produzione)');
}

// ========== CORS CONFIGURAZIONE ==========
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token']
}));
console.log('✅ CORS configurato');

// ========== SECURITY HEADERS ==========
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));
console.log('✅ Helmet configurato');

// ========== RATE LIMITING ==========
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Troppe richieste da questo IP, riprova tra 15 minuti.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Troppe richieste, riprova tra un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
console.log('✅ Rate Limiting configurato');

// ========== XSS SANITIZZAZIONE ==========
function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    });
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
});
console.log('✅ XSS sanitizzazione attiva');

// ========== MIDDLEWARE ==========
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ========== ROTTE (PRIMA DEL CSRF) ==========
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ========== JWT REFRESH TOKEN (PRIMA DEL CSRF) ==========
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token mancante' });
  }

  const decoded = jwtService.verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(403).json({ error: 'Refresh token non valido o scaduto' });
  }

  const newToken = jwtService.generateToken(decoded.userId);
  
  res.json({
    success: true,
    token: newToken
  });
});

// ========== CSRF PROTECTION ==========
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ========== CSRF PROTECTION (escluso refresh e auth) ==========
app.use((req, res, next) => {
  // Escludi le route auth dal CSRF
  const excludedPaths = [
    '/api/auth/refresh',
    '/api/auth/login',
    '/api/auth/register'
  ];
  
  if (excludedPaths.includes(req.path)) {
    return next();
  }
  
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return csrfProtection(req, res, next);
  }
  next();
});
console.log('✅ CSRF protection configurata (escluso auth)');

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MyZubster Backend',
    version: '1.0.0',
    database: 'MongoDB',
    security: {
      rateLimiting: true,
      helmet: true,
      xssProtection: true,
      csrfProtection: true,
      cors: true
    },
    blockchain: {
      web3: process.env.WEB3_PROVIDER,
      feeContract: process.env.FEE_CONTRACT_ADDRESS
    },
    monero: {
      network: process.env.MONERO_NETWORK || 'testnet',
      rpc: process.env.MONERO_RPC_URL
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'MyZubster Backend API',
    version: '1.0.0',
    documentation: 'https://github.com/DanielIoni-creator/MyZubsterAPP',
    endpoints: {
      auth: '/api/auth',
      orders: '/api/orders',
      health: '/api/health',
      csrfToken: '/api/csrf-token',
      refreshToken: '/api/auth/refresh'
    }
  });
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('❌ Errore server:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Token CSRF non valido o scaduto'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Errore di validazione',
      details: err.message
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token non valido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token scaduto'
    });
  }

  if (err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Duplicato',
        details: 'Questa risorsa esiste già'
      });
    }
  }

  res.status(500).json({
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// ========== AVVIO SERVER ==========
if (process.env.NODE_ENV !== 'test') {
  console.log('🔄 Connessione al database...');
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server avviato su http://localhost:${PORT}`);
        console.log(`📦 Modalità: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔒 Sicurezza: ${process.env.NODE_ENV === 'production' ? '🔒 HTTPS/Prod' : '🛡️ Sviluppo'}`);
        console.log(`🛡️  XSS: Attivo | CSRF: Attivo | RateLimit: Attivo`);
      });
    })
    .catch(err => {
      console.error('❌ Errore fatale:', err);
      process.exit(1);
    });
} else {
  console.log('🧪 Ambiente test: server non avviato');
}

module.exports = app;