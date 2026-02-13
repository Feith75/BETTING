# Testing Guide - Betting Racing Car

## ✅ API Verification

### Server Status
**Running**: http://localhost:5000  
**Status**: ✅ Operational

### Tested Endpoints
```bash
GET /api/balance/1
Response: {"balance":1000}
Status: ✅ Working

GET /api/race/challenges
Response: []
Status: ✅ Working (empty - no active challenges)
```

---

## 🎮 How to Play

### Step 1: Open the Game
Open your web browser and navigate to:
```
http://localhost:5000
```

You should see:
- **Header**: "🏁 RACING BETS" logo with your balance (1000 coins)
- **Lobby**: "Challenge Lobby" title with a "Create Challenge" button
- **Empty state** initially showing "No active challenges"

### Step 2: Create a Challenge (Player 1)

1. Click the **"+ Create Challenge"** button
2. Fill in the modal form:
   - **Bet Amount**: e.g., `100` coins
   - **Track Type**: Choose from Oval 🏁, City 🏙️, or Highway 🛣️
   - **Laps**: e.g., `3`
3. Click **"Create Challenge"**
4. You'll see an alert: "Challenge created! Waiting for opponent..."
5. The view switches to the **race canvas** (waiting state)

### Step 3: Accept Challenge (Player 2)

Open a **second browser window/tab** at http://localhost:5000

1. You should see your challenge card in the lobby grid showing:
   - Track emoji and type
   - Bet amount badge
   - Number of laps
   - Host player info
2. Click **"Accept Challenge"**
3. Confirm the bet amount in the popup
4. Both players' windows will trigger the race countdown

### Step 4: Race!

**Countdown**: 3... 2... 1... GO!

**Controls**:
- **Arrow Keys** or **WASD** to control your car
  - **↑ / W**: Accelerate
  - **↓ / S**: Brake/Reverse
  - **← / A**: Turn Left
  - **→ / D**: Turn Right

**Objective**:
- Drive through checkpoints in order
- Complete all laps before your opponent
- The **purple car** is you, **blue car** is your opponent

**HUD Display**:
- **Lap**: Current lap / Total laps
- **Speed**: Current velocity (0-120)
- **Position**: 1st or 2nd place

### Step 5: Win!

**Winner**:
- Sees trophy icon 🏆
- Message: "You Won!"
- Receives **2x bet amount** (e.g., 200 coins for 100 bet)

**Loser**:
- Sees sad face 😞
- Message: "You Lost"
- Loses bet amount

Click **"Back to Lobby"** to return and check updated balance.

---

## 🧪 API Testing with cURL

### Check User Balance
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/balance/1 -UseBasicParsing | Select-Object -ExpandProperty Content
```
Expected: `{"balance":1000}`

### List Open Challenges
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/race/challenges -UseBasicParsing | Select-Object -ExpandProperty Content
```
Expected: `[]` (or list of challenges if any exist)

### Create a Challenge (via API)
```powershell
$body = @{
    userId = 1
    betAmount = 100
    trackType = "oval"
    laps = 3
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/race/create -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```
Expected: `{"message":"Challenge created","raceId":1}`

### Accept a Challenge (via API)
```powershell
$body = @{
    raceId = 1
    userId = 2
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/race/accept -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```
Expected: `{"message":"Challenge accepted","raceId":1}`

---

## 🔧 Troubleshooting

### Port Already in Use
If you see `EADDRINUSE` error:
```powershell
# Kill all node processes
taskkill /F /IM node.exe

# Restart server
node server.js
```

### Database Issues
If you need to reset the database:
```powershell
# Stop server (Ctrl+C)
Remove-Item betting.db

# Restart server (will recreate database)
node server.js
```

### Socket.IO Connection Issues
- Ensure both browser windows are connected to the same server
- Check browser console for connection errors (F12 → Console)
- Verify server logs show "Client connected" messages

---

## 🎯 Known Behaviors

### By Design
- **Balance starts at 1000 coins** for all users
- **User ID is hardcoded to 1** in the frontend (production would need authentication)
- **Bets are locked** when creating/accepting challenges
- **Disconnection refunds** both players (future: implement forfeit)

### Track Types
- **Oval** 🏁: Simple circular track with 6 checkpoints
- **City** 🏙️: Complex circuit with 8 checkpoints and sharp turns
- **Highway** 🛣️: Sprint track with 5 checkpoints and curves

### Car Physics
- **Max Speed**: 12 units/frame (~120 displayed)
- **Acceleration**: 0.5 units/frame²
- **Friction**: 0.92 (7.7% speed loss per frame)
- **Server enforces** max speed of 15 units/frame (anti-cheat)

---

## 📊 Multiplayer Sync

**Client → Server** (60fps):
- Car position (x, y)
- Velocity vector
- Current lap number

**Server → Other Players**:
- Opponent position
- Opponent velocity
- Lap progress

**Server Validates**:
- Speed limits (max 15 units/frame)
- Lap completion via checkpoint progression
- Winner determination (first to complete all laps)

---

## 🚀 Next Steps

**Enhancements You Can Make**:
1. Add authentication system (replace hardcoded user ID)
2. Implement spectator mode for ongoing races
3. Add leaderboard/statistics tracking
4. Create more complex tracks
5. Add power-ups or boost mechanics
6. Mobile touch controls
7. Better disconnection handling (forfeit vs refund)
8. Race replays
9. Custom car skins
10. Tournament brackets

**Files to Modify**:
- `public/game.js` - Game engine and physics
- `public/style.css` - UI styling
- `raceManager.js` - Race logic and validation
- `public/app.js` - Frontend application logic

---

## 📝 Technology Stack

- **Backend**: Node.js + Express + Socket.IO
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Rendering**: HTML5 Canvas
- **Styling**: Custom CSS with Outfit font
- **Real-time**: WebSocket (Socket.IO)

Enjoy racing! 🏎️💨
