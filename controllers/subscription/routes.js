const express = require('express');
const SubscriptionController = require('./controller');

const router = express.Router();

// Subscription API Routes
router.post('/subscribe', SubscriptionController.subscribe);
router.get('/subscription/status/:userId', SubscriptionController.getStatus);

module.exports = router;
