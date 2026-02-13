const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./betting.db');

// Create tables
db.serialize(() => {
  // Users table with subscription support
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    coins REAL DEFAULT 5000.0,
    subscription_tier TEXT DEFAULT 'Free',
    subscription_expires DATETIME,
    total_wins INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Subscriptions table
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    tier TEXT,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    payment_method TEXT,
    amount REAL,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Prizes catalog
  db.run(`CREATE TABLE IF NOT EXISTS prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    category TEXT,
    rank_requirement INTEGER,
    value REAL,
    image_url TEXT,
    stock INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT 1
  )`);

  // Prize winners
  db.run(`CREATE TABLE IF NOT EXISTS prize_winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    prize_id INTEGER,
    won_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    claimed BOOLEAN DEFAULT 0,
    shipping_address TEXT,
    tracking_number TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (prize_id) REFERENCES prizes (id)
  )`);

  // Leaderboard stats
  db.run(`CREATE TABLE IF NOT EXISTS leaderboard_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    period TEXT,
    coins_won REAL DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    win_rate REAL DEFAULT 0,
    rank INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS markets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT, -- 'sports' or 'car_racing'
    event_name TEXT,
    outcome1 TEXT,
    outcome2 TEXT,
    odds1 REAL,
    odds2 REAL,
    status TEXT DEFAULT 'active' -- 'active', 'suspended', 'resolved'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    market_id INTEGER,
    selected_outcome INTEGER, -- 1 or 2
    amount REAL,
    odds REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'won', 'lost'
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (market_id) REFERENCES markets (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id INTEGER,
    challenger_id INTEGER,
    bet_amount REAL,
    track_type TEXT, -- 'oval', 'city', 'highway'
    laps INTEGER DEFAULT 3,
    status TEXT DEFAULT 'open', -- 'open', 'locked', 'racing', 'finished', 'cancelled'
    winner_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users (id),
    FOREIGN KEY (challenger_id) REFERENCES users (id),
    FOREIGN KEY (winner_id) REFERENCES users (id)
  )`);

  // Gifts table
  db.run(`CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    icon TEXT,
    cost REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Gift transactions table
  db.run(`CREATE TABLE IF NOT EXISTS gift_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    recipient_id INTEGER,
    gift_id INTEGER,
    cost_total REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES users (id),
    FOREIGN KEY (gift_id) REFERENCES gifts (id)
  )`);

  // Live Football Betting Tables
  db.run(`CREATE TABLE IF NOT EXISTS live_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team TEXT,
    away_team TEXT,
    score_home INTEGER DEFAULT 0,
    score_away INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished'
    start_time DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS live_bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    match_id INTEGER,
    market_type TEXT, -- 'winner', 'next_goal', 'over_under'
    selection TEXT,
    amount REAL,
    odds REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'won', 'lost'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (match_id) REFERENCES live_matches (id)
  )`);

  // Insert sample data
  db.run(`INSERT OR IGNORE INTO users (id, username, email, coins, subscription_tier) VALUES 
    (1, 'Player1', 'player1@example.com', 5000, 'Basic'),
    (2, 'Player2', 'player2@example.com', 5000, 'Free')`);

  db.run(`INSERT OR IGNORE INTO markets (type, event_name, outcome1, outcome2, odds1, odds2) VALUES 
    ('sports', 'Football Match', 'Team A', 'Team B', 2.0, 1.8),
    ('car_racing', 'Grand Prix', 'Driver X', 'Driver Y', 1.5, 2.5)`);

  // Insert sample prizes
  db.run(`INSERT OR IGNORE INTO prizes (name, description, category, rank_requirement, value, image_url) VALUES 
    ('PlayStation 5', 'Latest gaming console', 'racing', 1, 500, '/prizes/ps5.jpg'),
    ('Wireless Headphones', 'Premium noise-cancelling', 'racing', 2, 200, '/prizes/headphones.jpg'),
    ('Gaming Mouse', 'RGB gaming mouse', 'racing', 3, 50, '/prizes/mouse.jpg'),
    ('$100 Voucher', 'Amazon gift card', 'football', 1, 100, '/prizes/voucher.jpg')`);

  // Insert sample gifts
  db.run(`INSERT OR IGNORE INTO gifts (id, name, icon, cost) VALUES 
    (1, 'Rose', '🌹', 10),
    (2, 'Football', '⚽', 25),
    (3, 'Trophy', '🏆', 100),
    (4, 'Star', '⭐', 50),
    (5, 'Heart', '❤️', 15)`);

  // Payments table for M-Pesa transactions
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    phone_number TEXT,
    amount REAL,
    coins INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

module.exports = db;
