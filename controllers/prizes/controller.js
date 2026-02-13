const { Prize, Leaderboard } = require('./model');

class PrizesController {
    static getAllPrizes(req, res) {
        Prize.getAll((err, prizes) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(prizes);
        });
    }

    static getPrizesByCategory(req, res) {
        const category = req.params.category;
        Prize.getByCategory(category, (err, prizes) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(prizes);
        });
    }

    static getLeaderboard(req, res) {
        const period = req.query.period || 'monthly';
        Leaderboard.getTopPlayers(period, 10, (err, players) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(players);
        });
    }

    // Admin only - trigger winner selection (simulated)
    static triggerWinnerSelection(req, res) {
        // Logic to select winners based on leaderboard
        // Provide simulated response
        res.json({ message: 'Winner selection process started', estimatedCompletion: '2 minutes' });
    }
}

module.exports = PrizesController;
