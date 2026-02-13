const Race = require('./model');
const User = require('../user/model');
const RaceManager = require('../../raceManager');
const db = require('../../db');

class RaceController {

  // Create a new challenge
  static createChallenge(req, res) {
    const { userId, betAmount, trackType, laps = 3, isAi = false } = req.body;

    if (!userId || !betAmount || !trackType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    User.getById(userId, (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user || user.coins < betAmount) {
        return res.status(400).json({ error: 'Insufficient coins' });
      }

      // Lock coins
      User.updateCoins(userId, user.coins - betAmount, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to lock coins' });
        }

        // =====================
        // AI RACE
        // =====================
        if (isAi) {
          db.run(
            `INSERT INTO races 
             (host_id, challenger_id, bet_amount, track_type, laps, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, 0, betAmount, trackType, laps, 'locked'],
            function (err) {
              if (err) {
                // refund coins
                User.updateCoins(userId, user.coins, () => {});
                return res.status(500).json({ error: 'Failed to create AI race' });
              }

              const raceId = this.lastID;

              // ✅ No lobby emit for AI
              return res.json({
                message: 'AI race created',
                raceId,
                isAi: true
              });
            }
          );
          return;
        }

        // =====================
        // HUMAN RACE
        // =====================
        Race.create(userId, betAmount, trackType, laps, (err, raceId) => {
          if (err) {
            User.updateCoins(userId, user.coins, () => {});
            return res.status(500).json({ error: 'Failed to create race' });
          }

          res.json({ message: 'Challenge created', raceId });

          if (req.io) {
            req.io.emit('new-challenge', {
              raceId,
              betAmount,
              trackType,
              laps,
              isAi: false
            });
          }
        });
      });
    });
  }

  // Accept a challenge
  static acceptChallenge(req, res) {
    const { raceId, userId } = req.body;

    Race.getById(raceId, (err, race) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!race || !['open', 'locked'].includes(race.status)) {
        return res.status(400).json({ error: 'Race not available' });
      }
      if (race.host_id === userId) {
        return res.status(400).json({ error: 'Cannot accept your own challenge' });
      }

      // =====================
      // AI RACE ACCEPT
      // =====================
      if (race.challenger_id === 0) {
        Race.acceptChallenge(raceId, userId, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to accept AI challenge' });
          }

          res.json({ message: 'AI challenge accepted', raceId });

          if (req.io) {
            req.io.emit('challenge-accepted', {
              raceId,
              challengerId: userId
            });
          }
        });
        return;
      }

      // =====================
      // HUMAN RACE ACCEPT
      // =====================
      User.getById(userId, (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user || user.coins < race.bet_amount) {
          return res.status(400).json({ error: 'Insufficient coins' });
        }

        User.updateCoins(userId, user.coins - race.bet_amount, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to lock coins' });
          }

          Race.acceptChallenge(raceId, userId, (err) => {
            if (err) {
              User.updateCoins(userId, user.coins, () => {});
              return res.status(500).json({ error: 'Failed to accept challenge' });
            }

            res.json({ message: 'Challenge accepted', raceId });

            if (req.io) {
              req.io.emit('challenge-accepted', {
                raceId,
                challengerId: userId
              });
            }
          });
        });
      });
    });
  }

  // Get all open challenges
  static getOpenChallenges(req, res) {
    Race.getOpenRaces((err, races) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(races);
    });
  }

  // Admin: get active races
  static getActiveRacesForAdmin(req, res) {
    res.json(RaceManager.getActiveRaces());
  }

  // Cancel a race (only host can cancel open races)
  static cancelRace(req, res) {
    const { raceId, userId } = req.body;
    
    console.log('Cancel race request:', { raceId, userId });

    Race.getById(raceId, (err, race) => {
      if (err) {
        console.error('Database error getting race:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!race) {
        console.log('Race not found:', raceId);
        return res.status(404).json({ error: 'Race not found' });
      }

      console.log('Race found:', race);

      // Only host can cancel
      if (race.host_id !== userId) {
        console.log('Permission denied. Host:', race.host_id, 'User:', userId);
        return res.status(403).json({ error: 'Only the host can cancel this race' });
      }

      // Can only cancel open races (not started yet)
      if (race.status !== 'open') {
        console.log('Cannot cancel race with status:', race.status);
        return res.status(400).json({ error: 'Cannot cancel a race that has already started' });
      }

      console.log('Refunding coins to user:', userId);

      // Refund coins to host
      User.getById(userId, (err, user) => {
        if (err) {
          console.error('Error getting user:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log('User found:', user);

        User.updateCoins(userId, user.coins + race.bet_amount, (err) => {
          if (err) {
            console.error('Error refunding coins:', err);
            return res.status(500).json({ error: 'Failed to refund coins' });
          }

          console.log('Coins refunded. Cancelling race...');

          // Mark race as cancelled
          Race.cancelRace(raceId, (err) => {
            if (err) {
              console.error('Error cancelling race:', err);
              return res.status(500).json({ error: 'Failed to cancel race' });
            }

            console.log('Race cancelled successfully');

            res.json({ message: 'Race cancelled successfully', refunded: race.bet_amount });

            // Notify other users
            if (req.io) {
              req.io.emit('race-cancelled', { raceId });
            }
          });
        });
      });
    });
  }
}

module.exports = RaceController;
