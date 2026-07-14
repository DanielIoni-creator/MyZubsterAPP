// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. PRIORITÀ ASSOLUTA alla variabile d'ambiente (per Render)
    let uri = process.env.MONGODB_URI;

    // 2. Se NON esiste (sviluppo locale), usa il fallback
    if (!uri) {
      console.log('🔄 MONGODB_URI non trovata, uso configurazione locale...');
      
      const dbName = process.env.MONGO_DB || 'myzubster';
      let localUri = `mongodb://localhost:27017/${dbName}`;

      // Prova prima senza autenticazione
      try {
        console.log('🔄 Tentativo connessione senza autenticazione...');
        await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 2000
        });
        console.log('✅ MongoDB connesso (senza autenticazione)');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        return;
      } catch (err) {
        // Se fallisce, prova con autenticazione
        if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
          console.log('🔄 Tentativo con autenticazione...');
          localUri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:27017/${dbName}?authSource=admin`;
          await mongoose.connect(localUri, {
            serverSelectionTimeoutMS: 5000
          });
          console.log('✅ MongoDB connesso (con autenticazione)');
          console.log(`📊 Database: ${mongoose.connection.name}`);
          return;
        }
        // Se tutto fallisce, rilancio l'errore
        throw err;
      }
    }

    // 3. Connessione con MONGODB_URI (Render/Atlas)
    console.log('🔄 Connessione a MongoDB Atlas via MONGODB_URI...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB connesso: ${mongoose.connection.host}`);
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