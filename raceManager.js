const Race = require('./controllers/race/model');
const User = require('./controllers/user/model');

const activeSessions = new Map();
const botIntervals = new Map();

class RaceManager {

  static initRace(io, raceId) {
    if (activeSessions.has(raceId)) return;

    Race.getById(raceId, (err, race) => {
      if (err || !race) return;

      const isAiRace = !race.challenger_id;

      const players = {
        [race.host_id]: {
          position: { x: 100, y: 0 },
          velocity: { x: 0, y: 0 },
          lap: 0,
          finished: false
        }
      };

      if (isAiRace) {
        players[0] = {
          position: { x: 95, y: 0.3 },
          velocity: { x: 0, y: 0 },
          lap: 0,
          finished: false
        };
      } else {
        players[race.challenger_id] = {
          position: { x: 95, y: 0.3 },
          velocity: { x: 0, y: 0 },
          lap: 0,
          finished: false
        };
      }

      activeSessions.set(raceId, {
        hostId: race.host_id,
        challengerId: race.challenger_id || 0,
        trackType: race.track_type,
        totalLaps: race.laps,
        players,
        startTime: null,
        winner: null
      });

      Race.updateStatus(raceId, 'racing', () => {
        [3, 2, 1].forEach((num, i) => {
          setTimeout(() => {
            io.to(`race-${raceId}`).emit('race-countdown', { countdown: num });
          }, i * 1000);
        });

        setTimeout(() => {
          const session = activeSessions.get(raceId);
          if (!session) return;

          session.startTime = Date.now();
          io.to(`race-${raceId}`).emit('race-start', { startTime: session.startTime });

          if (isAiRace) {
            RaceManager.startBot(io, raceId);
          }
        }, 3000);
      });
    });
  }

  static updatePlayerPosition(raceId, userId, position, velocity) {
    const session = activeSessions.get(raceId);
    if (!session || !session.players[userId]) return false;

    if (userId !== 0) {
      const speed = Math.hypot(velocity.x, velocity.y);
      if (speed > 15) return false;
    }

    session.players[userId].position = position;
    session.players[userId].velocity = velocity;

    const newLap = Math.floor(position.x / 1000);
    if (newLap > session.players[userId].lap) {
      session.players[userId].lap = newLap;
    }

    return true;
  }

  static finishRace(io, raceId, userId, totalLaps) {
    const session = activeSessions.get(raceId);
    if (!session || session.winner !== null) return;

    if (session.players[userId].lap < totalLaps) return;

    session.winner = userId;

    Race.setWinner(raceId, userId, () => {
      Race.getById(raceId, (_, race) => {
        const payout = race.bet_amount * 2;

        if (userId === 0) {
          io.to(`race-${raceId}`).emit('race-finished', {
            winnerId: 0,
            payout: 0
          });
          RaceManager.cleanup(raceId);
          return;
        }

        User.getById(userId, (_, user) => {
          User.updateCoins(userId, user.coins + payout, () => {
            io.to(`race-${raceId}`).emit('race-finished', {
              winnerId: userId,
              payout
            });
            RaceManager.cleanup(raceId);
          });
        });
      });
    });
  }

  static startBot(io, raceId) {
    const session = activeSessions.get(raceId);
    if (!session) return;

    let botLap = 0;
    let botPos = { x: 105, y: 0.3 };
    let botVel = { x: 0, y: 0 };

    const interval = setInterval(() => {
      botVel.x = 8 + Math.random() * 4;
      botPos.x += botVel.x;
      botPos.y = Math.sin(botPos.x * 0.02) * 2;

      botLap = Math.floor(botPos.x / 1000);
      session.players[0].lap = botLap;

      io.to(`race-${raceId}`).emit('opponent-update', {
        userId: 0,
        position: botPos,
        velocity: botVel,
        lap: botLap
      });

      if (botLap >= session.totalLaps) {
        clearInterval(interval);
        botIntervals.delete(raceId);
        RaceManager.finishRace(io, raceId, 0, session.totalLaps);
      }
    }, 100);

    botIntervals.set(raceId, interval);
  }

  static cleanup(raceId) {
    activeSessions.delete(raceId);
    if (botIntervals.has(raceId)) {
      clearInterval(botIntervals.get(raceId));
      botIntervals.delete(raceId);
    }
  }

  static getActiveRaces() {
    const races = [];
    activeSessions.forEach((session, raceId) => {
      races.push({
        raceId,
        hostId: session.hostId,
        challengerId: session.challengerId,
        trackType: session.trackType,
        totalLaps: session.totalLaps,
        status: session.winner ? 'finished' : 'racing',
        winner: session.winner
      });
    });
    return races;
  }
}

module.exports = RaceManager;
