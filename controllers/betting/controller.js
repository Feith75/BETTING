const { Market, Bet } = require('./model');
const User = require('../user/model');

class BettingController {
    static getMarkets(req, res) {
        Market.getActive((err, markets) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(markets);
        });
    }

    static getBalance(req, res) {
        const userId = req.params.userId;
        User.getById(userId, (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json({ balance: user.coins });
        });
    }

    static getBets(req, res) {
        const userId = req.params.userId;
        Bet.getByUserId(userId, (err, bets) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(bets);
        });
    }

    static placeBet(req, res) {
        const { userId, marketId, selectedOutcome, amount, odds } = req.body;

        // Validate input
        if (!userId || !marketId || !selectedOutcome || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check market status
        Market.getActive((err, markets) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            const market = markets.find(m => m.id == marketId);
            if (!market) return res.status(400).json({ error: 'Market suspended or not found' });

            // Odds verification (simulate re-verification)
            const currentOdds = selectedOutcome === 1 ? market.odds1 : market.odds2;
            if (Math.abs(currentOdds - odds) > 0.1) { // Allow small variance
                return res.status(400).json({ error: 'Odds have changed significantly' });
            }

            // Check user coins
            User.getById(userId, (err, user) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (!user || user.coins < amount) {
                    return res.status(400).json({ error: 'Insufficient coins' });
                }

                // Lock coins (simulate with transaction)
                const newCoins = user.coins - amount;
                User.updateCoins(userId, newCoins, function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Transaction failed' });
                    }

                    // Create bet record
                    Bet.create(userId, marketId, selectedOutcome, amount, currentOdds, function (err) {
                        if (err) {
                            // Rollback coins
                            User.updateCoins(userId, user.coins, () => { });
                            return res.status(500).json({ error: 'Failed to create bet' });
                        }

                        res.json({ message: 'Bet placed successfully', betId: this.lastID });

                        // Emit real-time update
                        if (req.io) req.io.emit('bet-placed', { userId, marketId, betId: this.lastID });
                    });
                });
            });
        });
    }
}

module.exports = BettingController;
