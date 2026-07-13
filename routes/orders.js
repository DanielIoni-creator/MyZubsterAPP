// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Crea nuovo ordine
router.post('/', orderController.createOrder);

// ⚠️ ROUTE SPECIFICA: DEVE VENIRE PRIMA DI QUELLA GENERICA
// GET /api/orders/payments/:paymentId/status - Stato pagamento
router.get('/payments/:paymentId/status', orderController.getPaymentStatus);

// GET /api/orders/user/:userId - Ottieni ordini utente
router.get('/user/:userId', orderController.getUserOrders);

// GET /api/orders/:orderId - Ottieni ordine (GENERICA - DEVE VENIRE DOPO)
router.get('/:orderId', orderController.getOrder);

// PUT /api/orders/:orderId/cancel - Annulla ordine
router.put('/:orderId/cancel', orderController.cancelOrder);

// POST /api/orders/:orderId/pay - Avvia pagamento
router.post('/:orderId/pay', orderController.startPayment);

module.exports = router;