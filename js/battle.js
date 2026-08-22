/* ============================================================
   戦闘エンジン（セミオート：移動は仮想スティック、通常攻撃は自動、
   スキル／必殺技はボタン）
   ============================================================ */
import { state } from './state.js';
import { findStage } from './data/stages.js';
import { ENEMY_TYPES } from './data/enemies.js';
import { getItem } from './data/equipment.js';
import { DAMAGE_BUCKET, ECONOMY } from './data/balance.js';
import { Joystick } from './joystick.js';
import { Audio_ } from './audio.js';

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist2 = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;

const ARENA = { w: 1700, h: 1700 };

export class BattleScreen {
  constructor() {
    this.canvas = document.getElementById('battleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.joystick = new Joystick(document.getElementById('joystickBase'), document.getElementById('joystickKnob'));

    this.hpFill = document.getElementById('battleHpFill');
    this.hpText = document.getElementById('battleHpText');
    this.mpFill = document.getElementById('battleMpFill');
    this.stageNameEl = document.getElementById('battleStageName');
    this.remainEl = document.getElementById('enemyRemainText');
    this.bossBar = document.getElementById('bossBar');
    this.bossHpFill = document.getElementById('bossHpFill');
    this.bossNameText = document.getElementById('bossNameText');
    this.skillLabel = document.getElementById('skillLabel');
    this.skillVeil = document.getElementById('skillCooldownVeil');
    this.ultVeil = document.getElementById('ultCooldownVeil');
    this.retreatBtn = document.getElementById('retreatBtn');

    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);

    document.getElementById('skillBtn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { this._useSkill(); } catch (err) { console.error('useSkill error (recovered):', err); }
    });
    document.getElementById('ultBtn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { this._useUltimate(); } catch (err) { console.error('useUltimate error (recovered):', err); }
    });
    this.retreatBtn.addEventListener('click', () => {
      try { this._endRun(false, true); } catch (err) {
        console.error('retreat/_endRun error (recovered), forcing exit:', err);
        this._forceExitToResult(false, true);
      }
    });

    this.running = false;
    this.onEnd = null;
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(stageId, onEnd) {
    this._resize();
    this.onEnd = onEnd;
    const found = findStage(stageId);
    this.stage = found.stage;
    this.stageNameEl.textContent = `${this.stage.name}`;

    const stats = state.getStats();
    this.player = {
      x: ARENA.w / 2, y: ARENA.h / 2, radius: 16,
      hp: stats.hp, maxHp: stats.hp,
      mp: stats.mp, maxMp: stats.mp,
      atk: stats.atk, def: stats.def, mag: stats.mag, spd: stats.spd, critPct: stats.critPct,
      facing: 0,
      attackRange: 68,
      attackCooldown: clamp(1.0 - stats.spd * 0.012, 0.35, 1.1),
      attackTimer: 0,
      invuln: 0,
      buffAtkMult: 1, buffDefMult: 1, buffUntil: 0,
      ultGauge: 0,
    };

    this.job = state.currentJob;
    this.skillLabel.textContent = this.job.skill.name;
    this.skillCd = 0;
    this.ultReady = false;
    this.effects = state.getEquippedEffects();
    const equippedWeapon = getItem(state.data.equipped.weapon);
    this.weaponType = equippedWeapon ? equippedWeapon.weaponType : null;
    this.hasteUntil = 0;
    this.hasteBonus = 0;
    this.awakenMult = 1;

    this.enemies = [];
    this.particles = [];
    this.camera = { x: this.player.x, y: this.player.y };
    this.shake = 0;

    this.totalToDefeat = this.stage.waves.reduce((s, w) => s + w.count, 0);
    this.defeated = 0;
    this.runExp = 0;
    this.runGold = 0;
    this.runItems = [];
    this.boss = null;

    // スポーンキュー構築
    this.spawnQueue = [];
    for (const wave of this.stage.waves) {
      for (let i = 0; i < wave.count; i++) {
        this.spawnQueue.push({ type: wave.type, delay: i * (wave.interval || 1) });
      }
    }
    this.spawnQueue.sort((a, b) => a.delay - b.delay);
    this.spawnClock = 0;
    this.nextSpawnIdx = 0;

    this._updateHud();
    this._updateRemain();

    this.running = true;
    this.lastTime = performance.now();
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  stop() {
    this.running = false;
  }

  _loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    try {
      this._update(dt);
      this._render();
    } catch (err) {
      // 想定外の例外でループが永久停止しないようにする（フリーズ対策）。
      // 1フレーム分の処理は失われるが、次フレームで復帰を試みる。
      console.error('Battle loop error (recovered, continuing):', err);
    }
    if (this.running) requestAnimationFrame(this._loop);
  }

  // ---------------------------------------------------------
  _update(dt) {
    this.spawnClock += dt;
    while (this.nextSpawnIdx < this.spawnQueue.length && this.spawnQueue[this.nextSpawnIdx].delay <= this.spawnClock) {
      this._spawnEnemy(this.spawnQueue[this.nextSpawnIdx].type);
      this.nextSpawnIdx++;
    }

    this._updatePlayer(dt);
    this._updateEnemies(dt);
    this._updateParticles(dt);

    this.camera.x += (this.player.x - this.camera.x) * Math.min(1, dt * 6);
    this.camera.y += (this.player.y - this.camera.y) * Math.min(1, dt * 6);
    this.shake = Math.max(0, this.shake - dt * 4);

    if (this.skillCd > 0) this.skillCd -= dt;
    this._updateActionButtons();
    this._updatePassiveEffects();

    if (this.player.hp <= 0) {
      this._endRun(false, false);
      return;
    }
    if (this.defeated >= this.totalToDefeat && this.nextSpawnIdx >= this.spawnQueue.length && this.enemies.length === 0) {
      this._endRun(true, false);
    }
  }

  _updatePlayer(dt) {
    const v = this.joystick.vector;
    const len = Math.hypot(v.x, v.y);
    if (len > 0.05) {
      const hasteMult = this.hasteUntil && performance.now() < this.hasteUntil ? 1 + this.hasteBonus : 1;
      const speed = (190 + this.player.spd * 3) * hasteMult;
      const nx = v.x / Math.max(len, 1);
      const ny = v.y / Math.max(len, 1);
      this.player.x += nx * speed * dt;
      this.player.y += ny * speed * dt;
      this.player.facing = Math.atan2(ny, nx);
    }
    this.player.x = clamp(this.player.x, this.player.radius, ARENA.w - this.player.radius);
    this.player.y = clamp(this.player.y, this.player.radius, ARENA.h - this.player.radius);

    if (this.player.invuln > 0) this.player.invuln -= dt;
    if (this.player.buffUntil && performance.now() > this.player.buffUntil) {
      this.player.buffAtkMult = 1; this.player.buffDefMult = 1; this.player.buffUntil = 0;
    }

    // 自動攻撃
    this.player.attackTimer -= dt;
    if (this.player.attackTimer <= 0) {
      const target = this._nearestEnemy(this.player.attackRange);
      if (target) {
        this.player.attackTimer = this.player.attackCooldown;
        this.player.facing = Math.atan2(target.y - this.player.y, target.x - this.player.x);
        const dmg = this._rollDamage(this.player.atk * this.player.buffAtkMult * this.awakenMult, target.def);
        this._dealDamage(target, dmg);
        this._spawnParticles(target.x, target.y, '#ffffff', 5, 120, 0.2);
        Audio_.swing();
        this.player.ultGauge = Math.min(100, this.player.ultGauge + dmg * 0.4);
      }
    }
  }

  _effectsOf(trigger) {
    return this.effects.filter((e) => e.trigger === trigger);
  }

  _updatePassiveEffects() {
    const awaken = this._effectsOf('passive').find((e) => e.kind === 'damageBoost');
    if (!awaken) { this.awakenMult = 1; return; }
    const active = this.player.hp / this.player.maxHp <= awaken.threshold;
    this.awakenMult = active ? 1 + awaken.power : 1;
  }

  _nearestEnemy(maxRange) {
    let best = null, bestD = Infinity;
    for (const e of this.enemies) {
      const d = dist2(this.player.x, this.player.y, e.x, e.y);
      const maxD = (maxRange + e.radius) ** 2;
      if (d <= maxD && d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  _rollDamage(atk, def) {
    let dmg = Math.max(1, atk - def * DAMAGE_BUCKET.DEF_MITIGATION_COEFF);
    if (Math.random() * 100 < this.player.critPct) dmg *= DAMAGE_BUCKET.CRIT_MULTIPLIER;
    return Math.round(dmg);
  }

  _spawnEnemy(type) {
    const t = ENEMY_TYPES[type];
    const angle = rand(0, Math.PI * 2);
    const spawnDist = Math.max(this.canvas.width, this.canvas.height) / 2 + 100;
    let x = this.player.x + Math.cos(angle) * spawnDist;
    let y = this.player.y + Math.sin(angle) * spawnDist;
    x = clamp(x, t.radius, ARENA.w - t.radius);
    y = clamp(y, t.radius, ARENA.h - t.radius);
    const enemy = {
      type, x, y, radius: t.radius,
      hp: t.hp, maxHp: t.hp, atk: t.atk, def: t.def, speed: t.speed,
      color: t.color, name: t.name, xp: t.xp, gold: t.gold, boss: !!t.boss,
      hitFlash: 0, contactCooldown: 0,
    };
    this.enemies.push(enemy);
    if (enemy.boss) {
      this.boss = enemy;
      this.bossBar.classList.remove('hidden');
      this.bossNameText.textContent = enemy.name;
    }
  }

  _updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = this.player.x - e.x, dy = this.player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const desired = e.radius + this.player.radius + 4;
      if (d > desired) {
        e.x += (dx / d) * e.speed * dt;
        e.y += (dy / d) * e.speed * dt;
      }
      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.contactCooldown > 0) e.contactCooldown -= dt;

      for (const o of this.enemies) {
        if (o === e || o.dead) continue;
        const d2v = dist2(e.x, e.y, o.x, o.y);
        const minD = e.radius + o.radius;
        if (d2v < minD * minD && d2v > 0.001) {
          const dd = Math.sqrt(d2v);
          const push = (minD - dd) / 2;
          e.x += ((e.x - o.x) / dd) * push * 0.5;
          e.y += ((e.y - o.y) / dd) * push * 0.5;
        }
      }

      if (d < desired + 2 && e.contactCooldown <= 0 && this.player.invuln <= 0) {
        const dmg = Math.max(1, Math.round(e.atk - this.player.def * this.player.buffDefMult * 0.5));
        this.player.hp -= dmg;
        this.player.invuln = 0.9;
        e.contactCooldown = 0.9;
        this.shake = 0.3;
        this.player.ultGauge = Math.min(100, this.player.ultGauge + dmg * 0.8);
        Audio_.playerHurt();
        this._spawnParticles(this.player.x, this.player.y, '#ff5566', 7, 140, 0.3);
        this._applyOnHurtEffects(e);
      }
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
    this._updateHud();
    this._updateRemain();
  }

  _dealDamage(enemy, dmg) {
    this._applyRawDamage(enemy, dmg);

    for (const eff of this._effectsOf('onHit')) {
      if (Math.random() > eff.chance) continue;
      if (eff.kind === 'lifesteal') {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + dmg * eff.power);
      } else if (eff.kind === 'burnDamage' && !enemy.dead) {
        const burn = Math.round(this.player.atk * eff.power);
        this._applyRawDamage(enemy, burn);
        this._spawnParticles(enemy.x, enemy.y, '#ff7a3c', 6, 140, 0.25);
      }
    }
  }

  _applyRawDamage(enemy, dmg) {
    enemy.hp -= dmg;
    enemy.hitFlash = 0.12;
    if (enemy.hp <= 0 && !enemy.dead) {
      enemy.dead = true;
      this.defeated++;
      this._spawnParticles(enemy.x, enemy.y, enemy.color, 14, 200, 0.4);
      Audio_.enemyDeath();
      const expRes = state.gainExp(enemy.xp);
      const goldGain = state.gainGold(enemy.gold);
      this.runExp += expRes.gained;
      this.runGold += goldGain;
      if (expRes.leveledUp) this._toast('LEVEL UP!');
      this._rollDrop();
      this._rollManastone(enemy);
      if (this.weaponType) state.addWeaponKill(this.weaponType);
      if (enemy.boss) { this.boss = null; this.bossBar.classList.add('hidden'); }
    }
  }

  _applyOnHurtEffects(attacker) {
    for (const eff of this._effectsOf('onHurt')) {
      if (Math.random() > eff.chance) continue;
      if (eff.kind === 'counter' && !attacker.dead) {
        const counterDmg = Math.round(this.player.atk * eff.power);
        this._applyRawDamage(attacker, counterDmg);
        this._spawnParticles(attacker.x, attacker.y, '#ffcf6b', 6, 140, 0.25);
      } else if (eff.kind === 'haste') {
        this.hasteBonus = eff.power;
        this.hasteUntil = performance.now() + eff.duration * 1000;
      }
    }
  }

  _rollManastone(enemy) {
    if (enemy.boss) {
      const amount = Math.round(rand(ECONOMY.MANASTONE_BOSS_MIN, ECONOMY.MANASTONE_BOSS_MAX));
      state.addManastone(amount);
      this.runManastone = (this.runManastone || 0) + amount;
      return;
    }
    if (Math.random() > ECONOMY.MANASTONE_NORMAL_CHANCE) return;
    const amount = Math.round(rand(ECONOMY.MANASTONE_NORMAL_MIN, ECONOMY.MANASTONE_NORMAL_MAX));
    state.addManastone(amount);
    this.runManastone = (this.runManastone || 0) + amount;
  }

  _rollDrop() {
    const table = this.stage.dropTable || [];
    if (table.length === 0) return;
    const chance = ECONOMY.BASE_DROP_CHANCE * state.dropRateMult();
    if (Math.random() > chance) return;
    const totalW = table.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalW;
    for (const d of table) {
      r -= d.weight;
      if (r <= 0) {
        state.addItem(d.itemId, 1);
        this.runItems.push(d.itemId);
        return;
      }
    }
  }

  _useSkill() {
    if (!this.running || this.skillCd > 0) return;
    const skill = this.job.skill;
    if (this.player.mp < skill.mpCost) { this._toast('MP不足'); return; }
    this.player.mp -= skill.mpCost;
    this.skillCd = skill.cooldown;
    Audio_.skill();

    if (skill.type === 'damage') {
      const targets = this._nearbyEnemies(150, 3);
      for (const t of targets) {
        const dmg = this._rollDamage((skill.power + this.player.atk * 0.4 + this.player.mag * 0.6) * this.awakenMult, t.def);
        this._dealDamage(t, dmg);
      }
      this._spawnParticles(this.player.x, this.player.y, '#8ee9ff', 16, 220, 0.35);
    } else if (skill.type === 'heal') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + skill.power + this.player.mag * 0.5);
      Audio_.heal();
      this._spawnParticles(this.player.x, this.player.y, '#5cf27a', 14, 140, 0.4);
    } else if (skill.type === 'buff') {
      this.player.buffAtkMult = 1.35;
      this.player.buffDefMult = 1.35;
      this.player.buffUntil = performance.now() + 6000;
      this._spawnParticles(this.player.x, this.player.y, '#f2c94c', 14, 160, 0.4);
    }
    this._updateHud();
  }

  _useUltimate() {
    if (!this.running || this.player.ultGauge < 100) return;
    this.player.ultGauge = 0;
    Audio_.ultimate();
    const targets = this._nearbyEnemies(240, 99);
    const dmg = Math.round(((this.player.atk + this.player.mag) * 2.2 + 40) * this.awakenMult);
    for (const t of targets) this._dealDamage(t, dmg);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.12);
    this.shake = 0.6;
    this._spawnParticles(this.player.x, this.player.y, '#ffffff', 30, 300, 0.6);
    this._updateHud();
  }

  _nearbyEnemies(range, limit) {
    return this.enemies
      .filter((e) => !e.dead && dist2(this.player.x, this.player.y, e.x, e.y) <= (range + e.radius) ** 2)
      .sort((a, b) => dist2(this.player.x, this.player.y, a.x, a.y) - dist2(this.player.x, this.player.y, b.x, b.y))
      .slice(0, limit);
  }

  _spawnParticles(x, y, color, count, speed, life) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * rand(speed * 0.3, speed),
        vy: Math.sin(a) * rand(speed * 0.3, speed),
        life, maxLife: life, color, size: rand(2, 4),
      });
    }
  }

  _updateParticles(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.92; p.vy *= 0.92;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  _updateActionButtons() {
    const cdPct = this.skillCd > 0 ? (this.skillCd / this.job.skill.cooldown) * 100 : 0;
    this.skillVeil.style.transform = `translateY(${100 - cdPct}%)`;
    const ultPct = this.player.ultGauge;
    this.ultVeil.style.transform = `translateY(${ultPct}%)`;
  }

  _updateHud() {
    this.hpFill.style.width = `${clamp((this.player.hp / this.player.maxHp) * 100, 0, 100)}%`;
    this.hpText.textContent = `${Math.max(0, Math.round(this.player.hp))}/${this.player.maxHp}`;
    this.mpFill.style.width = `${clamp((this.player.mp / this.player.maxMp) * 100, 0, 100)}%`;
    if (this.boss) {
      this.bossHpFill.style.width = `${clamp((this.boss.hp / this.boss.maxHp) * 100, 0, 100)}%`;
    }
  }

  _updateRemain() {
    const remain = this.totalToDefeat - this.defeated;
    this.remainEl.textContent = `残り ${Math.max(0, remain)}`;
  }

  _toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    setTimeout(() => el.classList.add('hidden'), 1350);
  }

  _endRun(cleared, retreated) {
    if (!this.running) return;
    this.running = false;
    // running=false を確定させた直後に隔離しておく：以降で何が起きても
    // ループは止まり、あとは result 画面へ渡せるかどうかだけの問題にする。
    try { this.bossBar.classList.add('hidden'); } catch (e) { /* ignore */ }

    let firstClear = false;
    let bonusItem = null;
    let stageExp = 0;
    let stageGold = 0;

    // 報酬計算・セーブ処理は失敗しうる（不正なセーブ状態など）ため、
    // ここで例外が出てもリザルト画面へは必ず遷移できるようにする。
    try {
      if (cleared) {
        stageExp = this.stage.rewards.exp;
        stageGold = this.stage.rewards.gold;
        state.gainExp(stageExp);
        state.gainGold(stageGold);
        const res = state.recordStageResult(this.stage.id, true);
        firstClear = res.wasFirstClear;
        if (firstClear && this.stage.firstClear && this.stage.firstClear.itemId) {
          state.addItem(this.stage.firstClear.itemId, 1);
          bonusItem = this.stage.firstClear.itemId;
        }
        Audio_.stageClear();
      } else if (!retreated) {
        state.recordStageResult(this.stage.id, false);
        Audio_.stageFail();
      }
    } catch (err) {
      console.error('_endRun reward/save error (recovered, proceeding to result screen):', err);
    }

    const items = [...this.runItems];
    if (bonusItem) items.push(bonusItem);

    if (this.onEnd) {
      this.onEnd({
        cleared, retreated,
        expGained: cleared ? this.runExp + stageExp : this.runExp,
        goldGained: cleared ? this.runGold + stageGold : this.runGold,
        items,
        firstClear,
      });
    }
  }

  // _endRun 自体が想定外の例外で失敗した場合の最終フォールバック。
  // 撤退ボタン押下時にだけ使い、確実にリザルト画面へ抜けられるようにする。
  _forceExitToResult(cleared, retreated) {
    this.running = false;
    try { this.bossBar.classList.add('hidden'); } catch (e) { /* ignore */ }
    if (this.onEnd) {
      this.onEnd({
        cleared, retreated,
        expGained: this.runExp || 0,
        goldGained: this.runGold || 0,
        items: this.runItems || [],
        firstClear: false,
      });
    }
  }

  // ---------------------------------------------------------
  _render() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-this.shake, this.shake) * 8, rand(-this.shake, this.shake) * 8);

    this._drawBackground();
    this._drawEnemies();
    this._drawPlayer();
    this._drawParticles();

    ctx.restore();
  }

  _toScreen(x, y) {
    return { x: x - this.camera.x + this.canvas.width / 2, y: y - this.camera.y + this.canvas.height / 2 };
  }

  _drawBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = '#151522';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const gridSize = 80;
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    const offX = -((this.camera.x - this.canvas.width / 2) % gridSize);
    const offY = -((this.camera.y - this.canvas.height / 2) % gridSize);
    ctx.beginPath();
    for (let x = offX; x < this.canvas.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); }
    for (let y = offY; y < this.canvas.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); }
    ctx.stroke();

    const tl = this._toScreen(0, 0);
    const br = this._toScreen(ARENA.w, ARENA.h);
    ctx.strokeStyle = 'rgba(242,201,76,0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  }

  _drawPlayer() {
    const ctx = this.ctx;
    const s = this._toScreen(this.player.x, this.player.y);
    const flashing = this.player.invuln > 0 && Math.floor(performance.now() / 60) % 2 === 0;
    ctx.save();
    ctx.globalAlpha = flashing ? 0.4 : 1;
    ctx.beginPath();
    ctx.fillStyle = this.player.buffUntil ? '#f2c94c' : '#4ac2e8';
    ctx.arc(s.x, s.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dff6ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + Math.cos(this.player.facing) * (this.player.radius + 10), s.y + Math.sin(this.player.facing) * (this.player.radius + 10));
    ctx.stroke();
    ctx.restore();
  }

  _drawEnemies() {
    const ctx = this.ctx;
    for (const e of this.enemies) {
      const s = this._toScreen(e.x, e.y);
      if (s.x < -80 || s.x > this.canvas.width + 80 || s.y < -80 || s.y > this.canvas.height + 80) continue;
      ctx.beginPath();
      ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.color;
      ctx.arc(s.x, s.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = e.boss ? '#ffd76b' : 'rgba(0,0,0,0.4)';
      ctx.lineWidth = e.boss ? 3 : 2;
      ctx.stroke();

      const w = e.radius * 2;
      const pct = clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(s.x - w / 2, s.y - e.radius - 10, w, 4);
      ctx.fillStyle = pct > 0.4 ? '#7be07b' : '#e05555';
      ctx.fillRect(s.x - w / 2, s.y - e.radius - 10, w * pct, 4);
    }
  }

  _drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const s = this._toScreen(p.x, p.y);
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}
