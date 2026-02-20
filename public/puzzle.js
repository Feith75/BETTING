// Word Grid Game
const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5500' 
  : window.location.origin;
const socket = io(SOCKET_URL);
const API_BASE = SOCKET_URL;

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 1, username: 'Player1', coins: 100 };
let gameTimer = null;
let timeRemaining = 180;

// Initialize user progress
if (!currentUser.unlockedLevels) {
  currentUser.unlockedLevels = 1; // Only level 1 unlocked initially
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Game state
const gameState = {
  currentLevel: 1,
  score: 0,
  correctWords: 0,
  coins: currentUser.coins || 100,
  currentWord: null,
  acrossAnswer: '',
  downAnswer: '',
  hintCost: 3,
  gameStartTime: null
};

// Word puzzles by level - each has a hint and two intersecting words
const PUZZLES = {
  level1: {
    acrossHint: 'P _ G',  // 3 letters total (PIG)
    downHint: 'P _ N',    // 3 letters total (PEN)
    acrossWord: 'PIG',
    downWord: 'PEN',
    intersection: { letter: 'P', acrossIndex: 0, downIndex: 0 }
  },
  level2: {
    acrossHint: 'A _ _ _ E',  // 5 letters total (APPLE)
    downHint: 'A _ _ _ N',    // 5 letters total (APRON)
    acrossWord: 'APPLE',
    downWord: 'APRON',
    intersection: { letter: 'A', acrossIndex: 0, downIndex: 0 }
  },
  level3: {
    acrossHint: 'B _ _ E',  // 4 letters total (BLUE)
    downHint: 'B _ _ Y',    // 4 letters total (BABY)
    acrossWord: 'BLUE',
    downWord: 'BABY',
    intersection: { letter: 'B', acrossIndex: 0, downIndex: 0 }
  },
  level4: {
    acrossHint: 'S _ _ _ _ L',  // 6 letters total (SCHOOL)
    downHint: 'S _ _ _ Y',      // 5 letters total (STORY)
    acrossWord: 'SCHOOL',
    downWord: 'STORY',
    intersection: { letter: 'S', acrossIndex: 0, downIndex: 0 }
  },
  level5: {
    acrossHint: 'R _ _ _ _ _ W',  // 7 letters total (RAINBOW)
    downHint: 'R _ _ _ Y',        // 5 letters total (RAINY)
    acrossWord: 'RAINBOW',
    downWord: 'RAINY',
    intersection: { letter: 'R', acrossIndex: 0, downIndex: 0 }
  }
};

// DOM Elements
let lobbyView, gameView, createModal;
let currentFocusCell = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('Initializing Word Grid game...');
  
  lobbyView = document.getElementById('lobby-view');
  gameView = document.getElementById('puzzle-game-view');
  createModal = document.getElementById('create-puzzle-modal');
  
  setupEventListeners();
  updateCoinsDisplay();
  renderLevelSelection();
}

function setupEventListeners() {
  const createBtn = document.getElementById('create-puzzle-btn');
  const closeBtn = document.getElementById('close-puzzle-modal');
  const cancelBtn = document.getElementById('cancel-puzzle-btn');
  const confirmBtn = document.getElementById('confirm-puzzle-btn');
  const backBtn = document.getElementById('back-to-lobby-btn');
  const startTutorialBtn = document.getElementById('start-tutorial-btn');
  const hintBtn = document.getElementById('hint-btn');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      createModal.classList.remove('active');
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      createModal.classList.remove('active');
    });
  }
  
  if (confirmBtn) {
    confirmBtn.addEventListener('click', createPuzzleGame);
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('game-over-modal').classList.remove('active');
      switchView('lobby');
      renderLevelSelection();
    });
  }
  
  if (startTutorialBtn) {
    startTutorialBtn.addEventListener('click', () => {
      document.getElementById('tutorial-overlay').classList.remove('active');
      actuallyStartGame();
    });
  }
  
  if (hintBtn) {
    hintBtn.addEventListener('click', buyHint);
  }
  
  // Keyboard input for grid
  document.addEventListener('keydown', handleKeyPress);
}

function renderLevelSelection() {
  const container = document.getElementById('puzzle-challenges-grid');
  container.innerHTML = '';
  
  const levels = [
    { level: 1, title: 'Level 1', description: 'Simple 3-letter words', icon: '1️⃣' },
    { level: 2, title: 'Level 2', description: '4-5 letter words', icon: '2️⃣' },
    { level: 3, title: 'Level 3', description: 'Mixed challenges', icon: '3️⃣' },
    { level: 4, title: 'Level 4', description: '6-letter words', icon: '4️⃣' },
    { level: 5, title: 'Level 5', description: '7-letter words', icon: '5️⃣' }
  ];
  
  levels.forEach(levelData => {
    const isUnlocked = levelData.level <= currentUser.unlockedLevels;
    
    const levelCard = document.createElement('div');
    levelCard.className = 'level-card';
    if (!isUnlocked) {
      levelCard.classList.add('locked');
    }
    
    levelCard.innerHTML = `
      <div class="level-icon">${isUnlocked ? levelData.icon : '🔒'}</div>
      <div class="level-title">${levelData.title}</div>
      <div class="level-description">${levelData.description}</div>
      ${isUnlocked ? 
        `<button class="btn btn-primary" onclick="startLevelFromLobby(${levelData.level})" style="width: 100%; margin-top: 1rem;">Play Level</button>` :
        `<div style="color: var(--text-muted); margin-top: 1rem; font-size: 0.9rem;">Complete Level ${levelData.level - 1} to unlock</div>`
      }
    `;
    
    container.appendChild(levelCard);
  });
}

function startLevelFromLobby(level) {
  gameState.currentLevel = level;
  document.getElementById('create-puzzle-modal').classList.add('active');
}

function createPuzzleGame() {
  const duration = parseInt(document.getElementById('game-duration').value);
  timeRemaining = duration;
  
  createModal.classList.remove('active');
  startGame();
}

function startGame() {
  switchView('game');
  
  // Reset game state for selected level
  gameState.score = 0;
  gameState.correctWords = 0;
  gameState.acrossAnswer = '';
  gameState.downAnswer = '';
  
  updateStats();
  loadLevel(gameState.currentLevel);
  
  // Show tutorial only for first time players
  if (!localStorage.getItem('tutorialSeen')) {
    document.getElementById('tutorial-overlay').classList.add('active');
    localStorage.setItem('tutorialSeen', 'true');
  } else {
    actuallyStartGame();
  }
}

function actuallyStartGame() {
  gameState.gameStartTime = Date.now();
  gameState.hintCost = 3;
  updateHintButton();
  startTimer();
  startHintCostTimer();
}

function startHintCostTimer() {
  // Increase hint cost every 30 seconds, max 10 coins
  setInterval(() => {
    if (gameState.hintCost < 10) {
      gameState.hintCost++;
      updateHintButton();
    }
  }, 30000); // 30 seconds
}

function updateHintButton() {
  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) {
    hintBtn.textContent = `💡 Hint (${gameState.hintCost} coins)`;
  }
}

function loadLevel(level) {
  gameState.currentLevel = level;
  gameState.currentWord = PUZZLES[`level${level}`];
  gameState.acrossAnswer = '';
  gameState.downAnswer = '';
  
  renderPuzzle();
  updateStats();
  updateHintButton();
  
  document.getElementById('feedback-message').textContent = '';
}

function renderPuzzle() {
  const puzzle = gameState.currentWord;
  const container = document.getElementById('word-grid');
  
  // Hide hint boxes at top
  document.getElementById('hint-boxes').style.display = 'none';
  
  // Create grid
  const maxLength = Math.max(puzzle.acrossWord.length, puzzle.downWord.length);
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${maxLength}, 60px)`;
  container.style.gridTemplateRows = `repeat(${maxLength}, 60px)`;
  
  // Parse hints to get revealed letters
  const acrossHintLetters = puzzle.acrossHint.split(' ');
  const downHintLetters = puzzle.downHint.split(' ');
  
  // Create cells
  for (let row = 0; row < maxLength; row++) {
    for (let col = 0; col < maxLength; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      // Intersection point (0,0) - show the letter
      if (row === 0 && col === 0) {
        cell.classList.add('intersection');
        cell.textContent = puzzle.intersection.letter;
        cell.dataset.type = 'both';
        cell.dataset.locked = 'true';
      }
      // Across word (row 0)
      else if (row === 0 && col < puzzle.acrossWord.length) {
        cell.classList.add('active', 'across');
        cell.dataset.type = 'across';
        cell.dataset.index = col;
        
        // Check if this position should show a hint letter
        if (acrossHintLetters[col] && acrossHintLetters[col] !== '_') {
          cell.textContent = acrossHintLetters[col];
          cell.classList.add('hint-letter');
          cell.dataset.locked = 'true';
        } else {
          cell.contentEditable = 'true';
          cell.addEventListener('click', () => focusCell(cell));
          cell.addEventListener('input', (e) => handleCellInput(e, cell));
          cell.addEventListener('focus', () => focusCell(cell));
        }
      }
      // Down word (col 0)
      else if (col === 0 && row < puzzle.downWord.length) {
        cell.classList.add('active', 'down');
        cell.dataset.type = 'down';
        cell.dataset.index = row;
        
        // Check if this position should show a hint letter
        if (downHintLetters[row] && downHintLetters[row] !== '_') {
          cell.textContent = downHintLetters[row];
          cell.classList.add('hint-letter');
          cell.dataset.locked = 'true';
        } else {
          cell.contentEditable = 'true';
          cell.addEventListener('click', () => focusCell(cell));
          cell.addEventListener('input', (e) => handleCellInput(e, cell));
          cell.addEventListener('focus', () => focusCell(cell));
        }
      }
      // Empty cells
      else {
        cell.classList.add('blocked');
      }
      
      container.appendChild(cell);
    }
  }
}

function focusCell(cell) {
  if (cell.dataset.locked === 'true') return;
  
  // Remove previous focus
  document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('focused'));
  
  // Add focus to current cell
  cell.classList.add('focused');
  currentFocusCell = cell;
}

function handleCellInput(e, cell) {
  if (cell.dataset.locked === 'true') return;
  
  // Get only the last character typed
  let value = cell.textContent.trim().toUpperCase();
  if (value.length > 1) {
    value = value.slice(-1);
  }
  
  cell.textContent = value;
  
  // Move to next cell
  if (value.length === 1) {
    moveToNextCell(cell);
  }
  
  // Update answer strings
  updateAnswerStrings();
}

function handleKeyPress(e) {
  if (!currentFocusCell || currentFocusCell.dataset.locked === 'true') return;
  
  const key = e.key;
  
  // Handle backspace
  if (key === 'Backspace') {
    e.preventDefault();
    currentFocusCell.textContent = '';
    moveToPreviousCell(currentFocusCell);
    updateAnswerStrings();
  }
  // Handle letter input
  else if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    e.preventDefault();
    currentFocusCell.textContent = key.toUpperCase();
    moveToNextCell(currentFocusCell);
    updateAnswerStrings();
  }
  // Handle arrow keys
  else if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowUp' || key === 'ArrowDown') {
    e.preventDefault();
    navigateWithArrows(key);
  }
}

function moveToNextCell(cell) {
  const type = cell.dataset.type;
  const index = parseInt(cell.dataset.index);
  
  if (type === 'across') {
    const nextCell = document.querySelector(`.grid-cell.across[data-index="${index + 1}"]`);
    if (nextCell) {
      nextCell.focus();
      focusCell(nextCell);
    }
  } else if (type === 'down') {
    const nextCell = document.querySelector(`.grid-cell.down[data-index="${index + 1}"]`);
    if (nextCell) {
      nextCell.focus();
      focusCell(nextCell);
    }
  }
}

function moveToPreviousCell(cell) {
  const type = cell.dataset.type;
  const index = parseInt(cell.dataset.index);
  
  if (type === 'across') {
    const prevCell = document.querySelector(`.grid-cell.across[data-index="${index - 1}"]`);
    if (prevCell) {
      prevCell.focus();
      focusCell(prevCell);
    }
  } else if (type === 'down') {
    const prevCell = document.querySelector(`.grid-cell.down[data-index="${index - 1}"]`);
    if (prevCell) {
      prevCell.focus();
      focusCell(prevCell);
    }
  }
}

function navigateWithArrows(key) {
  if (!currentFocusCell) return;
  
  const row = parseInt(currentFocusCell.dataset.row);
  const col = parseInt(currentFocusCell.dataset.col);
  
  let nextCell = null;
  
  if (key === 'ArrowRight') {
    nextCell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col + 1}"]`);
  } else if (key === 'ArrowLeft') {
    nextCell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col - 1}"]`);
  } else if (key === 'ArrowDown') {
    nextCell = document.querySelector(`.grid-cell[data-row="${row + 1}"][data-col="${col}"]`);
  } else if (key === 'ArrowUp') {
    nextCell = document.querySelector(`.grid-cell[data-row="${row - 1}"][data-col="${col}"]`);
  }
  
  if (nextCell && nextCell.classList.contains('active') && nextCell.dataset.locked !== 'true') {
    nextCell.focus();
    focusCell(nextCell);
  }
}

function updateAnswerStrings() {
  const puzzle = gameState.currentWord;
  
  // Build across answer
  let acrossAnswer = puzzle.intersection.letter;
  const acrossCells = document.querySelectorAll('.grid-cell.across:not(.intersection)');
  acrossCells.forEach(cell => {
    const text = cell.textContent.trim();
    acrossAnswer += text;
  });
  gameState.acrossAnswer = acrossAnswer;
  
  // Build down answer
  let downAnswer = puzzle.intersection.letter;
  const downCells = document.querySelectorAll('.grid-cell.down:not(.intersection)');
  downCells.forEach(cell => {
    const text = cell.textContent.trim();
    downAnswer += text;
  });
  gameState.downAnswer = downAnswer;
  
  // Check across word immediately if complete
  if (acrossAnswer.length === puzzle.acrossWord.length) {
    checkWordImmediately('across', acrossAnswer, puzzle.acrossWord);
  }
  
  // Check down word immediately if complete
  if (downAnswer.length === puzzle.downWord.length) {
    checkWordImmediately('down', downAnswer, puzzle.downWord);
  }
  
  // If both words are correct, move to next level
  if (acrossAnswer === puzzle.acrossWord && downAnswer === puzzle.downWord) {
    setTimeout(() => {
      // Award coin
      gameState.coins += 1;
      gameState.correctWords += 2;
      gameState.score += 50 * gameState.currentLevel;
      
      currentUser.coins = gameState.coins;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      const feedback = document.getElementById('feedback-message');
      feedback.textContent = '🎉 Perfect! Both words correct! +1 Coin';
      feedback.style.color = '#22c55e';
      
      updateStats();
      updateCoinsDisplay();
      
      // Move to next level after delay
      setTimeout(() => {
        if (gameState.currentLevel < 5) {
          showLevelComplete();
        } else {
          endGame();
        }
      }, 1500);
    }, 500);
  }
}

function checkWordImmediately(type, answer, correctWord) {
  const feedback = document.getElementById('feedback-message');
  
  if (answer === correctWord) {
    // Correct - show GREEN immediately
    if (type === 'across') {
      document.querySelectorAll('.grid-cell.across, .grid-cell.intersection').forEach(cell => {
        cell.classList.remove('wrong');
        cell.classList.add('correct');
        if (cell.contentEditable === 'true') {
          cell.contentEditable = 'false';
        }
      });
    } else {
      document.querySelectorAll('.grid-cell.down, .grid-cell.intersection').forEach(cell => {
        cell.classList.remove('wrong');
        cell.classList.add('correct');
        if (cell.contentEditable === 'true') {
          cell.contentEditable = 'false';
        }
      });
    }
  } else {
    // Wrong - show RED immediately
    if (type === 'across') {
      document.querySelectorAll('.grid-cell.across, .grid-cell.intersection').forEach(cell => {
        cell.classList.remove('correct');
        cell.classList.add('wrong');
      });
      
      feedback.textContent = '❌ Wrong word! Try again';
      feedback.style.color = '#ef4444';
      
      // Clear wrong cells after delay
      setTimeout(() => {
        document.querySelectorAll('.grid-cell.across.wrong').forEach(cell => {
          cell.classList.remove('wrong');
          if (cell.dataset.locked !== 'true' && !cell.classList.contains('hint-letter')) {
            cell.textContent = '';
          }
        });
        feedback.textContent = '';
        gameState.acrossAnswer = puzzle.intersection.letter;
      }, 1500);
    } else {
      document.querySelectorAll('.grid-cell.down, .grid-cell.intersection').forEach(cell => {
        cell.classList.remove('correct');
        cell.classList.add('wrong');
      });
      
      feedback.textContent = '❌ Wrong word! Try again';
      feedback.style.color = '#ef4444';
      
      // Clear wrong cells after delay
      setTimeout(() => {
        document.querySelectorAll('.grid-cell.down.wrong').forEach(cell => {
          cell.classList.remove('wrong');
          if (cell.dataset.locked !== 'true' && !cell.classList.contains('hint-letter')) {
            cell.textContent = '';
          }
        });
        feedback.textContent = '';
        gameState.downAnswer = puzzle.intersection.letter;
      }, 1500);
    }
  }
}

function checkAnswersAuto() {
  // This function is no longer needed - checking happens immediately in updateAnswerStrings
  return;
}

function checkAnswers() {
  updateAnswerStrings();
  checkAnswersAuto();
}

function buyHint() {
  if (gameState.coins < gameState.hintCost) {
    const feedback = document.getElementById('feedback-message');
    feedback.textContent = '❌ Not enough coins! Buy more coins to continue.';
    feedback.style.color = '#ef4444';
    
    // Show buy coins modal
    document.getElementById('buy-coins-modal').classList.add('active');
    return;
  }
  
  const puzzle = gameState.currentWord;
  
  // Deduct coins
  gameState.coins -= gameState.hintCost;
  currentUser.coins = gameState.coins;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Show hint
  const feedback = document.getElementById('feedback-message');
  feedback.textContent = `💡 Hint: Across = ${puzzle.acrossWord}, Down = ${puzzle.downWord}`;
  feedback.style.color = '#fbbf24';
  
  updateStats();
  updateCoinsDisplay();
  
  // Auto-fill the answers
  const acrossCells = document.querySelectorAll('.grid-cell.across');
  acrossCells.forEach((cell, index) => {
    cell.textContent = puzzle.acrossWord[index + 1];
  });
  
  const downCells = document.querySelectorAll('.grid-cell.down');
  downCells.forEach((cell, index) => {
    cell.textContent = puzzle.downWord[index + 1];
  });
  
  updateAnswerStrings();
}

function initiateMpesaPayment(amount, coins) {
  const phoneNumber = document.getElementById('mpesa-phone').value.trim();
  
  if (!phoneNumber) {
    alert('Please enter your M-Pesa phone number');
    return;
  }
  
  // Validate phone number format (Kenyan format)
  const phoneRegex = /^(254|0)[17]\d{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    alert('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
    return;
  }
  
  // Show loading state
  const buyBtn = event.target;
  buyBtn.disabled = true;
  buyBtn.textContent = 'Processing...';
  
  // Simulate M-Pesa payment (in production, this would call your backend API)
  fetch(`${API_BASE}/api/payment/mpesa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumber: phoneNumber,
      amount: amount,
      coins: coins,
      userId: currentUser.id
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Add coins to user account
      gameState.coins += coins;
      currentUser.coins = gameState.coins;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      updateStats();
      updateCoinsDisplay();
      
      // Close modal
      document.getElementById('buy-coins-modal').classList.remove('active');
      
      alert(`✅ Payment successful! ${coins} coins added to your account.`);
    } else {
      alert('❌ Payment failed. Please try again.');
    }
  })
  .catch(error => {
    console.error('Payment error:', error);
    alert('❌ Payment failed. Please try again.');
  })
  .finally(() => {
    buyBtn.disabled = false;
    buyBtn.textContent = `Buy ${coins} Coins - KSh ${amount}`;
  });
}

function showLevelComplete() {
  // Unlock next level
  if (gameState.currentLevel >= currentUser.unlockedLevels && gameState.currentLevel < 5) {
    currentUser.unlockedLevels = gameState.currentLevel + 1;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  
  const modal = document.getElementById('level-complete-modal');
  document.getElementById('completed-level').textContent = gameState.currentLevel;
  document.getElementById('level-score').textContent = gameState.score;
  modal.classList.add('active');
}

function nextLevel() {
  document.getElementById('level-complete-modal').classList.remove('active');
  loadLevel(gameState.currentLevel + 1);
}

function updateStats() {
  document.getElementById('current-level').textContent = gameState.currentLevel;
  document.getElementById('player-score').textContent = gameState.score;
  document.getElementById('correct-words').textContent = gameState.correctWords;
  document.getElementById('player-coins').textContent = gameState.coins;
}

function updateCoinsDisplay() {
  const coinsDisplay = document.getElementById('player-coins');
  if (coinsDisplay) {
    coinsDisplay.textContent = gameState.coins;
  }
  
  const lobbyCoins = document.getElementById('lobby-coins');
  if (lobbyCoins) {
    lobbyCoins.textContent = gameState.coins;
  }
}

function startTimer() {
  updateTimerDisplay();
  
  gameTimer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  document.getElementById('game-timer').textContent = 
    `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
  clearInterval(gameTimer);
  
  const modal = document.getElementById('game-over-modal');
  const winnerIcon = document.getElementById('winner-icon');
  const winnerText = document.getElementById('winner-text');
  const finalScore = document.getElementById('final-score');
  
  winnerIcon.textContent = '🎉';
  winnerText.textContent = 'Game Complete!';
  finalScore.innerHTML = `
    <div style="margin: 1rem 0;">
      <p style="font-size: 2rem; font-weight: 800; color: var(--primary);">${gameState.score} Points</p>
      <p style="font-size: 1.2rem; color: var(--text-muted);">Level ${gameState.currentLevel} | ${gameState.correctWords} Words Correct</p>
      <p style="font-size: 1.5rem; color: #fbbf24; margin-top: 1rem;">💰 ${gameState.coins} Coins</p>
    </div>
  `;
  
  modal.classList.add('active');
}

function switchView(view) {
  lobbyView.classList.remove('active');
  gameView.classList.remove('active');
  
  if (view === 'lobby') {
    lobbyView.classList.add('active');
  } else if (view === 'game') {
    gameView.classList.add('active');
  }
}
