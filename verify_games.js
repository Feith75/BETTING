const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5500,
    path: '/api/games/live',
    method: 'GET'
};

const req = http.request(options, res => {
    let data = '';

    res.on('data', chunk => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(data);
                console.log('✅ Games API Response OK');
                console.log('Matches:', json.matches ? json.matches.length : 'N/A');
                console.log('Races:', json.races ? json.races.length : 'N/A');

                if (json.matches && json.matches.length > 0) {
                    console.log('Sample Match:', json.matches[0].homeTeam, 'vs', json.matches[0].awayTeam);
                }
            } catch (e) {
                console.error('❌ Failed to parse JSON response:', e.message);
            }
        } else {
            console.error(`❌ API Error: Status Code ${res.statusCode}`);
        }
    });
});

req.on('error', error => {
    console.error('❌ Request Error:', error.message);
});

req.end();
