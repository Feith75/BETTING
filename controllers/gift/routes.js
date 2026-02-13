const express = require('express');
const GiftController = require('./controller');

const router = express.Router();

// Gift API Routes
router.get('/gifts', GiftController.getGifts);
router.post('/gift/send', GiftController.sendGift);

module.exports = router;
