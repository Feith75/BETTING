const SportsDataService = require('./sportsDataService');

async function test() {
    const apiKey = '77a5bfd63emsh60febc638461b43p1a0689jsnbba0ea4f08bb';
    const sportsDataService = new SportsDataService(apiKey);

    console.log('Testing getLiveMatches()...');
    const liveMatches = await sportsDataService.getLiveMatches();
    console.log('Live Matches found:', liveMatches.length);
    if (liveMatches.length > 0) {
        console.log('First Live Match:', liveMatches[0].homeTeam, 'vs', liveMatches[0].awayTeam);
    } else {
        console.log('No live matches found or API error.');
    }

    console.log('\nTesting getPastMatches()...');
    const pastMatches = await sportsDataService.getPastMatches();
    console.log('Past Matches found:', pastMatches.length);
}

test();
