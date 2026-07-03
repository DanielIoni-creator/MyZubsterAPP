const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/myzubster';

async function testConnection() {
    try {
        console.log('🔍 Tentativo di connessione a:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('✅ Connessione a MongoDB riuscita!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Errore di connessione:', error.message);
    }
}

testConnection();