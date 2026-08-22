/* ============================================================
   戦闘エンジン（セミオート：移動は仮想スティック、通常攻撃は自動、
   スキル／必殺技はボタン）
   ============================================================ */
import { state } from './state.js';
import { findStage } from './data/stages.js';
import { ENEMY_TYPES } from './data/enemies.js';
import { getItem, RARITY, rarityIndex } from './data/equipment.js';
import { getRune } from './data/runes.js';
import { DAMAGE_BUCKET, ECONOMY, ABYSS_EXPANSION_LAYER, WEAPON_CODEX_LAYER, CAPS_LAYER, BOSS_AI_LAYER, resolveBossAIProfile } from './data/balance.js';
import { getBlessing } from './data/blessings.js';
import { weaponDropPoolForStage, bossWeaponForChapter } from './data/weapons.js';
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

  start(stageId, onEnd, blessingId) {
    this._resize();
    this.onEnd = onEnd;
    const found = findStage(stageId);
    this.stage = found.stage;
    this.chapter = found.chapter; // Boss固有武器の抽選に使う（章idが必要なため）
    this.stageNameEl.textContent = `${this.stage.name}`;
    // 加護（Blessing、深淵拡張）：深淵限定・その1階だけの一時バフ。
    // セーブされず、装備やツリーとは完全に独立した使い切りの選択。
    this.blessing = this.stage.isAbyss ? getBlessing(blessingId) : null;
    this._abyssReviveUsed = false; // 深淵ツリー「深淵の加護」：1階につき1回だけ

    const stats = state.getStats();
    this.player = {
      x: ARENA.w / 2, y: ARENA.h / 2, radius: 16,
      hp: stats.hp, maxHp: stats.hp,
      mp: stats.mp, maxMp: stats.mp,
      atk: stats.atk, def: stats.def, mag: stats.mag, spd: stats.spd, critPct: stats.critPct,
      // Blade Vale 2.1：武器図鑑武器（主に斧＝防御貫通、短剣＝回避）の新規ステータス
      armorPen: stats.armorPen || 0, evasion: stats.evasion || 0,
      facing: 0,
      attackRange: 68,
      attackCooldown: clamp(1.0 - stats.spd * 0.012, CAPS_LAYER.ATTACK_INTERVAL_MIN, 1.1),
      attackTimer: 0,
      invuln: 0,
      buffAtkMult: 1, buffDefMult: 1, buffUntil: 0,
      ultGauge: 0,
    };
    if (this.blessing) {
      const b = this.blessing;
      if (b.kind === 'atkMult') this.player.atk = Math.round(this.player.atk * (1 + b.power));
      else if (b.kind === 'defMult') this.player.def = Math.round(this.player.def * (1 + b.power));
      else if (b.kind === 'spdMult') this.player.spd = Math.round(this.player.spd * (1 + b.power));
      else if (b.kind === 'critAdd') this.player.critPct += b.power;
      else if (b.kind === 'hpMult') {
        this.player.maxHp = Math.round(this.player.maxHp * (1 + b.power));
        this.player.hp = this.player.maxHp;
      }
      // goldMult/expMult は _goldMult()/_expMult() が都度参照する（ここでは何もしない）
    }

    this.job = state.currentJob;
    this.skillLabel.textContent = this.job.skill.name;
    this.skillCd = 0;
    this.ultReady = false;
    this.effects = state.getEquippedEffects();
    // Blade Vale 2.1「玉砕型」武器（魔剣ノクティス等）：最大HP減の代わりに
    // 常時ダメージ増加。hp側だけここで一度だけ適用する（dmg側はawakenMultへ）
    for (const eff of this.effects) {
      if (eff.kind === 'glassCannon' && eff.hpMult) {
        this.player.maxHp = Math.max(1, Math.round(this.player.maxHp * (1 + eff.hpMult)));
        this.player.hp = Math.min(this.player.hp, this.player.maxHp);
      }
    }
    const equippedWeapon = getItem(state.data.equipped.weapon);
    this.weaponType = equippedWeapon ? equippedWeapon.weaponType : null;
    this.hasteUntil = 0;
    this.hasteBonus = 0;
    this.awakenMult = 1;
    this._regenPower = 0;
    this._hitCounters = {};        // everyNHits系固有効果の命中カウンター（effect.idごと）
    this._tempAtkBonus = 0;        // Boss撃破時の一時ATKバフ（bossSlayerBuff）
    this._tempAtkUntil = 0;
    this._actionTypesUsed = new Set(); // actionDiversityBurst用：通常/スキル/必殺技の使用履歴
    this._bossWeaponDropped = false;   // Boss固有武器の抽選は1戦闘中1回だけ（ボスは通常1体のため実質1回だが念のため）

    this.enemies = [];
    this.particles = [];
    this.projectiles = []; // Boss AI「遠距離攻撃」の弾体（元指示9・10番）
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
    this._updateBossAI(dt);
    this._updateProjectiles(dt);
    this._updateDots();
    this._updateParticles(dt);

    this.camera.x += (this.player.x - this.camera.x) * Math.min(1, dt * 6);
    this.camera.y += (this.player.y - this.camera.y) * Math.min(1, dt * 6);
    this.shake = Math.max(0, this.shake - dt * 4);

    if (this.skillCd > 0) this.skillCd -= dt;
    this._updateActionButtons();
    this._updatePassiveEffects();
    // 杖/錫杖/楽器系固有効果「regen」：毎秒、最大HPの一定割合を回復する
    if (this._regenPower) this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * this._regenPower * dt);

    if (this.player.hp <= 0) {
      // 深淵ツリー「深淵の加護」：深淵限定・1階につき1回だけ致死を耐える
      if (this.stage.isAbyss && !this._abyssReviveUsed && state.hasAbyssRevive()) {
        this._abyssReviveUsed = true;
        this.player.hp = Math.round(this.player.maxHp * 0.5);
        this.player.invuln = 1.5;
        this._toast('深淵の加護が発動！');
        Audio_.levelUp();
      } else {
        this._endRun(false, false);
        return;
      }
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
        // 転生遺物「狂戦士の心臓」：HPが低いほど攻撃間隔が縮む
        this.player.attackTimer = this.player.attackCooldown * this._berserkerCooldownMult();
        this.player.facing = Math.atan2(target.y - this.player.y, target.x - this.player.x);
        const atkValue = this.player.atk * this._mainDmgMult();
        const dmg = this._rollDamage(atkValue, target);
        this._dealDamage(target, dmg);
        this._spawnParticles(target.x, target.y, '#ffffff', 5, 120, 0.2);
        Audio_.swing();
        this.player.ultGauge = Math.min(100, this.player.ultGauge + dmg * 0.4);
        this._actionTypesUsed.add('normal');
        this._checkActionDiversityBurst();
        // 転生遺物「狂戦士の心臓」：HP25%以下では通常攻撃が2回攻撃になる
        if (this._berserkerDoubleAttackActive() && !target.dead) {
          const dmg2 = this._rollDamage(atkValue, target);
          this._dealDamage(target, dmg2);
          this.player.ultGauge = Math.min(100, this.player.ultGauge + dmg2 * 0.4);
        }
      }
    }
  }

  _effectsOf(trigger) {
    return this.effects.filter((e) => e.trigger === trigger);
  }

  _updatePassiveEffects() {
    const hpRatio = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
    const passives = this._effectsOf('passive');
    const awaken = passives.find((e) => e.kind === 'damageBoost');
    let mult = 1;
    if (awaken && hpRatio <= awaken.threshold) mult += awaken.power;
    // 上級・特級職MASTERの「HPが一定割合以下の間、与ダメージ+X%」もここに同じ枠で乗せる
    mult += state.jobMasterLowHpDamageBonus(hpRatio);
    // Blade Vale 2.1「玉砕型」武器（魔剣ノクティス等）：常時の与ダメージ増加分
    let regenPower = 0;
    for (const eff of passives) {
      if (eff.kind === 'glassCannon' && eff.dmgMult) mult += eff.dmgMult;
      if (eff.kind === 'regen') regenPower += eff.power;
    }
    this.awakenMult = mult;
    // 難易度リバランス（元指示16番）：秒間回復率（最大HPに対する割合）にも
    // 上限を設け、regen系固有効果の重複で実質無敵化しないようにする
    this._regenPower = Math.min(CAPS_LAYER.REGEN_PCT_PER_SEC_MAX, regenPower);
  }

  // 転生遺物「血神の杯」：通常攻撃・スキル命中時に一時的なATKバフが乗る
  _bloodChaliceMult() {
    return this.bloodChaliceUntil && performance.now() < this.bloodChaliceUntil ? 1 + this.bloodChaliceBonus : 1;
  }

  // レジェンド武器「竜殺剣バルムンク」等（bossSlayerBuff）：Boss撃破後の一時ATKバフ
  _tempAtkBuffMult() {
    return this._tempAtkUntil && performance.now() < this._tempAtkUntil ? 1 + this._tempAtkBonus : 1;
  }

  // 難易度リバランス（元指示12番）：与ダメージ+%系のバフ・ボーナスは、
  // 出処が違っても全て「同じカテゴリー」として1つの加算バケットへまとめる
  // （awakenMult＝覚醒/職業MASTER/玉砕型武器、スキルバフ、血神の杯、
  // 討伐後バフを、以前は個別に掛け算していたため複利的に増幅していた）。
  // カテゴリー内加算・カテゴリー間乗算の方針をここで実際に適用する。
  _mainDmgMult() {
    return 1
      + (this.awakenMult - 1)
      + (this.player.buffAtkMult - 1)
      + (this._bloodChaliceMult() - 1)
      + (this._tempAtkBuffMult() - 1);
  }

  // レジェンド武器「星断剣アステリオン」等（critDamageBoost）：会心ダメージ倍率の底上げ
  _critDamageBoostMult() {
    let mult = 1;
    for (const eff of this._effectsOf('passive')) if (eff.kind === 'critDamageBoost') mult += eff.power;
    return mult;
  }

  // レジェンド武器のbossDmg（Bossへの与ダメージ+X%固定）とexecutioner
  // （Boss残HPが一定以下の間さらに+X%）を、覚醒ツリー「覇者の一撃」に
  // 加算でまとめる。
  _bossDmgMult(target) {
    let bonus = state.awakeningBossDmgMult() - 1;
    for (const eff of this._effectsOf('passive')) {
      if (eff.kind === 'bossDmg') bonus += eff.power;
      if (eff.kind === 'executioner' && target && target.maxHp > 0 && target.hp / target.maxHp <= eff.hpThreshold) bonus += eff.power;
    }
    return 1 + bonus;
  }

  // 短剣系固有効果「weaken」で弱体化された敵のステータスを反映した実効値。
  // 複数ステータス（atk/def/spd）を同時に弱体化できるよう、ステータスごとに
  // 個別のタイマーを持つ（enemy.weaken = { atk: {power,until}, def: {...} }）。
  _effectiveEnemyStat(enemy, stat) {
    const base = enemy[stat];
    const w = enemy.weaken && enemy.weaken[stat];
    if (w && performance.now() < w.until) return base * (1 - w.power);
    return base;
  }

  // 神話武器「創世剣エクシード」等（actionDiversityBurst）：通常攻撃・スキル・
  // 必殺技をそれぞれ1回ずつ成立させると、周囲の敵へ大爆発を発生させる。
  _checkActionDiversityBurst() {
    const eff = this._effectsOf('passive').find((e) => e.kind === 'actionDiversityBurst');
    if (!eff || this._actionTypesUsed.size < 3) return;
    const dmg = Math.round(this.player.atk * eff.power);
    this._aoeDamage(this.player.x, this.player.y, eff.radius || 150, dmg, null);
    this._spawnParticles(this.player.x, this.player.y, '#ffe066', 24, 260, 0.5);
    this.shake = Math.max(this.shake, 0.4);
    this._actionTypesUsed.clear();
  }

  // 周囲の敵へまとめてダメージを与える（everyNHits/deathNova/
  // actionDiversityBurst等のAoE系固有効果で共通利用）
  _aoeDamage(x, y, radius, dmg, exclude) {
    for (const e of this.enemies) {
      if (e === exclude || e.dead) continue;
      if (dist2(x, y, e.x, e.y) <= radius * radius) this._applyRawDamage(e, dmg);
    }
  }

  // 転生遺物「狂戦士の心臓」：HPが低いほど攻撃間隔が縮み、HP25%以下で2回攻撃になる
  _berserkerRelic() {
    return this._effectsOf('passive').find((e) => e.kind === 'berserker');
  }

  _berserkerCooldownMult() {
    const rel = this._berserkerRelic();
    if (!rel) return 1;
    const hpRatio = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
    const missing = 1 - hpRatio;
    return Math.max(0.4, 1 - missing * rel.power); // 攻撃間隔の下限は元の40%（連射しすぎ防止）
  }

  _berserkerDoubleAttackActive() {
    const rel = this._berserkerRelic();
    if (!rel) return false;
    const hpRatio = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
    return hpRatio <= rel.threshold;
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

  // target は敵オブジェクトそのもの（旧: def数値とisBossフラグを別々に受け
  // 取っていたが、weaken弱体化の反映とexecutioner判定に敵の生データが必要な
  // ため、Blade Vale 2.1でtargetそのものを渡す形に変更した）。
  // 難易度リバランス（元指示3・12・13番）：Damage Bucketの再設計。
  //   dmg = atk × mainMult(呼び出し元で乗算済み) × (1-mitigation) × critMult(会心時) × bossMult(Boss時)
  // 「atk - def*係数」という単純減算式は、プレイヤーATKが数百〜数千に
  // 達すると敵DEFの影響が実質ゼロになり終盤ほど防御力が無意味化する欠陥が
  // あった。defが大きいほど軽減率が逓減しながら上昇する比率ベースの式へ
  // 変更し、高DEFの敵が終盤・深淵でも意味を持ち続けるようにした
  // （mitigation = effectiveDef / (effectiveDef + MITIGATION_K)。
  // defがMITIGATION_Kに等しいと50%軽減）。
  _rollDamage(atk, target) {
    const rawDef = target ? this._effectiveEnemyStat(target, 'def') : 0;
    // 斧系武器の「防御貫通」：プレイヤー自身の防御貫通率ぶん、相手の防御力の
    // 有効性を下げる（0.2なら敵の防御力を20%無視する）
    const effectiveDef = rawDef * (1 - (this.player.armorPen || 0));
    const mitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectiveDef / (effectiveDef + DAMAGE_BUCKET.MITIGATION_K));
    let dmg = Math.max(1, atk * (1 - mitigation));
    // 会心判定はlastHitCritとして保持し、直後の_dealDamage()がonCrit系の
    // 転生遺物（雷神の瞳など）を発動するかどうかの判定に使う
    this.lastHitCrit = Math.random() * 100 < this.player.critPct;
    if (this.lastHitCrit) dmg *= DAMAGE_BUCKET.CRIT_MULTIPLIER * this._critDamageBoostMult();
    // 覚醒ツリー「覇者の一撃」＋レジェンド武器のbossDmg/executioner：ボス相手にのみ乗る追加倍率
    if (target && target.boss) dmg *= this._bossDmgMult(target);
    return Math.round(dmg);
  }

  // モディファイア（ATK/DEF/SPD/接触ダメージ増加）を深淵ツリー「混沌への
  // 耐性」で軽減した上で適用するためのブレンド関数。mult<=1（プレイヤー
  // に有利な側）はそのまま通す＝耐性は「不利な効果の緩和」専用。
  _riskMult(mult) {
    if (mult <= 1 || !this.stage.isAbyss) return mult;
    const resistPct = state.abyssModifierResistPct();
    return 1 + (mult - 1) * (1 - resistPct);
  }

  _goldMult() {
    let m = this.blessing && this.blessing.kind === 'goldMult' ? 1 + this.blessing.power : 1;
    if (this.stage.isAbyss && this.stage.boss) m *= state.abyssBossFloorRewardMult();
    return m;
  }

  _expMult() {
    let m = this.blessing && this.blessing.kind === 'expMult' ? 1 + this.blessing.power : 1;
    if (this.stage.isAbyss && this.stage.boss) m *= state.abyssBossFloorRewardMult();
    return m;
  }

  _spawnEnemy(type) {
    const t = ENEMY_TYPES[type];
    let hp = t.hp, atk = t.atk, def = t.def, speed = t.speed, radius = t.radius;
    let xp = t.xp, gold = t.gold;
    let elite = false;

    // 深淵拡張：モディファイア由来の敵強化（耐性で軽減）＋エリート化抽選。
    // ボスには適用しない（ボスは常に単体・既存の強さのまま）。
    if (this.stage.isAbyss && !t.boss) {
      hp = Math.round(hp * (this.stage.enemyHpMult || 1));
      atk = Math.round(atk * this._riskMult(this.stage.enemyAtkMult || 1));
      def = Math.round(def * this._riskMult(this.stage.enemyDefMult || 1));
      speed = Math.round(speed * this._riskMult(this.stage.enemySpeedMult || 1));

      if (Math.random() < state.abyssEliteChance(this.stage.abyssDepth)) {
        elite = true;
        hp = Math.round(hp * ABYSS_EXPANSION_LAYER.ELITE_HP_MULT);
        atk = Math.round(atk * ABYSS_EXPANSION_LAYER.ELITE_ATK_MULT);
        def = Math.round(def * ABYSS_EXPANSION_LAYER.ELITE_DEF_MULT);
        radius = Math.round(radius * 1.25);
        const rewardMult = ABYSS_EXPANSION_LAYER.ELITE_REWARD_MULT * state.abyssEliteRewardMult();
        xp = Math.round(xp * rewardMult);
        gold = Math.round(gold * rewardMult);
      }
    }

    const angle = rand(0, Math.PI * 2);
    const spawnDist = Math.max(this.canvas.width, this.canvas.height) / 2 + 100;
    let x = this.player.x + Math.cos(angle) * spawnDist;
    let y = this.player.y + Math.sin(angle) * spawnDist;
    x = clamp(x, radius, ARENA.w - radius);
    y = clamp(y, radius, ARENA.h - radius);
    const enemy = {
      type, x, y, radius, elite,
      hp, maxHp: hp, atk, def, speed,
      color: t.color, name: t.name, xp, gold, boss: !!t.boss,
      hitFlash: 0, contactCooldown: 0,
    };
    if (enemy.boss) {
      // Boss AI（元指示9〜11番）：全BossにHP50%閾値のフェーズ2・予兆付き
      // 特殊攻撃を標準装備させ、「壁」として機能させる。どの攻撃パターンを
      // 使うかはBOSS_AI_PROFILES（Boss個体のtype文字列 > 章単位 > 深淵共通 >
      // default、balance.jsのresolveBossAIProfile参照）で決まる。章5・8・10と
      // 深淵Bossは、力のインフレの受け皿である深淵の趣旨（元指示21番）に
      // 合わせ、遠距離攻撃・雑魚召喚も使うフル構成にする。すべて必ず
      // TELEGRAPH_SEC秒の予兆を経てから発動するため、モバイルのタッチ操作
      // でも見てから避けられる（元指示11・33番）。
      const profile = resolveBossAIProfile(type, this.chapter ? this.chapter.num : null, !!this.stage.isAbyss);
      enemy.aiPhase = 1;
      enemy.aiProfile = profile;
      // 初動が完全な棒立ちにならないよう開始タイマーを少しずらす
      if (profile.slam) enemy.slamTimer = BOSS_AI_LAYER.SLAM_INTERVAL_SEC * 0.55;
      if (profile.charge) enemy.chargeTimer = BOSS_AI_LAYER.CHARGE_INTERVAL_SEC * 0.85;
      if (profile.projectile) enemy.projectileTimer = BOSS_AI_LAYER.PROJECTILE_INTERVAL_SEC * 0.4;
      if (profile.summon) enemy.summonTimer = BOSS_AI_LAYER.SUMMON_INTERVAL_SEC;
    }
    this.enemies.push(enemy);
    if (enemy.boss) {
      this.boss = enemy;
      this.bossBar.classList.remove('hidden');
      this.bossNameText.textContent = enemy.name;
    }
  }

  _updateEnemies(dt) {
    const now = performance.now();
    for (const e of this.enemies) {
      if (e.dead) continue;
      // 神話武器「時空剣クロノス」等（timeStop）：凍結中は移動も攻撃もしない
      const frozen = e.frozenUntil && now < e.frozenUntil;

      // Boss AI「突進」：予兆後の直線ダッシュ中は通常の追尾・接触ダメージを
      // 止め、記録しておいた方向へ一定時間だけ高速直進する（元指示9・10番）
      if (e.chargeDash && !frozen) {
        const cd = e.chargeDash;
        e.x = clamp(e.x + cd.dx * e.speed * BOSS_AI_LAYER.CHARGE_SPEED_MULT * dt, e.radius, ARENA.w - e.radius);
        e.y = clamp(e.y + cd.dy * e.speed * BOSS_AI_LAYER.CHARGE_SPEED_MULT * dt, e.radius, ARENA.h - e.radius);
        cd.timeLeft -= dt;
        if (!cd.hit && this.player.invuln <= 0) {
          const dd = Math.hypot(this.player.x - e.x, this.player.y - e.y);
          if (dd < e.radius + this.player.radius + 4) {
            cd.hit = true;
            const enemyAtk = this._effectiveEnemyStat(e, 'atk');
            const effectivePDef = (this.player.def || 0) * (this.player.buffDefMult || 1);
            const pMitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectivePDef / (effectivePDef + DAMAGE_BUCKET.MITIGATION_K));
            const dmg = Math.max(1, Math.round(enemyAtk * BOSS_AI_LAYER.CHARGE_DAMAGE_MULT * (1 - pMitigation)));
            this.player.hp -= dmg;
            this.player.invuln = 0.9;
            this.shake = 0.4;
            this.player.ultGauge = Math.min(100, this.player.ultGauge + dmg * 0.8);
            Audio_.playerHurt();
            this._spawnParticles(this.player.x, this.player.y, '#ff8a3c', 9, 160, 0.3);
          }
        }
        if (cd.timeLeft <= 0) e.chargeDash = null;
        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.contactCooldown > 0) e.contactCooldown -= dt;
        continue;
      }

      const dx = this.player.x - e.x, dy = this.player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const desired = e.radius + this.player.radius + 4;
      if (!frozen && d > desired) {
        const spd = this._effectiveEnemyStat(e, 'speed');
        e.x += (dx / d) * spd * dt;
        e.y += (dy / d) * spd * dt;
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

      if (!frozen && d < desired + 2 && e.contactCooldown <= 0 && this.player.invuln <= 0) {
        e.contactCooldown = 0.9;
        // 短剣系武器の「回避」：発動時はダメージを一切受けない
        if (Math.random() < (this.player.evasion || 0)) {
          this._spawnParticles(this.player.x, this.player.y, '#8ecbff', 4, 100, 0.25);
          continue;
        }
        // 深淵モディファイア「瘴気だまり」＋短剣系weaken debuff：接触ダメージ増加
        // 難易度リバランス（元指示13番「防御側も整理」）：プレイヤーDEFも
        // _rollDamage()と同じ比率ベースの軽減式で処理する。旧式（固定値半減
        // 減算）は終盤ATKインフレに対してDEFが無意味化する一方、序盤は
        // 最低保証ダメージ1で頭打ちになり「敵の攻撃が無視できる」原因にも
        // なっていた。同じmitigation = def/(def+MITIGATION_K)を適用することで、
        // 防御力への投資が終盤・深淵まで一貫して意味を持つようにする。
        const contactMult = this._riskMult(this.stage.contactDmgMult || 1);
        const enemyAtk = this._effectiveEnemyStat(e, 'atk');
        const effectivePDef = (this.player.def || 0) * (this.player.buffDefMult || 1);
        const pMitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectivePDef / (effectivePDef + DAMAGE_BUCKET.MITIGATION_K));
        const dmg = Math.max(1, Math.round(enemyAtk * contactMult * (1 - pMitigation)));
        this.player.hp -= dmg;
        this.player.invuln = 0.9;
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

  // Boss AI（元指示9・10・11番）：全Bossに汎用的な多段階・予兆型攻撃パターンを
  // 適用する。HP50%以下でフェーズ2（強化状態）へ移行し、攻撃力・移動速度が
  // 上がり特殊攻撃の間隔も縮む。intensity='high'（章5・8・10、深淵ボス）は
  // 遠距離攻撃・雑魚召喚も使うフル構成にし、明確な難易度の節目にする。
  // 危険な攻撃は必ずTELEGRAPH_SEC秒の予兆（警告円・警告ライン）を経てから
  // 発動するため、モバイルのタッチ操作でも「見てから避けられる」（元指示33番：
  // 回避不能な即死攻撃・精密な回避を要求する設計は禁止）。
  _updateBossAI(dt) {
    const now = performance.now();
    for (const e of this.enemies) {
      if (e.dead || !e.boss || e.aiPhase == null) continue;
      if (e.frozenUntil && now < e.frozenUntil) continue;

      if (e.aiPhase === 1 && e.hp / e.maxHp <= BOSS_AI_LAYER.PHASE2_HP_RATIO) {
        e.aiPhase = 2;
        e.atk = Math.round(e.atk * BOSS_AI_LAYER.PHASE2_ATK_MULT);
        e.speed = Math.round(e.speed * BOSS_AI_LAYER.PHASE2_SPEED_MULT);
        if (e.slamTimer != null) e.slamTimer = Math.min(e.slamTimer, BOSS_AI_LAYER.SLAM_INTERVAL_SEC) * BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT;
        if (e.chargeTimer != null) e.chargeTimer = Math.min(e.chargeTimer, BOSS_AI_LAYER.CHARGE_INTERVAL_SEC) * BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT;
        if (e.projectileTimer != null) e.projectileTimer *= BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT;
        if (e.summonTimer != null) e.summonTimer *= BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT;
        this._toast(`${e.name}が態勢を変えた！`, '#ff8a3c');
      }

      // 予兆中・突進中は新規攻撃を開始しない（複数攻撃の同時発生を避け、
      // モバイル画面でも見切れるようにするため）
      if (e.telegraph) {
        if (now >= e.telegraph.readyAt) this._resolveBossTelegraph(e);
        continue;
      }
      if (e.chargeDash) continue;

      // 各攻撃パターンはBOSS_AI_PROFILESで無効化されている場合タイマー
      // 自体がnullのまま（_spawnEnemyで初期化されない）なので、projectile/
      // summonと同じくnullガードで統一する（PR#2レビュー第3点）。
      if (e.slamTimer != null) e.slamTimer -= dt;
      if (e.chargeTimer != null) e.chargeTimer -= dt;
      if (e.projectileTimer != null) e.projectileTimer -= dt;
      if (e.summonTimer != null) e.summonTimer -= dt;

      if (e.slamTimer != null && e.slamTimer <= 0) { this._startBossTelegraph(e, 'slam'); continue; }
      if (e.chargeTimer != null && e.chargeTimer <= 0) { this._startBossTelegraph(e, 'charge'); continue; }
      if (e.projectileTimer != null && e.projectileTimer <= 0) { this._startBossTelegraph(e, 'projectile'); continue; }
      if (e.summonTimer != null && e.summonTimer <= 0) {
        e.summonTimer = BOSS_AI_LAYER.SUMMON_INTERVAL_SEC * (e.aiPhase === 2 ? BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT : 1);
        this._bossSummon(e);
      }
    }
  }

  _startBossTelegraph(e, kind) {
    const now = performance.now();
    e.telegraph = {
      kind,
      readyAt: now + BOSS_AI_LAYER.TELEGRAPH_SEC * 1000,
      // 発動位置は予兆開始時点のプレイヤー座標に固定する。発動直前まで追尾
      // すると反射神経勝負になり、モバイルのタッチ操作では避けにくくなる
      x: this.player.x, y: this.player.y,
    };
  }

  _resolveBossTelegraph(e) {
    const t = e.telegraph;
    e.telegraph = null;
    const phaseMult = e.aiPhase === 2 ? BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT : 1;
    if (t.kind === 'slam') {
      e.slamTimer = BOSS_AI_LAYER.SLAM_INTERVAL_SEC * phaseMult;
      const dd = Math.hypot(this.player.x - t.x, this.player.y - t.y);
      this._spawnParticles(t.x, t.y, '#ffb347', 18, 220, 0.4);
      if (dd < BOSS_AI_LAYER.SLAM_RADIUS && this.player.invuln <= 0) {
        const enemyAtk = this._effectiveEnemyStat(e, 'atk');
        const effectivePDef = (this.player.def || 0) * (this.player.buffDefMult || 1);
        const pMitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectivePDef / (effectivePDef + DAMAGE_BUCKET.MITIGATION_K));
        const dmg = Math.max(1, Math.round(enemyAtk * BOSS_AI_LAYER.SLAM_DAMAGE_MULT * (1 - pMitigation)));
        this.player.hp -= dmg;
        this.player.invuln = 0.9;
        this.shake = 0.5;
        this.player.ultGauge = Math.min(100, this.player.ultGauge + dmg * 0.8);
        Audio_.playerHurt();
        this._spawnParticles(this.player.x, this.player.y, '#ff5566', 12, 180, 0.35);
      }
    } else if (t.kind === 'charge') {
      e.chargeTimer = BOSS_AI_LAYER.CHARGE_INTERVAL_SEC * phaseMult;
      const dx = t.x - e.x, dy = t.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.chargeDash = { dx: dx / d, dy: dy / d, timeLeft: 0.45, hit: false };
    } else if (t.kind === 'projectile') {
      e.projectileTimer = BOSS_AI_LAYER.PROJECTILE_INTERVAL_SEC * phaseMult;
      const dx = t.x - e.x, dy = t.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      this.projectiles.push({
        x: e.x, y: e.y,
        vx: (dx / d) * BOSS_AI_LAYER.PROJECTILE_SPEED, vy: (dy / d) * BOSS_AI_LAYER.PROJECTILE_SPEED,
        radius: 13, atk: this._effectiveEnemyStat(e, 'atk'), life: 3,
      });
    }
  }

  // Boss AI「雑魚召喚」：報酬インフレを避けるため、召喚した手下はxp/goldを
  // 与えない（難易度は上がるが、章の報酬バランスはドロップテーブル側で
  // 担保する方針のため。元指示24番の趣旨）
  _bossSummon(e) {
    for (let i = 0; i < BOSS_AI_LAYER.SUMMON_COUNT; i++) {
      const angle = rand(0, Math.PI * 2);
      const dist = e.radius + 70;
      const hp = Math.max(1, Math.round(e.maxHp * 0.05));
      this.enemies.push({
        type: '__boss_summon__', boss: false, elite: false,
        x: clamp(e.x + Math.cos(angle) * dist, 20, ARENA.w - 20),
        y: clamp(e.y + Math.sin(angle) * dist, 20, ARENA.h - 20),
        radius: 13, hp, maxHp: hp,
        atk: Math.max(1, Math.round(e.atk * 0.3)), def: Math.round(e.def * 0.4), speed: 150,
        color: '#ff9f6b', name: `${e.name}の手下`, xp: 0, gold: 0,
        hitFlash: 0, contactCooldown: 0,
      });
    }
    this._toast(`${e.name}が手下を呼び出した！`, '#ffb347');
  }

  // Boss AI「遠距離攻撃」の弾体：直進し、着弾または画面外/寿命切れで消える
  _updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.dead) continue;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || p.x < -50 || p.x > ARENA.w + 50 || p.y < -50 || p.y > ARENA.h + 50) { p.dead = true; continue; }
      const dd = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dd < p.radius + this.player.radius && this.player.invuln <= 0) {
        p.dead = true;
        const effectivePDef = (this.player.def || 0) * (this.player.buffDefMult || 1);
        const pMitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectivePDef / (effectivePDef + DAMAGE_BUCKET.MITIGATION_K));
        const dmg = Math.max(1, Math.round(p.atk * BOSS_AI_LAYER.PROJECTILE_DAMAGE_MULT * (1 - pMitigation)));
        this.player.hp -= dmg;
        this.player.invuln = 0.7;
        this.shake = 0.3;
        this.player.ultGauge = Math.min(100, this.player.ultGauge + dmg * 0.8);
        Audio_.playerHurt();
        this._spawnParticles(this.player.x, this.player.y, '#c77dff', 8, 150, 0.3);
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.dead);
  }

  // 炎/毒/闇系武器の「burnStack」固有効果：重複可能なDoT（継続ダメージ）。
  // enemy.dotStacks本ぶん、1秒毎（tickInterval）にATK×powerのダメージが入る。
  // durationを過ぎると自然に消滅する（新たな命中で重複・時間更新される）。
  _updateDots() {
    const now = performance.now();
    for (const e of this.enemies) {
      if (e.dead || !e.dotStacks) continue;
      if (now > e.dotUntil) { e.dotStacks = 0; e.dotNextTick = null; continue; }
      if (e.dotNextTick != null && now >= e.dotNextTick) {
        const dmg = Math.max(1, Math.round(this.player.atk * e.dotPower * e.dotStacks));
        this._applyRawDamage(e, dmg);
        this._spawnParticles(e.x, e.y, '#ff7a3c', 4, 100, 0.2);
        e.dotNextTick = now + e.dotTickInterval * 1000;
      }
    }
  }

  _dealDamage(enemy, dmg) {
    this._applyRawDamage(enemy, dmg);

    // 難易度リバランス（元指示16番）：吸血系固有効果は複数装備分の重複が
    // 起こり得るため、1回の命中あたりの合計吸収率をCAPS_LAYER.LIFESTEAL_PCT_MAX
    // で頭打ちにする（「隠し上限は禁止」の方針に沿い、UI側の説明文でも
    // この上限を明示する）。
    let lifestealRatioUsed = 0;
    for (const eff of this._effectsOf('onHit')) {
      // everyNHits系はchanceを持たない（命中のたびに必ずカウンターが進む）ため、
      // chanceが未指定のeffectは常に通す。
      if (eff.chance != null && Math.random() > eff.chance) continue;
      if (eff.kind === 'lifesteal') {
        const allowed = Math.max(0, CAPS_LAYER.LIFESTEAL_PCT_MAX - lifestealRatioUsed);
        const applied = Math.min(eff.power, allowed);
        lifestealRatioUsed += applied;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + dmg * applied);
      } else if (eff.kind === 'burnDamage' && !enemy.dead) {
        const burn = Math.round(this.player.atk * eff.power);
        this._applyRawDamage(enemy, burn);
        this._spawnParticles(enemy.x, enemy.y, '#ff7a3c', 6, 140, 0.25);
      } else if (eff.kind === 'bloodChalice') {
        // 転生遺物「血神の杯」：命中の度に一時ATKバフを更新（重複せず上書き）
        this.bloodChaliceBonus = eff.power;
        this.bloodChaliceUntil = performance.now() + eff.duration * 1000;
      } else if (eff.kind === 'weaken' && !enemy.dead) {
        // 短剣/杖/楽器/斧系武器の debuff：ステータスごとに個別タイマーで管理する
        enemy.weaken = enemy.weaken || {};
        enemy.weaken[eff.stat] = { power: eff.power, until: performance.now() + eff.duration * 1000 };
      } else if (eff.kind === 'burnStack' && !enemy.dead) {
        // 炎/毒/闇系武器のスタック型DoT（_updateDots()が毎フレーム処理する）
        enemy.dotStacks = Math.min(eff.maxStacks, (enemy.dotStacks || 0) + 1);
        enemy.dotUntil = performance.now() + eff.duration * 1000;
        enemy.dotPower = eff.power;
        enemy.dotTickInterval = eff.tickInterval;
        if (enemy.dotNextTick == null) enemy.dotNextTick = performance.now() + eff.tickInterval * 1000;
        this._spawnParticles(enemy.x, enemy.y, '#c86bff', 5, 120, 0.25);
      } else if (eff.kind === 'everyNHits' && !enemy.dead) {
        // エピック〜神話武器のNヒット毎追撃（単体 or 周囲AoE）
        this._hitCounters[eff.id] = (this._hitCounters[eff.id] || 0) + 1;
        if (this._hitCounters[eff.id] % eff.n === 0) {
          const burst = Math.round(this.player.atk * eff.power);
          if (eff.aoe) this._aoeDamage(enemy.x, enemy.y, eff.radius || 100, burst, null);
          else this._applyRawDamage(enemy, burst);
          this._spawnParticles(enemy.x, enemy.y, '#ffd76b', 14, 220, 0.35);
          this.shake = Math.max(this.shake, 0.25);
        }
      }
    }

    // 転生遺物「雷神の瞳」＋各種武器のonCrit系固有効果：直前のヒットが
    // 会心だった場合のみ判定する
    if (this.lastHitCrit) {
      for (const eff of this._effectsOf('onCrit')) {
        if (eff.chance != null && Math.random() > eff.chance) continue;
        if (eff.kind === 'lightning' && !enemy.dead) {
          const bolt = Math.round(this.player.atk * eff.power);
          this._applyRawDamage(enemy, bolt);
          this._spawnParticles(enemy.x, enemy.y, '#8ecbff', 10, 200, 0.3);
        } else if (eff.kind === 'timeStop' && !enemy.dead) {
          // 神話武器「時空剣クロノス」等：敵を一定時間、行動不能にする
          enemy.frozenUntil = performance.now() + eff.duration * 1000;
          this._spawnParticles(enemy.x, enemy.y, '#bfe9ff', 16, 60, 0.6);
        }
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
      const expRes = state.gainExp(Math.round(enemy.xp * this._expMult()));
      const goldGain = state.gainGold(Math.round(enemy.gold * this._goldMult()));
      this.runExp += expRes.gained;
      this.runGold += goldGain;
      if (expRes.leveledUp) this._toast('LEVEL UP!');
      this._rollDrop();
      this._rollWeaponDrop();
      this._rollManastone(enemy);
      if (this.weaponType) state.addWeaponKill(this.weaponType);
      // 覚醒装備（本来仕様）：固有効果を持つ装備を身につけていれば、
      // どのスロットでもキル数として加算される
      state.addItemAwakenKills();
      // 深淵拡張：エリート撃破で深淵の欠片（深淵ツリーの獲得量倍率が乗る）
      if (enemy.elite) state.addAbyssShards(ABYSS_EXPANSION_LAYER.ELITE_SHARD_DROP);
      // 冥府系武器の「deathNova」：撃破時、周囲の敵へ追加ダメージ
      for (const eff of this._effectsOf('onKill')) {
        if (eff.chance != null && Math.random() > eff.chance) continue;
        if (eff.kind === 'deathNova') {
          const nova = Math.round(this.player.atk * eff.power);
          this._aoeDamage(enemy.x, enemy.y, eff.radius || 100, nova, enemy);
          this._spawnParticles(enemy.x, enemy.y, '#8a4bd6', 16, 240, 0.4);
        }
      }
      if (enemy.boss) {
        // 竜狩り系武器の「bossSlayerBuff」：Boss撃破後の一時ATKバフ
        for (const eff of this._effectsOf('passive')) {
          if (eff.kind === 'bossSlayerBuff') {
            this._tempAtkBonus = eff.power;
            this._tempAtkUntil = performance.now() + eff.duration * 1000;
            this._toast('討伐の高揚！');
          }
        }
        this._rollBossWeaponDrop();
        this.boss = null; this.bossBar.classList.add('hidden');
      }
    }
  }

  // Blade Vale 2.1：武器図鑑武器（約200本）専用の第二の抽選プール。
  // 既存の_rollDrop()（防具・固有装備）とは完全に独立し、既存のドロップ率・
  // 重みには一切影響しない。
  _rollWeaponDrop() {
    if (Math.random() > WEAPON_CODEX_LAYER.DROP_CHANCE * state.dropRateMult()) return;
    const pool = weaponDropPoolForStage(this.stage);
    if (pool.length === 0) return;
    const totalW = pool.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalW;
    for (const d of pool) {
      r -= d.weight;
      if (r <= 0) {
        const isNew = state.addItem(d.itemId, 1);
        this.runItems.push(d.itemId);
        this._announceDrop(d.itemId, isNew);
        return;
      }
    }
  }

  // Blade Vale 2.1：各章Bossの固有武器（元指示21番）。通常の武器図鑑ドロップ
  // よりさらに低確率の別枠。章のボスを撃破した時だけ抽選される。
  _rollBossWeaponDrop() {
    if (this._bossWeaponDropped) return;
    if (!this.chapter) return;
    const bossWeapon = bossWeaponForChapter(this.chapter.id);
    if (!bossWeapon) return;
    if (Math.random() > WEAPON_CODEX_LAYER.BOSS_WEAPON_DROP_CHANCE) return;
    this._bossWeaponDropped = true;
    const isNew = state.addItem(bossWeapon.id, 1);
    this.runItems.push(bossWeapon.id);
    this._announceDrop(bossWeapon.id, isNew);
  }

  _applyOnHurtEffects(attacker) {
    for (const eff of this._effectsOf('onHurt')) {
      if (eff.chance != null && Math.random() > eff.chance) continue;
      if (eff.kind === 'counter' && !attacker.dead) {
        const counterDmg = Math.round(this.player.atk * eff.power);
        this._applyRawDamage(attacker, counterDmg);
        this._spawnParticles(attacker.x, attacker.y, '#ffcf6b', 6, 140, 0.25);
      } else if (eff.kind === 'haste') {
        this.hasteBonus = eff.power;
        this.hasteUntil = performance.now() + eff.duration * 1000;
      } else if (eff.kind === 'guardianHeal') {
        // 聖属性武器（聖剣ルミナス等）：被弾時にHPの一部を回復する
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * eff.power);
        this._spawnParticles(this.player.x, this.player.y, '#5cf27a', 8, 120, 0.35);
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
    // 深淵拡張：モディファイア（鉄壁の守り等）のdropMult ＋ 深淵ツリー
    // 「深淵の宝探し」による深淵限定のドロップ率上昇を乗せる
    const abyssMult = this.stage.isAbyss ? (this.stage.dropMult || 1) * state.abyssDropRateMult() : 1;
    const chance = ECONOMY.BASE_DROP_CHANCE * state.dropRateMult() * abyssMult;
    if (Math.random() > chance) return;
    // 覚醒ツリー「宝物庫の記憶」：一定確率で、まだ持っていない装備だけの
    // プールから優先的に選ぶ（該当がなければ通常通り全体から選ぶ）
    let pool = table;
    if (Math.random() < state.awakeningUnownedBiasChance()) {
      const unowned = table.filter((d) => !state.ownsItem(d.itemId));
      if (unowned.length > 0) pool = unowned;
    }
    const totalW = pool.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalW;
    for (const d of pool) {
      r -= d.weight;
      if (r <= 0) {
        const isNew = state.addItem(d.itemId, 1);
        this.runItems.push(d.itemId);
        this._announceDrop(d.itemId, isNew);
        return;
      }
    }
  }

  // レア以上のドロップは、戦闘を止めずにトースト演出だけで知らせる（Phase 6）。
  // Blade Vale 2.1：武器図鑑武器（+Boss固有武器）を初めて拾った時はNEW!を
  // 付け、レジェンド以上・Boss固有は演出を少し強くする（元指示24番）。
  _announceDrop(itemId, isNew) {
    const item = getItem(itemId);
    if (item) {
      if (rarityIndex(item.rarity) < rarityIndex('epic')) return; // epic未満は演出なし
      const stars = '★'.repeat(rarityIndex(item.rarity));
      const newTag = isNew ? ' NEW!' : '';
      this._toast(`${stars} ${item.name}${newTag}`, RARITY[item.rarity].color);
      const bigMoment = rarityIndex(item.rarity) >= rarityIndex('legendary') || item.isBossWeapon;
      if (bigMoment) Audio_.jobMastered();
      if (isNew && bigMoment) this.shake = Math.max(this.shake, 0.5);
      return;
    }
    const rune = getRune(itemId);
    if (rune) this._toast(`✨ ${rune.name}`);
  }

  _useSkill() {
    if (!this.running || this.skillCd > 0) return;
    const skill = this.job.skill;
    if (this.player.mp < skill.mpCost) { this._toast('MP不足'); return; }
    this.player.mp -= skill.mpCost;
    // 上級・特級職MASTERの「常時、スキルクールダウン-X%」（基本職MASTERの
    // スキル/回復ダメージ倍率とは別枠）
    this.skillCd = skill.cooldown * state.jobMasterCooldownMult();
    // 転生遺物「時喰らいの砂時計」：一定確率でスキルのクールダウンが発生しない
    // ／楽器系武器の「haste」（onSkill版）：スキル使用時、一時的にATKが上がる
    for (const eff of this._effectsOf('onSkill')) {
      if (eff.kind === 'cdRefund' && Math.random() < eff.chance) { this.skillCd = 0; this._toast('時が止まった！'); }
      else if (eff.kind === 'haste') { this._tempAtkBonus = eff.power; this._tempAtkUntil = performance.now() + eff.duration * 1000; }
    }
    Audio_.skill();

    if (skill.type === 'damage') {
      const targets = this._nearbyEnemies(150, 3);
      const skillPowerMult = state.jobMasterSkillPowerMult();
      for (const t of targets) {
        const dmg = this._rollDamage((skill.power * skillPowerMult + this.player.atk * 0.4 + this.player.mag * 0.6) * this._mainDmgMult(), t);
        this._dealDamage(t, dmg);
      }
      this._spawnParticles(this.player.x, this.player.y, '#8ee9ff', 16, 220, 0.35);
    } else if (skill.type === 'heal') {
      const healPowerMult = state.jobMasterHealPowerMult();
      // 深淵モディファイア「静穏の加護」：回復量アップ
      const healMult = this.stage.healMult || 1;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + (skill.power * healPowerMult + this.player.mag * 0.5) * healMult);
      Audio_.heal();
      this._spawnParticles(this.player.x, this.player.y, '#5cf27a', 14, 140, 0.4);
    } else if (skill.type === 'buff') {
      this.player.buffAtkMult = 1.35;
      this.player.buffDefMult = 1.35;
      this.player.buffUntil = performance.now() + 6000;
      this._spawnParticles(this.player.x, this.player.y, '#f2c94c', 14, 160, 0.4);
    }
    this._actionTypesUsed.add('skill');
    this._checkActionDiversityBurst();
    this._updateHud();
  }

  _useUltimate() {
    if (!this.running || this.player.ultGauge < 100) return;
    this.player.ultGauge = 0;
    Audio_.ultimate();
    // 必殺技は_rollDamageを経由しない（会心判定なし）ため、直前の通常攻撃/スキルの
    // 会心フラグが残っていて雷神の瞳が誤発動しないよう明示的にリセットする
    this.lastHitCrit = false;
    const targets = this._nearbyEnemies(240, 99);
    const base = Math.round(((this.player.atk + this.player.mag) * 2.2 + 40) * this._mainDmgMult());
    for (const t of targets) {
      const dmg = t.boss ? Math.round(base * this._bossDmgMult(t)) : base;
      this._dealDamage(t, dmg);
    }
    this._actionTypesUsed.add('ultimate');
    this._checkActionDiversityBurst();
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

  _toast(msg, color) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.color = color || '';
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
        stageExp = Math.round(this.stage.rewards.exp * this._expMult());
        stageGold = Math.round(this.stage.rewards.gold * this._goldMult());
        state.gainExp(stageExp);
        state.gainGold(stageGold);
        if (this.stage.isAbyss) {
          // 深淵は無限に深くなるため、章のように毎階stageProgressへ記録せず
          // 「最高到達階」だけを更新する（下がらない・永続）
          state.recordAbyssClear(this.stage.abyssDepth);
        } else {
          const res = state.recordStageResult(this.stage.id, true);
          firstClear = res.wasFirstClear;
          if (firstClear && this.stage.firstClear && this.stage.firstClear.itemId) {
            state.addItem(this.stage.firstClear.itemId, 1);
            bonusItem = this.stage.firstClear.itemId;
          }
        }
        Audio_.stageClear();
      } else if (!retreated) {
        if (!this.stage.isAbyss) state.recordStageResult(this.stage.id, false);
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
    this._drawBossTelegraphs();
    this._drawEnemies();
    this._drawProjectiles();
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
      ctx.strokeStyle = e.elite ? '#ffe066' : (e.boss ? '#ffd76b' : 'rgba(0,0,0,0.4)');
      ctx.lineWidth = e.elite || e.boss ? 3 : 2;
      ctx.stroke();
      // 深淵拡張：エリート敵は外周にもう1本、薄い金の輪を描いて視認性を上げる
      if (e.elite) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,224,102,0.5)';
        ctx.lineWidth = 2;
        ctx.arc(s.x, s.y, e.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      const w = e.radius * 2;
      const pct = clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(s.x - w / 2, s.y - e.radius - 10, w, 4);
      ctx.fillStyle = pct > 0.4 ? '#7be07b' : '#e05555';
      ctx.fillRect(s.x - w / 2, s.y - e.radius - 10, w * pct, 4);
    }
  }

  // Boss AI予兆の可視化（元指示11・33番：回避不能な即死攻撃・精密な回避を
  // 要求する設計は禁止）。範囲攻撃は着弾円、突進／遠距離攻撃は狙い筋を
  // 破線で表示し、残り時間が短くなるほど点滅を速めて危険を強調する。
  _drawBossTelegraphs() {
    const ctx = this.ctx;
    const now = performance.now();
    for (const e of this.enemies) {
      if (e.dead || !e.telegraph) continue;
      const t = e.telegraph;
      const remain = Math.max(0, t.readyAt - now) / (BOSS_AI_LAYER.TELEGRAPH_SEC * 1000);
      const pulse = 0.35 + 0.35 * Math.abs(Math.sin(now / (60 + remain * 140)));
      if (t.kind === 'slam') {
        const s = this._toScreen(t.x, t.y);
        ctx.save();
        ctx.strokeStyle = `rgba(255,90,90,${pulse})`;
        ctx.fillStyle = `rgba(255,90,90,${pulse * 0.18})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, BOSS_AI_LAYER.SLAM_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (t.kind === 'charge' || t.kind === 'projectile') {
        const s0 = this._toScreen(e.x, e.y);
        const s1 = this._toScreen(t.x, t.y);
        ctx.save();
        ctx.strokeStyle = `rgba(255,190,80,${pulse})`;
        ctx.lineWidth = t.kind === 'charge' ? 10 : 4;
        ctx.setLineDash([14, 10]);
        ctx.beginPath();
        ctx.moveTo(s0.x, s0.y);
        ctx.lineTo(s1.x, s1.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  _drawProjectiles() {
    const ctx = this.ctx;
    for (const p of this.projectiles) {
      const s = this._toScreen(p.x, p.y);
      ctx.beginPath();
      ctx.fillStyle = '#c77dff';
      ctx.arc(s.x, s.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
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
