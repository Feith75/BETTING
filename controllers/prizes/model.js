const db = require('../../db');

class Prize {
    static getAll(callback) {
        db.all('SELECT * FROM prizes WHERE active = 1', [], callback);
    }

    static getByCategory(category, callback) {
        db.all('SELECT * FROM prizes WHERE category = ? AND active = 1 ORDER BY rank_requirement', [category], callback);
    }

    static awardPrize(userId, prizeId, callback) {
        db.run('INSERT INTO prize_winners (user_id, prize_id) VALUES (?, ?)',
            [userId, prizeId], function (err) {
                callback(err, this ? this.lastID : null);
            });
    }

    static getWinnersByUserId(userId, callback) {
        db.all(`SELECT pw.*, p.name, p.description, p.value 
            FROM prize_winners pw 
            JOIN prizes p ON pw.prize_id = p.id 
            WHERE pw.user_id = ?`, [userId], callback);
    }
}

class Leaderboard {
    static updateStats(userId, period, coinsWon, gamesPlayed, callback) {
        db.run(`INSERT OR REPLACE INTO leaderboard_stats (user_id, period, coins_won, games_played, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [userId, period, coinsWon, gamesPlayed], callback);
    }

    static getTopPlayers(period, limit, callback) {
        db.all(`SELECT ls.*, u.username 
            FROM leaderboard_stats ls 
            JOIN users u ON ls.user_id = u.id 
            WHERE ls.period = ? 
            ORDER BY ls.coins_won DESC 
            LIMIT ?`, [period, limit || 10], callback);
    }
}

module.exports = { Prize, Leaderboard };
