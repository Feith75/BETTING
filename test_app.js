// Main Application Logic
const socket = io('http://localhost:5500');
const API_BASE = 'http://localhost:5500';
window.socket = socket;

// User state
const urlParams = new URLSearchParams(window.location.search);
const userIdParam = urlParams.get('user');

if (userIdParam) {
  // If user param provided, fetch and set as current
  fetch(`${API_BASE}/api/user/${userIdParam}`)
    .then(res => res.json())
    .then(user => {
      if (user && user.id) {
        const newUser = { id: user.id, username: user.username };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        // Remove param and reload to clean URL
        window.location.href = window.location.pathname;
      }
    });
}

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 1, username: 'Player1' };
let currentRaceId = null;
let game = null;

// DOM Elements
const userSwitcher = document.getElementById('user-switcher');
const lobbyView = document.getElementById('lobby-view');
const raceView = document.getElementById('race-view');
const createModal = document.getElementById('create-modal');
const createChallengeBtn = document.getElementById('create-challenge-btn');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const confirmCreateBtn = document.getElementById('confirm-create-btn');
const challengesGrid = document.getElementById('challenges-grid');
const balanceDisplay = document.getElementById('balance');
const usernameDisplay = document.getElementById('username');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const resultModal = document.getElementById('result-modal');
const backToLobbyBtn = document.getElementById('back-to-lobby');

// Initialize
function init() {
  if (userSwitcher) {
    userSwitcher.value = currentUser.id;
    userSwitcher.addEventListener('change', (e) => {
      const selectedId = parseInt(e.target.value);
      fetch(`${API_BASE}/api/user/${selectedId}`)
        .then(res => res.json())
        .then(user => {
          currentUser = { id: user.id, username: user.username };
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          window.location.reload();
        });
    });
  }

  usernameDisplay.textContent = currentUser.username;
  loadBalance();
  loadChallenges();
  setupEventListeners();
  setupSocketListeners();

  // Initialize game engine
  game = new RacingGame('race-canvas', socket);
}

// Load user balance & Subscription Status
function loadBalance() {
  fetch(`${API_BASE}/api/subscription/status/${currentUser.id}`)
    .then(res => res.json())
    .then(data => {
      // PAYWALL CHECK: Redirect if Free/Expired
      // if (!data.tier || data.tier === 'Free') {
      //   alert("Subscription Required for Game Access! Redirecting...");
      //   window.location.href = '/subscribe.html';
      //   return;
      // }

      // Update UI
      balanceDisplay.textContent = `${(data.coins || 0).toFixed(0)} 🪙`;

      // Update Username with Tier Badge
      const badge = data.tier === 'VIP' ? '👑' : data.tier === 'Premium' ? '💎' : '🛡️';
      usernameDisplay.textContent = `${data.username} ${badge}`;
    })
    .catch(err => console.error('Error loading status:', err));
}

// Load open challenges
function loadChallenges() {
  fetch(`${API_BASE}/api/race/challenges`)
    .then(res => res.json())
    .then(challenges => {
      displayChallenges(challenges);
    })
    .catch(err => console.error('Error loading challenges:', err));
}

function displayChallenges(challenges) {
  if (challenges.length === 0) {
    challengesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏎️</div>
        <p>No active challenges</p>
        <p class="empty-subtitle">Create one to get started!</p>
      </div>
    `;
    return;
  }

  challengesGrid.innerHTML = challenges.map(challenge => {
    const trackEmoji = challenge.track_type === 'oval' ? '🏁' :
      challenge.track_type === 'city' ? '🏙️' : '🛣️';
    return `
      <div class="challenge-card" data-race-id="${challenge.id}">
        <div class="challenge-header">
          <span class="challenge-track">${trackEmoji}</span>
          <span class="challenge-bet">${challenge.bet_amount} Coins</span>
        </div>
        <div class="challenge-info">
          <div class="challenge-info-item">
            <span>Track:</span>
            <span>${challenge.track_type}</span>
          </div>
          <div class="challenge-info-item">
            <span>Laps:</span>
            <span>${challenge.laps}</span>
          </div>
          <div class="challenge-info-item">
            <span>Host:</span>
            <span>Player ${challenge.host_id}</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="acceptChallenge(${challenge.id}, ${challenge.bet_amount}, '${challenge.track_type}', ${challenge.laps})">
          Join Race
        </button>
      </div>
    `;
  }).join('');
}

// Event Listeners
function setupEventListeners() {
  createChallengeBtn.addEventListener('click', () => {
    createModal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    createModal.classList.remove('active');
  });

  cancelBtn.addEventListener('click', () => {
    createModal.classList.remove('active');
  });

  confirmCreateBtn.addEventListener('click', createChallenge);

  backToLobbyBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    switchView('lobby');
    loadBalance();
    loadChallenges();
  });
}

// Create challenge
function createChallenge() {
  const betAmount = parseFloat(document.getElementById('bet-amount').value);
  const trackType = document.getElementById('track-type').value;
  const laps = parseInt(document.getElementById('laps').value);
  const isAi = document.getElementById('is-ai').checked;

  if (!betAmount || betAmount <= 0) {
    alert('Please enter a valid coin amount');
    return;
  }

  fetch(`${API_BASE}/api/race/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      betAmount,
      trackType,
      laps,
      isAi
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      createModal.classList.remove('active');
      currentRaceId = data.raceId;

      // Join the race room
      socket.emit('join-race', { raceId: data.raceId, userId: currentUser.id });

      // Switch to race view
      switchView('race');
      game.trackType = trackType;
      game.totalLaps = laps;
      game.isSinglePlayer = isAi; // Set local flag for AI

      if (isAi) {
        // AI race starts automatically
        console.log('AI Race setup complete, triggering start...');
        socket.emit('race-ready', { raceId: data.raceId });
      } else {
        alert('Race created! Waiting for opponent...');
      }
      loadBalance();
    })
    .catch(err => {
      console.error('Error creating challenge:', err);
      alert('Network error. Please check your connection and try again.');
    });
}

// Accept challenge
window.acceptChallenge = function (raceId, betAmount, trackType, laps) {
  if (!confirm(`Join race for ${betAmount} coins?`)) {
    return;
  }

  fetch(`${API_BASE}/api/race/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raceId,
      userId: currentUser.id
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      currentRaceId = raceId;
      socket.emit('join-race', { raceId, userId: currentUser.id });

      // Trigger race start
      socket.emit('race-ready', { raceId });

      switchView('race');
      loadBalance();
    })
    .catch(err => console.error('Error accepting challenge:', err));
};

// Socket.IO Listeners
function setupSocketListeners() {
  socket.on('new-challenge', (data) => {
    loadChallenges();
  });

  socket.on('challenge-accepted', (data) => {
    if (currentRaceId === data.raceId) {
      // Host: Start the race when challenger joins
      socket.emit('race-ready', { raceId: data.raceId });
    }
  });

  socket.on('race-countdown', (data) => {
    countdownOverlay.classList.remove('hidden');
    countdownNumber.textContent = data.countdown;

    if (data.countdown === 1) {
      setTimeout(() => {
        countdownOverlay.classList.add('hidden');
      }, 1000);
    }
  });

  socket.on('race-start', (data) => {
    // Start the game engine
    game.start(currentRaceId, currentUser.id, game.trackType, game.totalLaps);
  });

  socket.on('opponent-update', (data) => {
    // Update opponent position
    if (game) {
      game.updateOpponent(data);
    }
  });

  socket.on('race-finished', (data) => {
    game.stop();

    const isWinner = data.winnerId === currentUser.id;
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');

    if (isWinner) {
      resultIcon.textContent = '🏆';
      resultTitle.textContent = 'You Won!';
      resultMessage.textContent = `Congratulations! You won ${data.payout} coins`;
    } else {
      resultIcon.textContent = '😞';
      resultTitle.textContent = 'You Lost';
      resultMessage.textContent = 'Better luck next time!';
    }

    resultModal.classList.remove('hidden');
  });

  socket.on('race-cancelled', (data) => {
    alert('Race was cancelled');
    game.stop();
    switchView('lobby');
    loadBalance();
    loadChallenges();
  });
}

// Switch views
function switchView(view) {
  lobbyView.classList.remove('active');
  raceView.classList.remove('active');

  if (view === 'lobby') {
    lobbyView.classList.add('active');
  } else if (view === 'race') {
    raceView.classList.add('active');
    if (game) game.resize();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
