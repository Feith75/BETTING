const Gift = require('./model');
const User = require('../user/model');

class GiftController {
    // Get all available gifts
    static getGifts(req, res) {
        Gift.getAll((err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }

    // Send a gift
    static sendGift(req, res) {
        // Note: io is attached to req in server.js
        const io = req.io;
        const { senderId, matchId, giftId, team } = req.body;

        // 1. Get Gift Cost
        Gift.getById(giftId, (err, gift) => {
            if (err || !gift) return res.status(404).json({ error: 'Gift not found' });

            // 2. Check Sender Balance
            User.getById(senderId, (err, user) => {
                if (err || !user) return res.status(404).json({ error: 'User not found' });

                if (user.coins < gift.cost) {
                    return res.status(400).json({ error: 'Insufficient coins' });
                }

                // 3. Process Transaction
                const newBalance = user.coins - gift.cost;

                // Deduct coins
                User.updateCoins(senderId, newBalance, function (err) {
                    if (err) return res.status(500).json({ error: 'Transaction failed' });

                    // Record transaction
                    // recipient_id is 0 for now (Match Pool), but could be a specific player in future
                    Gift.recordTransaction(senderId, 0, giftId, gift.cost, (err) => {
                        // if (err) ... // log error but transaction already done
                    });

                    // 4. Broadcast Event (TikTok style animation)
                    if (io) {
                        io.emit('gift-received', {
                            sender: user.username,
                            gift: gift,
                            matchId: matchId,
                            team: team, // 'home' or 'away' support
                            message: `sent a ${gift.name}!`
                        });
                    }

                    // 5. Update Leaderboard/Earnings (Diamonds)
                    // In a real app, this would credit the Creator/Team with Diamonds.
                    // For now, we simulate the "House" or "Team" collecting it.

                    res.json({
                        success: true,
                        coins: newBalance,
                        message: `Sent ${gift.name} successfully!`
                    });
                });
            });
        });
    }
}

module.exports = GiftController;
