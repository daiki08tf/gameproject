/* ============================================================
   BLADE VALE - トップダウン・ハック＆スラッシュ サバイバル
   Vanilla JS + Canvas2D, ビルド不要
   ============================================================ */
(() => {
  'use strict';

  // ---------------------------------------------------------
  // Canvas & basic setup
  // ---------------------------------------------------------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const WORLD = { w: 3000, h: 3000 };

  // ---------------------------------------------------------
  // Audio (procedural, no external assets)
  // ---------------------------------------------------------
  const Audio_ = (() => {
    let actx = null;
    function ctxReady() {
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        actx = new AC();
      }
      if (actx.state === 'suspended') actx.resume();
      return actx;
    }
    function beep({ freq = 440, dur = 0.08, type = 'square', gain = 0.08, slideTo = null }) {
      try {
        const ac = ctxReady();
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
        g.gain.setValueAtTime(gain, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
        osc.connect(g).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + dur + 0.02);
      } catch (e) { /* audio not available, ignore */ }
    }
    return {
      swing: () => beep({ freq: 260, dur: 0.09, type: 'triangle', gain: 0.06, slideTo: 140 }),
      hit: () => beep({ freq: 180, dur: 0.07, type: 'square', gain: 0.09, slideTo: 60 }),
      enemyDeath: () => beep({ freq: 320, dur: 0.15, type: 'sawtooth', gain: 0.07, slideTo: 80 }),
      playerHurt: () => beep({ freq: 140, dur: 0.18, type: 'sawtooth', gain: 0.12, slideTo: 50 }),
      pickup: () => beep({ freq: 620, dur: 0.08, type: 'sine', gain: 0.06, slideTo: 900 }),
      levelUp: () => {
        beep({ freq: 440, dur: 0.12, type: 'sine', gain: 0.08, slideTo: 660 });
        setTimeout(() => beep({ freq: 660, dur: 0.16, type: 'sine', gain: 0.08, slideTo: 880 }), 90);
      },
      gameOver: () => beep({ freq: 200, dur: 0.6, type: 'sawtooth', gain: 0.1, slideTo: 40 }),
    };
  })();

  // ---------------------------------------------------------
  // Input
  // ---------------------------------------------------------
  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false };

  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase());
    if (e.key === ' ') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mousedown', () => (mouse.down = true));
  window.addEventListener('mouseup', () => (mouse.down = false));

  // ---------------------------------------------------------
  // Utility
  // ---------------------------------------------------------
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const dist2 = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  // ---------------------------------------------------------
  // Game state
  // ---------------------------------------------------------
  let state = 'start'; // 'start' | 'playing' | 'gameover'
  let elapsed = 0;
  let score = 0;
  let waveIdx = 1;
  let spawnTimer = 0;
  let waveTimer = 0;
  let shake = 0;
  const camera = { x: 0, y: 0 };

  let player, enemies, orbs, potions, particles;

  function resetGame() {
    player = {
      x: WORLD.w / 2, y: WORLD.h / 2,
      radius: 16,
      hp: 100, maxHp: 100,
      speed: 220,
      level: 1, xp: 0, xpToNext: 20,
      damage: 14,
      attackRange: 70,
      attackArcDeg: 100,
      attackCooldown: 0.32,
      attackTimer: 0,
      swinging: 0, // countdown while swing visual is active
      facing: 0,
      invuln: 0,
      hitEnemiesThisSwing: new Set(),
    };
    enemies = [];
    orbs = [];
    potions = [];
    particles = [];
    elapsed = 0;
    score = 0;
    waveIdx = 1;
    spawnTimer = 0;
    waveTimer = 0;
    shake = 0;
    camera.x = player.x;
    camera.y = player.y;
  }

  // ---------------------------------------------------------
  // Enemy types
  // ---------------------------------------------------------
  const ENEMY_TYPES = {
    grunt: { hp: 26, speed: 100, damage: 8, radius: 15, color: '#c9505f', xp: 6, score: 10 },
    fast:  { hp: 14, speed: 190, damage: 5, radius: 11, color: '#e0c94a', xp: 5, score: 12 },
    tank:  { hp: 70, speed: 65,  damage: 14, radius: 22, color: '#8a5cd6', xp: 14, score: 25 },
  };

  function spawnEnemy() {
    const roll = Math.random();
    let type;
    if (waveIdx < 2) type = 'grunt';
    else if (roll < 0.55) type = 'grunt';
    else if (roll < 0.85) type = 'fast';
    else type = 'tank';

    const t = ENEMY_TYPES[type];
    // spawn just outside camera view, in world bounds
    const angle = rand(0, Math.PI * 2);
    const spawnDist = Math.max(canvas.width, canvas.height) / 2 + 80;
    let x = player.x + Math.cos(angle) * spawnDist;
    let y = player.y + Math.sin(angle) * spawnDist;
    x = clamp(x, t.radius, WORLD.w - t.radius);
    y = clamp(y, t.radius, WORLD.h - t.radius);

    const scale = 1 + (waveIdx - 1) * 0.12;
    enemies.push({
      type, x, y,
      radius: t.radius,
      hp: Math.round(t.hp * scale),
      maxHp: Math.round(t.hp * scale),
      speed: t.speed,
      damage: Math.round(t.damage * (1 + (waveIdx - 1) * 0.08)),
      color: t.color,
      xp: t.xp,
      scoreVal: t.score,
      hitFlash: 0,
      contactCooldown: 0,
    });
  }

  // ---------------------------------------------------------
  // Particles (slash fx, hit sparks, death burst)
  // ---------------------------------------------------------
  function spawnParticles(x, y, color, count, speed = 160, life = 0.4) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      particles.push({
        x, y,
        vx: Math.cos(a) * rand(speed * 0.3, speed),
        vy: Math.sin(a) * rand(speed * 0.3, speed),
        life, maxLife: life,
        color,
        size: rand(2, 4),
      });
    }
  }

  // ---------------------------------------------------------
  // Combat
  // ---------------------------------------------------------
  function tryAttack(dt) {
    if (player.attackTimer > 0) return;
    const wantAttack = mouse.down || keys.has(' ');
    if (!wantAttack) return;

    player.attackTimer = player.attackCooldown;
    player.swinging = 0.16;
    player.hitEnemiesThisSwing = new Set();
    player.facing = Math.atan2(mouse.y - (player.y - camera.y + canvas.height / 2), mouse.x - (player.x - camera.x + canvas.width / 2));
    Audio_.swing();

    const arcRad = (player.attackArcDeg * Math.PI) / 180;
    for (const e of enemies) {
      const d2 = dist2(player.x, player.y, e.x, e.y);
      const maxD = player.attackRange + e.radius;
      if (d2 > maxD * maxD) continue;
      const angToE = Math.atan2(e.y - player.y, e.x - player.x);
      if (Math.abs(angleDiff(angToE, player.facing)) <= arcRad / 2) {
        damageEnemy(e, player.damage);
      }
    }
  }

  function damageEnemy(e, amount) {
    if (player.hitEnemiesThisSwing.has(e)) return;
    player.hitEnemiesThisSwing.add(e);
    e.hp -= amount;
    e.hitFlash = 0.12;
    spawnParticles(e.x, e.y, '#ffffff', 6, 140, 0.25);
    if (e.hp <= 0) {
      killEnemy(e);
    } else {
      Audio_.hit();
    }
  }

  function killEnemy(e) {
    e.dead = true;
    score += e.scoreVal;
    spawnParticles(e.x, e.y, e.color, 14, 200, 0.45);
    Audio_.enemyDeath();
    orbs.push({ x: e.x, y: e.y, xp: e.xp, radius: 5, bob: rand(0, Math.PI * 2) });
    if (Math.random() < 0.09) {
      potions.push({ x: e.x + rand(-10, 10), y: e.y + rand(-10, 10), radius: 8, heal: 25 });
    }
  }

  function gainXp(amount) {
    player.xp += amount;
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.round(player.xpToNext * 1.35 + 6);
      player.maxHp += 14;
      player.hp = Math.min(player.maxHp, player.hp + 14);
      player.damage += 3;
      player.speed += 4;
      showLevelUp();
    }
  }

  function showLevelUp() {
    Audio_.levelUp();
    const toast = document.getElementById('levelUpToast');
    toast.classList.remove('hidden');
    toast.style.animation = 'none';
    void toast.offsetWidth; // restart animation
    toast.style.animation = '';
    setTimeout(() => toast.classList.add('hidden'), 1100);
  }

  // ---------------------------------------------------------
  // Update
  // ---------------------------------------------------------
  function update(dt) {
    elapsed += dt;
    waveTimer += dt;
    spawnTimer -= dt;

    // wave progression: every 25s bump wave
    if (waveTimer > 25) {
      waveTimer = 0;
      waveIdx++;
    }

    // spawn rate scales with wave
    const spawnInterval = Math.max(0.35, 1.6 - waveIdx * 0.12);
    if (spawnTimer <= 0 && enemies.length < 120) {
      spawnTimer = spawnInterval;
      const batch = 1 + Math.floor(waveIdx / 3);
      for (let i = 0; i < batch; i++) spawnEnemy();
    }

    updatePlayer(dt);
    updateEnemies(dt);
    updateOrbsAndPotions(dt);
    updateParticles(dt);

    // camera follow (smooth)
    camera.x += (player.x - camera.x) * Math.min(1, dt * 6);
    camera.y += (player.y - camera.y) * Math.min(1, dt * 6);
    shake = Math.max(0, shake - dt * 4);

    if (player.hp <= 0 && state === 'playing') {
      triggerGameOver();
    }
  }

  function updatePlayer(dt) {
    let mx = 0, my = 0;
    if (keys.has('w') || keys.has('arrowup')) my -= 1;
    if (keys.has('s') || keys.has('arrowdown')) my += 1;
    if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
    if (keys.has('d') || keys.has('arrowright')) mx += 1;
    const len = Math.hypot(mx, my);
    if (len > 0) {
      mx /= len; my /= len;
      player.x += mx * player.speed * dt;
      player.y += my * player.speed * dt;
    }
    player.x = clamp(player.x, player.radius, WORLD.w - player.radius);
    player.y = clamp(player.y, player.radius, WORLD.h - player.radius);

    if (player.attackTimer > 0) player.attackTimer -= dt;
    if (player.swinging > 0) player.swinging -= dt;
    if (player.invuln > 0) player.invuln -= dt;

    tryAttack(dt);
  }

  function updateEnemies(dt) {
    for (const e of enemies) {
      if (e.dead) continue;
      const dx = player.x - e.x, dy = player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const desiredDist = e.radius + player.radius + 4;
      if (d > desiredDist) {
        e.x += (dx / d) * e.speed * dt;
        e.y += (dy / d) * e.speed * dt;
      }
      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.contactCooldown > 0) e.contactCooldown -= dt;

      // simple separation so enemies don't fully stack
      for (const o of enemies) {
        if (o === e || o.dead) continue;
        const d2v = dist2(e.x, e.y, o.x, o.y);
        const minD = e.radius + o.radius;
        if (d2v < minD * minD && d2v > 0.001) {
          const dd = Math.sqrt(d2v);
          const push = (minD - dd) / 2;
          const nx = (e.x - o.x) / dd, ny = (e.y - o.y) / dd;
          e.x += nx * push * 0.5;
          e.y += ny * push * 0.5;
        }
      }

      // contact damage to player
      if (d < desiredDist + 2 && e.contactCooldown <= 0 && player.invuln <= 0) {
        player.hp -= e.damage;
        player.invuln = 0.55;
        e.contactCooldown = 0.6;
        shake = 0.35;
        Audio_.playerHurt();
        spawnParticles(player.x, player.y, '#ff5566', 8, 150, 0.3);
      }
    }
    enemies = enemies.filter((e) => !e.dead);
  }

  function updateOrbsAndPotions(dt) {
    for (const o of orbs) {
      o.bob += dt * 4;
      const d = Math.hypot(player.x - o.x, player.y - o.y);
      const magnet = 110;
      if (d < magnet) {
        const pull = 1 - d / magnet;
        o.x += (player.x - o.x) * pull * dt * 6;
        o.y += (player.y - o.y) * pull * dt * 6;
      }
      if (d < player.radius + o.radius + 6) {
        o.collected = true;
        gainXp(o.xp);
        score += 1;
      }
    }
    orbs = orbs.filter((o) => !o.collected);

    for (const p of potions) {
      const d = Math.hypot(player.x - p.x, player.y - p.y);
      if (d < player.radius + p.radius) {
        p.collected = true;
        player.hp = Math.min(player.maxHp, player.hp + p.heal);
        Audio_.pickup();
        spawnParticles(p.x, p.y, '#5cf27a', 10, 140, 0.35);
      }
    }
    potions = potions.filter((p) => !p.collected);
  }

  function updateParticles(dt) {
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0);
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  function worldToScreen(x, y) {
    return {
      x: x - camera.x + canvas.width / 2,
      y: y - camera.y + canvas.height / 2,
    };
  }

  function render() {
    ctx.save();
    if (shake > 0) {
      ctx.translate(rand(-shake, shake) * 8, rand(-shake, shake) * 8);
    }

    drawBackground();
    drawPotions();
    drawOrbs();
    drawEnemies();
    drawPlayer();
    drawParticles();

    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = '#151522';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    const gridSize = 80;
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    const offX = -((camera.x - canvas.width / 2) % gridSize);
    const offY = -((camera.y - canvas.height / 2) % gridSize);
    ctx.beginPath();
    for (let x = offX; x < canvas.width; x += gridSize) {
      ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = offY; y < canvas.height; y += gridSize) {
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // world border
    const tl = worldToScreen(0, 0);
    const br = worldToScreen(WORLD.w, WORLD.h);
    ctx.strokeStyle = 'rgba(242,201,76,0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  }

  function drawPlayer() {
    const s = worldToScreen(player.x, player.y);
    const flashing = player.invuln > 0 && Math.floor(elapsed * 20) % 2 === 0;

    // attack swing arc
    if (player.swinging > 0) {
      const t = player.swinging / 0.16;
      ctx.save();
      ctx.globalAlpha = t * 0.55;
      ctx.fillStyle = '#f2c94c';
      const arcRad = (player.attackArcDeg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.arc(s.x, s.y, player.attackRange, player.facing - arcRad / 2, player.facing + arcRad / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = flashing ? 0.4 : 1;
    // body
    ctx.beginPath();
    ctx.fillStyle = '#4ac2e8';
    ctx.arc(s.x, s.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dff6ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // facing indicator
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + Math.cos(player.facing) * (player.radius + 10), s.y + Math.sin(player.facing) * (player.radius + 10));
    ctx.stroke();
    ctx.restore();
  }

  function drawEnemies() {
    for (const e of enemies) {
      const s = worldToScreen(e.x, e.y);
      if (s.x < -60 || s.x > canvas.width + 60 || s.y < -60 || s.y > canvas.height + 60) continue;

      ctx.beginPath();
      ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.color;
      ctx.arc(s.x, s.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // hp bar
      const w = e.radius * 2;
      const pct = clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(s.x - w / 2, s.y - e.radius - 10, w, 4);
      ctx.fillStyle = pct > 0.4 ? '#7be07b' : '#e05555';
      ctx.fillRect(s.x - w / 2, s.y - e.radius - 10, w * pct, 4);
    }
  }

  function drawOrbs() {
    for (const o of orbs) {
      const s = worldToScreen(o.x, o.y);
      const bobY = Math.sin(o.bob) * 3;
      ctx.beginPath();
      ctx.fillStyle = '#8ee9ff';
      ctx.shadowColor = '#8ee9ff';
      ctx.shadowBlur = 8;
      ctx.arc(s.x, s.y + bobY, o.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawPotions() {
    for (const p of potions) {
      const s = worldToScreen(p.x, p.y);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = '#5cf27a';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-6, -8, 12, 16, 3) : ctx.rect(-6, -8, 12, 16);
      ctx.fill();
      ctx.fillStyle = '#173';
      ctx.fillRect(-2, -11, 4, 4);
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const s = worldToScreen(p.x, p.y);
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ---------------------------------------------------------
  // HUD
  // ---------------------------------------------------------
  const hpFill = document.getElementById('hpFill');
  const hpText = document.getElementById('hpText');
  const xpFill = document.getElementById('xpFill');
  const xpText = document.getElementById('xpText');
  const levelText = document.getElementById('levelText');
  const scoreText = document.getElementById('scoreText');
  const waveText = document.getElementById('waveText');
  const timeText = document.getElementById('timeText');

  function updateHud() {
    hpFill.style.width = `${clamp((player.hp / player.maxHp) * 100, 0, 100)}%`;
    hpText.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`;
    xpFill.style.width = `${clamp((player.xp / player.xpToNext) * 100, 0, 100)}%`;
    xpText.textContent = `XP ${player.xp}/${player.xpToNext}`;
    levelText.textContent = `Lv.${player.level}`;
    scoreText.textContent = `Score: ${score}`;
    waveText.textContent = `Wave ${waveIdx}`;
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
    timeText.textContent = `${mm}:${ss}`;
  }

  // ---------------------------------------------------------
  // Game loop
  // ---------------------------------------------------------
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (state === 'playing') {
      update(dt);
      updateHud();
    }
    render();
    requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------
  // Screens
  // ---------------------------------------------------------
  const startScreen = document.getElementById('startScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalStats = document.getElementById('finalStats');

  function startGame() {
    resetGame();
    state = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
  }

  function triggerGameOver() {
    state = 'gameover';
    Audio_.gameOver();
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
    finalStats.textContent = `スコア: ${score}　レベル: ${player.level}　生存時間: ${mm}:${ss}`;
    gameOverScreen.classList.remove('hidden');
  }

  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', startGame);

  // kick off render loop immediately (shows empty bg behind start screen)
  resetGame();
  requestAnimationFrame(loop);
})();
