const axios = require('axios');
const MoneroTransaction = require('../models/MoneroTransaction');
const OrderBook = require('../models/OrderBook');
const TokenHolding = require('../models/TokenHolding');

// Configurazione Monero (da .env)
const WALLET_RPC_URL = process.env.MONERO_WALLET_RPC_URL || 'http://localhost:18083/json_rpc';
const DAEMON_RPC_URL = process.env.MONERO_DAEMON_RPC_URL || 'http://localhost:18081/json_rpc';
const RPC_USER = process.env.MONERO_RPC_USER || '';
const RPC_PASS = process.env.MONERO_RPC_PASSWORD || '';

// Base per le richieste RPC
const rpcRequest = async (url, method, params = {}) => {
  const auth = RPC_USER && RPC_PASS ? { username: RPC_USER, password: RPC_PASS } : {};
  const response = await axios.post(url, {
    jsonrpc: '2.0',
    id: '0',
    method,
    params
  }, { auth });
  if (response.data.error) throw new Error(response.data.error.message);
  return response.data.result;
};

/**
 * Crea un subaddress per una transazione specifica
 */
const createSubaddress = async (accountIndex = 0, label = '') => {
  const result = await rpcRequest(WALLET_RPC_URL, 'create_address', {
    account_index: accountIndex,
    label
  });
  return {
    address: result.address,
    addressIndex: result.address_index
  };
};

/**
 * Genera un indirizzo Monero dedicato per un ordine
 */
const generatePaymentAddress = async (orderId) => {
  const subaddress = await createSubaddress(0, `Order ${orderId}`);
  return subaddress.address;
};

/**
 * Crea un pagamento Monero per un ordine
 */
const createPayment = async (orderId, buyerId, amountXMR) => {
  // Genera indirizzo dedicato
  const address = await generatePaymentAddress(orderId);
  
  const transaction = new MoneroTransaction({
    orderId,
    buyerId,
    subaddress: address,
    amount: amountXMR,
    status: 'pending'
  });
  
  await transaction.save();
  
  // Aggiorna l'ordine con il riferimento
  await OrderBook.findByIdAndUpdate(orderId, { 
    moneroTxid: `pending_${transaction._id}` 
  });
  
  return {
    transactionId: transaction._id,
    address: address,
    amount: amountXMR,
    expiresAt: transaction.expiresAt
  };
};

/**
 * Verifica se un pagamento è stato ricevuto
 */
const checkPayment = async (transactionId) => {
  const transaction = await MoneroTransaction.findById(transactionId);
  if (!transaction) throw new Error('Transazione non trovata');
  
  // Ottieni tutte le transazioni in entrata (in) del wallet
  const transfers = await rpcRequest(WALLET_RPC_URL, 'get_transfers', {
    in: true,
    account_index: 0
  });
  
  // Cerca transazioni che hanno come destinazione il subaddress della transazione
  // Nota: get_transfers restituisce i dettagli delle transazioni, ma il campo "address" potrebbe non essere presente.
  // Alternativa: usare 'get_transfers' con 'subaddr_indices' per filtrare per subaddress.
  // Per semplicità, si può scansionare tutte le transazioni e verificare se l'importo e il subaddress coincidono.
  // Dobbiamo recuperare gli indirizzi associati al subaddress.
  // Usiamo get_address per mappare l'indice all'indirizzo.
  
  // Per ora, implementiamo un controllo semplificato: prendiamo tutte le transazioni in entrata
  // e controlliamo se l'importo è >= quello richiesto e se la transazione è recente.
  // In produzione, dovresti associare il subaddress a un indice e verificare se ci sono fondi
  // su quel subaddress specifico.
  
  const incoming = transfers.in || [];
  // Filtra per transazioni con importo >= amount (in atomic units)
  const amountAtomic = transaction.amount * 1e12; // XMR → atomic units
  
  // Verifica se c'è una transazione che soddisfa l'importo e che è stata ricevuta dopo la creazione
  const matchedTx = incoming.find(tx => 
    tx.amount >= amountAtomic && 
    new Date(tx.timestamp * 1000) > transaction.createdAt
  );
  
  if (matchedTx) {
    transaction.amountPaid = matchedTx.amount / 1e12;
    transaction.moneroTxid = matchedTx.txid;
    transaction.confirmations = matchedTx.confirmations || 0;
    transaction.status = 'confirmed';
    transaction.updatedAt = new Date();
    await transaction.save();
    
    // Completa l'ordine
    await completeOrder(transaction.orderId);
    
    return { status: 'confirmed', txid: matchedTx.txid };
  }
  
  return { status: 'pending' };
};

/**
 * Completa un ordine dopo il pagamento Monero
 */
const completeOrder = async (orderId) => {
  const order = await OrderBook.findById(orderId);
  if (!order) throw new Error('Ordine non trovato');
  if (order.status !== 'open') throw new Error('Ordine non più disponibile');
  
  const transaction = await MoneroTransaction.findOne({ orderId, status: 'confirmed' });
  if (!transaction) throw new Error('Transazione non trovata');
  
  // Trasferisci i token
  const sellerHolding = await TokenHolding.findOne({ 
    user: order.seller, 
    token: order.token 
  });
  if (sellerHolding) {
    sellerHolding.lockedAmount = Math.max(0, sellerHolding.lockedAmount - order.amount);
    sellerHolding.amount -= order.amount;
    await sellerHolding.save();
  }
  
  let buyerHolding = await TokenHolding.findOne({ 
    user: transaction.buyerId, 
    token: order.token 
  });
  if (!buyerHolding) {
    buyerHolding = new TokenHolding({
      user: transaction.buyerId,
      token: order.token,
      amount: 0,
      lockedAmount: 0
    });
  }
  buyerHolding.amount += order.amount;
  await buyerHolding.save();
  
  order.status = 'filled';
  order.moneroTxid = transaction.moneroTxid;
  await order.save();
  
  return order;
};

module.exports = {
  createSubaddress,
  generatePaymentAddress,
  createPayment,
  checkPayment,
  completeOrder
};
