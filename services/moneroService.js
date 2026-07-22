const axios = require('axios');
const MoneroTransaction = require('../models/MoneroTransaction');
const OrderBook = require('../models/OrderBook');
const TokenHolding = require('../models/TokenHolding');

const WALLET_RPC_URL = process.env.MONERO_WALLET_RPC_URL || 'http://localhost:18083/json_rpc';
const RPC_USER = process.env.MONERO_RPC_USER || '';
const RPC_PASS = process.env.MONERO_RPC_PASSWORD || '';

const rpcRequest = async (method, params = {}) => {
  const auth = RPC_USER && RPC_PASS ? { username: RPC_USER, password: RPC_PASS } : {};
  try {
    const response = await axios.post(WALLET_RPC_URL, {
      jsonrpc: '2.0',
      id: '0',
      method,
      params
    }, { auth, timeout: 10000 });
    if (response.data.error) throw new Error(response.data.error.message);
    return response.data.result;
  } catch (error) {
    console.error(`RPC error (${method}):`, error.message);
    throw error;
  }
};

const createSubaddress = async (accountIndex = 0, label = '') => {
  const result = await rpcRequest('create_address', {
    account_index: accountIndex,
    label
  });
  return result.address;
};

const createPayment = async (orderId, buyerId, amountXMR) => {
  const subaddress = await createSubaddress(0, `Order ${orderId}`);
  const transaction = new MoneroTransaction({
    orderId,
    buyerId,
    subaddress,
    amount: amountXMR,
    status: 'pending'
  });
  await transaction.save();
  return {
    transactionId: transaction._id,
    address: subaddress,
    amount: amountXMR,
    expiresAt: transaction.expiresAt
  };
};

const checkPayment = async (transactionId) => {
  const transaction = await MoneroTransaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  try {
    const transfers = await rpcRequest('get_transfers', { in: true });
    // Se non c'è campo "in", significa che non ci sono transazioni in entrata
    if (!transfers || !transfers.in) {
      console.log(`[checkPayment] Nessuna transazione in entrata per ${transactionId}`);
      return { status: 'pending' };
    }

    const amountAtomic = transaction.amount * 1e12;
    const matchedTx = transfers.in.find(tx =>
      tx.amount >= amountAtomic &&
      new Date(tx.timestamp * 1000) > transaction.createdAt
    );

    if (matchedTx) {
      transaction.amountPaid = matchedTx.amount / 1e12;
      transaction.moneroTxid = matchedTx.txid;
      transaction.confirmations = matchedTx.confirmations || 0;
      transaction.status = 'confirmed';
      await transaction.save();
      await completeOrder(transaction.orderId);
      return { status: 'confirmed', txid: matchedTx.txid };
    }
    return { status: 'pending' };
  } catch (error) {
    console.error(`[checkPayment] Errore per ${transactionId}:`, error.message);
    return { status: 'pending' };
  }
};

const completeOrder = async (orderId) => {
  const order = await OrderBook.findById(orderId);
  if (!order) throw new Error('Order not found');
  const transaction = await MoneroTransaction.findOne({ orderId, status: 'confirmed' });
  if (!transaction) throw new Error('Transaction not found');

  const sellerHolding = await TokenHolding.findOne({ user: order.seller, token: order.token });
  if (sellerHolding) {
    sellerHolding.lockedAmount = Math.max(0, (sellerHolding.lockedAmount || 0) - order.amount);
    sellerHolding.amount -= order.amount;
    await sellerHolding.save();
  }
  let buyerHolding = await TokenHolding.findOne({ user: transaction.buyerId, token: order.token });
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
  createPayment,
  checkPayment,
  completeOrder
};
