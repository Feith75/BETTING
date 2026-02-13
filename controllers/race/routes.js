const express = require('express');
const RaceController = require('./controller');

const router = express.Router();

// Racing API Routes
router.post('/create', RaceController.createChallenge);
router.get('/challenges', RaceController.getOpenChallenges);
router.post('/accept', RaceController.acceptChallenge);
router.post('/cancel', RaceController.cancelRace);
router.get('/admin/active', RaceController.getActiveRacesForAdmin);

module.exports = router;
