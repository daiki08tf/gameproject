/* ============================================================
   BattleEngine（テキスト戦闘への移行：戦闘ルール・計算のみを担当）
   ------------------------------------------------------------
   旧 battle.js（BattleScreen）はリアルタイムCanvas戦闘のロジックと
   描画・入力（Canvas/Joystick/requestAnimationFrame）を1クラスに
   まとめていた。今回のテキスト戦闘移行では、責務を
     BattleEngine   … 戦闘ルール・ダメージ計算・状態管理（DOM非依存）
     BattleLog      … Engineが返すevent[]を日本語の文章へ変換
     TextBattleScreen … 画面表示・コマンド入力（js/screens/textBattle.js）
   に分離する。PR#2で再設計したDamage Bucket・比率型DEF軽減・
   CAPS_LAYER・本編Enemy Scaling・深淵Piecewise Scaling・Boss AI Profile
   は一切変更せず、そのまま呼び出す（このファイルは新しい計算式を
   一切導入しない）。

   ターン制への変換方針（元指示5・6・7番）：
   - SPD：旧来はAttack Interval（実時間の攻撃間隔）に使われていたが、
     テキスト戦闘では「initiative = spd + 小さな乱数」で1ラウンドごとの
     先攻/後攻を決める（プレイヤー vs 敵グループの代表SPD）。
   - Boss予兆（実時間0.9秒）→「予兆ターン」：そのターンは攻撃せず
     宣言だけ行い、次のBossの手番で実際にダメージを与える。
   - 各種秒数（SLAM_INTERVAL_SEC等）は helper `roundsFromSeconds()` で
     「おおよそ3秒=1ターン」としてターン数に変換する（BOSS_AI_LAYER自体は
     変更しない。消費する側でターン換算するだけ）。
   - 被弾時の無敵時間（invuln）・接触クールダウン（contactCooldown）は、
     1ラウンドにつき「敵1体＝1回だけ攻撃」というターン制の構造上
     自然に不要になるため実装しない（同じ理由でx/y座標・移動・Projectile
     の実弾飛翔なども不要。予兆→次ターンで着弾、という時間構造だけを流用）。
   ============================================================ */
import { state } from './state.js';
import { findStage } from './data/stages.js';
import { ENEMY_TYPES } from './data/enemies.js';
import { getItem, RARITY, rarityIndex } from './data/equipment.js';
import { getRune } from './data/runes.js';
import { DAMAGE_BUCKET, ECONOMY, ABYSS_EXPANSION_LAYER, WEAPON_CODEX_LAYER, CAPS_LAYER, BOSS_AI_LAYER, resolveBossAIProfile, TEXT_BATTLE_LAYER } from './data/balance.js';
import { getBlessing } from './data/blessings.js';
import { weaponDropPoolForStage, bossWeaponForChapter } from './data/weapons.js';

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// 1ラウンド ≒ 3秒、という緩い換算でBOSS_AI_LAYERの秒数をターン数へ変換する。
// balance.js自体（PR#2の到達物）は一切変更しない。
function roundsFromSeconds(sec) {
  return Math.max(1, Math.round(sec / TEXT_BATTLE_LAYER.SECONDS_PER_ROUND));
}

// テキスト戦闘で一度に表示・選択する敵の数の上限（元指示10番：Wave構成は
// 維持しつつ、リアルタイムの時間差Spawnは不要という指示を反映）。
// 深淵深部ではwave内の頭数が数十体に達することがあるため（PR#2レビューで
// 出現数上限を引き上げた影響）、1つの遭遇（encounter）あたりの表示数を
// これで区切り、同じ種類の敵を複数の遭遇に分割する。総数・組成データ
// 自体は変えない。
const ENCOUNTER_GROUP_SIZE = TEXT_BATTLE_LAYER.ENCOUNTER_GROUP_SIZE;

export class BattleEngine {
  constructor(stageId, blessingId) {
    const found = findStage(stageId);
    if (!found) throw new Error(`unknown stage: ${stageId}`);
    this.stage = found.stage;
    this.chapter = found.chapter;
    this.blessing = this.stage.isAbyss ? getBlessing(blessingId) : null;
    this._abyssReviveUsed = false;

    const stats = state.getStats();
    this.player = {
      hp: stats.hp, maxHp: stats.hp,
      mp: stats.mp, maxMp: stats.mp,
      atk: stats.atk, def: stats.def, mag: stats.mag, spd: stats.spd, critPct: stats.critPct,
      armorPen: stats.armorPen || 0, evasion: stats.evasion || 0,
      buffAtkMult: 1, buffDefMult: 1, buffTurns: 0,
      guarding: false,
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
    }

    this.job = state.currentJob;
    this.effects = state.getEquippedEffects();
    for (const eff of this.effects) {
      if (eff.kind === 'glassCannon' && eff.hpMult) {
        this.player.maxHp = Math.max(1, Math.round(this.player.maxHp * (1 + eff.hpMult)));
        this.player.hp = Math.min(this.player.hp, this.player.maxHp);
      }
    }
    const equippedWeapon = getItem(state.data.equipped.weapon);
    this.weaponType = equippedWeapon ? equippedWeapon.weaponType : null;

    this.awakenMult = 1;
    this._regenPower = 0;
    this._hitCounters = {};
    this._tempAtkBonus = 0;
    this._tempAtkTurns = 0;
    this._bloodChaliceBonus = 0;
    this._bloodChaliceTurns = 0;
    this._hasteInitiativeBonus = 0; // 元「haste」（onHurt）：SPD/先攻ボーナスへ転用（元指示5番）
    this._hasteInitiativeTurns = 0;
    this._actionTypesUsed = new Set(); // actionDiversityBurst用（通常/とくぎ）
    this._bossWeaponDropped = false;
    // とくぎ（既存の職業スキル）のクールダウン。元は秒数だったのでターン換算する。
    this._skillCdTurns = 0;

    this.runExp = 0;
    this.runGold = 0;
    this.runItems = [];
    this.boss = null;

    // Wave構成（元指示10番）：既存のstage.wavesはそのまま使い、リアルタイムの
    // 時間差Spawnだけを廃止して「1つの遭遇（encounter）グループ」の列へ
    // 変換する。1グループの頭数はENCOUNTER_GROUP_SIZEで区切るが、総数・
    // 組成データ自体は変えない。
    this.encounterQueue = [];
    for (const wave of this.stage.waves) {
      let remaining = wave.count;
      while (remaining > 0) {
        const n = Math.min(ENCOUNTER_GROUP_SIZE, remaining);
        this.encounterQueue.push({ type: wave.type, count: n });
        remaining -= n;
      }
    }
    this.totalToDefeat = this.stage.waves.reduce((s, w) => s + w.count, 0);
    this.defeated = 0;
    this.enemies = []; // 現在の遭遇グループ（生存者のみ残す）
    this.round = 0;
    this.over = false;
    this.finalResult = null;
  }

  // ---------------------------------------------------------
  // 遭遇（encounter）グループの開始
  // ---------------------------------------------------------
  hasMoreEncounters() {
    return this.encounterQueue.length > 0 || this.enemies.some((e) => !e.dead);
  }

  // 現在のグループを全滅させ、かつ次のグループが控えている場合に呼ぶ。
  // 「〜が2体 〜が1体 あらわれた！」の宣言イベントを返す（元指示10番）。
  beginNextEncounter() {
    const spec = this.encounterQueue.shift();
    if (!spec) return null;
    const group = [];
    for (let i = 0; i < spec.count; i++) group.push(this._spawnEnemy(spec.type));
    this.enemies = group;
    // TextBattleScreen側が「コマンドを選ぶ前に敵の姿を見せる」ためにこのメソッドを
    // advanceTurn()より前に呼んでおける（表示専用の呼び出し）ように、この
    // グループが「出現直後で猶予ラウンドが必要」であることをここに記録しておき、
    // advanceTurn()側は「このラウンド中にbeginNextEncounterを呼んだか」ではなく
    // このフラグで判定する。こうすることで、UIが先に表示だけしておいても、
        // 続くプレイヤーの最初のコマンドの1ラウンド目はこれまで通り敵が
    // まだ動かない猶予ラウンドのまま保たれ、既存の較正済みバランスは変わらない。
    this._freshGroupPending = true;
    return { type: 'encounterStart', enemies: group.map((e) => ({ id: e.id, name: e.name, boss: e.boss, elite: e.elite })) };
  }

  _spawnEnemy(type) {
    const t = ENEMY_TYPES[type];
    let hp = t.hp, atk = t.atk, def = t.def, spd = t.speed;
    let xp = t.xp, gold = t.gold;
    let elite = false;

    // 深淵拡張：モディファイア由来の敵強化＋エリート化抽選（元のbattle.jsと同一ロジック）
    if (this.stage.isAbyss && !t.boss) {
      hp = Math.round(hp * (this.stage.enemyHpMult || 1));
      atk = Math.round(atk * this._riskMult(this.stage.enemyAtkMult || 1));
      def = Math.round(def * this._riskMult(this.stage.enemyDefMult || 1));
      spd = Math.round(spd * this._riskMult(this.stage.enemySpeedMult || 1));

      if (Math.random() < state.abyssEliteChance(this.stage.abyssDepth)) {
        elite = true;
        hp = Math.round(hp * ABYSS_EXPANSION_LAYER.ELITE_HP_MULT);
        atk = Math.round(atk * ABYSS_EXPANSION_LAYER.ELITE_ATK_MULT);
        def = Math.round(def * ABYSS_EXPANSION_LAYER.ELITE_DEF_MULT);
        const rewardMult = ABYSS_EXPANSION_LAYER.ELITE_REWARD_MULT * state.abyssEliteRewardMult();
        xp = Math.round(xp * rewardMult);
        gold = Math.round(gold * rewardMult);
      }
    }

    const enemy = {
      id: `${type}_${this._nextEnemyId = (this._nextEnemyId || 0) + 1}`,
      type, name: t.name, boss: !!t.boss, elite,
      hp, maxHp: hp, atk, def, spd,
      xp, gold, dead: false,
      weaken: null, dotStacks: 0, dotTurnsLeft: 0, dotPower: 0, frozenTurns: 0,
    };
    if (enemy.boss) {
      // Boss AI Profile（元指示8番）：この解決ロジック自体はbattle.jsと完全に
      // 同一（resolveBossAIProfileは一切変更しない）。タイマーだけ秒数から
      // ターン数へ変換する。
      const profile = resolveBossAIProfile(type, this.chapter ? this.chapter.num : null, !!this.stage.isAbyss);
      enemy.aiPhase = 1;
      enemy.aiProfile = profile;
      if (profile.slam) enemy.slamTurns = roundsFromSeconds(BOSS_AI_LAYER.SLAM_INTERVAL_SEC);
      if (profile.charge) enemy.chargeTurns = roundsFromSeconds(BOSS_AI_LAYER.CHARGE_INTERVAL_SEC);
      if (profile.projectile) enemy.projectileTurns = roundsFromSeconds(BOSS_AI_LAYER.PROJECTILE_INTERVAL_SEC);
      if (profile.summon) enemy.summonTurns = roundsFromSeconds(BOSS_AI_LAYER.SUMMON_INTERVAL_SEC);
      enemy.pendingSpecial = null; // 予兆ターン中の攻撃種別（元指示7番）
      this.boss = enemy;
    }
    return enemy;
  }

  _riskMult(mult) {
    if (mult <= 1 || !this.stage.isAbyss) return mult;
    const resistPct = state.abyssModifierResistPct();
    return 1 + (mult - 1) * (1 - resistPct);
  }

  get aliveEnemies() { return this.enemies.filter((e) => !e.dead); }

  // ---------------------------------------------------------
  // ダメージ計算（PR#2のDamage Bucketをそのまま流用。新式は作らない）
  // ---------------------------------------------------------
  _effectsOf(trigger) { return this.effects.filter((e) => e.trigger === trigger); }

  _mainDmgMult() {
    const bloodChaliceMult = this._bloodChaliceTurns > 0 ? 1 + this._bloodChaliceBonus : 1;
    const tempAtkMult = this._tempAtkTurns > 0 ? 1 + this._tempAtkBonus : 1;
    return 1
      + (this.awakenMult - 1)
      + (this.player.buffTurns > 0 ? this.player.buffAtkMult - 1 : 0)
      + (bloodChaliceMult - 1)
      + (tempAtkMult - 1);
  }

  _critDamageBoostMult() {
    let mult = 1;
    for (const eff of this._effectsOf('passive')) if (eff.kind === 'critDamageBoost') mult += eff.power;
    return mult;
  }

  _bossDmgMult(target) {
    let bonus = state.awakeningBossDmgMult() - 1;
    for (const eff of this._effectsOf('passive')) {
      if (eff.kind === 'bossDmg') bonus += eff.power;
      if (eff.kind === 'executioner' && target && target.maxHp > 0 && target.hp / target.maxHp <= eff.hpThreshold) bonus += eff.power;
    }
    return 1 + bonus;
  }

  _effectiveEnemyStat(enemy, stat) {
    const base = enemy[stat];
    const w = enemy.weaken && enemy.weaken[stat];
    if (w && w.turnsLeft > 0) return base * (1 - w.power);
    return base;
  }

  // calculateDamage(): 攻撃側atk・防御側defから最終ダメージを算出する。
  // PR#2の比率型DEF軽減・CAPS_LAYER.DEF_MITIGATION_MAX・会心・Boss倍率を
  // そのまま踏襲する（js/battle.js旧_rollDamage()と数式は完全に同一）。
  calculateDamage(atk, target, opts = {}) {
    const rawDef = target ? this._effectiveEnemyStat(target, 'def') : 0;
    const armorPen = opts.armorPen != null ? opts.armorPen : (this.player.armorPen || 0);
    const effectiveDef = rawDef * (1 - armorPen);
    const mitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectiveDef / (effectiveDef + DAMAGE_BUCKET.MITIGATION_K));
    let dmg = Math.max(1, atk * (1 - mitigation));
    const critPct = opts.critPct != null ? opts.critPct : this.player.critPct;
    const critical = Math.random() * 100 < critPct;
    if (critical) dmg *= DAMAGE_BUCKET.CRIT_MULTIPLIER * this._critDamageBoostMult();
    if (target && target.boss && !opts.noBossMult) dmg *= this._bossDmgMult(target);
    return { damage: Math.round(dmg), critical };
  }

  // プレイヤーDEFに対する敵攻撃の軽減（js/battle.js旧_updateEnemies接触
  // ダメージ・Boss特殊攻撃と同じ比率式）。guardMultiplierは別枠で掛ける
  // （元指示6番：「最終被ダメージ×guardMultiplier」として、DEF軽減とは
  // 独立に処理する）。
  _enemyAttackDamage(atk, opts = {}) {
    const effectiveDef = (this.player.def || 0) * (this.player.buffTurns > 0 ? this.player.buffDefMult : 1);
    const mitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectiveDef / (effectiveDef + DAMAGE_BUCKET.MITIGATION_K));
    let dmg = Math.max(1, atk * (opts.mult || 1) * (1 - mitigation));
    // opts.multが指定されない＝予兆を経ない「通常攻撃」（Bossの通常攻撃含む）。
    // 実時間の「移動による回避」ぶんを補正するNORMAL_ATTACK_DAMAGE_MULTは
    // ここにのみ掛ける。予兆つきのBoss特殊攻撃（opts.multあり）は対象外
    // （telegraph読み＋ぼうぎょで軽減する、という別の意味づけを持つため）。
    if (opts.mult == null) dmg *= TEXT_BATTLE_LAYER.NORMAL_ATTACK_DAMAGE_MULT;
    if (this.player.guarding) dmg *= TEXT_BATTLE_LAYER.GUARD_DAMAGE_MULT;
    return Math.max(1, Math.round(dmg));
  }

  // ---------------------------------------------------------
  // プレイヤー行動
  // ---------------------------------------------------------
  performPlayerAction(action) {
    if (action.type === 'attack') return this._playerAttack(action.targetId);
    if (action.type === 'guard') return this._playerGuard();
    if (action.type === 'flee') return this._playerFlee();
    if (action.type === 'skill') return this._playerSkill();
    return { action: action.type, noop: true };
  }

  _pickTarget(targetId) {
    const alive = this.aliveEnemies;
    if (targetId) {
      const found = alive.find((e) => e.id === targetId);
      if (found) return found;
    }
    return alive[0] || null;
  }

  // 元instructionのAttack Interval（実時間の攻撃間隔）をそのまま流用する
  // （旧battle.js _updatePlayer()と同一の式）。1ラウンド＝
  // TEXT_BATTLE_LAYER.SECONDS_PER_ROUND秒相当とみなし、その間に何回
  // 攻撃できたかをhitCountとして「1回のこうげきコマンド」にまとめて
  // 反映する（元指示5番：SPD/攻撃速度を「連続行動」へ発展させる第一歩）。
  // こうしないと、PR#2で秒単位のTTKとして較正した敵HPに対し、ターン制の
  // 「1ラウンド1回攻撃」では手数が足りず本来の強さで攻略できなくなる
  // （実際に3章・5章の中型/tank敵で検証中に発覚し、この対応で解消した）。
  _playerAttackCooldown() {
    return clamp(1.0 - this.player.spd * 0.012, CAPS_LAYER.ATTACK_INTERVAL_MIN, 1.1);
  }
  _playerHitsPerRound() {
    return Math.max(1, Math.round(TEXT_BATTLE_LAYER.SECONDS_PER_ROUND / this._playerAttackCooldown()));
  }

  _playerAttack(targetId) {
    const target = this._pickTarget(targetId);
    if (!target) return { action: 'attack', noTarget: true };
    this.player.guarding = false;
    let hitCount = this._playerHitsPerRound();
    // 転生遺物「狂戦士の心臓」：HP一定割合以下で2回攻撃（実時間版の
    // クールダウン短縮の代わりに、こちらの核心挙動をターン制でも維持する）
    const berserkerDoubled = !!this._berserkerDoubleAttack;
    if (berserkerDoubled) hitCount *= 2;
    const atkValue = this.player.atk * this._mainDmgMult();
    // hitCount回ぶんを1回のcalculateDamageの結果にまとめて掛け合わせるのでは
    // なく、実時間版と同じく1発ごとに独立して会心判定・ダメージ乱数を振って
    // 合算する（1回だけ判定してhitCount倍すると、本来3発中1発だけ会心のはずが
    // 「3発とも会心」「3発とも非会心」の二択になり分散が過大になって、
    // 期待値は変わらないのに毎回の結果が安定しない＝手番ごとの決着のブレが
    // 大きくなりすぎる問題があった）
    let damage = 0;
    let critical = false;
    for (let i = 0; i < hitCount; i++) {
      const hit = this.calculateDamage(atkValue, target);
      damage += hit.damage;
      if (hit.critical) critical = true;
    }
    const result = this._applyDamageToEnemy(target, damage);
    result.action = 'attack';
    result.critical = critical;
    result.hitCount = hitCount;
    result.berserkerDoubled = berserkerDoubled;
    this._actionTypesUsed.add('attack');
    this._checkActionDiversityBurst(result);
    return result;
  }

  _playerSkill() {
    const skill = this.job.skill;
    if (this._skillCdTurns > 0) return { action: 'skill', onCooldown: true };
    if (this.player.mp < skill.mpCost) return { action: 'skill', noMp: true };
    this.player.guarding = false;
    this.player.mp -= skill.mpCost;
    this._skillCdTurns = Math.max(1, roundsFromSeconds(skill.cooldown * state.jobMasterCooldownMult()));
    for (const eff of this._effectsOf('onSkill')) {
      if (eff.kind === 'cdRefund' && Math.random() < eff.chance) this._skillCdTurns = 0;
      else if (eff.kind === 'haste') { this._tempAtkBonus = eff.power; this._tempAtkTurns = roundsFromSeconds(eff.duration); }
    }

    const result = { action: 'skill', name: skill.name, skillType: skill.type, targets: [] };
    if (skill.type === 'damage') {
      const skillPowerMult = state.jobMasterSkillPowerMult();
      const targets = this.aliveEnemies.slice(0, 3);
      for (const t of targets) {
        const atkValue = (skill.power * skillPowerMult + this.player.atk * 0.4 + this.player.mag * 0.6) * this._mainDmgMult();
        const { damage, critical } = this.calculateDamage(atkValue, t);
        const hit = this._applyDamageToEnemy(t, damage);
        hit.critical = critical;
        result.targets.push(hit);
      }
    } else if (skill.type === 'heal') {
      const healPowerMult = state.jobMasterHealPowerMult();
      const healMult = this.stage.healMult || 1;
      const amount = Math.round((skill.power * healPowerMult + this.player.mag * 0.5) * healMult);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
      result.healAmount = amount;
    } else if (skill.type === 'buff') {
      this.player.buffAtkMult = 1.35;
      this.player.buffDefMult = 1.35;
      this.player.buffTurns = 2; // 実時間6秒相当→約2ターン
      result.buffed = true;
    }
    this._actionTypesUsed.add('skill');
    this._checkActionDiversityBurst(result);
    return result;
  }

  _playerGuard() {
    this.player.guarding = true;
    return { action: 'guard' };
  }

  // にげる（元指示17番）：Boss戦・エリート混在戦では不可。プレイヤーSPD・
  // 敵グループの代表SPD・ステージ難易度（深淵かどうか）から成功率を出す。
  canFlee() {
    return !this.aliveEnemies.some((e) => e.boss);
  }

  _playerFlee() {
    if (!this.canFlee()) return { action: 'flee', blocked: true };
    const alive = this.aliveEnemies;
    const avgEnemySpd = alive.length > 0 ? alive.reduce((s, e) => s + e.spd, 0) / alive.length : 0;
    const stagePenalty = this.stage.isAbyss ? 0.05 : 0;
    const chance = clamp(0.5 + (this.player.spd - avgEnemySpd) * 0.01 - stagePenalty, 0.1, 0.9);
    const success = Math.random() < chance;
    return { action: 'flee', success };
  }

  // ---------------------------------------------------------
  // ダメージ適用・onHit/onCrit/onKill系固有効果（元指示4・12番：既存を流用）
  // ---------------------------------------------------------
  applyEffect(trigger, ctx) {
    const events = [];
    for (const eff of this._effectsOf(trigger)) {
      if (eff.chance != null && Math.random() > eff.chance) continue;
      const ev = this._applyOneEffect(eff, trigger, ctx);
      if (ev) events.push(ev);
    }
    return events;
  }

  _applyOneEffect(eff, trigger, ctx) {
    if (trigger === 'onHit') {
      const { target, dmg } = ctx;
      if (eff.kind === 'lifesteal') {
        const allowed = Math.max(0, CAPS_LAYER.LIFESTEAL_PCT_MAX - (ctx.lifestealUsed || 0));
        const applied = Math.min(eff.power, allowed);
        ctx.lifestealUsed = (ctx.lifestealUsed || 0) + applied;
        const healed = Math.round(dmg * applied);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healed);
        return { kind: 'lifesteal', amount: healed };
      }
      if (eff.kind === 'burnDamage' && !target.dead) {
        const burn = Math.round(this.player.atk * eff.power);
        this._applyRawDamage(target, burn);
        return { kind: 'burnDamage', amount: burn, targetDead: target.dead };
      }
      if (eff.kind === 'bloodChalice') {
        this._bloodChaliceBonus = eff.power;
        this._bloodChaliceTurns = roundsFromSeconds(eff.duration);
        return { kind: 'bloodChalice' };
      }
      if (eff.kind === 'weaken' && !target.dead) {
        target.weaken = target.weaken || {};
        target.weaken[eff.stat] = { power: eff.power, turnsLeft: roundsFromSeconds(eff.duration) };
        return { kind: 'weaken', stat: eff.stat };
      }
      if (eff.kind === 'burnStack' && !target.dead) {
        target.dotStacks = Math.min(eff.maxStacks, (target.dotStacks || 0) + 1);
        target.dotTurnsLeft = roundsFromSeconds(eff.duration);
        target.dotPower = eff.power;
        return { kind: 'burnStack', stacks: target.dotStacks };
      }
      if (eff.kind === 'everyNHits' && !target.dead) {
        this._hitCounters[eff.id] = (this._hitCounters[eff.id] || 0) + 1;
        if (this._hitCounters[eff.id] % eff.n === 0) {
          const burst = Math.round(this.player.atk * eff.power);
          if (eff.aoe) {
            const hits = [];
            for (const e of this.aliveEnemies) { this._applyRawDamage(e, burst); hits.push(e.name); }
            return { kind: 'everyNHits', amount: burst, aoe: true, hits };
          }
          this._applyRawDamage(target, burst);
          return { kind: 'everyNHits', amount: burst, aoe: false, targetDead: target.dead };
        }
        return null;
      }
    } else if (trigger === 'onCrit') {
      const { target } = ctx;
      if (eff.kind === 'lightning' && !target.dead) {
        const bolt = Math.round(this.player.atk * eff.power);
        this._applyRawDamage(target, bolt);
        return { kind: 'lightning', amount: bolt, targetDead: target.dead };
      }
      if (eff.kind === 'timeStop' && !target.dead) {
        target.frozenTurns = Math.max(target.frozenTurns, roundsFromSeconds(eff.duration));
        return { kind: 'timeStop' };
      }
    } else if (trigger === 'onHurt') {
      const { attacker } = ctx;
      if (eff.kind === 'counter' && attacker && !attacker.dead) {
        const counterDmg = Math.round(this.player.atk * eff.power);
        this._applyRawDamage(attacker, counterDmg);
        return { kind: 'counter', amount: counterDmg, targetDead: attacker.dead };
      }
      if (eff.kind === 'haste') {
        // 実時間移動速度バフ→テキスト戦闘ではSPD/先攻ボーナスへ転用（元指示5番）
        this._hasteInitiativeBonus = eff.power * 20;
        this._hasteInitiativeTurns = roundsFromSeconds(eff.duration);
        return { kind: 'haste' };
      }
      if (eff.kind === 'guardianHeal') {
        const healed = Math.round(this.player.maxHp * eff.power);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healed);
        return { kind: 'guardianHeal', amount: healed };
      }
    } else if (trigger === 'onKill') {
      const { enemy } = ctx;
      if (eff.kind === 'deathNova') {
        const nova = Math.round(this.player.atk * eff.power);
        const hits = [];
        for (const e of this.aliveEnemies) { if (e === enemy) continue; this._applyRawDamage(e, nova); hits.push(e.name); }
        return { kind: 'deathNova', amount: nova, hits };
      }
    }
    return null;
  }

  _checkActionDiversityBurst(result) {
    const eff = this._effectsOf('passive').find((e) => e.kind === 'actionDiversityBurst');
    if (!eff || this._actionTypesUsed.size < 2) return; // ターン制では通常攻撃/とくぎの2種のみ運用
    const dmg = Math.round(this.player.atk * eff.power);
    const hits = [];
    for (const e of this.aliveEnemies) { this._applyRawDamage(e, dmg); hits.push(e.name); }
    result.actionDiversityBurst = { amount: dmg, hits };
    this._actionTypesUsed.clear();
  }

  // dmgを与え、生きていればonHit系固有効果を適用する。1回の攻撃行動（通常攻撃/
  // スキル1ヒット）ぶんの結果をまとめて返す。
  _applyDamageToEnemy(target, dmg) {
    this._applyRawDamage(target, dmg);
    const wasAlive = !target.dead;
    const hitEvents = wasAlive || target.hp + dmg > 0 ? this.applyEffect('onHit', { target, dmg, lifestealUsed: 0 }) : [];
    let critEvents = [];
    if (this.lastHitCrit) critEvents = this.applyEffect('onCrit', { target });
    const killResult = target.dead && !target._rewardsGranted ? this._grantKillRewards(target) : null;
    return {
      damage: dmg, targetId: target.id, targetName: target.name, defeated: target.dead,
      effects: [...hitEvents, ...critEvents], kill: killResult,
    };
  }

  _applyRawDamage(enemy, dmg) {
    enemy.hp -= dmg;
    if (enemy.hp <= 0 && !enemy.dead) {
      enemy.dead = true;
      this.defeated++;
    }
  }

  _grantKillRewards(enemy) {
    enemy._rewardsGranted = true;
    const expRes = state.gainExp(Math.round(enemy.xp * this._expMult()));
    const goldGain = state.gainGold(Math.round(enemy.gold * this._goldMult()));
    this.runExp += expRes.gained;
    this.runGold += goldGain;
    if (this.weaponType) state.addWeaponKill(this.weaponType);
    state.addItemAwakenKills();
    if (enemy.elite) state.addAbyssShards(ABYSS_EXPANSION_LAYER.ELITE_SHARD_DROP);
    const onKillEvents = this.applyEffect('onKill', { enemy });
    const drops = [];
    const dropInfo = this._rollDrop(); if (dropInfo) drops.push(dropInfo);
    const weaponDropInfo = this._rollWeaponDrop(); if (weaponDropInfo) drops.push(weaponDropInfo);
    const manastone = this._rollManastone(enemy);
    let bossSlayerBuff = null;
    if (enemy.boss) {
      for (const eff of this._effectsOf('passive')) {
        if (eff.kind === 'bossSlayerBuff') {
          this._tempAtkBonus = eff.power;
          this._tempAtkTurns = roundsFromSeconds(eff.duration);
          bossSlayerBuff = true;
        }
      }
      const bossWeaponDrop = this._rollBossWeaponDrop();
      if (bossWeaponDrop) drops.push(bossWeaponDrop);
      this.boss = null;
    }
    return {
      xp: expRes.gained, gold: goldGain, leveledUp: expRes.leveledUp,
      drops, manastone, onKillEvents, bossSlayerBuff,
    };
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

  _rollWeaponDrop() {
    if (Math.random() > WEAPON_CODEX_LAYER.DROP_CHANCE * state.dropRateMult()) return null;
    const pool = weaponDropPoolForStage(this.stage);
    if (pool.length === 0) return null;
    const totalW = pool.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalW;
    for (const d of pool) {
      r -= d.weight;
      if (r <= 0) {
        const isNew = state.addItem(d.itemId, 1);
        this.runItems.push(d.itemId);
        return this._describeDrop(d.itemId, isNew);
      }
    }
    return null;
  }

  _rollBossWeaponDrop() {
    if (this._bossWeaponDropped || !this.chapter) return null;
    const bossWeapon = bossWeaponForChapter(this.chapter.id);
    if (!bossWeapon) return null;
    if (Math.random() > WEAPON_CODEX_LAYER.BOSS_WEAPON_DROP_CHANCE) return null;
    this._bossWeaponDropped = true;
    const isNew = state.addItem(bossWeapon.id, 1);
    this.runItems.push(bossWeapon.id);
    return this._describeDrop(bossWeapon.id, isNew);
  }

  _rollManastone(enemy) {
    if (enemy.boss) {
      const amount = Math.round(rand(ECONOMY.MANASTONE_BOSS_MIN, ECONOMY.MANASTONE_BOSS_MAX));
      state.addManastone(amount);
      return amount;
    }
    if (Math.random() > ECONOMY.MANASTONE_NORMAL_CHANCE) return 0;
    const amount = Math.round(rand(ECONOMY.MANASTONE_NORMAL_MIN, ECONOMY.MANASTONE_NORMAL_MAX));
    state.addManastone(amount);
    return amount;
  }

  _rollDrop() {
    const table = this.stage.dropTable || [];
    if (table.length === 0) return null;
    const abyssMult = this.stage.isAbyss ? (this.stage.dropMult || 1) * state.abyssDropRateMult() : 1;
    const chance = ECONOMY.BASE_DROP_CHANCE * state.dropRateMult() * abyssMult;
    if (Math.random() > chance) return null;
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
        return this._describeDrop(d.itemId, isNew);
      }
    }
    return null;
  }

  _describeDrop(itemId, isNew) {
    const item = getItem(itemId);
    if (item) return { itemId, name: item.name, rarity: item.rarity, isNew, isBossWeapon: !!item.isBossWeapon };
    const rune = getRune(itemId);
    if (rune) return { itemId, name: rune.name, rarity: null, isNew, isRune: true };
    return { itemId, name: itemId, rarity: null, isNew };
  }

  // ---------------------------------------------------------
  // 敵の手番（通常敵AI・Boss AI）元指示7・8・9・11番
  // ---------------------------------------------------------
  performEnemyTurn(enemy) {
    if (enemy.dead) return null;
    if (enemy.frozenTurns > 0) { enemy.frozenTurns--; return { enemyId: enemy.id, name: enemy.name, frozen: true }; }

    if (enemy.boss) return this._performBossTurn(enemy);

    // 通常敵AI（元指示11番）：現状は「通常攻撃中心」で統一する。fast/tank等の
    // 個性は既にステータス差（spd高い＝先攻しやすい、tank def高い等）で
    // 表現されているため、行動そのものは単純な通常攻撃で十分。将来、回復/
    // バフ/デバフ/魔法/防御タイプの敵を追加する際はここに分岐を増やす。
    const enemyAtk = this._effectiveEnemyStat(enemy, 'atk');
    if (Math.random() < (this.player.evasion || 0)) {
      return { enemyId: enemy.id, name: enemy.name, kind: 'attack', evaded: true };
    }
    const dmg = this._enemyAttackDamage(enemyAtk);
    this.player.hp -= dmg;
    const hurtEvents = this.applyEffect('onHurt', { attacker: enemy });
    return { enemyId: enemy.id, name: enemy.name, kind: 'attack', damage: dmg, evaded: false, hurtEvents };
  }

  _performBossTurn(enemy) {
    // フェーズ2チェック（元指示9番）：HP50%以下で強化状態へ移行
    if (enemy.aiPhase === 1 && enemy.hp / enemy.maxHp <= BOSS_AI_LAYER.PHASE2_HP_RATIO) {
      enemy.aiPhase = 2;
      enemy.atk = Math.round(enemy.atk * BOSS_AI_LAYER.PHASE2_ATK_MULT);
      if (enemy.slamTurns != null) enemy.slamTurns = Math.max(1, Math.round(enemy.slamTurns * BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT));
      if (enemy.chargeTurns != null) enemy.chargeTurns = Math.max(1, Math.round(enemy.chargeTurns * BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT));
      if (enemy.projectileTurns != null) enemy.projectileTurns = Math.max(1, Math.round(enemy.projectileTurns * BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT));
      if (enemy.summonTurns != null) enemy.summonTurns = Math.max(1, Math.round(enemy.summonTurns * BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT));
      enemy._justPhased = true;
    }
    // このターンの手番がどの分岐（予兆解決／新規予兆／召喚／通常攻撃）に進んでも
    // 「Phase2へ移行した直後の手番である」ことを一度だけログへ伝えられるよう、
    // ここで読み取って即座に消費する（分岐ごとに読み書きすると、特殊攻撃解決や
    // 召喚の分岐ではフラグが読まれずリセットもされないまま次回以降の通常攻撃
    // まで持ち越されてしまい、無関係なターンで「様子が変わった」と誤って
    // 表示される不具合があった）
    const justPhased = !!enemy._justPhased;
    enemy._justPhased = false;

    // 予兆ターンの解決（元指示7番：前ターンで宣言した特殊攻撃が実際に発動する）
    if (enemy.pendingSpecial) {
      const kind = enemy.pendingSpecial;
      enemy.pendingSpecial = null;
      return this._resolveBossSpecial(enemy, kind, justPhased);
    }

    // 新規の特殊攻撃を予兆する／雑魚を召喚する／通常攻撃する、の判定
    const phaseMult = enemy.aiPhase === 2 ? BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT : 1;
    if (enemy.slamTurns != null) { enemy.slamTurns--; if (enemy.slamTurns <= 0) return this._startBossTelegraph(enemy, 'slam', phaseMult, justPhased); }
    if (enemy.chargeTurns != null) { enemy.chargeTurns--; if (enemy.chargeTurns <= 0) return this._startBossTelegraph(enemy, 'charge', phaseMult, justPhased); }
    if (enemy.projectileTurns != null) { enemy.projectileTurns--; if (enemy.projectileTurns <= 0) return this._startBossTelegraph(enemy, 'projectile', phaseMult, justPhased); }
    if (enemy.summonTurns != null) {
      enemy.summonTurns--;
      if (enemy.summonTurns <= 0) {
        enemy.summonTurns = Math.max(1, Math.round(roundsFromSeconds(BOSS_AI_LAYER.SUMMON_INTERVAL_SEC) * phaseMult));
        return this._bossSummon(enemy, justPhased);
      }
    }

    // 通常攻撃
    const enemyAtk = this._effectiveEnemyStat(enemy, 'atk');
    if (Math.random() < (this.player.evasion || 0)) {
      return { enemyId: enemy.id, name: enemy.name, kind: 'attack', evaded: true, phased: justPhased };
    }
    const dmg = this._enemyAttackDamage(enemyAtk);
    this.player.hp -= dmg;
    const hurtEvents = this.applyEffect('onHurt', { attacker: enemy });
    return { enemyId: enemy.id, name: enemy.name, kind: 'attack', damage: dmg, evaded: false, hurtEvents, phased: justPhased };
  }

  // 予兆ターン開始（元指示7・11・33番：必ず1ターン分の宣言を経てから発動する
  // ため、モバイルのタッチ操作でも「見てから防御を選べる」設計を維持する）
  _startBossTelegraph(enemy, kind, phaseMult, justPhased) {
    enemy.pendingSpecial = kind;
    const resetTurns = () => {
      if (kind === 'slam') enemy.slamTurns = Math.max(1, Math.round(roundsFromSeconds(BOSS_AI_LAYER.SLAM_INTERVAL_SEC) * phaseMult));
      if (kind === 'charge') enemy.chargeTurns = Math.max(1, Math.round(roundsFromSeconds(BOSS_AI_LAYER.CHARGE_INTERVAL_SEC) * phaseMult));
      if (kind === 'projectile') enemy.projectileTurns = Math.max(1, Math.round(roundsFromSeconds(BOSS_AI_LAYER.PROJECTILE_INTERVAL_SEC) * phaseMult));
    };
    resetTurns();
    return { enemyId: enemy.id, name: enemy.name, kind: 'telegraph', specialKind: kind, phased: !!justPhased };
  }

  _resolveBossSpecial(enemy, kind, justPhased) {
    const enemyAtk = this._effectiveEnemyStat(enemy, 'atk');
    const multByKind = {
      slam: BOSS_AI_LAYER.SLAM_DAMAGE_MULT,
      charge: BOSS_AI_LAYER.CHARGE_DAMAGE_MULT,
      projectile: BOSS_AI_LAYER.PROJECTILE_DAMAGE_MULT,
    };
    if (Math.random() < (this.player.evasion || 0)) {
      return { enemyId: enemy.id, name: enemy.name, kind: 'special', specialKind: kind, evaded: true, phased: !!justPhased };
    }
    const dmg = this._enemyAttackDamage(enemyAtk, { mult: multByKind[kind] });
    this.player.hp -= dmg;
    const hurtEvents = this.applyEffect('onHurt', { attacker: enemy });
    return { enemyId: enemy.id, name: enemy.name, kind: 'special', specialKind: kind, damage: dmg, evaded: false, hurtEvents, phased: !!justPhased };
  }

  // Boss AI「雑魚召喚」（元指示7番：summon）：現在の遭遇グループへ手下を
  // 追加する。報酬インフレを避けるためxp/goldは与えない（元battle.jsと同じ）。
  _bossSummon(enemy, justPhased) {
    const added = [];
    for (let i = 0; i < BOSS_AI_LAYER.SUMMON_COUNT; i++) {
      const hp = Math.max(1, Math.round(enemy.maxHp * 0.05));
      const summon = {
        id: `${enemy.id}_summon_${this._nextEnemyId = (this._nextEnemyId || 0) + 1}`,
        type: '__boss_summon__', name: `${enemy.name}の手下`, boss: false, elite: false,
        hp, maxHp: hp, atk: Math.max(1, Math.round(enemy.atk * 0.3)), def: Math.round(enemy.def * 0.4), spd: 150,
        xp: 0, gold: 0, dead: false, weaken: null, dotStacks: 0, dotTurnsLeft: 0, frozenTurns: 0,
      };
      this.enemies.push(summon);
      added.push(summon.name);
      this.totalToDefeat++; // 召喚された手下も「倒すべき敵」の総数に加える（残り表示の整合性）
    }
    return { enemyId: enemy.id, name: enemy.name, kind: 'summon', added, phased: !!justPhased };
  }

  // ---------------------------------------------------------
  // ラウンド進行（advanceTurn）：先攻/後攻の決定→プレイヤー行動→敵の手番→
  // ラウンド終了処理（DoT・バフ/デバフのターン経過・戦闘終了判定）
  // 元指示5番：initiative = spd + 小さな乱数、でシンプルに先攻/後攻を決める。
  // ---------------------------------------------------------
  advanceTurn(command) {
    const events = [];
    this.round++;

    // 新しい遭遇グループが出現したラウンドは、敵がまだ接触距離まで移動してくる
    // 「間合い」に相当し、この1ラウンドだけは敵の手番を発生させない（実時間版でも
    // wave出現直後は敵が接触距離まで歩いてくるまでのタイムラグがあり、出現した
    // 瞬間に必ず被弾するわけではなかった。元指示10番で実時間の時間差湧きは
        // 廃止したが、この「出現直後の猶予」まで失うと、複数グループが連続する
    // ステージで被弾が積み上がりすぎて既存のENEMY_SCALING較正から乖離するため、
    // グループ単位でこの猶予だけ残す）
    if (this.aliveEnemies.length === 0) {
      const startEvent = this.beginNextEncounter();
      if (startEvent) events.push(startEvent);
      else { this._finishBattle(true, false); return { events, over: true, result: this.finalResult }; }
    }
    // TextBattleScreenが表示のために事前にbeginNextEncounter()を呼んでいた
    // 場合も含め、このグループの「出現直後の猶予ラウンド」フラグをここで消費する
    const freshEncounter = !!this._freshGroupPending;
    this._freshGroupPending = false;

    // にげる・とくぎクールダウン切れ等は行動選択そのものなので、通常の
    // 先攻/後攻計算をスキップしてよいコマンドから先に処理する
    if (command.type === 'flee') {
      const fleeResult = this._playerFlee();
      events.push({ type: 'playerAction', result: fleeResult });
      if (fleeResult.success) { this._finishBattle(false, true); return { events, over: true, result: this.finalResult }; }
      if (fleeResult.blocked) return { events, over: false };
      // 失敗した場合は1ラウンド消費し、敵はそのまま行動する（ただし出現直後の
      // 猶予ラウンドでは敵はまだ動かない）
      if (!freshEncounter) {
        const enemyEvents = this._runEnemyPhase();
        events.push(...enemyEvents);
      }
      const end = this._afterRoundChecks();
      events.push(...end.events);
      return { events, over: end.over, result: this.finalResult };
    }

    // ガードは「このラウンドに飛んでくる敵の攻撃を軽減する」ためのコマンドなので、
    // 先攻/後攻の判定結果に関わらず、このラウンドの敵行動解決より前に有効化しておく
    // 必要がある。旧実装ではperformPlayerAction経由の_playerGuard()でしか
    // guarding=trueにしておらず、敵が先攻（プレイヤーよりSPDが低い場面）の場合に
    // 「ガードを選んだのに同じラウンドの敵攻撃を防げない」バグがあった
    // （3章のtank系敵での検証で発覚）。
    if (command.type === 'guard') this.player.guarding = true;

    const playerInitiative = this.player.spd + this._hasteInitiativeBonus + rand(0, 8);
    const alive = this.aliveEnemies;
    const enemyInitiative = (alive.reduce((s, e) => s + e.spd, 0) / Math.max(1, alive.length)) + rand(0, 8);
    const playerFirst = playerInitiative >= enemyInitiative;

    const runPlayer = () => {
      const result = this.performPlayerAction(command);
      events.push({ type: 'playerAction', result });
      return result;
    };
    const runEnemies = () => { events.push(...this._runEnemyPhase()); };

    if (freshEncounter) {
      // 出現直後の猶予ラウンド：プレイヤーは通常通り行動できるが、敵はまだ
      // 間合いに入っていないため手番を発生させない
      runPlayer();
    } else if (playerFirst) { runPlayer(); if (this.player.hp > 0) runEnemies(); }
    else { runEnemies(); if (this.player.hp > 0) runPlayer(); }

    const end = this._afterRoundChecks();
    events.push(...end.events);
    return { events, over: end.over, result: this.finalResult, playerFirst };
  }

  // 元指示5・7番の実時間版は被弾後0.9秒の無敵時間があり、敵の頭数に関わらず
  // 「合計で見るとほぼ1体ぶん」のペースでしか被弾しなかった（PR#2の
  // ENEMY_SCALING・敵ATKはこの前提で較正済み）。ターン制で敵全員が毎ラウンド
  // 攻撃すると頭数の多いwaveほど過剰に痛くなるため、非Boss敵は1ラウンドに
  // つきMAX_NORMAL_ATTACKERS_PER_ROUND体だけがランダムに選ばれて攻撃する
  // （既存のENEMY_SCALING・敵ATK自体は一切変更しない）。Bossは対象外で
  // 常に行動する。
  _runEnemyPhase() {
    const events = [];
    const alive = this.enemies.filter((e) => !e.dead);
    const bosses = alive.filter((e) => e.boss);
    const normals = alive.filter((e) => !e.boss);
    const shuffled = [...normals].sort(() => Math.random() - 0.5);
    const cap = TEXT_BATTLE_LAYER.MAX_NORMAL_ATTACKERS_PER_ROUND;
    const acting = shuffled.slice(0, cap);
    const waiting = shuffled.slice(cap);

    for (const enemy of [...bosses, ...acting]) {
      if (enemy.dead || this.player.hp <= 0) continue;
      const result = this.performEnemyTurn(enemy);
      if (result) events.push({ type: 'enemyAction', result });
    }
    for (const enemy of waiting) {
      events.push({ type: 'enemyWait', enemyId: enemy.id, name: enemy.name });
    }
    return events;
  }

  // DoT・ターン経過処理・戦闘終了判定（元指示13番のDoT運用をターン制に合わせる：
  // 1ラウンドにつき1回ティックする）
  _afterRoundChecks() {
    const events = [];
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      if (enemy.weaken) {
        for (const stat in enemy.weaken) {
          enemy.weaken[stat].turnsLeft--;
          if (enemy.weaken[stat].turnsLeft <= 0) delete enemy.weaken[stat];
        }
      }
      if (enemy.dotStacks > 0 && enemy.dotTurnsLeft > 0) {
        const dmg = Math.max(1, Math.round(this.player.atk * enemy.dotPower * enemy.dotStacks));
        this._applyRawDamage(enemy, dmg);
        events.push({ type: 'dotTick', enemyId: enemy.id, name: enemy.name, amount: dmg, targetDead: enemy.dead });
        if (enemy.dead && !enemy._rewardsGranted) events[events.length - 1].kill = this._grantKillRewards(enemy);
        enemy.dotTurnsLeft--;
        if (enemy.dotTurnsLeft <= 0) enemy.dotStacks = 0;
      }
    }
    if (this.player.buffTurns > 0) { this.player.buffTurns--; if (this.player.buffTurns <= 0) { this.player.buffAtkMult = 1; this.player.buffDefMult = 1; } }
    if (this._bloodChaliceTurns > 0) this._bloodChaliceTurns--;
    if (this._tempAtkTurns > 0) this._tempAtkTurns--;
    if (this._hasteInitiativeTurns > 0) { this._hasteInitiativeTurns--; if (this._hasteInitiativeTurns <= 0) this._hasteInitiativeBonus = 0; }
    if (this._skillCdTurns > 0) this._skillCdTurns--;
    this._updatePassiveEffects();
    if (this._regenPower > 0) this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * this._regenPower);
    this.player.guarding = false; // ガードは「次の自分のターンまで」＝この時点でリセット

    const end = this.checkBattleEnd();
    return { events, over: end.over };
  }

  _updatePassiveEffects() {
    const hpRatio = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
    const passives = this._effectsOf('passive');
    const awaken = passives.find((e) => e.kind === 'damageBoost');
    let mult = 1;
    if (awaken && hpRatio <= awaken.threshold) mult += awaken.power;
    mult += state.jobMasterLowHpDamageBonus(hpRatio);
    let regenPower = 0;
    let doubleAttack = false;
    for (const eff of passives) {
      if (eff.kind === 'glassCannon' && eff.dmgMult) mult += eff.dmgMult;
      if (eff.kind === 'regen') regenPower += eff.power;
      // 転生遺物「狂戦士の心臓」：実時間の攻撃間隔短縮はターン制に意味がないため
      // 廃止するが、「HP一定割合以下で2回攻撃」という核心の挙動は維持する
      if (eff.kind === 'berserker' && hpRatio <= eff.threshold) doubleAttack = true;
    }
    this.awakenMult = mult;
    this._regenPower = Math.min(CAPS_LAYER.REGEN_PCT_PER_SEC_MAX, regenPower);
    this._berserkerDoubleAttack = doubleAttack;
  }

  // ---------------------------------------------------------
  // 戦闘終了判定・終了処理
  // ---------------------------------------------------------
  checkBattleEnd() {
    if (this.over) return { over: true };
    if (this.player.hp <= 0) {
      if (this.stage.isAbyss && !this._abyssReviveUsed && state.hasAbyssRevive()) {
        this._abyssReviveUsed = true;
        this.player.hp = Math.round(this.player.maxHp * 0.5);
        return { over: false, revived: true };
      }
      this._finishBattle(false, false);
      return { over: true };
    }
    if (!this.hasMoreEncounters()) {
      this._finishBattle(true, false);
      return { over: true };
    }
    return { over: false };
  }

  // 画面上部の✕ボタン（旧battle.jsのretreatBtn）用：成功率判定を挟む「にげる」
  // コマンド（_playerFlee、元指示17番）とは別物の、無条件・即時の離脱。
  // 旧battle.jsの`this._endRun(false, true)`と同じく必ず成功し、ラウンドも
  // 消費しない（それまでに得たrunExp/runGold/runItemsはそのまま結果に残る）。
  forceRetreat() {
    if (this.over) return this.finalResult;
    this._finishBattle(false, true);
    return this.finalResult;
  }

  // 戦闘終了時の報酬・セーブ処理（旧battle.js _endRun()と同一のstate呼び出し）
  _finishBattle(cleared, retreated) {
    if (this.over) return;
    this.over = true;
    let firstClear = false;
    let bonusItem = null;
    let stageExp = 0;
    let stageGold = 0;
    try {
      if (cleared) {
        stageExp = Math.round(this.stage.rewards.exp * this._expMult());
        stageGold = Math.round(this.stage.rewards.gold * this._goldMult());
        state.gainExp(stageExp);
        state.gainGold(stageGold);
        if (this.stage.isAbyss) {
          state.recordAbyssClear(this.stage.abyssDepth);
        } else {
          const res = state.recordStageResult(this.stage.id, true);
          firstClear = res.wasFirstClear;
          if (firstClear && this.stage.firstClear && this.stage.firstClear.itemId) {
            state.addItem(this.stage.firstClear.itemId, 1);
            bonusItem = this.stage.firstClear.itemId;
          }
        }
      } else if (!retreated) {
        if (!this.stage.isAbyss) state.recordStageResult(this.stage.id, false);
      }
    } catch (err) {
      console.error('BattleEngine._finishBattle reward/save error (recovered):', err);
    }
    const items = [...this.runItems];
    if (bonusItem) items.push(bonusItem);
    this.finalResult = {
      cleared, retreated,
      expGained: cleared ? this.runExp + stageExp : this.runExp,
      goldGained: cleared ? this.runGold + stageGold : this.runGold,
      items, firstClear,
    };
  }
}
