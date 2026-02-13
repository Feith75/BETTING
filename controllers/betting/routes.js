const express = require('express');
const BettingController = require('./controller');

const router = express.Router();

// Betting API Routes
router.get('/markets', BettingController.getMarkets);
router.get('/balance/:userId', BettingController.getBalance);
router.get('/bets/:userId', BettingController.getBets);
router.post('/place-bet', BettingController.placeBet);

module.exports = router;
