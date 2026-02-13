const db = require('../../db');

class Gift {
    static getAll(callback) {
        db.all("SELECT * FROM gifts ORDER BY cost ASC", [], callback);
    }

    static getById(id, callback) {
        db.get("SELECT * FROM gifts WHERE id = ?", [id], callback);
    }

    static recordTransaction(senderId, recipientId, giftId, cost, callback) {
        db.run("INSERT INTO gift_transactions (sender_id, recipient_id, gift_id, cost_total) VALUES (?, ?, ?, ?)",
            [senderId, recipientId, giftId, cost], callback);
    }
}

module.exports = Gift;
