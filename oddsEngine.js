class OddsEngine {
    constructor() {
        this.defaultMargin = 1.08; // 8% house edge
    }

    calculateMatchOptimized(match) {
        // Base probabilities (dynamically adjusted)
        let probHome = 0.33;
        let probDraw = 0.34;
        let probAway = 0.33;

        // Adjust based on score
        const scoreDiff = match.score.home - match.score.away;

        if (scoreDiff > 0) {
            probHome += 0.3 * scoreDiff;
            probDraw -= 0.1 * scoreDiff;
            probAway -= 0.2 * scoreDiff;
        } else if (scoreDiff < 0) {
            probAway += 0.3 * Math.abs(scoreDiff);
            probDraw -= 0.1 * Math.abs(scoreDiff);
            probHome -= 0.2 * Math.abs(scoreDiff);
        }

        // Adjust based on time decay (draw becomes more likely as time passes if score is even)
        if (scoreDiff === 0) {
            const timeFactor = match.time / 90; // 0 to 1
            probDraw += 0.2 * timeFactor;
            probHome -= 0.1 * timeFactor;
            probAway -= 0.1 * timeFactor;
        }

        // Normalize
        const total = probHome + probDraw + probAway;
        probHome /= total;
        probDraw /= total;
        probAway /= total;

        return {
            home: this.probToOdds(probHome),
            draw: this.probToOdds(probDraw),
            away: this.probToOdds(probAway)
        };
    }

    probToOdds(prob) {
        if (prob <= 0.01) return 100.0; // Cap max odds
        return parseFloat((1 / (prob * this.defaultMargin)).toFixed(2));
    }
}

module.exports = new OddsEngine();
