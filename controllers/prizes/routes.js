const express = require('express');
const PrizesController = require('./controller');

const router = express.Router();

// Prize & Leaderboard API Routes
router.get('/prizes', PrizesController.getAllPrizes);
router.get('/prizes/:category', PrizesController.getPrizesByCategory);
router.get('/leaderboard', PrizesController.getLeaderboard);

module.exports = router;
