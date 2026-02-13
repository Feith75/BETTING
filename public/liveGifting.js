// Live Football Game
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 1, username: 'Player1', coins: 100 };

// Real Teams Data
const TEAMS = {
    manchester: {
        name: 'Manchester United',
        shortName: 'MAN UTD',
        color: '#DA291C',
        secondaryColor: '#FBE122',
        players: [
            { num: 1, name: 'Onana', pos: 'GK' },
            { num: 2, name: 'Lindelof', pos: 'DF' },
            { num: 5, name: 'Maguire', pos: 'DF' },
            { num: 6, name: 'Martinez', pos: 'DF' },
            { num: 8, name: 'Fernandes', pos: 'MF' },
            { num: 18, name: 'Casemiro', pos: 'MF' },
            { num: 7, name: 'Rashford', pos: 'FW' },
            { num: 10, name: 'Garnacho', pos: 'FW' },
            { num: 9, name: 'Hojlund', pos: 'FW' }
        ]
    },
    liverpool: {
        name: 'Liverpool FC',
        shortName: 'LIVERPOOL',
        color: '#C8102E',
        secondaryColor: '#00B2A9',
        players: [
            { num: 1, name: 'Alisson', pos: 'GK' },
            { num: 4, name: 'Van Dijk', pos: 'DF' },
            { num: 5, name: 'Konate', pos: 'DF' },
            { num: 26, name: 'Robertson', pos: 'DF' },
            { num: 8, name: 'Szoboszlai', pos: 'MF' },
            { num: 10, name: 'Mac Allister', pos: 'MF' },
            { num: 11, name: 'Salah', pos: 'FW' },
            { num: 9, name: 'Nunez', pos: 'FW' },
            { num: 7, name: 'Diaz', pos: 'FW' }
        ]
    },
    chelsea: {
        name: 'Chelsea FC',
        shortName: 'CHELSEA',
        color: '#034694',
        secondaryColor: '#FFFFFF',
        players: [
            { num: 1, name: 'Sanchez', pos: 'GK' },
            { num: 2, name: 'Disasi', pos: 'DF' },
            { num: 6, name: 'Silva', pos: 'DF' },
            { num: 26, name: 'Colwill', pos: 'DF' },
            { num: 8, name: 'Fernandez', pos: 'MF' },
            { num: 25, name: 'Caicedo', pos: 'MF' },
            { num: 20, name: 'Palmer', pos: 'FW' },
            { num: 15, name: 'Jackson', pos: 'FW' },
            { num: 11, name: 'Madueke', pos: 'FW' }
        ]
    },
    arsenal: {
        name: 'Arsenal FC',
        shortName: 'ARSENAL',
        color: '#EF0107',
        secondaryColor: '#FFFFFF',
        players: [
            { num: 1, name: 'Raya', pos: 'GK' },
            { num: 2, name: 'Saliba', pos: 'DF' },
            { num: 6, name: 'Gabriel', pos: 'DF' },
            { num: 4, name: 'White', pos: 'DF' },
            { num: 8, name: 'Odegaard', pos: 'MF' },
            { num: 5, name: 'Partey', pos: 'MF' },
            { num: 7, name: 'Saka', pos: 'FW' },
            { num: 9, name: 'Jesus', pos: 'FW' },
            { num: 11, name: 'Martinelli', pos: 'FW' }
        ]
    },
    city: {
        name: 'Manchester City',
        shortName: 'MAN CITY',
        color: '#6CABDD',
        secondaryColor: '#1C2C5B',
        players: [
            { num: 31, name: 'Ederson', pos: 'GK' },
            { num: 3, name: 'Dias', pos: 'DF' },
            { num: 5, name: 'Stones', pos: 'DF' },
            { num: 6, name: 'Ake', pos: 'DF' },
            { num: 17, name: 'De Bruyne', pos: 'MF' },
            { num: 16, name: 'Rodri', pos: 'MF' },
            { num: 10, name: 'Grealish', pos: 'FW' },
            { num: 9, name: 'Haaland', pos: 'FW' },
            { num: 47, name: 'Foden', pos: 'FW' }
        ]
    },
    tottenham: {
        name: 'Tottenham Hotspur',
        shortName: 'SPURS',
        color: '#132257',
        secondaryColor: '#FFFFFF',
        players: [
            { num: 1, name: 'Vicario', pos: 'GK' },
            { num: 17, name: 'Romero', pos: 'DF' },
            { num: 37, name: 'Van de Ven', pos: 'DF' },
            { num: 33, name: 'Davies', pos: 'DF' },
            { num: 10, name: 'Maddison', pos: 'MF' },
            { num: 30, name: 'Bentancur', pos: 'MF' },
            { num: 7, name: 'Son', pos: 'FW' },
            { num: 9, name: 'Richarlison', pos: 'FW' },
            { num: 21, name: 'Kulusevski', pos: 'FW' }
        ]
    }
};

const gameState = {
    mode: null, // 'player' or 'ai'
    homeTeam: null,
    awayTeam: null,
    time: 0,
    maxTime: 24, // 24 minutes total (12 per half)
    halfTime: 12, // Half time at 12 minutes
    half: 1, // 1 or 2
    halfTime: false,
    extraTime: false,
    penaltyShootout: false,
    score: { home: 0, away: 0 },
    penaltyScore: { home: 0, away: 0 },
    stats: {
        possession: 50,
        shots: { home: 0, away: 0 },
        passes: { home: 0, away: 0 },
        tackles: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        yellowCards: { home: [], away: [] },
        redCards: { home: [], away: [] }
    },
    ballPosition: { x: 50, y: 50 },
    isPlaying: false,
    currentTurn: 'home',
    aiDifficulty: 0.6,
    kickoffTeam: null,
    substitutionsUsed: { home: 0, away: 0 },
    selectedAction: null, // 'pass' or 'shoot'
    selectedPlayer: null // player index for action
};

let gameInterval = null;
let aiInterval = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    updateCoinsDisplay();
    showTeamSelection();
}

function showTeamSelection() {
    const modeSelection = document.getElementById('mode-selection');
    modeSelection.innerHTML = `
        <div style="text-align: center; padding: 3rem 2rem;">
            <button class="btn btn-secondary" onclick="window.location.href='/'" style="margin-bottom: 2rem;">← Back to Home</button>
            <h1 style="font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem;">⚽ Select Your Team</h1>
            <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 3rem;">Choose your team to start the match</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 0 auto;">
                ${Object.keys(TEAMS).map(key => {
                    const team = TEAMS[key];
                    return `
                        <div class="team-card" onclick="selectTeam('${key}')" style="background: linear-gradient(135deg, ${team.color}, ${team.secondaryColor}); cursor: pointer; border-radius: 15px; padding: 2rem; text-align: center; transition: all 0.3s; border: 3px solid transparent;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⚽</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${team.name}</div>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9); margin-top: 0.5rem;">Click to select</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Add hover effect
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.borderColor = 'white';
            this.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.borderColor = 'transparent';
            this.style.boxShadow = 'none';
        });
    });
}

function selectTeam(teamKey) {
    gameState.homeTeam = teamKey;
    showOpponentSelection();
}

function showOpponentSelection() {
    const modeSelection = document.getElementById('mode-selection');
    const homeTeam = TEAMS[gameState.homeTeam];
    
    modeSelection.innerHTML = `
        <div style="text-align: center; padding: 3rem 2rem;">
            <button class="btn btn-secondary" onclick="showTeamSelection()" style="margin-bottom: 2rem;">← Change Team</button>
            <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--text); margin-bottom: 0.5rem;">You selected: ${homeTeam.name}</h1>
            <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 3rem;">Now choose your opponent</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 0 auto;">
                ${Object.keys(TEAMS).filter(key => key !== gameState.homeTeam).map(key => {
                    const team = TEAMS[key];
                    return `
                        <div class="team-card" onclick="selectOpponent('${key}')" style="background: linear-gradient(135deg, ${team.color}, ${team.secondaryColor}); cursor: pointer; border-radius: 15px; padding: 2rem; text-align: center; transition: all 0.3s; border: 3px solid transparent;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⚽</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${team.name}</div>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9); margin-top: 0.5rem;">Click to play</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Add hover effect
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.borderColor = 'white';
            this.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.borderColor = 'transparent';
            this.style.boxShadow = 'none';
        });
    });
}

function selectOpponent(teamKey) {
    gameState.awayTeam = teamKey;
    showCoinToss();
}

function showCoinToss() {
    const modeSelection = document.getElementById('mode-selection');
    const homeTeam = TEAMS[gameState.homeTeam];
    const awayTeam = TEAMS[gameState.awayTeam];
    
    modeSelection.innerHTML = `
        <div style="text-align: center; padding: 3rem 2rem;">
            <button class="btn btn-secondary" onclick="showTeamSelection()" style="margin-bottom: 2rem;">← Back to Team Selection</button>
            <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--text); margin-bottom: 2rem;">🪙 Coin Toss</h1>
            <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 3rem;">${homeTeam.name} vs ${awayTeam.name}</p>
            
            <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 3rem; border-radius: 20px; border: 2px solid var(--border);">
                <div style="font-size: 5rem; margin-bottom: 2rem; animation: spin 1s ease;">🪙</div>
                <p style="font-size: 1.3rem; color: var(--text); margin-bottom: 2rem;">Choose heads or tails to decide who kicks off first!</p>
                
                <div style="display: flex; gap: 2rem; justify-content: center;">
                    <button class="btn btn-primary" onclick="coinToss('heads')" style="font-size: 1.2rem; padding: 1rem 2rem;">
                        👑 Heads
                    </button>
                    <button class="btn btn-primary" onclick="coinToss('tails')" style="font-size: 1.2rem; padding: 1rem 2rem;">
                        🦅 Tails
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                from { transform: rotateY(0deg); }
                to { transform: rotateY(720deg); }
            }
        </style>
    `;
}

function coinToss(choice) {
    const result = Math.random() > 0.5 ? 'heads' : 'tails';
    const won = choice === result;
    
    const modeSelection = document.getElementById('mode-selection');
    const homeTeam = TEAMS[gameState.homeTeam];
    
    gameState.kickoffTeam = won ? 'home' : 'away';
    
    modeSelection.innerHTML = `
        <div style="text-align: center; padding: 3rem 2rem;">
            <button class="btn btn-secondary" onclick="showCoinToss()" style="margin-bottom: 2rem;">← Back</button>
            <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 3rem; border-radius: 20px; border: 2px solid var(--border);">
                <div style="font-size: 5rem; margin-bottom: 2rem;">${won ? '🎉' : '😔'}</div>
                <h2 style="font-size: 2rem; color: ${won ? '#22c55e' : '#ef4444'}; margin-bottom: 1rem;">
                    ${won ? 'You Won the Toss!' : 'You Lost the Toss!'}
                </h2>
                <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2rem;">
                    ${won ? `${homeTeam.shortName} will kick off first!` : `Opponent will kick off first!`}
                </p>
                <button class="btn btn-primary" onclick="startGame('ai')" style="font-size: 1.2rem; padding: 1rem 2rem;">
                    ⚽ Start Match
                </button>
            </div>
        </div>
    `;
}

function startGame(mode) {
    gameState.mode = mode;
    gameState.time = 0;
    gameState.half = 1;
    gameState.halfTime = false;
    gameState.extraTime = false;
    gameState.penaltyShootout = false;
    gameState.score = { home: 0, away: 0 };
    gameState.penaltyScore = { home: 0, away: 0 };
    gameState.stats = {
        possession: 50,
        shots: { home: 0, away: 0 },
        passes: { home: 0, away: 0 },
        tackles: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        yellowCards: { home: [], away: [] },
        redCards: { home: [], away: [] }
    };
    gameState.ballPosition = { x: 50, y: 50 };
    gameState.isPlaying = true;
    gameState.currentTurn = gameState.kickoffTeam || 'home';
    gameState.substitutionsUsed = { home: 0, away: 0 };

    const homeTeam = TEAMS[gameState.homeTeam];
    const awayTeam = TEAMS[gameState.awayTeam];

    // Update UI
    document.getElementById('mode-selection').classList.remove('active');
    document.getElementById('game-content').style.display = 'block';
    document.getElementById('stats-section').style.display = 'grid';
    document.getElementById('game-mode-label').textContent = `${homeTeam.shortName} vs ${awayTeam.shortName}`;
    
    document.getElementById('home-team').textContent = homeTeam.shortName;
    document.getElementById('away-team').textContent = awayTeam.shortName;

    // Initialize pitch
    initializePitch();
    updateUI();

    // Start game timer
    gameInterval = setInterval(updateGameTime, 1000);

    // Start AI
    if (mode === 'ai') {
        aiInterval = setInterval(aiTurn, 3000);
    }

    addEventLog({ time: 0, type: 'start', message: `⚽ KICK OFF! ${homeTeam.shortName} vs ${awayTeam.shortName} - First Half begins!` });
    
    // Show kick-off animation
    const actionText = document.getElementById('action-text');
    if (actionText) {
        actionText.textContent = 'KICK OFF!';
        actionText.style.display = 'block';
        setTimeout(() => {
            actionText.style.display = 'none';
        }, 3000);
    }
}

function initializePitch() {
    const container = document.getElementById('visualizer-container');
    const homeTeam = TEAMS[gameState.homeTeam];
    const awayTeam = TEAMS[gameState.awayTeam];
    
    container.innerHTML = `
        <div class="pitch-lines"></div>
        <div class="center-line"></div>
        <div class="center-circle"></div>
        <div class="penalty-area-home"></div>
        <div class="penalty-area-away"></div>
        <div class="ball" id="match-ball"></div>
        <div class="action-overlay" id="action-text">KICK OFF</div>
        <div class="goal-flash" id="goal-flash"></div>
    `;

    // Home team formation positions (4-3-2)
    const homeFormation = [
        { x: 10, y: 50 },  // GK
        { x: 20, y: 25 },  // DF
        { x: 20, y: 50 },  // DF
        { x: 20, y: 75 },  // DF
        { x: 35, y: 35 },  // MF
        { x: 35, y: 65 },  // MF
        { x: 50, y: 30 },  // FW
        { x: 50, y: 50 },  // FW
        { x: 50, y: 70 },  // FW
    ];

    // Away team formation positions (4-3-2)
    const awayFormation = [
        { x: 90, y: 50 },  // GK
        { x: 80, y: 25 },  // DF
        { x: 80, y: 50 },  // DF
        { x: 80, y: 75 },  // DF
        { x: 65, y: 35 },  // MF
        { x: 65, y: 65 },  // MF
        { x: 50, y: 30 },  // FW
        { x: 50, y: 50 },  // FW
        { x: 50, y: 70 },  // FW
    ];

    homeTeam.players.forEach((player, idx) => {
        const pos = homeFormation[idx];
        const playerEl = document.createElement('div');
        playerEl.className = 'player player-home';
        playerEl.id = `home-player-${idx}`;
        playerEl.innerHTML = `
            <div class="player-head"></div>
            <div class="player-body" style="background: linear-gradient(135deg, ${homeTeam.color}, ${homeTeam.secondaryColor}); border-color: ${homeTeam.secondaryColor};">
                ${player.num}
            </div>
        `;
        playerEl.style.left = `${pos.x}%`;
        playerEl.style.top = `${pos.y}%`;
        playerEl.title = `${player.name} (${player.pos})`;
        
        // Add click handler for player selection
        playerEl.onclick = () => selectPlayerForAction('home', idx);
        
        container.appendChild(playerEl);
    });

    awayTeam.players.forEach((player, idx) => {
        const pos = awayFormation[idx];
        const playerEl = document.createElement('div');
        playerEl.className = 'player player-away';
        playerEl.id = `away-player-${idx}`;
        playerEl.innerHTML = `
            <div class="player-head"></div>
            <div class="player-body" style="background: linear-gradient(135deg, ${awayTeam.color}, ${awayTeam.secondaryColor}); border-color: ${awayTeam.secondaryColor};">
                ${player.num}
            </div>
        `;
        playerEl.style.left = `${pos.x}%`;
        playerEl.style.top = `${pos.y}%`;
        playerEl.title = `${player.name} (${player.pos})`;
        container.appendChild(playerEl);
    });

    // Add referee
    const referee = document.createElement('div');
    referee.className = 'referee';
    referee.id = 'referee';
    referee.innerHTML = `
        <div class="referee-head"></div>
        <div class="referee-body"></div>
    `;
    referee.style.left = '50%';
    referee.style.top = '60%';
    referee.title = 'Referee';
    container.appendChild(referee);
}

function updateGameTime() {
    if (!gameState.isPlaying) return;

    gameState.time++;
    const displayTime = gameState.half === 1 ? gameState.time : gameState.time;
    document.getElementById('match-timer').textContent = `${displayTime}' - ${gameState.half === 1 ? '1st Half' : '2nd Half'}`;

    // Random events during play
    if (Math.random() < 0.1) {
        updatePossession();
    }

    // Random match events
    if (Math.random() < 0.05) {
        const events = ['throw-in', 'corner', 'goal-kick', 'free-kick'];
        const event = events[Math.floor(Math.random() * events.length)];
        triggerMatchEvent(event);
    }

    // Half time at 12 minutes
    if (gameState.time === 12 && gameState.half === 1) {
        halfTime();
        return;
    }

    // Full time at 24 minutes
    if (gameState.time === 24 && gameState.half === 2) {
        fullTime();
        return;
    }
}

function halfTime() {
    gameState.isPlaying = false;
    gameState.halfTime = true;
    
    const actionText = document.getElementById('action-text');
    if (actionText) {
        actionText.textContent = 'HALF TIME';
        actionText.style.display = 'block';
    }

    addEventLog({ time: 12, type: 'halftime', message: '⏸️ HALF TIME - 30 second break' });

    // Show half time modal
    setTimeout(() => {
        const modal = document.getElementById('game-over-modal');
        const content = modal.querySelector('.game-over-content');
        content.innerHTML = `
            <div class="winner-icon">⏸️</div>
            <h2>Half Time</h2>
            <div style="margin: 2rem 0;">
                <div style="display: flex; gap: 2rem; justify-content: center; margin-bottom: 2rem;">
                    <div>
                        <div style="font-size: 1rem; color: var(--text-muted);">${TEAMS[gameState.homeTeam].shortName}</div>
                        <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${gameState.score.home}</div>
                    </div>
                    <div style="font-size: 2rem; padding-top: 1rem;">-</div>
                    <div>
                        <div style="font-size: 1rem; color: var(--text-muted);">${TEAMS[gameState.awayTeam].shortName}</div>
                        <div style="font-size: 3rem; font-weight: 800; color: var(--secondary);">${gameState.score.away}</div>
                    </div>
                </div>
                <p style="color: var(--text-muted);">Teams are resting. Second half will begin in <span id="halftime-countdown">30</span> seconds...</p>
            </div>
        `;
        modal.classList.add('active');
        
        // 30 second countdown
        let countdown = 30;
        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = document.getElementById('halftime-countdown');
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                startSecondHalf();
            }
        }, 1000);
    }, 1000);
}

function startSecondHalf() {
    document.getElementById('game-over-modal').classList.remove('active');
    
    gameState.half = 2;
    gameState.time = 12;
    gameState.halfTime = false;
    gameState.isPlaying = true;
    gameState.currentTurn = gameState.kickoffTeam === 'home' ? 'away' : 'home'; // Switch kick-off
    
    // Reset ball to center
    moveBallToPosition(50, 50);
    
    const actionText = document.getElementById('action-text');
    if (actionText) {
        actionText.textContent = 'SECOND HALF - KICK OFF!';
        actionText.style.display = 'block';
        setTimeout(() => {
            actionText.style.display = 'none';
        }, 3000);
    }
    
    addEventLog({ time: 12, type: 'start', message: '⚽ Second Half begins!' });
}

function fullTime() {
    gameState.isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(aiInterval);

    const actionText = document.getElementById('action-text');
    if (actionText) {
        actionText.textContent = 'FULL TIME';
        actionText.style.display = 'block';
    }

    addEventLog({ time: 24, type: 'fulltime', message: '🏁 FULL TIME - Match ended!' });

    // Check if we need extra time (for tournament mode)
    if (gameState.score.home === gameState.score.away) {
        setTimeout(() => showDrawOptions(), 2000);
    } else {
        setTimeout(() => endGame(), 2000);
    }
}

function showDrawOptions() {
    const modal = document.getElementById('game-over-modal');
    const content = modal.querySelector('.game-over-content');
    content.innerHTML = `
        <div class="winner-icon">🤝</div>
        <h2>Match Drawn!</h2>
        <div style="margin: 2rem 0;">
            <div style="display: flex; gap: 2rem; justify-content: center;">
                <div>
                    <div style="font-size: 1rem; color: var(--text-muted);">${TEAMS[gameState.homeTeam].shortName}</div>
                    <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${gameState.score.home}</div>
                </div>
                <div style="font-size: 2rem; padding-top: 1rem;">-</div>
                <div>
                    <div style="font-size: 1rem; color: var(--text-muted);">${TEAMS[gameState.awayTeam].shortName}</div>
                    <div style="font-size: 3rem; font-weight: 800; color: var(--secondary);">${gameState.score.away}</div>
                </div>
            </div>
        </div>
        <p style="margin: 2rem 0; color: var(--text-muted);">Do you want to continue to penalties or end the match?</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-primary" onclick="startPenaltyShootout()">⚽ Penalty Shootout</button>
            <button class="btn btn-secondary" onclick="endGame()">End Match</button>
        </div>
    `;
    modal.classList.add('active');
}

function startPenaltyShootout() {
    document.getElementById('game-over-modal').classList.remove('active');
    gameState.penaltyShootout = true;
    gameState.penaltyScore = { home: 0, away: 0 };
    gameState.penaltyRound = 1;
    
    addEventLog({ time: 24, type: 'penalties', message: '🎯 PENALTY SHOOTOUT begins!' });
    
    alert('Penalty Shootout! Click Shoot button to take penalties.');
}

function triggerMatchEvent(eventType) {
    const team = Math.random() > 0.5 ? 'home' : 'away';
    const teamName = TEAMS[gameState[`${team}Team`]].shortName;
    
    switch(eventType) {
        case 'throw-in':
            addEventLog({ time: gameState.time, type: 'throw', message: `↗️ Throw-in for ${teamName}` });
            break;
        case 'corner':
            gameState.stats.corners[team]++;
            addEventLog({ time: gameState.time, type: 'corner', message: `🚩 Corner kick for ${teamName}` });
            moveBallToPosition(team === 'home' ? 90 : 10, Math.random() > 0.5 ? 10 : 90);
            break;
        case 'goal-kick':
            addEventLog({ time: gameState.time, type: 'goalkick', message: `🥅 Goal kick for ${teamName}` });
            moveBallToPosition(team === 'home' ? 10 : 90, 50);
            break;
        case 'free-kick':
            gameState.stats.fouls[team === 'home' ? 'away' : 'home']++;
            addEventLog({ time: gameState.time, type: 'freekick', message: `⚠️ Free kick awarded to ${teamName}` });
            break;
    }
}

function updatePossession() {
    const change = (Math.random() - 0.5) * 10;
    gameState.stats.possession = Math.max(20, Math.min(80, gameState.stats.possession + change));
    updateBallPosition();
}

function updateBallPosition() {
    const ball = document.getElementById('match-ball');
    const actionText = document.getElementById('action-text');
    const homeTeam = TEAMS[gameState.homeTeam];
    const awayTeam = TEAMS[gameState.awayTeam];
    
    if (!ball) return;

    let targetX, targetY;
    
    if (gameState.stats.possession > 55) {
        // Home attacking
        targetX = 60 + (Math.random() * 25);
        targetY = 25 + (Math.random() * 50);
        actionText.textContent = `${homeTeam.shortName} ATTACKING`;
        actionText.style.display = 'block';
        movePlayersToAttack('home');
    } else if (gameState.stats.possession < 45) {
        // Away attacking
        targetX = 15 + (Math.random() * 25);
        targetY = 25 + (Math.random() * 50);
        actionText.textContent = `${awayTeam.shortName} ATTACKING`;
        actionText.style.display = 'block';
        movePlayersToAttack('away');
    } else {
        // Midfield
        targetX = 40 + (Math.random() * 20);
        targetY = 30 + (Math.random() * 40);
        actionText.style.display = 'none';
        resetPlayerPositions();
    }

    gameState.ballPosition = { x: targetX, y: targetY };
    ball.style.left = `${targetX}%`;
    ball.style.top = `${targetY}%`;

    // Highlight nearest player to ball
    highlightNearestPlayer(targetX, targetY);
}

function movePlayersToAttack(team) {
    if (team === 'home') {
        // Move home players forward
        for (let i = 3; i < 9; i++) {
            const player = document.getElementById(`home-player-${i}`);
            if (player) {
                const currentLeft = parseFloat(player.style.left);
                player.style.left = `${Math.min(85, currentLeft + 5)}%`;
            }
        }
        // Move away players back
        for (let i = 3; i < 9; i++) {
            const player = document.getElementById(`away-player-${i}`);
            if (player) {
                const currentLeft = parseFloat(player.style.left);
                player.style.left = `${Math.max(55, currentLeft - 5)}%`;
            }
        }
    } else {
        // Move away players forward
        for (let i = 3; i < 9; i++) {
            const player = document.getElementById(`away-player-${i}`);
            if (player) {
                const currentLeft = parseFloat(player.style.left);
                player.style.left = `${Math.max(15, currentLeft - 5)}%`;
            }
        }
        // Move home players back
        for (let i = 3; i < 9; i++) {
            const player = document.getElementById(`home-player-${i}`);
            if (player) {
                const currentLeft = parseFloat(player.style.left);
                player.style.left = `${Math.min(45, currentLeft + 5)}%`;
            }
        }
    }
}

function resetPlayerPositions() {
    // Reset home players
    const homePositions = [10, 20, 20, 20, 35, 35, 50, 50, 50];
    for (let i = 0; i < 9; i++) {
        const player = document.getElementById(`home-player-${i}`);
        if (player) {
            player.style.left = `${homePositions[i]}%`;
        }
    }

    // Reset away players
    const awayPositions = [90, 80, 80, 80, 65, 65, 50, 50, 50];
    for (let i = 0; i < 9; i++) {
        const player = document.getElementById(`away-player-${i}`);
        if (player) {
            player.style.left = `${awayPositions[i]}%`;
        }
    }
}

function highlightNearestPlayer(ballX, ballY) {
    // Remove all highlights
    document.querySelectorAll('.player').forEach(p => p.classList.remove('player-active'));

    let nearestPlayer = null;
    let minDistance = Infinity;

    // Find nearest player
    document.querySelectorAll('.player').forEach(player => {
        const playerX = parseFloat(player.style.left);
        const playerY = parseFloat(player.style.top);
        const distance = Math.sqrt(Math.pow(playerX - ballX, 2) + Math.pow(playerY - ballY, 2));
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestPlayer = player;
        }
    });

    // Highlight nearest player
    if (nearestPlayer && minDistance < 20) {
        nearestPlayer.classList.add('player-active');
    }
}

function performAction(action) {
    if (!gameState.isPlaying) return;
    if (gameState.currentTurn !== 'home') return;

    // For pass and shoot, enable player selection mode
    if (action === 'pass' || action === 'shoot') {
        gameState.selectedAction = action;
        
        // Highlight all home players for selection
        document.querySelectorAll('.player-home').forEach(p => {
            p.classList.add('selectable');
        });
        
        // Update action text
        const actionText = document.getElementById('action-text');
        if (actionText) {
            actionText.textContent = action === 'pass' ? 'SELECT PLAYER TO PASS TO' : 'SELECT PLAYER TO SHOOT';
            actionText.style.display = 'block';
        }
        
        // Update button states
        updateButtonStates();
        return;
    }

    const success = Math.random() > 0.4; // 60% success rate
    let message = '';
    const homeTeam = TEAMS[gameState.homeTeam];

    switch (action) {
        case 'defend':
            const defenderIdx = Math.floor(Math.random() * 3) + 1; // Defenders
            moveBallToPlayer('home', defenderIdx);
            
            setTimeout(() => {
                if (success) {
                    message = `🛡️ ${homeTeam.players[defenderIdx].name} good defense!`;
                    gameState.stats.possession = Math.min(80, gameState.stats.possession + 10);
                    moveBallToPosition(30, 50);
                } else {
                    message = `⚠️ ${homeTeam.players[defenderIdx].name} defense broken!`;
                    moveBallToPosition(20, 50);
                }
                addEventLog({ time: gameState.time, type: action, message });
                updateUI();
            }, 800);
            break;

        case 'tackle':
            gameState.stats.tackles.home++;
            const tacklerIdx = Math.floor(Math.random() * 6) + 1; // Defender/Midfielder
            moveBallToPlayer('home', tacklerIdx);
            moveRefereeToPosition(gameState.ballPosition.x, gameState.ballPosition.y);
            
            setTimeout(() => {
                if (success) {
                    message = `💪 ${homeTeam.players[tacklerIdx].name} great tackle!`;
                    gameState.stats.possession = Math.min(80, gameState.stats.possession + 15);
                    gameState.currentTurn = 'home';
                    moveBallToPosition(50, 50);
                } else {
                    message = `🟨 Foul by ${homeTeam.players[tacklerIdx].name}! Yellow card!`;
                    showCard('yellow');
                    gameState.currentTurn = 'away';
                    moveBallToPosition(30, 50);
                }
                addEventLog({ time: gameState.time, type: action, message });
                updateUI();
            }, 800);
            break;
    }

    updateUI();

    // Switch turn in player vs player mode
    if (gameState.mode === 'player' && success) {
        setTimeout(() => {
            gameState.currentTurn = gameState.currentTurn === 'home' ? 'away' : 'home';
            updateUI();
        }, 1500);
    }
}

function selectPlayerForAction(team, playerIdx) {
    if (!gameState.selectedAction || team !== 'home' || gameState.currentTurn !== 'home') return;
    
    const homeTeam = TEAMS[gameState.homeTeam];
    const success = Math.random() > 0.4;
    let message = '';
    
    // Remove selectable class from all players
    document.querySelectorAll('.player').forEach(p => p.classList.remove('selectable'));
    
    // Hide action text
    const actionText = document.getElementById('action-text');
    if (actionText) {
        actionText.style.display = 'none';
    }
    
    if (gameState.selectedAction === 'shoot') {
        gameState.stats.shots.home++;
        moveBallToPlayer('home', playerIdx);
        
        setTimeout(() => {
            if (success && Math.random() > 0.7) {
                // Goal!
                gameState.score.home++;
                message = `⚽ GOAL! ${homeTeam.players[playerIdx].name} scored!`;
                showGoalAnimation();
                moveBallToPosition(85, 50);
            } else {
                message = success ? `🎯 ${homeTeam.players[playerIdx].name} shot saved!` : `❌ ${homeTeam.players[playerIdx].name} shot missed!`;
                moveBallToPosition(85, 30 + Math.random() * 40);
            }
            addEventLog({ time: gameState.time, type: 'shoot', message });
            updateUI();
        }, 800);
        
    } else if (gameState.selectedAction === 'pass') {
        gameState.stats.passes.home++;
        
        // Find current ball holder (random for now)
        const passerIdx = Math.floor(Math.random() * 6) + 3;
        const receiverIdx = playerIdx;
        
        const passerPlayer = document.getElementById(`home-player-${passerIdx}`);
        const receiverPlayer = document.getElementById(`home-player-${receiverIdx}`);
        
        if (passerPlayer && receiverPlayer) {
            const fromX = parseFloat(passerPlayer.style.left);
            const fromY = parseFloat(passerPlayer.style.top);
            const toX = parseFloat(receiverPlayer.style.left);
            const toY = parseFloat(receiverPlayer.style.top);
            
            moveBallToPlayer('home', passerIdx);
            
            // Show pass line
            setTimeout(() => {
                showPassLine(fromX, fromY, toX, toY);
            }, 200);
        }
        
        setTimeout(() => {
            if (success) {
                message = `✅ Pass to ${homeTeam.players[receiverIdx].name}!`;
                gameState.stats.possession = Math.min(80, gameState.stats.possession + 5);
                moveBallToPlayer('home', receiverIdx);
            } else {
                message = `❌ Pass intercepted!`;
                gameState.stats.possession = Math.max(20, gameState.stats.possession - 10);
                gameState.currentTurn = 'away';
                moveBallToPosition(40, 50);
            }
            addEventLog({ time: gameState.time, type: 'pass', message });
            updateUI();
        }, 800);
    }
    
    // Reset selection state
    gameState.selectedAction = null;
    gameState.selectedPlayer = null;
    updateButtonStates();
}

function updateButtonStates() {
    const buttons = ['btn-shoot', 'btn-pass', 'btn-defend', 'btn-tackle'];
    const isSelecting = gameState.selectedAction !== null;
    
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            const action = id.replace('btn-', '');
            
            if (isSelecting) {
                // Highlight the active action button
                if (action === gameState.selectedAction) {
                    btn.style.background = 'var(--secondary)';
                    btn.style.borderColor = 'var(--secondary)';
                    btn.textContent = action === 'pass' ? '🎯 Selecting...' : '⚽ Selecting...';
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.3';
                }
            } else {
                // Normal state
                btn.disabled = gameState.currentTurn !== 'home' || !gameState.isPlaying;
                btn.style.opacity = (gameState.currentTurn === 'home' && gameState.isPlaying) ? '1' : '0.5';
                btn.style.background = '';
                btn.style.borderColor = '';
                
                // Reset button text
                if (action === 'shoot') btn.textContent = '⚽ Shoot';
                if (action === 'pass') btn.textContent = '🎯 Pass';
                if (action === 'defend') btn.textContent = '🛡️ Defend';
                if (action === 'tackle') btn.textContent = '💪 Tackle';
            }
        }
    });
}

function aiTurn() {
    if (!gameState.isPlaying || gameState.mode !== 'ai') return;
    if (gameState.currentTurn !== 'away') {
        gameState.currentTurn = 'away';
    }

    const actions = ['shoot', 'pass', 'defend', 'tackle'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const success = Math.random() < gameState.aiDifficulty;
    const awayTeam = TEAMS[gameState.awayTeam];

    let message = '';

    switch (action) {
        case 'shoot':
            gameState.stats.shots.away++;
            const shooterIdx = Math.floor(Math.random() * 3) + 6;
            moveBallToPlayer('away', shooterIdx);
            
            setTimeout(() => {
                if (success && Math.random() > 0.7) {
                    gameState.score.away++;
                    message = `⚽ GOAL! ${awayTeam.players[shooterIdx].name} scored!`;
                    showGoalAnimation();
                    moveBallToPosition(15, 50);
                } else {
                    message = success ? `🎯 ${awayTeam.players[shooterIdx].name} shot saved!` : `❌ ${awayTeam.players[shooterIdx].name} shot missed!`;
                    moveBallToPosition(15, 30 + Math.random() * 40);
                }
                addEventLog({ time: gameState.time, type: action, message });
                updateUI();
            }, 800);
            break;

        case 'pass':
            gameState.stats.passes.away++;
            const passerIdx = Math.floor(Math.random() * 6) + 3;
            const receiverIdx = Math.floor(Math.random() * 6) + 3;
            
            const passerPlayer = document.getElementById(`away-player-${passerIdx}`);
            const receiverPlayer = document.getElementById(`away-player-${receiverIdx}`);
            
            if (passerPlayer && receiverPlayer) {
                const fromX = parseFloat(passerPlayer.style.left);
                const fromY = parseFloat(passerPlayer.style.top);
                const toX = parseFloat(receiverPlayer.style.left);
                const toY = parseFloat(receiverPlayer.style.top);
                
                moveBallToPlayer('away', passerIdx);
                
                // Show pass line
                setTimeout(() => {
                    showPassLine(fromX, fromY, toX, toY);
                }, 200);
            }
            
            setTimeout(() => {
                if (success) {
                    message = `${awayTeam.players[passerIdx].name} passes to ${awayTeam.players[receiverIdx].name}`;
                    gameState.stats.possession = Math.max(20, gameState.stats.possession - 5);
                    moveBallToPlayer('away', receiverIdx);
                } else {
                    message = `${awayTeam.players[passerIdx].name}'s pass intercepted!`;
                    gameState.stats.possession = Math.min(80, gameState.stats.possession + 10);
                    gameState.currentTurn = 'home';
                    moveBallToPosition(60, 50);
                }
                addEventLog({ time: gameState.time, type: action, message });
                updateUI();
            }, 800);
            break;

        case 'defend':
            const defenderIdx = Math.floor(Math.random() * 3) + 1;
            moveBallToPlayer('away', defenderIdx);
            
            setTimeout(() => {
                if (success) {
                    message = `${awayTeam.players[defenderIdx].name} defending well`;
                    gameState.stats.possession = Math.max(20, gameState.stats.possession - 10);
                    moveBallToPosition(70, 50);
                } else {
                    message = `${awayTeam.players[defenderIdx].name} defense broken!`;
                    moveBallToPosition(80, 50);
                }
                addEventLog({ time: gameState.time, type: action, message });
                updateUI();
            }, 800);
            break;

        case 'tackle':
            gameState.stats.tackles.away++;
            const tacklerIdx = Math.floor(Math.random() * 6) + 1;
            moveBallToPlayer('away', tacklerIdx);
            moveRefereeToPosition(gameState.ballPosition.x, gameState.ballPosition.y);
            
            setTimeout(() => {
                if (success) {
                    message = `${awayTeam.players[tacklerIdx].name} tackles successfully!`;
                    gameState.stats.possession = Math.max(20, gameState.stats.possession - 15);
                    moveBallToPosition(50, 50);
                } else {
                    message = `🟨 Foul by ${awayTeam.players[tacklerIdx].name}! Yellow card!`;
                    showCard('yellow');
                    gameState.currentTurn = 'home';
                    moveBallToPosition(70, 50);
                }
                addEventLog({ time: gameState.time, type: action, message });
                updateUI();
            }, 800);
            break;
    }

    // Give control back to player after AI action
    setTimeout(() => {
        gameState.currentTurn = 'home';
        updateUI();
    }, 2000);
}

function moveBallToPosition(x, y) {
    const ball = document.getElementById('match-ball');
    if (ball) {
        ball.style.left = `${x}%`;
        ball.style.top = `${y}%`;
    }
    gameState.ballPosition = { x, y };
    
    // Highlight nearest player
    highlightNearestPlayer(x, y);
}

function moveBallToPlayer(team, playerIdx) {
    const player = document.getElementById(`${team}-player-${playerIdx}`);
    if (player) {
        const x = parseFloat(player.style.left);
        const y = parseFloat(player.style.top);
        moveBallToPosition(x, y);
        
        // Highlight the player
        document.querySelectorAll('.player').forEach(p => p.classList.remove('player-active'));
        player.classList.add('player-active');
        
        setTimeout(() => {
            player.classList.remove('player-active');
        }, 1000);
    }
}

function showPassLine(fromX, fromY, toX, toY) {
    const container = document.getElementById('visualizer-container');
    if (!container) return;

    // Calculate line position and angle
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Create dashed line
    const line = document.createElement('div');
    line.className = 'pass-line';
    line.style.left = `${fromX}%`;
    line.style.top = `${fromY}%`;
    line.style.width = `${distance}%`;
    line.style.transform = `rotate(${angle}deg)`;
    container.appendChild(line);

    // Create arrow at the end
    const arrow = document.createElement('div');
    arrow.className = 'pass-arrow';
    arrow.style.left = `${toX}%`;
    arrow.style.top = `${toY}%`;
    arrow.style.transform = `rotate(${angle}deg) translateX(-10px)`;
    container.appendChild(arrow);

    // Remove after animation
    setTimeout(() => {
        line.remove();
        arrow.remove();
    }, 800);
}

function moveRefereeToPosition(x, y) {
    const referee = document.getElementById('referee');
    if (referee) {
        // Move referee closer to the action
        const refX = x + (Math.random() - 0.5) * 10;
        const refY = y + (Math.random() - 0.5) * 10;
        referee.style.left = `${refX}%`;
        referee.style.top = `${refY}%`;
    }
}

function showCard(cardType) {
    const referee = document.getElementById('referee');
    if (!referee) return;

    const card = document.createElement('div');
    card.className = `card-show ${cardType}-card`;
    referee.appendChild(card);

    setTimeout(() => {
        card.remove();
    }, 2000);
}

function showGoalAnimation() {
    const flash = document.getElementById('goal-flash');
    if (flash) {
        flash.style.display = 'block';
        setTimeout(() => flash.style.display = 'none', 600);
    }

    // Award coin for scoring
    if (gameState.score.home > gameState.score.away) {
        currentUser.coins += 1;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateCoinsDisplay();
    }
}

function updateUI() {
    // Update scores
    document.getElementById('score-home').textContent = gameState.score.home;
    document.getElementById('score-away').textContent = gameState.score.away;

    // Update possession bar
    document.getElementById('possession-bar').style.width = `${gameState.stats.possession}%`;

    // Update stats
    document.getElementById('shots-stat').textContent = 
        `${gameState.stats.shots.home} - ${gameState.stats.shots.away}`;
    document.getElementById('corners-stat').textContent = 
        `${gameState.stats.corners.home} - ${gameState.stats.corners.away}`;
    document.getElementById('fouls-stat').textContent = 
        `${gameState.stats.fouls.home} - ${gameState.stats.fouls.away}`;
    document.getElementById('subs-stat').textContent = 
        `${gameState.substitutionsUsed.home}/5 - ${gameState.substitutionsUsed.away}/5`;

    // Update ball position
    updateBallPosition();

    // Update button states
    updateButtonStates();

    // Substitution button
    const subBtn = document.getElementById('btn-sub');
    if (subBtn) {
        subBtn.disabled = gameState.substitutionsUsed.home >= 5 || !gameState.isPlaying;
        subBtn.style.opacity = (gameState.substitutionsUsed.home < 5 && gameState.isPlaying) ? '1' : '0.5';
    }
}

function makeSubstitution() {
    if (gameState.substitutionsUsed.home >= 5) {
        alert('Maximum 5 substitutions already used!');
        return;
    }

    gameState.substitutionsUsed.home++;
    const homeTeam = TEAMS[gameState.homeTeam];
    const playerOut = Math.floor(Math.random() * 9);
    const playerIn = Math.floor(Math.random() * 20) + 12; // Random sub number
    
    addEventLog({ 
        time: gameState.time, 
        type: 'sub', 
        message: `🔄 Substitution: ${homeTeam.players[playerOut].name} OFF, Player #${playerIn} ON` 
    });
    
    updateUI();
}

function addEventLog(event) {
    const feed = document.getElementById('event-feed');
    const item = document.createElement('div');
    item.className = 'event-item';

    let icon = '⚽';
    if (event.type === 'shoot') icon = '⚽';
    if (event.type === 'pass') icon = '🎯';
    if (event.type === 'defend') icon = '🛡️';
    if (event.type === 'tackle') icon = '💪';
    if (event.type === 'start') icon = '🏁';

    item.innerHTML = `<span>${event.time}'</span> <span>${icon}</span> <span>${event.message}</span>`;
    feed.prepend(item);

    // Update latest event
    document.getElementById('latest-event').textContent = event.message;
}

function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(aiInterval);

    const modal = document.getElementById('game-over-modal');
    const winnerIcon = document.getElementById('winner-icon');
    const winnerText = document.getElementById('winner-text');
    const finalScores = document.getElementById('final-scores');

    if (gameState.score.home > gameState.score.away) {
        winnerIcon.textContent = '🏆';
        winnerText.textContent = 'You Win!';
        // Award bonus coins
        currentUser.coins += 5;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateCoinsDisplay();
    } else if (gameState.score.away > gameState.score.home) {
        winnerIcon.textContent = '😢';
        winnerText.textContent = 'You Lost!';
    } else {
        winnerIcon.textContent = '🤝';
        winnerText.textContent = "It's a Draw!";
        currentUser.coins += 2;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateCoinsDisplay();
    }

    finalScores.innerHTML = `
        <div style="display: flex; gap: 2rem; justify-content: center;">
            <div>
                <div style="font-size: 1rem; color: var(--text-muted);">You</div>
                <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${gameState.score.home}</div>
            </div>
            <div>
                <div style="font-size: 1rem; color: var(--text-muted);">Opponent</div>
                <div style="font-size: 3rem; font-weight: 800; color: var(--secondary);">${gameState.score.away}</div>
            </div>
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 10px;">
            <p style="color: #22c55e; font-weight: 600; margin: 0;">Match completed! ${gameState.score.home > gameState.score.away ? '+5 coins earned!' : gameState.score.home === gameState.score.away ? '+2 coins earned!' : ''}</p>
        </div>
    `;

    modal.classList.add('active');
    addEventLog({ time: gameState.time, type: 'end', message: 'Full Time! Match ended.' });
}

function backToModeSelection() {
    // Clear intervals
    clearInterval(gameInterval);
    clearInterval(aiInterval);

    // Reset game state
    gameState.isPlaying = false;
    gameState.homeTeam = null;
    gameState.awayTeam = null;

    // Hide game content
    document.getElementById('game-content').style.display = 'none';
    document.getElementById('stats-section').style.display = 'none';
    document.getElementById('game-over-modal').classList.remove('active');

    // Show team selection
    document.getElementById('mode-selection').classList.add('active');
    showTeamSelection();

    // Clear event feed
    document.getElementById('event-feed').innerHTML = '';
}

function confirmQuit() {
    if (confirm('Are you sure you want to quit the match? Progress will be lost.')) {
        backToModeSelection();
    }
}

function updateCoinsDisplay() {
    document.getElementById('balance').textContent = currentUser.coins;
}
