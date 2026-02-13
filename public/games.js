class RacingGame {
  constructor(canvasId, socket) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.socket = socket;

    this.raceId = null;
    this.userId = null;
    this.trackType = 'oval';
    this.totalLaps = 3;

    this.player = {
      x: 100,
      y: 200,
      speed: 0,
      lap: 0
    };

    this.opponent = {
      x: 100,
      y: 240,
      lap: 0
    };

    this.running = false;
    this.started = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.registerSocketEvents();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  registerSocketEvents() {
    // Countdown (optional UI hook)
    this.socket.on('race-countdown', ({ countdown }) => {
      console.log('Countdown:', countdown);
    });

    // Race start (IMPORTANT)
    this.socket.on('race-start', () => {
      this.started = true;
    });

    // Opponent updates (AI or human)
    this.socket.on('opponent-update', (data) => {
      if (data.userId === this.userId) return;
      if (!this.running) return;
      this.updateOpponent(data);
    });

    // Race finished
    this.socket.on('race-finished', ({ winnerId, payout }) => {
      this.stop();
      alert(
        winnerId === this.userId
          ? `You won! +${payout} coins`
          : 'You lost the race'
      );
    });
  }

  start(raceId, userId, trackType, totalLaps) {
    this.raceId = raceId;
    this.userId = userId;
    this.trackType = trackType;
    this.totalLaps = totalLaps;

    this.running = true;
    this.started = false;

    this.player.x = 100;
    this.player.lap = 0;

    // Join socket room
    this.socket.emit('join-race', {
      raceId: this.raceId,
      userId: this.userId
    });

    this.loop();
  }

  stop() {
    this.running = false;
    this.started = false;
  }

  updateOpponent(data) {
    this.opponent.x = data.position.x;
    this.opponent.y = data.position.y;
    this.opponent.lap = data.lap;
  }

  loop() {
    if (!this.running) return;

    if (this.started) {
      this.update();
    }

    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    // Constant forward speed (matches server validation)
    this.player.speed = 10;
    this.player.x += this.player.speed;

    // Lap calculation (1000 units per lap)
    const newLap = Math.floor(this.player.x / 1000);
    if (newLap > this.player.lap) {
      this.player.lap = newLap;
    }

    // Send update to server
    this.socket.emit('player-update', {
      raceId: this.raceId,
      userId: this.userId,
      position: {
        x: this.player.x,
        y: this.player.y
      },
      velocity: {
        x: this.player.speed,
        y: 0
      },
      lap: this.player.lap
    });

    // Finish race
    if (this.player.lap >= this.totalLaps) {
      this.socket.emit('player-finished', {
        raceId: this.raceId,
        userId: this.userId,
        totalLaps: this.totalLaps
      });
      this.stop();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Track with lanes
    const trackY = this.player.y - 60;
    const trackHeight = 140;
    
    // Track background
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, trackY, this.canvas.width, trackHeight);
    
    // Lane lines
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([20, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, trackY + trackHeight / 2);
    this.ctx.lineTo(this.canvas.width, trackY + trackHeight / 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Track borders
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(0, trackY, this.canvas.width, trackHeight);

    // Draw cars
    this.drawCar(this.player.x, this.player.y, '#00ffcc', '#00ccaa', true);
    this.drawCar(this.opponent.x, this.opponent.y, '#ff4444', '#cc0000', false);
    
    // HUD
    this.drawHUD();
  }

  drawCar(x, y, primaryColor, secondaryColor, isPlayer) {
    const ctx = this.ctx;
    const width = 60;
    const height = 35;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(3, 3, width, height);
    
    // Main body - Lamborghini angular shape
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    // Front (aggressive pointed nose)
    ctx.moveTo(width, height / 2);
    ctx.lineTo(width - 8, height / 2 - 12);
    ctx.lineTo(width - 8, height / 2 + 12);
    ctx.closePath();
    ctx.fill();
    
    // Main chassis (angular wedge shape)
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - 8);
    ctx.lineTo(15, height / 2 - 15);
    ctx.lineTo(width - 8, height / 2 - 12);
    ctx.lineTo(width - 8, height / 2 + 12);
    ctx.lineTo(15, height / 2 + 15);
    ctx.lineTo(0, height / 2 + 8);
    ctx.closePath();
    ctx.fill();
    
    // Rear wing/spoiler (Lamborghini style)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-8, height / 2 - 12, 8, 24);
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(-10, height / 2 - 14, 3, 28);
    
    // Side air intakes (angular vents)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(20, height / 2 - 10);
    ctx.lineTo(28, height / 2 - 8);
    ctx.lineTo(28, height / 2 - 4);
    ctx.lineTo(20, height / 2 - 6);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(20, height / 2 + 10);
    ctx.lineTo(28, height / 2 + 8);
    ctx.lineTo(28, height / 2 + 4);
    ctx.lineTo(20, height / 2 + 6);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit/windshield (angular, low profile)
    ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
    ctx.beginPath();
    ctx.moveTo(12, height / 2 - 8);
    ctx.lineTo(22, height / 2 - 10);
    ctx.lineTo(32, height / 2 - 8);
    ctx.lineTo(32, height / 2 + 8);
    ctx.lineTo(22, height / 2 + 10);
    ctx.lineTo(12, height / 2 + 8);
    ctx.closePath();
    ctx.fill();
    
    // Windshield highlight
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Aggressive LED headlights (Y-shape Lamborghini style)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width - 6, height / 2 - 10, 4, 3);
    ctx.fillRect(width - 6, height / 2 + 7, 4, 3);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(width - 4, height / 2 - 8, 2, 2);
    ctx.fillRect(width - 4, height / 2 + 6, 2, 2);
    
    // Wheels (low profile, wide)
    ctx.fillStyle = '#0a0a0a';
    // Front wheels
    ctx.fillRect(width - 15, height / 2 - 16, 8, 10);
    ctx.fillRect(width - 15, height / 2 + 6, 8, 10);
    // Rear wheels
    ctx.fillRect(5, height / 2 - 16, 8, 10);
    ctx.fillRect(5, height / 2 + 6, 8, 10);
    
    // Wheel rims (gold/bronze for luxury look)
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(width - 13, height / 2 - 14, 4, 6);
    ctx.fillRect(width - 13, height / 2 + 8, 4, 6);
    ctx.fillRect(7, height / 2 - 14, 4, 6);
    ctx.fillRect(7, height / 2 + 8, 4, 6);
    
    // Racing stripe (center line)
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(width / 2 - 1, 0, 2, height);
    
    // Side skirts/diffuser lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, height / 2 - 13);
    ctx.lineTo(width - 10, height / 2 - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, height / 2 + 13);
    ctx.lineTo(width - 10, height / 2 + 10);
    ctx.stroke();
    
    // Exhaust pipes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-2, height / 2 - 6, 3, 3);
    ctx.fillRect(-2, height / 2 + 3, 3, 3);
    
    // Brake calipers (red accent)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(width - 14, height / 2 - 13, 2, 4);
    ctx.fillRect(width - 14, height / 2 + 9, 2, 4);
    
    // Player indicator
    if (isPlayer) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', width / 2, -12);
      // Arrow pointing down
      ctx.beginPath();
      ctx.moveTo(width / 2 - 5, -5);
      ctx.lineTo(width / 2, 0);
      ctx.lineTo(width / 2 + 5, -5);
      ctx.fill();
    }
    
    ctx.restore();
  }

  drawHUD() {
    const ctx = this.ctx;
    const padding = 20;
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(padding, padding, 250, 120);
    
    // Border
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, 250, 120);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Lap: ${this.player.lap + 1} / ${this.totalLaps}`, padding + 15, padding + 35);
    
    ctx.fillStyle = '#00ffcc';
    ctx.font = '16px Arial';
    ctx.fillText(`Speed: ${Math.round(this.player.speed * 10)} km/h`, padding + 15, padding + 65);
    
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`Distance: ${Math.round(this.player.x)}m`, padding + 15, padding + 95);
    
    // Progress bar
    const progress = (this.player.lap + (this.player.x % 1000) / 1000) / this.totalLaps;
    const barWidth = 200;
    const barHeight = 10;
    const barX = padding + 25;
    const barY = padding + 105;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}
