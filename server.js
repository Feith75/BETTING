// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const db = require('./db');
const RaceManager = require('./raceManager');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Attach io to request (for controllers)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/race', require('./controllers/race/routes'));
app.use('/api/user', require('./controllers/user/routes'));
app.use('/api', require('./controllers/gift/routes'));
app.use('/api', require('./controllers/betting/routes'));
app.use('/api', require('./controllers/subscription/routes'));
app.use('/api', require('./controllers/prizes/routes'));
app.use('/api/games', require('./controllers/games/routes'));
app.use('/api/payment', require('./controllers/payment/routes'));

// ================= SOCKET.IO =================
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('join-race', ({ raceId, userId }) => {
    socket.join(`race-${raceId}`);
    console.log(`User ${userId} joined race ${raceId}`);
  });

  socket.on('race-ready', ({ raceId }) => {
    RaceManager.initRace(io, raceId);
  });

  socket.on('player-update', ({ raceId, userId, position, velocity, lap }) => {
    const valid = RaceManager.updatePlayerPosition(
      raceId,
      userId,
      position,
      velocity
    );

    if (valid) {
      socket.to(`race-${raceId}`).emit('opponent-update', {
        userId,
        position,
        velocity,
        lap
      });
    }
  });

  socket.on('player-finished', ({ raceId, userId, totalLaps }) => {
    RaceManager.finishRace(io, raceId, userId, totalLaps);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

// ================= START SERVER =================
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
