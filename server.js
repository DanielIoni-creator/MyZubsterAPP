// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🔄 Avvio server...');

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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== SECURITY HEADERS ==========
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));

// ========== RATE LIMITING ==========
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 10,
  message: 'Troppe richieste da questo IP, riprova tra 15 minuti.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Troppe richieste, riprova tra un minuto.',
});

app.use('/api/', generalLimiter);

// ========== MIDDLEWARE ==========
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ========== ROTTE ==========
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MyZubster Backend',
    database: 'MongoDB',
    blockchain: {
      web3: process.env.WEB3_PROVIDER,
      feeContract: process.env.FEE_CONTRACT_ADDRESS
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'MyZubster Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      orders: '/api/orders',
      health: '/api/health'
    }
  });
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('❌ Errore server:', err.stack);
  res.status(500).json({
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// ========== AVVIO SERVER ==========
if (process.env.NODE_ENV !== 'test') {
  console.log('🔄 Connessione al database...');
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server avviato su http://localhost:${PORT}`);
      console.log(`📦 Modalità: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch(err => {
    console.error('❌ Errore fatale:', err);
    process.exit(1);
  });
} else {
  console.log('🧪 Ambiente test: server non avviato');
}

module.exports = app;