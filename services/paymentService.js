// services/paymentService.js
const { Order } = require('../models');

class PaymentService {
  constructor() {
    this.confirmationDelay = parseInt(process.env.MOCK_PAYMENT_DELAY) || 3000;
    this.payments = new Map();
  }

  async createPayment(orderId, amount, currency = 'XMR') {
    const paymentId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let address = '4';
    for (let i = 0; i < 95; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const payment = {
      id: paymentId,
      orderId,
      amount: parseFloat(amount.toFixed(6)),
      currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      address,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentId}`,
      memo: `Pagamento ordine ${orderId}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };

    this.payments.set(paymentId, payment);
    console.log(`[Mock] 💰 Pagamento creato: ${paymentId}`);

    setTimeout(() => {
      this.confirmPayment(paymentId).catch(err =>
        console.error(`[Mock] ❌ Errore conferma:`, err.message)
      );
    }, this.confirmationDelay);

    return payment;
  }

  async confirmPayment(paymentId) {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error('Pagamento non trovato');
    if (payment.status === 'pending') {
      payment.status = 'confirmed';
      payment.confirmedAt = new Date().toISOString();
      console.log(`[Mock] ✅ Pagamento CONFERMATO: ${paymentId}`);
      await this._updateOrderStatus(payment);
    }
    return payment;
  }

  async getPaymentStatus(paymentId) {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error('Pagamento non trovato');
    return { ...payment };
  }

  async _updateOrderStatus(payment) {
    try {
      const order = await Order.findById(payment.orderId);
      if (!order) return;
      if (order.status === 'pending') {
        order.status = 'paid';
        order.paymentStatus = 'confirmed';
        order.paymentDetails = {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          confirmedAt: payment.confirmedAt,
          address: payment.address
        };
        await order.save();
        console.log(`[Mock] 📦 Ordine ${payment.orderId} aggiornato a "paid"`);
      }
    } catch (error) {
      console.error('[Mock] ❌ Errore aggiornamento ordine:', error.message);
    }
  }

  setConfirmationDelay(delayMs) {
    this.confirmationDelay = delayMs;
  }
}

module.exports = new PaymentService();