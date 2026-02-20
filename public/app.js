// Main Application Logic
console.log('app.js loaded');

const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5500' 
  : window.location.origin;
const socket = io(SOCKET_URL);
const API_BASE = SOCKET_URL;
window.socket = socket;

console.log('Socket initialized:', socket);

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

// DOM Elements - will be initialized in init()
let userSwitcher;
let lobbyView;
let raceView;
let createModal;
let createChallengeBtn;
let closeModalBtn;
let cancelBtn;
let confirmCreateBtn;
let challengesGrid;
let balanceDisplay;
let usernameDisplay;
let countdownOverlay;
let countdownNumber;
let resultModal;
let backToLobbyBtn;

// Initialize
function init() {
  console.log('=== INIT FUNCTION CALLED ===');
  
  try {
    // Initialize DOM elements
    userSwitcher = document.getElementById('user-switcher');
    lobbyView = document.getElementById('lobby-view');
    raceView = document.getElementById('race-view');
    createModal = document.getElementById('create-modal');
    createChallengeBtn = document.getElementById('create-challenge-btn');
    closeModalBtn = document.getElementById('close-modal');
    cancelBtn = document.getElementById('cancel-btn');
    confirmCreateBtn = document.getElementById('confirm-create-btn');
    challengesGrid = document.getElementById('challenges-grid');
    balanceDisplay = document.getElementById('balance');
    usernameDisplay = document.getElementById('username');
    countdownOverlay = document.getElementById('countdown-overlay');
    countdownNumber = document.getElementById('countdown-number');
    resultModal = document.getElementById('result-modal');
    backToLobbyBtn = document.getElementById('back-to-lobby');
    
    console.log('DOM elements initialized');
    console.log('createChallengeBtn:', createChallengeBtn);
    console.log('createModal:', createModal);

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
    
    console.log('=== INIT COMPLETE ===');
  } catch (error) {
    console.error('Error in init():', error);
  }
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
    
    const isMyChallenge = challenge.host_id === currentUser.id;
    
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
            <span>${isMyChallenge ? '👤 You' : '👤 Player ' + challenge.host_id}</span>
          </div>
        </div>
        ${isMyChallenge ? 
          `<button class="btn" onclick="cancelChallenge(${challenge.id})" style="width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
            ❌ Cancel Race
          </button>` :
          `<button class="btn btn-primary" onclick="acceptChallenge(${challenge.id}, ${challenge.bet_amount}, '${challenge.track_type}', ${challenge.laps})" style="width: 100%;">
            ✓ Join Race
          </button>`
        }
      </div>
    `;
  }).join('');
}

// Event Listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  console.log('createChallengeBtn:', createChallengeBtn);
  console.log('createModal:', createModal);
  
  if (!createChallengeBtn) {
    console.error('createChallengeBtn not found!');
    return;
  }
  
  if (!createModal) {
    console.error('createModal not found!');
    return;
  }
  
  createChallengeBtn.addEventListener('click', () => {
    console.log('New Race button clicked!');
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

// Cancel challenge
window.cancelChallenge = function (raceId) {
  console.log('Cancel challenge called for race:', raceId);
  console.log('Current user:', currentUser);
  
  if (!confirm('Cancel this race? Your coins will be refunded.')) {
    console.log('User cancelled the confirmation');
    return;
  }

  console.log('Sending cancel request...');
  
  fetch(`${API_BASE}/api/race/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raceId,
      userId: currentUser.id
    })
  })
    .then(res => {
      console.log('Response status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('Response data:', data);
      
      if (data.error) {
        alert('Error: ' + data.error);
        return;
      }

      alert(`Race cancelled! ${data.refunded} coins refunded.`);
      loadBalance();
      loadChallenges();
    })
    .catch(err => {
      console.error('Error cancelling challenge:', err);
      alert('Failed to cancel race. Please try again.');
    });
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
console.log('Registering DOMContentLoaded listener...');
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded!');
  init();
});
