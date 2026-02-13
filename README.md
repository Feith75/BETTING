# Betting Racing Car 🏎️

A real-time multiplayer racing game with betting mechanics built on Node.js, Socket.IO, and HTML5 Canvas.

## 🎮 Quick Start

```bash
# Install dependencies
npm install

# Start server
node server.js
```

Open your browser to **http://localhost:5000**

## 📖 How to Play

1. **Create a Challenge**: Set bet amount, track type, and laps
2. **Wait for Opponent**: Another player accepts your challenge
3. **Race**: Use **Arrow Keys** or **WASD** to control your car
4. **Win**: First to complete all laps wins 2x the bet amount!

## 🏁 Features

- ✅ Real-time multiplayer racing
- ✅ 3 track types (Oval, City, Highway)
- ✅ Betting system with automatic payouts
- ✅ Server-side validation & anti-cheat
- ✅ Premium dark UI with vibrant effects
- ✅ Canvas-based physics engine

## 📚 Documentation

- [TESTING.md](TESTING.md) - Complete testing guide
- [TODO.md](TODO.md) - Development checklist

## 🛠️ Tech Stack

- **Backend**: Express + Socket.IO + SQLite
- **Frontend**: Vanilla JS + HTML5 Canvas
- **Styling**: Custom CSS with Google Fonts

## 🎯 Game Controls

- **↑ / W**: Accelerate
- **↓ / S**: Brake
- **← / A**: Turn Left  
- **→ / D**: Turn Right

## 📁 Project Structure

```
├── server.js          # Express server + Socket.IO
├── raceManager.js     # Race session management
├── db.js              # SQLite database setup
├── model.js           # Data models (User, Race, Bet)
├── controller.js      # API controllers
├── routes.js          # API routes
└── public/
    ├── index.html     # Main UI
    ├── style.css      # Premium styling
    ├── app.js         # Frontend logic
    └── game.js        # Racing game engine
```

## 🎨 UI Preview

**Lobby**: Challenge creation and browsing  
**Race View**: Real-time racing with HUD  
**Result Modal**: Win/loss with payout display

## 🚀 Future Enhancements

- User authentication
- Leaderboards & statistics
- More track types
- Power-ups & boosts
- Mobile controls
- Tournament mode

---

Built with ❤️ for the thrill of racing and betting!
