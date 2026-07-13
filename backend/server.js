// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');  // Importa il modello e connessione
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ========== ROUTES ==========
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MyZubster Backend',
      database: 'connected',
      blockchain: {
        web3: process.env.WEB3_PROVIDER,
        feeContract: process.env.FEE_CONTRACT_ADDRESS
      },
      monero: {
        rpc: process.env.MONERO_RPC_URL,
        network: process.env.MONERO_NETWORK
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'MyZubster Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      orders: '/api/orders'
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// ========== SYNC DATABASE & START ==========
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Connessione PostgreSQL stabilita');

      // Sincronizza i modelli (crea tabelle se non esistono)
      await sequelize.sync({ alter: true });
      console.log('📦 Database sincronizzato');

      app.listen(PORT, () => {
        console.log(`🚀 Server avviato su http://localhost:${PORT}`);
        console.log(`📦 Modalità: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  Database: ${process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}`);
        console.log(`⛓️  Web3: ${process.env.WEB3_PROVIDER}`);
        console.log(`💰 Fee Contract: ${process.env.FEE_CONTRACT_ADDRESS}`);
      });
    } catch (error) {
      console.error('❌ Errore avvio server:', error);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;