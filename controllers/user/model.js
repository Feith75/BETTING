const db = require('../../db');

class User {
    static getById(id, callback) {
        db.get('SELECT * FROM users WHERE id = ?', [id], callback);
    }

    static updateCoins(id, coins, callback) {
        db.run('UPDATE users SET coins = ? WHERE id = ?', [coins, id], callback);
    }

    static incrementWins(id, callback) {
        db.run('UPDATE users SET total_wins = total_wins + 1, total_games = total_games + 1 WHERE id = ?', [id], callback);
    }

    static incrementGames(id, callback) {
        db.run('UPDATE users SET total_games = total_games + 1 WHERE id = ?', [id], callback);
    }
}

module.exports = User;
