const db = require('../../db');

class Race {
    static create(hostId, betAmount, trackType, laps, callback) {
        db.run('INSERT INTO races (host_id, bet_amount, track_type, laps, status) VALUES (?, ?, ?, ?, ?)',
            [hostId, betAmount, trackType, laps, 'open'], function (err) {
                callback(err, this ? this.lastID : null);
            });
    }

    static getOpenRaces(callback) {
        db.all('SELECT * FROM races WHERE status = "open"', [], callback);
    }

    static getById(id, callback) {
        db.get('SELECT * FROM races WHERE id = ?', [id], callback);
    }

    static acceptChallenge(raceId, challengerId, callback) {
        db.run('UPDATE races SET challenger_id = ?, status = "locked" WHERE id = ? AND status = "open"',
            [challengerId, raceId], callback);
    }

    static updateStatus(id, status, callback) {
        db.run('UPDATE races SET status = ? WHERE id = ?', [status, id], callback);
    }

    static setWinner(id, winnerId, callback) {
        db.run('UPDATE races SET winner_id = ?, status = "finished" WHERE id = ?',
            [winnerId, id], callback);
    }

    static cancelRace(id, callback) {
        db.run('UPDATE races SET status = "cancelled" WHERE id = ?', [id], callback);
    }
}

module.exports = Race;
