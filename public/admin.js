document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const authSection = document.getElementById('auth-section');
    const racesSection = document.getElementById('races-section');
    const racesList = document.getElementById('races-list');

    loginBtn.addEventListener('click', () => {
        const password = passwordInput.value;
        if (password === 'admin') {
            authSection.style.display = 'none';
            racesSection.style.display = 'block';
            fetchActiveRaces();
        } else {
            alert('Incorrect password');
        }
    });

    function fetchActiveRaces() {
        fetch('/api/race/admin/active')
            .then(response => response.json())
            .then(races => {
                displayRaces(races);
            })
            .catch(error => {
                console.error('Error fetching active races:', error);
                racesList.innerHTML = '<p>Error loading races</p>';
            });
    }

    function displayRaces(races) {
        if (races.length === 0) {
            racesList.innerHTML = '<p>No active races</p>';
            return;
        }

        const html = races.map(race => `
            <div class="race-card">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <img src="/assets/lambo_real_car.png" alt="Lambo Car" style="width: 100px; height: auto; border-radius: 10px;">
                    <div>
                        <h3>Race ID: ${race.id}</h3>
                        <p><strong>Participants:</strong> ${race.participants.join(', ')}</p>
                        <p><strong>Track Type:</strong> ${race.trackType}</p>
                        <p><strong>Laps:</strong> ${race.laps}</p>
                        <p><strong>Status:</strong> ${race.status}</p>
                    </div>
                </div>
                <div class="players">
                    <h4>Car Positions:</h4>
                    ${race.players.map(player => `
                        <div class="player">
                            <p>User ID: ${player.userId}</p>
                            <p>Position: (${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)})</p>
                            <p>Lap: ${player.lap}</p>
                            <p>Finished: ${player.finished ? 'Yes' : 'No'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        racesList.innerHTML = html;
    }
});
