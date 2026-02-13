const db = require('../../db');

class Market {
    static getActive(callback) {
        db.all('SELECT * FROM markets WHERE status = "active"', [], callback);
    }

    static updateStatus(id, status, callback) {
        db.run('UPDATE markets SET status = ? WHERE id = ?', [status, id], callback);
    }
}

class Bet {
    static create(userId, marketId, selectedOutcome, amount, odds, callback) {
        db.run('INSERT INTO bets (user_id, market_id, selected_outcome, amount, odds) VALUES (?, ?, ?, ?, ?)',
            [userId, marketId, selectedOutcome, amount, odds], callback);
    }

    static getByUserId(userId, callback) {
        db.all('SELECT * FROM bets WHERE user_id = ?', [userId], callback);
    }

    static getPendingByMarketId(marketId, callback) {
        db.all('SELECT * FROM bets WHERE market_id = ? AND status = "pending"', [marketId], callback);
    }

    static updateStatus(id, status, callback) {
        db.run('UPDATE bets SET status = ? WHERE id = ?', [status, id], callback);
    }
}

module.exports = { Market, Bet };
