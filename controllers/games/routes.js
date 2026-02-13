const express = require('express');
const GamesController = require('./controller');

const router = express.Router();

router.get('/live', GamesController.getLiveGames);

module.exports = router;
