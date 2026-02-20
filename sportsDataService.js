const axios = require('axios');
require('dotenv').config();

class SportsDataService {
    constructor(apiKey = process.env.RAPIDAPI_KEY) {
        this.apiKey = apiKey;
        this.baseURL = process.env.RAPIDAPI_FOOTBALL_URL || 
        this.headers = {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': process.env.RAPIDAPI_FOOTBALL_HOST || 
        };
        this.cache = new Map(); // Cache for API responses
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    async getLiveMatches() {
        try {
            const response = await axios.get(`${this.baseURL}/fixtures`, {
                headers: this.headers,
                params: {
                    live: 'all'
                }
            });

            if (response.data && response.data.response) {
                return response.data.response.map(fixture => ({
                    id: fixture.fixture.id,
                    homeTeam: fixture.teams.home.name,
                    awayTeam: fixture.teams.away.name,
                    score: {
                        home: fixture.goals.home || 0,
                        away: fixture.goals.away || 0
                    },
                    time: fixture.fixture.status.elapsed || 0,
                    status: fixture.fixture.status.short.toLowerCase(),
                    league: fixture.league.name,
                    country: fixture.league.country,
                    events: fixture.events || []
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching live matches:', error.message);
            return [];
        }
    }

    async getMatchDetails(matchId) {
        const cacheKey = `match_${matchId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await axios.get(`${this.baseURL}/fixtures`, {
                headers: this.headers,
                params: {
                    id: matchId
                }
            });

            if (response.data && response.data.response && response.data.response.length > 0) {
                const fixture = response.data.response[0];
                const matchData = {
                    id: fixture.fixture.id,
                    homeTeam: fixture.teams.home.name,
                    awayTeam: fixture.teams.away.name,
                    score: {
                        home: fixture.goals.home || 0,
                        away: fixture.goals.away || 0
                    },
                    time: fixture.fixture.status.elapsed || 0,
                    status: fixture.fixture.status.short.toLowerCase(),
                    stats: fixture.statistics || [],
                    events: fixture.events || [],
                    league: fixture.league.name,
                    country: fixture.league.country
                };

                this.cache.set(cacheKey, { data: matchData, timestamp: Date.now() });
                return matchData;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching match ${matchId}:`, error.message);
            return null;
        }
    }

    async getPastMatches(leagueId = 39, season = 2023) { // Premier League by default
        try {
            const response = await axios.get(`${this.baseURL}/fixtures`, {
                headers: this.headers,
                params: {
                    league: leagueId,
                    season: season,
                    status: 'FT' // Finished matches
                }
            });

            if (response.data && response.data.response) {
                return response.data.response.slice(0, 10); // Get last 10 matches for replay
            }
            return [];
        } catch (error) {
            console.error('Error fetching past matches:', error.message);
            return [];
        }
    }

    // Get a random past match for replay mode
    async getRandomReplayMatch() {
        const pastMatches = await this.getPastMatches();
        if (pastMatches.length > 0) {
            return pastMatches[Math.floor(Math.random() * pastMatches.length)];
        }
        return null;
    }
}

module.exports = SportsDataService;
