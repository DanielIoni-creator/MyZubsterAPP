// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Costruisci URI: prima senza auth (locale) o con auth se specificata
    const dbName = process.env.MONGO_DB || 'myzubster';
    let uri = `mongodb://localhost:27017/${dbName}`;

    // Se ci sono credenziali, prova ad usarle (ma solo se non è localhost senza auth)
    if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
      // Prova prima senza auth (perché di default su Windows non c'è)
      try {
        console.log('🔄 Tentativo connessione senza autenticazione...');
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 2000
        });
        console.log('✅ MongoDB connesso (senza autenticazione)');
        return;
      } catch (err) {
        console.log('🔄 Tentativo con autenticazione...');
        // Se fallisce, usa le credenziali
        uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:27017/${dbName}?authSource=admin`;
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB connesso (con autenticazione)');
      }
    } else {
      // Senza credenziali
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ MongoDB connesso (senza autenticazione)');
    }

    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Errore MongoDB:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;