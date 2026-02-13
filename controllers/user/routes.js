const express = require('express');
const UserController = require('./controller');
const router = express.Router();

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserProfile);

module.exports = router;
