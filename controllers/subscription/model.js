const db = require('../../db');

class Subscription {
    static create(userId, tier, endDate, paymentMethod, amount, callback) {
        db.run('INSERT INTO subscriptions (user_id, tier, end_date, payment_method, amount) VALUES (?, ?, ?, ?, ?)',
            [userId, tier, endDate, paymentMethod, amount], function (err) {
                callback(err, this ? this.lastID : null);
            });
    }

    static getActiveByUserId(userId, callback) {
        db.get('SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY end_date DESC LIMIT 1',
            [userId], callback);
    }

    static updateUserTier(userId, tier, expiresDate, callback) {
        db.run('UPDATE users SET subscription_tier = ?, subscription_expires = ? WHERE id = ?',
            [tier, expiresDate, userId], callback);
    }
}

module.exports = Subscription;
