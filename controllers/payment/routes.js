const express = require('express');
const router = express.Router();
const paymentController = require('./controller');

// M-Pesa payment routes
router.post('/mpesa', paymentController.initiateMpesaPayment);
router.get('/status/:paymentId', paymentController.checkPaymentStatus);
router.get('/history/:userId', paymentController.getPaymentHistory);

module.exports = router;
