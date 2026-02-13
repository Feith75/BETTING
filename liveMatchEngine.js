const { EventEmitter } = require('events');

class LiveMatchEngine extends EventEmitter {
    constructor(io, sportsDataService, replayEngine) {
        super();
        this.io = io;
        this.sportsDataService = sportsDataService;
        this.replayEngine = replayEngine;
        this.matches = new Map(); // id -> matchState
        this.matchIntervals = new Map(); // id -> intervalId
        this.liveMatchIds = new Set(); // Track which matches are from live API
    }

    startMatch(matchId, homeTeam, awayTeam) {
        if (this.matches.has(matchId)) return;

        console.log(`Starting match ${matchId}: ${homeTeam} vs ${awayTeam}`);

        const matchState = {
            id: matchId,
            homeTeam,
            awayTeam,
            score: { home: 0, away: 0 },
            time: 0, // minutes
            status: 'live', // live, halftime, finished
            stats: {
                possession: 50, // Home possession %
                attacks: { home: 0, away: 0 },
                dangerousAttacks: { home: 0, away: 0 },
                corners: { home: 0, away: 0 },
                yellowCards: { home: 0, away: 0 },
                redCards: { home: 0, away: 0 }
            },
            events: [], // Log of events
            lastEventTime: Date.now()
        };

        this.matches.set(matchId, matchState);
        this.broadcastUpdate(matchId);

        // Simulation loop (runs every second, advances time faster than real-time)
        // 1 real second = 1 game minute (for demo purposes)
        const interval = setInterval(() => {
            this.simulateTick(matchId);
        }, 1000);

        this.matchIntervals.set(matchId, interval);
    }

    async startLiveMatch(matchId) {
        if (this.matches.has(matchId)) return;

        try {
            const matchData = await this.sportsDataService.getMatchDetails(matchId);
            if (!matchData) {
                console.log(`No live match data found for ${matchId}, falling back to simulation`);
                this.startMatch(matchId, 'Unknown Home', 'Unknown Away');
                return;
            }

            console.log(`Starting live match ${matchId}: ${matchData.homeTeam} vs ${matchData.awayTeam}`);

            const matchState = {
                id: matchId,
                homeTeam: matchData.homeTeam,
                awayTeam: matchData.awayTeam,
                score: matchData.score,
                time: matchData.time,
                status: matchData.status,
                stats: {
                    possession: 50,
                    attacks: { home: 0, away: 0 },
                    dangerousAttacks: { home: 0, away: 0 },
                    corners: { home: 0, away: 0 },
                    yellowCards: { home: 0, away: 0 },
                    redCards: { home: 0, away: 0 }
                },
                events: matchData.events || [],
                isLive: true,
                lastEventTime: Date.now()
            };

            this.matches.set(matchId, matchState);
            this.liveMatchIds.add(matchId);
            this.broadcastUpdate(matchId);

            // Poll for updates every 5 minutes (optimized for free tier)
            const interval = setInterval(() => {
                this.pollLiveMatch(matchId);
            }, 300000);

            this.matchIntervals.set(matchId, interval);

        } catch (error) {
            console.error(`Error starting live match ${matchId}:`, error.message);
            this.startMatch(matchId, 'Unknown Home', 'Unknown Away');
        }
    }

    async startReplayMatch(matchId) {
        if (this.matches.has(matchId)) return;

        try {
            const replayData = await this.sportsDataService.getRandomReplayMatch();
            if (!replayData) {
                console.log(`No replay data available, falling back to simulation`);
                this.startMatch(matchId, 'Manchester City', 'Arsenal');
                return;
            }

            console.log(`Starting replay match ${matchId}: ${replayData.teams.home.name} vs ${replayData.teams.away.name}`);

            const matchState = {
                id: matchId,
                homeTeam: replayData.teams.home.name,
                awayTeam: replayData.teams.away.name,
                score: { home: 0, away: 0 },
                time: 0,
                status: 'live',
                stats: {
                    possession: 50,
                    attacks: { home: 0, away: 0 },
                    dangerousAttacks: { home: 0, away: 0 },
                    corners: { home: 0, away: 0 },
                    yellowCards: { home: 0, away: 0 },
                    redCards: { home: 0, away: 0 }
                },
                events: [],
                isReplay: true,
                replayData: {
                    homeTeam: replayData.teams.home.name,
                    awayTeam: replayData.teams.away.name,
                    finalScore: {
                        home: replayData.goals.home || 0,
                        away: replayData.goals.away || 0
                    },
                    events: replayData.events || []
                },
                lastEventTime: Date.now()
            };

            this.matches.set(matchId, matchState);
            this.broadcastUpdate(matchId);

            // Replay loop (faster for demo)
            const interval = setInterval(() => {
                this.replayTick(matchId);
            }, 500); // 2x speed

            this.matchIntervals.set(matchId, interval);

        } catch (error) {
            console.error(`Error starting replay match ${matchId}:`, error.message);
            this.startMatch(matchId, 'Manchester City', 'Arsenal');
        }
    }

    async pollLiveMatch(matchId) {
        const match = this.matches.get(matchId);
        if (!match || !match.isLive) return;

        try {
            const updatedData = await this.sportsDataService.getMatchDetails(matchId);
            if (updatedData) {
                // Check for score changes
                const oldScore = { ...match.score };
                if (updatedData.score.home !== oldScore.home || updatedData.score.away !== oldScore.away) {
                    const scoringTeam = updatedData.score.home > oldScore.home ? 'home' : 'away';
                    this.scoreGoal(match, scoringTeam);
                }

                // Update match state
                match.score = updatedData.score;
                match.time = updatedData.time;
                match.status = updatedData.status;
                match.events = updatedData.events || [];

                // Update stats if available
                if (updatedData.stats && updatedData.stats.length > 0) {
                    this.updateStatsFromAPI(match, updatedData.stats);
                }

                this.broadcastUpdate(matchId);

                // Check if match finished
                if (updatedData.status === 'ft' || updatedData.status === 'finished') {
                    this.finishMatch(matchId);
                }
            }
        } catch (error) {
            console.error(`Error polling live match ${matchId}:`, error.message);
        }
    }

    updateStatsFromAPI(match, apiStats) {
        // Map API stats to our format
        apiStats.forEach(stat => {
            if (stat.type === 'Ball Possession') {
                match.stats.possession = parseInt(stat.home) || 50;
            } else if (stat.type === 'Total Shots') {
                match.stats.attacks.home = parseInt(stat.home) || 0;
                match.stats.attacks.away = parseInt(stat.away) || 0;
            } else if (stat.type === 'Corner Kicks') {
                match.stats.corners.home = parseInt(stat.home) || 0;
                match.stats.corners.away = parseInt(stat.away) || 0;
            } else if (stat.type === 'Yellow Cards') {
                match.stats.yellowCards.home = parseInt(stat.home) || 0;
                match.stats.yellowCards.away = parseInt(stat.away) || 0;
            }
        });
    }

    simulateTick(matchId) {
        const match = this.matches.get(matchId);
        if (!match || match.status === 'finished' || match.isLive || match.isReplay) {
            this.stopMatch(matchId);
            return;
        }

        // Advance time
        match.time += 1;

        // Halftime check
        if (match.time === 45 && match.status === 'live') {
            match.status = 'halftime';
            this.io.to(`match-${matchId}`).emit('match-event', { type: 'halftime', message: 'Half Time' });
            setTimeout(() => {
                match.status = 'live';
                this.io.to(`match-${matchId}`).emit('match-event', { type: 'kickoff', message: 'Second Half Start' });
            }, 5000); // 5 sec halftime for demo
        }

        // Fulltime check
        if (match.time >= 90) {
            this.finishMatch(matchId);
            return;
        }

        // Random event generation
        this.generateRandomEvents(match);

        // Fluctuations
        this.fluctuateStats(match);

        this.broadcastUpdate(matchId);
    }

    replayTick(matchId) {
        const match = this.matches.get(matchId);
        if (!match || !match.isReplay || match.status === 'finished') {
            this.stopMatch(matchId);
            return;
        }

        match.time += 1;

        // Process replay events
        const currentEvents = match.replayData.events.filter(event =>
            event.time === match.time
        );

        currentEvents.forEach(event => {
            if (event.type === 'Goal') {
                const team = event.team === match.replayData.homeTeam ? 'home' : 'away';
                this.scoreGoal(match, team);
            } else if (event.type === 'Card') {
                const team = event.team === match.replayData.homeTeam ? 'home' : 'away';
                match.stats.yellowCards[team]++;
                this.emitEvent(match, 'yellow_card', { team, message: `Yellow Card for ${event.team}` });
            }
        });

        // Update final score at end
        if (match.time >= 90) {
            match.score = match.replayData.finalScore;
            this.finishMatch(matchId);
            return;
        }

        this.broadcastUpdate(matchId);
    }

    generateRandomEvents(match) {
        const rand = Math.random();

        // Goal Probability (very low per tick)
        if (rand < 0.02) {
            const scoringTeam = Math.random() > 0.5 ? 'home' : 'away';
            this.scoreGoal(match, scoringTeam);
        }
        // Yellow Card (low)
        else if (rand < 0.04) {
            const cardTeam = Math.random() > 0.5 ? 'home' : 'away';
            match.stats.yellowCards[cardTeam]++;
            const teamName = match[cardTeam + 'Team'];
            this.emitEvent(match, 'yellow_card', { team: cardTeam, message: `Yellow Card for ${teamName}` });
        }
        // Corner (medium)
        else if (rand < 0.08) {
            const cornerTeam = Math.random() > 0.5 ? 'home' : 'away';
            match.stats.corners[cornerTeam]++;
            const teamName = match[cornerTeam + 'Team'];
            this.emitEvent(match, 'corner', { team: cornerTeam, message: `Corner for ${teamName}` });
        }
    }

    scoreGoal(match, team) {
        match.score[team]++;
        const teamName = match[team + 'Team'];
        const message = `GOAL! ${teamName} scores!`;

        this.emitEvent(match, 'goal', { team, score: match.score, message });

        // Critical: Notify Odds Engine (listener will handle this)
        this.emit('goal-scored', match);
    }

    fluctuateStats(match) {
        // Possession fluctuation
        const change = (Math.random() - 0.5) * 4;
        match.stats.possession = Math.max(20, Math.min(80, match.stats.possession + change));

        // Attacks increment
        if (Math.random() > 0.6) {
            const attackTeam = Math.random() > 0.5 ? 'home' : 'away';
            match.stats.attacks[attackTeam]++;
            if (Math.random() > 0.7) {
                match.stats.dangerousAttacks[attackTeam]++;
            }
        }
    }

    emitEvent(match, type, data) {
        const event = {
            id: Date.now(),
            time: match.time,
            type,
            ...data
        };
        match.events.unshift(event);
        if (match.events.length > 10) match.events.pop(); // Keep last 10

        this.io.to(`match-${match.id}`).emit('match-event', event);
    }

    broadcastUpdate(matchId) {
        const match = this.matches.get(matchId);
        this.io.to(`match-${matchId}`).emit('match-update', match);
        // Also emit internally for odds engine
        this.emit('match-tick', match);
    }

    finishMatch(matchId) {
        const match = this.matches.get(matchId);
        match.status = 'finished';
        this.io.to(`match-${matchId}`).emit('match-finished', { winner: this.getWinner(match) });
        this.stopMatch(matchId);
    }

    stopMatch(matchId) {
        clearInterval(this.matchIntervals.get(matchId));
        this.matchIntervals.delete(matchId);
        this.matches.delete(matchId);
    }

    getWinner(match) {
        if (match.score.home > match.score.away) return 'home';
        if (match.score.away > match.score.home) return 'away';
        return 'draw';
    }
}

module.exports = LiveMatchEngine;
