// Trivia Game
const socket = io('http://localhost:5500');
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 1, username: 'Player1', coins: 100 };

const gameState = {
  category: null,
  difficulty: null,
  levelNum: null,
  currentQuestion: 0,
  player1Score: 0,
  player2Score: 0,
  currentPlayer: 1,
  questions: []
};

// Trivia Categories with Questions by Difficulty
const CATEGORIES = {
  couples: {
    title: 'Couples Trivia',
    icon: '💑',
    description: 'Test how well you know each other',
    color: '#ec4899',
    levels: {
      easy: [ // Level 1 & 2
        { q: "What is your partner's favorite color?", a: ["Red", "Blue", "Green", "Yellow"], correct: 0 },
        { q: "What is your partner's favorite food?", a: ["Pizza", "Pasta", "Sushi", "Burgers"], correct: 0 },
        { q: "What is your partner's favorite season?", a: ["Spring", "Summer", "Autumn", "Winter"], correct: 0 },
        { q: "What time does your partner usually wake up?", a: ["6 AM", "7 AM", "8 AM", "9 AM"], correct: 0 },
        { q: "What is your partner's favorite movie genre?", a: ["Action", "Romance", "Comedy", "Horror"], correct: 0 },
        { q: "What is your partner's favorite drink?", a: ["Coffee", "Tea", "Juice", "Soda"], correct: 0 },
        { q: "What is your partner's favorite day of the week?", a: ["Friday", "Saturday", "Sunday", "Monday"], correct: 0 },
        { q: "What is your partner's favorite animal?", a: ["Dog", "Cat", "Bird", "Fish"], correct: 0 },
        { q: "What is your partner's favorite music genre?", a: ["Pop", "Rock", "Hip Hop", "Jazz"], correct: 0 },
        { q: "What is your partner's favorite sport?", a: ["Football", "Basketball", "Tennis", "Swimming"], correct: 0 }
      ],
      medium: [ // Level 3 & 4
        { q: "Where did you have your first date?", a: ["Restaurant", "Cinema", "Park", "Beach"], correct: 0 },
        { q: "What is your partner's dream vacation destination?", a: ["Paris", "Maldives", "Tokyo", "New York"], correct: 0 },
        { q: "What is your partner's biggest fear?", a: ["Heights", "Spiders", "Dark", "Public Speaking"], correct: 0 },
        { q: "What is your partner's love language?", a: ["Words of Affirmation", "Quality Time", "Physical Touch", "Acts of Service"], correct: 0 },
        { q: "What is your partner's hidden talent?", a: ["Singing", "Dancing", "Cooking", "Drawing"], correct: 0 },
        { q: "What is your partner's favorite childhood memory?", a: ["Family vacation", "Birthday party", "School event", "Holiday celebration"], correct: 0 },
        { q: "What is your partner's biggest pet peeve?", a: ["Loud chewing", "Being late", "Messiness", "Interrupting"], correct: 0 },
        { q: "What is your partner's ideal weekend activity?", a: ["Relaxing at home", "Going out", "Outdoor adventure", "Visiting friends"], correct: 0 },
        { q: "What is your partner's favorite way to show love?", a: ["Gifts", "Quality time", "Physical touch", "Words"], correct: 0 },
        { q: "What makes your partner laugh the most?", a: ["Jokes", "Funny videos", "Tickling", "Silly faces"], correct: 0 }
      ],
      hard: [ // Level 5
        { q: "What is your partner's biggest life goal?", a: ["Career success", "Family", "Travel the world", "Financial freedom"], correct: 0 },
        { q: "What is your partner's deepest insecurity?", a: ["Appearance", "Intelligence", "Social skills", "Career"], correct: 0 },
        { q: "What is your partner's most treasured possession?", a: ["Family heirloom", "Gift from you", "Childhood item", "Achievement award"], correct: 0 },
        { q: "What is your partner's biggest regret?", a: ["Missed opportunity", "Past relationship", "Career choice", "Not traveling more"], correct: 0 },
        { q: "What does your partner value most in life?", a: ["Family", "Love", "Success", "Freedom"], correct: 0 },
        { q: "What is your partner's secret dream?", a: ["Start a business", "Write a book", "Learn an instrument", "Change careers"], correct: 0 },
        { q: "What is your partner's biggest strength?", a: ["Kindness", "Intelligence", "Determination", "Creativity"], correct: 0 },
        { q: "What is your partner's biggest weakness?", a: ["Procrastination", "Overthinking", "Impatience", "Perfectionism"], correct: 0 },
        { q: "What is your partner's definition of success?", a: ["Happiness", "Wealth", "Impact", "Balance"], correct: 0 },
        { q: "What is your partner's ultimate life philosophy?", a: ["Live in the moment", "Plan for future", "Help others", "Follow passion"], correct: 0 }
      ]
    }
  },
  bible: {
    title: 'Bible Trivia',
    icon: '📖',
    description: 'Test your biblical knowledge',
    color: '#8b5cf6',
    levels: {
      easy: [
        { q: "Who built the ark?", a: ["Noah", "Moses", "Abraham", "David"], correct: 0 },
        { q: "Who was swallowed by a great fish?", a: ["Jonah", "Daniel", "Peter", "Paul"], correct: 0 },
        { q: "Who defeated Goliath?", a: ["Saul", "David", "Solomon", "Samuel"], correct: 1 },
        { q: "Where was Jesus born?", a: ["Nazareth", "Jerusalem", "Bethlehem", "Galilee"], correct: 2 },
        { q: "Who betrayed Jesus?", a: ["Peter", "John", "Judas", "Thomas"], correct: 2 },
        { q: "How many apostles did Jesus have?", a: ["10", "11", "12", "13"], correct: 2 },
        { q: "Who was the first man?", a: ["Adam", "Noah", "Abraham", "Moses"], correct: 0 },
        { q: "Who was the first woman?", a: ["Mary", "Eve", "Sarah", "Ruth"], correct: 1 },
        { q: "What did God create on the first day?", a: ["Light", "Earth", "Animals", "Man"], correct: 0 },
        { q: "How many days did God take to create the world?", a: ["5", "6", "7", "8"], correct: 1 }
      ],
      medium: [
        { q: "What was the first plague in Egypt?", a: ["Frogs", "Water to Blood", "Locusts", "Darkness"], correct: 1 },
        { q: "How many books are in the New Testament?", a: ["25", "26", "27", "28"], correct: 2 },
        { q: "Who wrote most of the New Testament letters?", a: ["Peter", "Paul", "John", "James"], correct: 1 },
        { q: "How many days was Jonah in the fish?", a: ["1", "2", "3", "4"], correct: 2 },
        { q: "Who led the Israelites out of Egypt?", a: ["Joshua", "Moses", "Aaron", "David"], correct: 1 },
        { q: "What did Jesus turn water into?", a: ["Wine", "Juice", "Oil", "Milk"], correct: 0 },
        { q: "How many loaves did Jesus use to feed 5000?", a: ["3", "5", "7", "10"], correct: 1 },
        { q: "Who denied Jesus three times?", a: ["John", "Peter", "James", "Thomas"], correct: 1 },
        { q: "What was Jesus' first miracle?", a: ["Healing blind", "Water to wine", "Walking on water", "Feeding 5000"], correct: 1 },
        { q: "How many plagues were there in Egypt?", a: ["7", "8", "9", "10"], correct: 3 }
      ],
      hard: [
        { q: "Who was the oldest person in the Bible?", a: ["Noah", "Methuselah", "Adam", "Abraham"], correct: 1 },
        { q: "How many years did the Israelites wander in the desert?", a: ["30", "40", "50", "60"], correct: 1 },
        { q: "What was Paul's original name?", a: ["Saul", "Simon", "Samuel", "Solomon"], correct: 0 },
        { q: "How many books are in the entire Bible?", a: ["60", "66", "70", "76"], correct: 1 },
        { q: "Who was the wisest man in the Bible?", a: ["David", "Solomon", "Daniel", "Joseph"], correct: 1 },
        { q: "How many sons did Jacob have?", a: ["10", "11", "12", "13"], correct: 2 },
        { q: "What was the name of Moses' sister?", a: ["Miriam", "Rachel", "Leah", "Deborah"], correct: 0 },
        { q: "How many chapters are in the book of Psalms?", a: ["100", "120", "150", "180"], correct: 2 },
        { q: "Who was the first king of Israel?", a: ["David", "Saul", "Solomon", "Samuel"], correct: 1 },
        { q: "How many days did Jesus fast in the wilderness?", a: ["30", "40", "50", "60"], correct: 1 }
      ]
    }
  },
  math: {
    title: 'Math Trivia',
    icon: '🔢',
    description: 'Challenge your mathematical mind',
    color: '#3b82f6',
    levels: {
      easy: [
        { q: "What is 5 + 7?", a: ["10", "11", "12", "13"], correct: 2 },
        { q: "What is 10 - 4?", a: ["4", "5", "6", "7"], correct: 2 },
        { q: "What is 6 × 3?", a: ["15", "16", "17", "18"], correct: 3 },
        { q: "What is 20 ÷ 4?", a: ["4", "5", "6", "7"], correct: 1 },
        { q: "What is 8 + 8?", a: ["14", "15", "16", "17"], correct: 2 },
        { q: "What is 15 - 7?", a: ["6", "7", "8", "9"], correct: 2 },
        { q: "What is 4 × 5?", a: ["18", "19", "20", "21"], correct: 2 },
        { q: "What is 30 ÷ 6?", a: ["4", "5", "6", "7"], correct: 1 },
        { q: "What is 12 + 9?", a: ["19", "20", "21", "22"], correct: 2 },
        { q: "What is 25 - 10?", a: ["13", "14", "15", "16"], correct: 2 }
      ],
      medium: [
        { q: "What is 15 × 8?", a: ["110", "120", "130", "140"], correct: 1 },
        { q: "What is the square root of 144?", a: ["10", "11", "12", "13"], correct: 2 },
        { q: "What is 25% of 200?", a: ["40", "45", "50", "55"], correct: 2 },
        { q: "What is 100 ÷ 4?", a: ["20", "25", "30", "35"], correct: 1 },
        { q: "What is 50% of 88?", a: ["42", "44", "46", "48"], correct: 1 },
        { q: "How many sides does a hexagon have?", a: ["5", "6", "7", "8"], correct: 1 },
        { q: "What is 12 × 12?", a: ["124", "134", "144", "154"], correct: 2 },
        { q: "What is 75% of 80?", a: ["50", "55", "60", "65"], correct: 2 },
        { q: "What is the square root of 81?", a: ["7", "8", "9", "10"], correct: 2 },
        { q: "What is 18 × 6?", a: ["98", "102", "108", "112"], correct: 2 }
      ],
      hard: [
        { q: "What is the value of π (pi) to 3 decimal places?", a: ["3.141", "3.142", "3.143", "3.144"], correct: 1 },
        { q: "What is 7³ (7 cubed)?", a: ["243", "343", "443", "543"], correct: 1 },
        { q: "What is the next prime number after 7?", a: ["9", "10", "11", "13"], correct: 2 },
        { q: "What is 15² (15 squared)?", a: ["215", "225", "235", "245"], correct: 1 },
        { q: "What is the square root of 256?", a: ["14", "15", "16", "17"], correct: 2 },
        { q: "What is 20% of 450?", a: ["80", "85", "90", "95"], correct: 2 },
        { q: "What is 13 × 17?", a: ["211", "221", "231", "241"], correct: 1 },
        { q: "What is the sum of angles in a triangle?", a: ["90°", "180°", "270°", "360°"], correct: 1 },
        { q: "What is 2⁸ (2 to the power of 8)?", a: ["128", "256", "512", "1024"], correct: 1 },
        { q: "What is the value of e (Euler's number) approximately?", a: ["2.52", "2.62", "2.72", "2.82"], correct: 2 }
      ]
    }
  },
  fun: {
    title: 'Fun Facts',
    icon: '🎉',
    description: 'Random fun trivia questions',
    color: '#f59e0b',
    levels: {
      easy: [
        { q: "How many colors are in a rainbow?", a: ["5", "6", "7", "8"], correct: 2 },
        { q: "How many continents are there?", a: ["5", "6", "7", "8"], correct: 2 },
        { q: "What color is the sky?", a: ["Red", "Blue", "Green", "Yellow"], correct: 1 },
        { q: "How many legs does a spider have?", a: ["6", "8", "10", "12"], correct: 1 },
        { q: "What is the color of grass?", a: ["Blue", "Green", "Yellow", "Red"], correct: 1 },
        { q: "How many days are in a week?", a: ["5", "6", "7", "8"], correct: 2 },
        { q: "What is the largest planet in our solar system?", a: ["Mars", "Jupiter", "Saturn", "Neptune"], correct: 1 },
        { q: "Which country invented pizza?", a: ["France", "Italy", "Spain", "Greece"], correct: 1 },
        { q: "How many months are in a year?", a: ["10", "11", "12", "13"], correct: 2 },
        { q: "What is the fastest land animal?", a: ["Lion", "Cheetah", "Leopard", "Tiger"], correct: 1 }
      ],
      medium: [
        { q: "How many hearts does an octopus have?", a: ["1", "2", "3", "4"], correct: 2 },
        { q: "What is the smallest country in the world?", a: ["Monaco", "Vatican City", "Malta", "Liechtenstein"], correct: 1 },
        { q: "How many bones are in the human body?", a: ["196", "206", "216", "226"], correct: 1 },
        { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2 },
        { q: "What is the largest ocean on Earth?", a: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 1 },
        { q: "How many teeth does an adult human have?", a: ["28", "30", "32", "34"], correct: 2 },
        { q: "What is the tallest mountain in the world?", a: ["K2", "Everest", "Kilimanjaro", "Denali"], correct: 1 },
        { q: "How many strings does a guitar have?", a: ["4", "5", "6", "7"], correct: 2 },
        { q: "What is the largest mammal?", a: ["Elephant", "Blue Whale", "Giraffe", "Rhino"], correct: 1 },
        { q: "How many planets are in our solar system?", a: ["7", "8", "9", "10"], correct: 1 }
      ],
      hard: [
        { q: "What is the speed of light?", a: ["299,792 km/s", "300,000 km/s", "299,000 km/s", "298,792 km/s"], correct: 0 },
        { q: "How many elements are in the periodic table?", a: ["108", "118", "128", "138"], correct: 1 },
        { q: "What is the smallest bone in the human body?", a: ["Stapes", "Incus", "Malleus", "Femur"], correct: 0 },
        { q: "How many time zones are there in the world?", a: ["20", "22", "24", "26"], correct: 2 },
        { q: "What is the deepest point in the ocean?", a: ["Mariana Trench", "Puerto Rico Trench", "Java Trench", "Philippine Trench"], correct: 0 },
        { q: "How many languages are spoken in the world?", a: ["5,000", "6,000", "7,000", "8,000"], correct: 2 },
        { q: "What is the longest river in the world?", a: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
        { q: "How many countries are in Africa?", a: ["50", "52", "54", "56"], correct: 2 },
        { q: "What is the largest desert in the world?", a: ["Sahara", "Arabian", "Gobi", "Antarctic"], correct: 3 },
        { q: "How many stars are in the Milky Way?", a: ["100 billion", "200 billion", "300 billion", "400 billion"], correct: 0 }
      ]
    }
  }
};

// Initialize user progress
if (!currentUser.triviaProgress) {
  currentUser.triviaProgress = {};
  Object.keys(CATEGORIES).forEach(cat => {
    currentUser.triviaProgress[cat] = 1; // Only level 1 unlocked initially
  });
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

document.addEventListener('DOMContentLoaded', init);

function init() {
  renderCategories();
  updateCoinsDisplay();
}

function renderCategories() {
  const container = document.getElementById('category-grid');
  container.innerHTML = '';
  
  // Trivia categories only
  Object.keys(CATEGORIES).forEach(key => {
    const cat = CATEGORIES[key];
    const card = document.createElement('div');
    card.className = 'category-card';
    card.onclick = () => showLevelSelection(key);
    card.innerHTML = `
      <div class="category-icon">${cat.icon}</div>
      <div class="category-title">${cat.title}</div>
      <div class="category-description">${cat.description}</div>
      <button class="btn btn-primary" style="width: 100%;">Select Level</button>
    `;
    container.appendChild(card);
  });
}

function showLevelSelection(category) {
  const cat = CATEGORIES[category];
  const container = document.getElementById('category-grid');
  const unlockedLevel = currentUser.triviaProgress[category] || 1;
  
  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; margin-bottom: 2rem;">
      <button class="btn btn-secondary" onclick="renderCategories()" style="margin-bottom: 1rem;">← Back to Categories</button>
      <h2 style="font-size: 2.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">${cat.title}</h2>
      <p style="color: var(--text-muted); font-size: 1.1rem;">Select a level to play</p>
    </div>
  `;
  
  const levels = [
    { key: 'easy', num: 1 },
    { key: 'easy', num: 2 },
    { key: 'medium', num: 3 },
    { key: 'medium', num: 4 },
    { key: 'hard', num: 5 }
  ];
  
  levels.forEach(level => {
    const isUnlocked = level.num <= unlockedLevel;
    
    const card = document.createElement('div');
    card.className = 'category-card';
    if (!isUnlocked) {
      card.classList.add('locked');
      card.style.opacity = '0.5';
      card.style.cursor = 'not-allowed';
    } else {
      card.onclick = () => startTrivia(category, level.key, level.num);
    }
    
    card.innerHTML = `
      <div class="category-icon" style="font-size: 4rem;">${isUnlocked ? level.num : '🔒'}</div>
      <div class="category-title">Level ${level.num}</div>
      <div class="category-description">${isUnlocked ? '10 Questions' : `Complete Level ${level.num - 1} to unlock`}</div>
      ${isUnlocked ? 
        `<button class="btn btn-primary" style="width: 100%;">Play Level ${level.num}</button>` :
        `<div style="color: var(--text-muted); margin-top: 1rem; font-size: 0.9rem;">🔒 Locked</div>`
      }
    `;
    container.appendChild(card);
  });
}

function startTrivia(category, difficulty, levelNum) {
  gameState.category = category;
  gameState.difficulty = difficulty;
  gameState.levelNum = levelNum;
  gameState.currentQuestion = 0;
  gameState.player1Score = 0;
  gameState.player2Score = 0;
  gameState.currentPlayer = 1;
  gameState.questions = [...CATEGORIES[category].levels[difficulty]];
  
  document.getElementById('category-title').textContent = `${CATEGORIES[category].title} - Level ${levelNum}`;
  updateScores();
  showQuestion();
  switchView('game');
}

function showQuestion() {
  const question = gameState.questions[gameState.currentQuestion];
  const container = document.getElementById('question-container');
  
  document.getElementById('question-number').textContent = gameState.currentQuestion + 1;
  
  // Highlight current player
  document.getElementById('player1-card').classList.toggle('active', gameState.currentPlayer === 1);
  document.getElementById('player2-card').classList.toggle('active', gameState.currentPlayer === 2);
  
  container.innerHTML = `
    <div class="question-card">
      <div style="text-align: center; margin-bottom: 1rem;">
        <span style="background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700;">
          Player ${gameState.currentPlayer}'s Turn
        </span>
      </div>
      <div class="question-text">${question.q}</div>
      ${question.a.map((answer, index) => `
        <div class="answer-option" onclick="selectAnswer(${index})">
          ${String.fromCharCode(65 + index)}. ${answer}
        </div>
      `).join('')}
    </div>
  `;
}

function selectAnswer(index) {
  const question = gameState.questions[gameState.currentQuestion];
  const options = document.querySelectorAll('.answer-option');
  
  // Disable all options
  options.forEach(opt => opt.style.pointerEvents = 'none');
  
  // Show correct/wrong
  options[index].classList.add(index === question.correct ? 'correct' : 'wrong');
  options[question.correct].classList.add('correct');
  
  // Update score
  if (index === question.correct) {
    if (gameState.currentPlayer === 1) {
      gameState.player1Score++;
    } else {
      gameState.player2Score++;
    }
    updateScores();
    
    // Award coin
    currentUser.coins += 1;
    gameState.coins = currentUser.coins;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateCoinsDisplay();
  }
  
  // Next question after delay
  setTimeout(() => {
    gameState.currentQuestion++;
    
    if (gameState.currentQuestion >= gameState.questions.length) {
      endGame();
    } else {
      // Switch player
      gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
      showQuestion();
    }
  }, 2000);
}

function updateScores() {
  document.getElementById('player1-score').textContent = gameState.player1Score;
  document.getElementById('player2-score').textContent = gameState.player2Score;
}

function endGame() {
  const modal = document.getElementById('game-over-modal');
  const winnerIcon = document.getElementById('winner-icon');
  const winnerText = document.getElementById('winner-text');
  const finalScores = document.getElementById('final-scores');
  
  // Unlock next level if current level is completed
  if (gameState.levelNum && gameState.levelNum < 5) {
    const currentUnlocked = currentUser.triviaProgress[gameState.category] || 1;
    if (gameState.levelNum >= currentUnlocked) {
      currentUser.triviaProgress[gameState.category] = gameState.levelNum + 1;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }
  
  if (gameState.player1Score > gameState.player2Score) {
    winnerIcon.textContent = '🏆';
    winnerText.textContent = 'Player 1 Wins!';
  } else if (gameState.player2Score > gameState.player1Score) {
    winnerIcon.textContent = '🏆';
    winnerText.textContent = 'Player 2 Wins!';
  } else {
    winnerIcon.textContent = '🤝';
    winnerText.textContent = "It's a Tie!";
  }
  
  finalScores.innerHTML = `
    <div style="display: flex; gap: 2rem; justify-content: center;">
      <div>
        <div style="font-size: 1rem; color: var(--text-muted);">Player 1</div>
        <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${gameState.player1Score}</div>
      </div>
      <div>
        <div style="font-size: 1rem; color: var(--text-muted);">Player 2</div>
        <div style="font-size: 3rem; font-weight: 800; color: var(--secondary);">${gameState.player2Score}</div>
      </div>
    </div>
    ${gameState.levelNum && gameState.levelNum < 5 ? 
      `<div style="margin-top: 2rem; padding: 1rem; background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 10px;">
        <p style="color: #22c55e; font-weight: 600; margin: 0;">🎉 Level ${gameState.levelNum + 1} Unlocked!</p>
      </div>` : 
      gameState.levelNum === 5 ? 
      `<div style="margin-top: 2rem; padding: 1rem; background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 10px;">
        <p style="color: #8b5cf6; font-weight: 600; margin: 0;">👑 All Levels Completed!</p>
      </div>` : ''
    }
  `;
  
  modal.classList.add('active');
}

function updateCoinsDisplay() {
  document.getElementById('player-coins').textContent = currentUser.coins;
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  
  if (view === 'category') {
    document.getElementById('category-view').classList.add('active');
  } else if (view === 'game') {
    document.getElementById('game-view').classList.add('active');
  }
}

function backToCategories() {
  document.getElementById('game-over-modal').classList.remove('active');
  switchView('category');
}
