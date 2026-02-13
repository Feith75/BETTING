const Subscription = require('./model');
const User = require('../user/model');

class SubscriptionController {
    static subscribe(req, res) {
        const { userId, tier, paymentMethod } = req.body;

        if (!userId || !tier || !paymentMethod) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tiers = {
            'Basic': { amount: 5, coins: 5000, duration: 30 },
            'Premium': { amount: 10, coins: 12000, duration: 30 },
            'VIP': { amount: 25, coins: 35000, duration: 30 }
        };

        const selectedTier = tiers[tier];
        if (!selectedTier) {
            return res.status(400).json({ error: 'Invalid subscription tier' });
        }

        // Calculate end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + selectedTier.duration);

        // Create subscription record
        Subscription.create(userId, tier, endDate.toISOString(), paymentMethod, selectedTier.amount, (err, subId) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Update user tier and add coins
            User.getById(userId, (err, user) => {
                if (err) return;

                const newCoins = (user.coins || 0) + selectedTier.coins;
                User.updateCoins(userId, newCoins, (err) => {
                    if (err) return console.error('Failed to add subscription coins');
                });

                Subscription.updateUserTier(userId, tier, endDate.toISOString(), (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to update user status' });

                    res.json({
                        message: 'Subscription active',
                        subscriptionId: subId,
                        tier: tier,
                        expires: endDate,
                        coinsAdded: selectedTier.coins
                    });
                });
            });
        });
    }

    static getStatus(req, res) {
        const userId = req.params.userId;

        Subscription.getActiveByUserId(userId, (err, sub) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            User.getById(userId, (err, user) => {
                if (err) return res.status(500).json({ error: 'Database error' });

                res.json({
                    username: user.username,
                    tier: user.subscription_tier,
                    expires: user.subscription_expires,
                    coins: user.coins,
                    subscription: sub || null
                });
            });
        });
    }
}

module.exports = SubscriptionController;
