// controllers/games/controller.js

// Controller for live games and races
const getLiveGames = async (req, res) => {
  try {
    let matches = [];
    let races = [];

    // SAFELY check sportsDataService
    if (req.app.sportsDataService?.getLiveMatches) {
      try {
        const liveMatches = await req.app.sportsDataService.getLiveMatches();

        matches = liveMatches.map(match => ({
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          score: match.score,
          time: match.time,
          status: match.status,
          league: match.league,
          country: match.country
        }));
      } catch (err) {
        console.error('Live API failed:', err.message);
      }
    }

    // Fallback to mock data if API fails or no matches
    if (matches.length === 0) {
      matches = [
        {
          id: Date.now(),
          homeTeam: 'Manchester City',
          awayTeam: 'Arsenal',
          score: { home: 2, away: 1 },
          time: 67,
          status: 'live',
          league: 'Premier League',
          country: 'England'
        }
      ];
    }

    // Mock races (can be extended later)
    races = [
      {
        id: 1,
        name: 'Sprint Championship',
        status: 'waiting',
        players: 2
      }
    ];

    // Return JSON response
    res.json({ matches, races });

  } catch (error) {
    console.error('Live games error:', error);

    // Always return JSON even on error
    res.status(200).json({
      matches: [],
      races: []
    });
  }
};

// Export as an object for router
module.exports = {
  getLiveGames
};

 