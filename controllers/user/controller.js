const User = require('./model');

const getAllUsers = (req, res) => {
    const db = require('../../db');
    db.all('SELECT id, username, coins, subscription_tier FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
};

const getUserProfile = (req, res) => {
    const id = req.params.id;
    User.getById(id, (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
};

module.exports = {
    getAllUsers,
    getUserProfile
};
