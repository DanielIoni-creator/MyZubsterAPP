// test-payment.js
require('dotenv').config();

const paymentService = require('./services/paymentService');
const mongoose = require('mongoose');

async function testPayment() {
  console.log('🧪 Test Payment Service...\n');

  // Connessione a MongoDB
  console.log('📌 0. Connessione a MongoDB...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myzubster';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('   ✅ Connesso a MongoDB');
  } catch (error) {
    console.error('   ❌ Errore connessione MongoDB:', error.message);
    return;
  }
  console.log();

  try {
    // Importa il modello dopo la connessione
    const Order = require('./models/Order');

    // 1. Test connessione Monero
    console.log('📌 1. Test connessione Monero...');
    const result = await paymentService.testMoneroConnection();
    if (result.connected) {
      console.log('   ✅ Connesso a Monero RPC');
      console.log('   📍 Indirizzo:', result.address);
    } else {
      console.log('   ❌ Errore:', result.error);
    }
    console.log();

    // 2. Crea un ordine di test
    console.log('📌 2. Crea ordine di test...');
    const testOrder = new Order({
      userId: 'test_user_123',
      items: [{ name: 'Test Product', quantity: 1, price: 30 }],
      total: 30,
      currency: 'XMR'
    });
    await testOrder.save();
    console.log('   ✅ Ordine creato:', testOrder._id);
    console.log();

    // 3. Genera un subaddress
    console.log('📌 3. Genera subaddress per l ordine...');
    const subaddress = await paymentService.generatePaymentAddress(testOrder._id);
    console.log('   📍 Subaddress:', subaddress.address);
    console.log('   🔢 Indice:', subaddress.addressIndex);
    console.log();

    // 4. Crea un pagamento
    console.log('📌 4. Crea pagamento...');
    const payment = await paymentService.createPayment(testOrder._id, 30);
    console.log('   💳 Payment ID:', payment.id);
    console.log('   📊 Stato:', payment.status);
    console.log('   📍 Indirizzo:', payment.address);
    console.log();

    console.log('✅ Test completato!');
  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
  } finally {
    // Chiudi connessione MongoDB
    await mongoose.connection.close();
    console.log('📌 Connessione MongoDB chiusa');
  }
}

testPayment();