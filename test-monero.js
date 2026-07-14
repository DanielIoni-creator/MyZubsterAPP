// test-monero.js
const moneroService = require('./services/moneroService');

async function testMoneroService() {
  console.log('🧪 Test Monero Service...\n');

  try {
    // 1. Ottieni l'indirizzo del wallet
    console.log('📌 1. Ottieni indirizzo wallet...');
    const address = await moneroService.getWalletAddress();
    console.log('   Indirizzo:', address);
    console.log();

    // 2. Genera un subaddress per un ordine
    console.log('📌 2. Genera subaddress...');
    const subaddress = await moneroService.createSubaddress('ORD-12345');
    console.log('   Subaddress:', subaddress.address);
    console.log('   Indice:', subaddress.addressIndex);
    console.log();

    // 3. Ottieni il saldo
    console.log('📌 3. Ottieni saldo...');
    const balance = await moneroService.getBalance();
    console.log('   Saldo (picowatt):', balance.balance);
    console.log('   Saldo sbloccato:', balance.unlockedBalance);
    console.log();

    // 4. Controlla i pagamenti per il subaddress
    console.log('📌 4. Controlla pagamenti...');
    const payment = await moneroService.checkPayment(1);
    if (payment) {
      console.log('   Pagamento trovato!');
      console.log('   TXID:', payment.txid);
      console.log('   Importo:', payment.amount);
    } else {
      console.log('   Nessun pagamento trovato');
    }
    console.log();

    console.log('✅ Test completato!');
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
    if (error.response) {
      console.error('   Dettaglio:', error.response.data);
    }
  }
}

testMoneroService();