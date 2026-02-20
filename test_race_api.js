async function testRaceAPI() {
    const baseUrl = 'http://localhost:5500/api';

    console.log('Testing Race API...');

    // Test create challenge
    console.log('\n1. Creating challenge...');
    try {
        const createResponse = await fetch(`${baseUrl}/race/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                betAmount: 100,
                trackType: 'oval',
                laps: 3
            })
        });
        const createData = await createResponse.json();
        console.log('Create response:', createData);

        if (createData.raceId) {
            const raceId = createData.raceId;

            // Test accept challenge
            console.log('\n2. Accepting challenge...');
            const acceptResponse = await fetch(`${baseUrl}/race/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    raceId: raceId,
                    userId: 2
                })
            });
            const acceptData = await acceptResponse.json();
            console.log('Accept response:', acceptData);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Test create AI challenge
    console.log('\n3. Creating AI challenge...');
    try {
        const aiCreateResponse = await fetch(`${baseUrl}/race/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                betAmount: 50,
                trackType: 'city',
                laps: 2,
                isAi: true
            })
        });
        const aiCreateData = await aiCreateResponse.json();
        console.log('AI Create response:', aiCreateData);
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Test get challenges
    console.log('\n4. Getting challenges...');
    try {
        const challengesResponse = await fetch(`${baseUrl}/race/challenges`);
        const challenges = await challengesResponse.json();
        console.log('Challenges:', challenges.length, 'found');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRaceAPI();
