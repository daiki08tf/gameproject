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
import { sumPassivePower } from './data/combatStats.js';
import { hasRareAffix, highestAffixRarity } from './data/affixes.js';

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

// 農民MASTER「百姓魂」：1戦1回だけ、致死ダメージを低確率で耐える（HP1で生存）。
// 確定回避や無限復活にはしない（元指示：壊れた技を避ける）。
const FARMER_SURVIVE_CHANCE = 0.3;

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
      guarding: false,
      // 職業とくぎ・じゅもん実装：汎用バフ構造（元指示「どうしても必要な
      // ものだけBattleEngine側に汎用status構造を追加」）。旧buffAtkMult/
      // buffDefMult/buffTurns（ATK・DEFが常に同じ1本のタイマーで連動する
      // 設計）を、ステータスごとに独立したターン付きバフへ一般化した。
      // atk/def/spd/magはmult（1.0基準の倍率）、critAdd/evasionAdd/regenAddは
      // 加算値（CAPS_LAYER側の上限は適用側の_effectiveXxx()で必ず頭打ちする）。
      buffs: {
        atk: { mult: 1, turnsLeft: 0 }, def: { mult: 1, turnsLeft: 0 },
        spd: { mult: 1, turnsLeft: 0 }, mag: { mult: 1, turnsLeft: 0 },
        critAdd: { value: 0, turnsLeft: 0 }, evasionAdd: { value: 0, turnsLeft: 0 },
        regenAdd: { value: 0, turnsLeft: 0 },
      },
      // ガード軽減率の一時的な上書き（大工「受け流し」「要塞化」用）。
      // null＝通常のTEXT_BATTLE_LAYER.GUARD_DAMAGE_MULTを使う。
      guardOverrideMult: null, guardOverrideTurns: 0,
      // 現状プレイヤーへweaken/DoT相当を与える敵側の手段は存在しないため、
      // 僧侶「浄化」用の空のスキャフォールドとしてのみ保持する（将来Boss等が
      // プレイヤーを弱体化させる手段を持った際にここへ書き込む想定）。
      negativeStatus: { weaken: {}, dotStacks: 0, dotTurnsLeft: 0 },
      // 魔導技師「自動砲台」：設置中は_afterRoundChecks()でラウンド終了時に
      // 1回だけ自動で追撃する（新規summon・実弾は作らず、既存の
      // calculateDamage/_applyRawDamageAndRewardをそのまま呼ぶだけの軽量tick）
      autoTurret: null,
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
    this._actionProcCounts = {}; // 武器Affix（Part A）proc暴走防止：1アクションごとにリセット
    this._tempAtkBonus = 0;
    this._tempAtkTurns = 0;
    this._bloodChaliceBonus = 0;
    this._bloodChaliceTurns = 0;
    this._hasteInitiativeBonus = 0; // 元「haste」（onHurt）：SPD/先攻ボーナスへ転用（元指示5番）
    this._hasteInitiativeTurns = 0;
    this._actionTypesUsed = new Set(); // actionDiversityBurst用（通常/とくぎ/じゅもん）
    this._bossWeaponDropped = false;
    // とくぎ・じゅもんのクールダウン。1技=1スロット前提だった旧_skillCdTurns
    // （単一の数値）から、技IDごとに個別クールダウンを持てるMapへ変更した
    // （元指示：Map/objectへの変更）。
    this.skillCooldowns = {};
    this._skillCooldownsSetThisRound = new Set();
    // 商人・農民の一時的なGold獲得ボーナス（商魂／大収穫）
    this._tempGoldBonus = 0; this._tempGoldBonusTurns = 0;
    // 狩人「獣狩り」：Boss/Elite限定の一時的な与ダメージ加算
    this._tempBossDmgBonus = 0; this._tempBossDmgTurns = 0;
    // 学者MASTER「完全解析」：与ダメージ全般への一時加算
    this._tempDmgBonus = 0; this._tempDmgBonusTurns = 0;
    // 農民MASTER「百姓魂」：1戦1回、低確率で致死ダメージを耐える
    this._farmerSurviveUsed = false;
    // 盗賊「盗む」：対象ごとに1戦1回だけ成立させるため、盗んだ敵のidを記録する
    this._stolenEnemyIds = new Set();

    /* --------------------------------------------------------
       ここから上級職30種（第2フェーズ）向けに追加した状態。
       いずれも「既存の一時バフ／一時ボーナスと同じturns管理の薄いフィールド」
       であり、新しい状態異常システムではない（元指示：どうしても必要な
       ものだけ汎用status/buff構造へ追加する）。
       -------------------------------------------------------- */
    // 魔法剣士MASTER「魔力剣」：数ターン、通常攻撃にもMAG補正を追加する
    this._tempHybridMagRatio = 0; this._tempHybridMagTurns = 0;
    // 大商人/大工系「値切り」：Gold消費技のコストを一時的に割り引く
    this._tempGoldCostReduce = 0; this._tempGoldCostReduceTurns = 0;
    // トレジャーハンター「目利き」・大商人「鑑定眼」：戦闘中だけドロップ率を底上げ
    this._tempDropRateBonus = 0; this._tempDropRateBonusTurns = 0;
    // アルカニスト「錬成陣」等：自分がかけるweaken/dotの効果量を一時的に底上げ
    this._tempDebuffPowerBonus = 0; this._tempDebuffPowerBonusTurns = 0;
    // 語り部「伝説の一節」：数ターン経験値取得を底上げ
    this._tempExpBonus = 0; this._tempExpBonusTurns = 0;
    // アームズナイトMASTER「完全武装」：Armor Penへの一時加算
    this._tempArmorPenBonus = 0; this._tempArmorPenTurns = 0;
    // 賢者MASTER「連続詠唱」：次に唱えるspell1回だけ2回発動させる予約フラグ
    this._doubleCastArmed = false;
    // 剣豪「居合」・密偵「奇襲」等：このラウンド先攻したか（advanceTurn側で設定）
    this._lastPlayerFirst = false;
    // 怪盗MASTER「背後の一撃」：直前に敵の攻撃を回避していたか
    this._playerEvadedLastRound = false;
    // 幻惑の舞姫MASTER「夢幻乱舞」：戦闘中に回避へ成功した累計回数
    this._playerEvasionCount = 0;
    // 拳聖「連環拳」：直前の自分の行動が攻撃系（通常攻撃 or damage技）だったか
    this._lastActionWasAttack = false;
    // トレジャーハンター「発掘」・大商人「市場支配」：戦闘クリア時に1回だけ
    // 追加報酬を判定する予約（{goldPct, dropChance}）。既存_rollDrop()のみを
    // 使うためBoss固有武器・初回クリア報酬（別経路）は対象外＝無限増殖しない
    this._battleEndBonusReward = null;
    // トレジャーハンターMASTER「大発見」・村の癒し手MASTER「村人の奇跡」等、
    // 技ID単位で「1戦1回」を厳密に保証する汎用セット（_probeTechnique/
    // _playerTechnique側で共通に参照する）
    this._oncePerBattleUsed = new Set();
    // パラディンMASTER「不落の誓い」：致死ダメージを1戦1回だけ耐える権利を
    // 技の使用時に「起動」する（農民の百姓魂＝常時パッシブとは異なり、
    // 使った時だけ有効になる）。checkBattleEnd()では深淵蘇生→百姓魂→
    // この順で判定し、重複発動しないようにする
    this._paladinDeathGuardArmed = false;
    this._paladinSurviveUsed = false;

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
  // 有効ステータス（player.buffsの一時バフを反映した値）。通常攻撃・とくぎ・
  // じゅもん・initiative判定・回避判定など、プレイヤーのステータスを読む
  // 箇所は全てここを経由する（元指示：CAPS_LAYERの上限を必ず厳守する）。
  // ---------------------------------------------------------
  _effectiveAtk() { const b = this.player.buffs.atk; return this.player.atk * (b.turnsLeft > 0 ? b.mult : 1); }
  _effectiveMag() { const b = this.player.buffs.mag; return this.player.mag * (b.turnsLeft > 0 ? b.mult : 1); }
  _effectiveDef() { const b = this.player.buffs.def; return this.player.def * (b.turnsLeft > 0 ? b.mult : 1); }
  // Build Affix「死線」：HPが閾値以下の間だけSPDも底上げする
  _effectiveSpd() {
    const b = this.player.buffs.spd;
    let spd = this.player.spd * (b.turnsLeft > 0 ? b.mult : 1);
    spd *= 1 + this._deathlineBonus('spd');
    return spd;
  }
  _hpRatio() { return this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1; }
  _deathlineBonus(which) {
    let bonus = 0;
    const hpRatio = this._hpRatio();
    for (const eff of this._effectsOf('passive')) {
      if (eff.kind === 'deathlineBoost' && hpRatio <= eff.threshold) bonus += eff.power;
    }
    return bonus;
  }
  _effectiveCritPct() {
    const b = this.player.buffs.critAdd;
    // Build Affix「死線」：HP閾値以下でCritも底上げ（percentage point換算）
    const deathline = this._deathlineBonus('crit') * 100;
    return Math.min(CAPS_LAYER.CRIT_PCT_MAX, this.player.critPct + (b.turnsLeft > 0 ? b.value : 0) + deathline);
  }
  _effectiveEvasion() {
    const b = this.player.buffs.evasionAdd;
    return Math.min(CAPS_LAYER.EVASION_MAX, (this.player.evasion || 0) + (b.turnsLeft > 0 ? b.value : 0));
  }
  // アームズナイトMASTER「完全武装」用：既存player.armorPenへの一時加算を
  // 一箇所で反映する（通常攻撃・とくぎ・じゅもんの全経路がここを経由する）
  _effectiveArmorPen() {
    return Math.min(CAPS_LAYER.ARMOR_PEN_MAX, (this.player.armorPen || 0) + (this._tempArmorPenTurns > 0 ? this._tempArmorPenBonus : 0));
  }

  // パラディン「聖盾」・剣豪MASTER「無心斬」・巫女MASTER「神託」等：Boss予兆
  // （既存pendingSpecial）が出ている間だけ強化される技で共通して使う判定
  _hasActiveTelegraph() { return this.aliveEnemies.some((e) => e.pendingSpecial); }

  // 自己参照（プレイヤー・戦況側）の条件で威力を上乗せする技（居合・奇襲・
  // 背後の一撃・無心斬・連環拳・背水拳等）が共通で使う判定。target側の条件は
  // 別途_targetBonusPower()で扱う（新しい状態異常システムではなく、既存の
  // フラグ・カウンタを読むだけの薄いヘルパー）
  _conditionMet(cb) {
    if (!cb) return false;
    switch (cb.condition) {
      case 'playerFirst': return !!this._lastPlayerFirst;
      case 'evadedLastRound': return !!this._playerEvadedLastRound;
      case 'firstOrEvaded': return !!this._lastPlayerFirst || !!this._playerEvadedLastRound;
      case 'telegraphActive': return this._hasActiveTelegraph();
      case 'prevActionAttack': return !!this._lastActionWasAttack;
      case 'highEvasion': return this._effectiveEvasion() >= (cb.evasionThreshold != null ? cb.evasionThreshold : 0.15);
      default: return false;
    }
  }

  // 対象（敵）側の状態で威力を上乗せする技（猛獣使い・暗殺拳・密偵・
  // 狩猟王等）が共通で使う判定。'marked'は狩猟王「狩人の印」が刻む
  // enemy.vulnerable（既存weakenと同じ形の追加フィールド）を見る
  _targetBonusPower(tb, target) {
    if (!tb || !target) return 0;
    switch (tb.when) {
      case 'bossOrElite': return (target.boss || target.elite) ? tb.power : 0;
      case 'lowHp': return (target.maxHp > 0 && target.hp / target.maxHp <= (tb.hpThreshold != null ? tb.hpThreshold : 0.5)) ? tb.power : 0;
      case 'debuffed': return ((target.weaken && Object.keys(target.weaken).length > 0) || (target.dotStacks || 0) > 0) ? tb.power : 0;
      case 'marked': return (target.vulnerable && target.vulnerable.turnsLeft > 0) ? tb.power : 0;
      default: return 0;
    }
  }

  // ---------------------------------------------------------
  // ダメージ計算（PR#2のDamage Bucketをそのまま流用。新式は作らない）
  // ---------------------------------------------------------
  _effectsOf(trigger) { return this.effects.filter((e) => e.trigger === trigger); }

  // sourceKind: 'normal'|'skill'|'spell' を渡すと、武器Affix（Part A）の
  // 「通常攻撃/とくぎ/じゅもんDamage+」（normalDmgAdd/skillDmgAdd/
  // spellDmgAdd）のうち該当するものだけを追加で乗せる（省略時は無視＝
  // AoE反撃・自動砲台等の既存呼び出しは今まで通り）
  _mainDmgMult(sourceKind) {
    const bloodChaliceMult = this._bloodChaliceTurns > 0 ? 1 + this._bloodChaliceBonus : 1;
    const tempAtkMult = this._tempAtkTurns > 0 ? 1 + this._tempAtkBonus : 1;
    // ATKバフはplayer.buffs.atk（_effectiveAtk()）側へ移動したため、ここでは
    // 加算しない（旧buffAtkMultの項をここから除去）。学者MASTER「完全解析」の
    // 一時的な与ダメージ加算だけ、既存の加算バケット方式にならって追加する。
    let mult = 1
      + (this.awakenMult - 1)
      + (bloodChaliceMult - 1)
      + (tempAtkMult - 1)
      + (this._tempDmgBonusTurns > 0 ? this._tempDmgBonus : 0);
    for (const eff of this._effectsOf('passive')) {
      if (eff.kind === 'dmgBonusAdd') mult += eff.power;
      else if (sourceKind === 'normal' && eff.kind === 'normalDmgAdd') mult += eff.power;
      else if (sourceKind === 'skill' && eff.kind === 'skillDmgAdd') mult += eff.power;
      else if (sourceKind === 'spell' && eff.kind === 'spellDmgAdd') mult += eff.power;
      // Build Affix「早撃ち」：このラウンド自分が先攻していればDamageも上乗せ
      else if (eff.kind === 'firstStrikeBonus' && this._lastPlayerFirst) mult += eff.power;
    }
    return mult;
  }

  _critDamageBoostMult() {
    let mult = 1;
    for (const eff of this._effectsOf('passive')) if (eff.kind === 'critDamageBoost') mult += eff.power;
    return mult;
  }

  _bossDmgMult(target) {
    let bonus = state.awakeningBossDmgMult() - 1;
    const debuffed = target && ((target.weaken && Object.keys(target.weaken).length > 0) || (target.dotStacks || 0) > 0);
    for (const eff of this._effectsOf('passive')) {
      // bossDmgは既存挙動どおりBoss/Elite両方に適用する（元指示：既存の
      // 判定条件を変更しない）。eliteDmgはAffix追加分でElite限定に上乗せする
      if (eff.kind === 'bossDmg') bonus += eff.power;
      if (eff.kind === 'eliteDmg' && target && target.elite) bonus += eff.power;
      if (eff.kind === 'executioner' && target && target.maxHp > 0 && target.hp / target.maxHp <= eff.hpThreshold) bonus += eff.power;
      // 武器Affix「弱毒撃」：weaken/DoTが乗っている相手へのDamage+
      if (eff.kind === 'debuffedDmg' && debuffed) bonus += eff.power;
      // Build Affix「毒心」：DoTスタック数に比例してDamage+
      if (eff.kind === 'dotStackDmg' && target) bonus += eff.power * (target.dotStacks || 0);
    }
    // 狩人「獣狩り」：Boss/Elite限定の一時的な与ダメージ加算
    if (this._tempBossDmgTurns > 0 && target && (target.boss || target.elite)) bonus += this._tempBossDmgBonus;
    return 1 + bonus;
  }

  _effectiveEnemyStat(enemy, stat) {
    const base = enemy[stat];
    const w = enemy.weaken && enemy.weaken[stat];
    if (w && w.turnsLeft > 0) return base * (1 - w.power);
    return base;
  }

  // weaken/burnStackの適用処理を1箇所に集約する。装備固有効果（_applyOneEffect）
  // と職業とくぎ・じゅもん（skills.js/spells.jsのweaken/dotフィールド）の
  // どちらから呼ばれても、同じenemy.weaken/dotStacks構造へ書き込む
  // （新しい状態異常システムを増やさず、既存の仕組みへ合流させる）。
  // アルカニスト「錬成陣」・MASTER「賢者の触媒」：自分がかけるweaken/dotの
  // 効果量を一時的に底上げする（_tempDebuffPowerBonus）。両メソッドを通る
  // 経路すべて（装備固有効果・基本職skills.js・上級職skills.js）へ自動で乗る
  // 武器Affix「弱点看破の心得」：弱体化/DoT付与の効果量を恒常的に底上げする
  _debuffPowerMult() {
    const temp = this._tempDebuffPowerBonusTurns > 0 ? this._tempDebuffPowerBonus : 0;
    return 1 + temp + sumPassivePower(this.effects, 'debuffPowerAdd');
  }
  _applyWeakenToTarget(target, stat, power, turnsLeft) {
    if (!target || target.dead) return;
    target.weaken = target.weaken || {};
    target.weaken[stat] = { power: power * this._debuffPowerMult(), turnsLeft };
  }
  // 武器Affix「侵蝕」「積毒」：DoTの持続ターン・最大スタック数を底上げする
  _dotDurationMult() { return 1 + sumPassivePower(this.effects, 'dotDuration'); }
  _dotStackCapMult() { return 1 + sumPassivePower(this.effects, 'dotStackCap'); }
  _applyDotToTarget(target, power, turnsLeft, maxStacks = 99) {
    if (!target || target.dead) return;
    const cap = Math.max(1, Math.round(maxStacks * this._dotStackCapMult()));
    target.dotStacks = Math.min(cap, (target.dotStacks || 0) + 1);
    target.dotTurnsLeft = Math.max(1, Math.round(turnsLeft * this._dotDurationMult()));
    target.dotPower = power * this._debuffPowerMult();
  }
  // 星詠みの魔女「星蝕」・幻術師「幻覚」等：weakenを配列（複数ステータス）でも
  // 単一オブジェクトでも受理できるよう一般化した共通ヘルパー
  _applyWeakenList(target, weaken, bossMultiplierTarget) {
    const list = Array.isArray(weaken) ? weaken : [weaken];
    const applied = [];
    for (const w of list) {
      let pct = w.pct;
      if (bossMultiplierTarget && bossMultiplierTarget.boss && w.bossMultiplier != null) pct *= w.bossMultiplier;
      this._applyWeakenToTarget(target, w.stat, pct, w.turns);
      applied.push({ stat: w.stat, pct });
    }
    return applied;
  }

  // calculateDamage(): 攻撃側atk・防御側defから最終ダメージを算出する。
  // PR#2の比率型DEF軽減・CAPS_LAYER.DEF_MITIGATION_MAX・会心・Boss倍率を
  // そのまま踏襲する（js/battle.js旧_rollDamage()と数式は完全に同一）。
  calculateDamage(atk, target, opts = {}) {
    const rawDef = target ? this._effectiveEnemyStat(target, 'def') : 0;
    const armorPen = opts.armorPen != null ? opts.armorPen : this._effectiveArmorPen();
    const effectiveDef = rawDef * (1 - armorPen);
    const mitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectiveDef / (effectiveDef + DAMAGE_BUCKET.MITIGATION_K));
    let dmg = Math.max(1, atk * (1 - mitigation));
    const critPct = opts.critPct != null ? opts.critPct : this._effectiveCritPct();
    const critical = Math.random() * 100 < critPct;
    if (critical) dmg *= DAMAGE_BUCKET.CRIT_MULTIPLIER * this._critDamageBoostMult();
    // 狩人「獣狩り」（Boss/Elite特効）に対応するため、既存のbossDmg/executioner
    // 判定条件をelite含みに広げる（Boss限定だった既存の挙動自体は変えない＝
    // target.boss===trueの場合は従来どおり必ず適用される。target.elite===true
    // のケースだけが新たに対象に加わる）。
    if (target && (target.boss || target.elite) && !opts.noBossMult) dmg *= this._bossDmgMult(target);
    // 狩猟王「狩人の印」：マーク中の相手への一律ダメージ増加。既存weakenと
    // 対になる新フィールドenemy.vulnerableだけを見る薄い追加（新しい状態
    // 異常システムを作らず、既存のダメージ計算の最後に1項足すだけ）
    if (target && target.vulnerable && target.vulnerable.turnsLeft > 0) dmg *= (1 + target.vulnerable.pct);
    return { damage: Math.round(dmg), critical };
  }

  // プレイヤーDEFに対する敵攻撃の軽減（js/battle.js旧_updateEnemies接触
  // ダメージ・Boss特殊攻撃と同じ比率式）。guardMultiplierは別枠で掛ける
  // （元指示6番：「最終被ダメージ×guardMultiplier」として、DEF軽減とは
  // 独立に処理する）。
  _enemyAttackDamage(atk, opts = {}) {
    const effectiveDef = this._effectiveDef();
    const mitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effectiveDef / (effectiveDef + DAMAGE_BUCKET.MITIGATION_K));
    let dmg = Math.max(1, atk * (1 - mitigation));
    if (opts.mult == null) {
      // opts.multが指定されない＝予兆を経ない「通常攻撃」（Bossの通常攻撃含む）。
      // 実時間の「移動による回避」ぶんを補正するNORMAL_ATTACK_DAMAGE_MULTは
      // ここにのみ掛ける。
      dmg *= TEXT_BATTLE_LAYER.NORMAL_ATTACK_DAMAGE_MULT;
    } else {
      // ChatGPTレビュー指摘3番：予兆つきのBoss特殊攻撃。BOSS_AI_LAYERの
      // SLAM/CHARGE/PROJECTILE_DAMAGE_MULT（opts.mult）は実時間のAoE当たり
      // 判定基準の値なので、そのまま素のatkに掛けるだけでは「通常攻撃1回
      // ぶん」の基準（NORMAL_ATTACK_DAMAGE_MULT適用後）より軽くなってしまい、
      // 予兆の意味が薄れる。通常攻撃と同じ基準に載せ替えたうえで、
      // TELEGRAPH_MULT_SCALEで狙った強弱（slam/charge/projectileの相対比は
      // BOSS_AI_LAYER側の値をそのまま活かす）に引き上げる。
      dmg *= TEXT_BATTLE_LAYER.NORMAL_ATTACK_DAMAGE_MULT * opts.mult * TEXT_BATTLE_LAYER.TELEGRAPH_MULT_SCALE;
      // 武器Affix「対怪異の心得」：Boss特殊攻撃を常に一定割合軽減する
      dmg *= 1 - Math.min(0.5, sumPassivePower(this.effects, 'bossSpecialMitigation'));
      // Build Affix「魔導防壁」：MPが一定割合以上残っている間だけ、Boss特殊
      // 攻撃をさらに軽減する（MPを維持するプレイスタイルへのコストになる）
      for (const eff of this._effectsOf('passive')) {
        if (eff.kind === 'mpShield' && this.player.maxMp > 0 && this.player.mp / this.player.maxMp >= eff.threshold) dmg *= 1 - eff.power;
      }
    }
    // 大工「受け流し」「要塞化」：通常のGUARD_DAMAGE_MULTより強い軽減率を
    // 一時的に使う（guardOverrideMultがnullの間は従来どおり）。完全無敵には
    // ならないよう、guardOverrideMult自体も0より大きい値のみをskills.js側で
    // 定義している。
    if (this.player.guarding) {
      dmg *= this.player.guardOverrideMult != null ? this.player.guardOverrideMult : TEXT_BATTLE_LAYER.GUARD_DAMAGE_MULT;
      // 武器Affix「要塞の心得」：ぼうぎょ軽減率をさらに底上げする（0にはしない）
      dmg *= Math.max(0.1, 1 - sumPassivePower(this.effects, 'guardMitigation'));
    }
    return Math.max(1, Math.round(dmg));
  }

  // ---------------------------------------------------------
  // プレイヤー行動
  // ---------------------------------------------------------
  performPlayerAction(action) {
    // 武器Affix（Part A）proc暴走防止：1アクションごとにperActionCapの
    // カウンタをリセットする
    this._actionProcCounts = {};
    if (action.type === 'attack') return this._playerAttack(action.targetId);
    if (action.type === 'guard') return this._playerGuard();
    if (action.type === 'flee') return this._playerFlee();
    if (action.type === 'skill') return this._playerTechnique('skill', action.techId, action.targetId);
    if (action.type === 'spell') return this._playerTechnique('spell', action.techId, action.targetId);
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
    // 武器Affix「瞬撃の心得」：攻撃間隔をさらに短縮する（下限は既存踏襲）
    const atkSpeedMult = 1 - Math.min(0.5, sumPassivePower(this.effects, 'atkSpeedAdd'));
    return clamp((1.0 - this._effectiveSpd() * 0.012) * atkSpeedMult, CAPS_LAYER.ATTACK_INTERVAL_MIN, 1.1);
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
    // 魔法剣士MASTER「魔力剣」：数ターンだけ通常攻撃にもMAG補正を追加する
    // （永続化しないよう必ずturnsで管理された一時ボーナスのみを見る）
    const hybridBonus = this._tempHybridMagTurns > 0 ? this._effectiveMag() * this._tempHybridMagRatio : 0;
    const atkValue = (this._effectiveAtk() + hybridBonus) * this._mainDmgMult('normal');
    // ChatGPTレビュー指摘1番：multi-hitは1発ごとに独立して会心判定・
    // ダメージ乱数を振り（分散を実時間相当に保つ）、かつ1発ごとに
    // _applyDamageToEnemy()を呼んでonHit/onCritをその場で発火させる
    // （以前は全hit分を合算した1つのdmgでまとめて1回だけ適用しており、
    // 「1hitごとに発動すべきonHit/onCrit」が正しく発火しない・lifesteal等
    // の1命中単位の上限も全hit分をまとめて食い潰す不具合があった）。
    // 敵が途中のhitで死亡したら、以降のhitは行わずそこで打ち切る。
    let totalDamage = 0;
    let criticalCount = 0;
    let hitsLanded = 0;
    const effects = [];
    let kill = null;
    for (let i = 0; i < hitCount; i++) {
      if (target.dead) break;
      const { damage, critical } = this.calculateDamage(atkValue, target);
      if (critical) criticalCount++;
      hitsLanded++;
      totalDamage += damage;
      const hit = this._applyDamageToEnemy(target, damage, critical, i, hitCount);
      effects.push(...hit.effects);
      if (hit.kill) kill = hit.kill; // 同一targetなので、直前の（＝唯一の）撃破結果が最終結果
    }
    const result = {
      action: 'attack', targetId: target.id, targetName: target.name,
      damage: totalDamage, defeated: target.dead, effects, kill,
      // 表示用にまとめた集計値（ChatGPTレビュー指摘1番）：内部処理は1hit単位、
      // UI表示はhitCount/criticalCount/totalDamageとしてまとめてよい
      critical: criticalCount > 0, criticalCount, hitCount: hitsLanded, berserkerDoubled,
    };
    this._actionTypesUsed.add('attack');
    this._lastActionWasAttack = true; // 拳聖「連環拳」：直前の行動が攻撃系だったかの判定に使う
    this._checkActionDiversityBurst(result);
    return result;
  }

  // ---------------------------------------------------------
  // とくぎ・じゅもん（職業技）：基本職15種を対象にした共通実行系。
  // 元指示：「profile→自動生成のまま／skills・spells→職業ごとの手動
  // コンテンツ」の責務分離を前提とし、上級職・特級職・勇者はautoSkillFor()
  // が生成した単一技をjobs.js側でjob.skills[0]へラップして流用する
  // （このBattleEngine側は常にjob.skills[]/job.spells[]の配列だけを見る）。
  // ---------------------------------------------------------
  _isTechniqueLearned(tech) {
    if (tech.learnLevel === 'master') return state.isMastered(state.currentJobId);
    return state.currentLevel >= tech.learnLevel;
  }

  // 習得済み（かつpassiveではない＝コマンドとして選択可能な）技一覧
  availableSkills() { return (this.job.skills || []).filter((t) => this._isTechniqueLearned(t) && !t.passive); }
  availableSpells() { return (this.job.spells || []).filter((t) => this._isTechniqueLearned(t) && !t.passive); }

  // 武器Affix「省魔の心得」：MPコストを恒常的に割り引く
  _effectiveMpCost(tech) {
    const mult = Math.min(0.7, sumPassivePower(this.effects, 'mpCostReduce'));
    return Math.max(0, Math.round(tech.mpCost * (1 - mult)));
  }
  _techniqueGoldCost(tech) {
    let cost;
    if (tech.goldCostFlat != null) cost = tech.goldCostFlat;
    else if (tech.goldCostPct != null) cost = Math.max(tech.goldCostMin || 0, Math.round(state.data.gold * tech.goldCostPct));
    else return 0;
    // 大商人「値切り」：Gold消費技のコストを一時的に割り引く
    if (this._tempGoldCostReduceTurns > 0) cost = Math.max(0, Math.round(cost * (1 - this._tempGoldCostReduce)));
    return cost;
  }

  // MP・クールダウン・Gold・習得状態を確認するだけの副作用なしチェック。
  // advanceTurn()側でコマンド選択の可否を先に判定する（にげるBoss不可判定と
  // 同じ「実行そのものが成立しないコマンドはラウンドを消費しない」扱いに
  // するため）のと、_playerTechnique()内部の実行直前チェックの両方で使う。
  _probeTechnique(kind, techId) {
    const list = kind === 'spell' ? this.availableSpells() : this.availableSkills();
    const tech = list.find((t) => t.id === techId);
    if (!tech) return { ok: false, reason: 'notLearned' };
    // トレジャーハンターMASTER「大発見」・村の癒し手MASTER「村人の奇跡」等：
    // 技ID単位の「1戦1回」制限（クールダウンとは別枠。長い戦闘でCDが
    // 切れて再度使えてしまわないよう、明示的に使用済みセットで縛る）
    if (tech.oncePerBattle && this._oncePerBattleUsed.has(tech.id)) return { ok: false, reason: 'usedThisBattle' };
    if ((this.skillCooldowns[tech.id] || 0) > 0) return { ok: false, reason: 'onCooldown' };
    if (this.player.mp < this._effectiveMpCost(tech)) return { ok: false, reason: 'noMp' };
    if (tech.goldCostPct != null || tech.goldCostFlat != null) {
      if (state.data.gold < this._techniqueGoldCost(tech)) return { ok: false, reason: 'noGold' };
    }
    return { ok: true, tech };
  }

  _playerTechnique(kind, techId, targetId) {
    const probe = this._probeTechnique(kind, techId);
    if (!probe.ok) return { action: kind, blocked: true, reason: probe.reason };
    const tech = probe.tech;
    this.player.guarding = false;
    this.player.mp -= this._effectiveMpCost(tech);
    let goldSpent = 0;
    if (tech.goldCostPct != null || tech.goldCostFlat != null) {
      goldSpent = this._techniqueGoldCost(tech);
      // 元指示：Goldが0未満にならないこと
      state.data.gold = Math.max(0, state.data.gold - goldSpent);
    }
    if (tech.oncePerBattle) this._oncePerBattleUsed.add(tech.id);
    if (tech.cooldownTurns > 0) {
      // 武器Affix「型の冴え」：職業MASTERのCDRとは別枠で、恒常的にさらに
      // クールダウンを短縮する（既存CAPS_LAYER.CDR_MULT_MINの下限を共有）
      const cdrMult = Math.max(CAPS_LAYER.CDR_MULT_MIN, state.jobMasterCooldownMult() - sumPassivePower(this.effects, 'cdrAdd'));
      this.skillCooldowns[tech.id] = Math.max(1, Math.round(tech.cooldownTurns * cdrMult));
      // このラウンドの_afterRoundChecks()でうっかり即座に1減らしてしまうと、
      // 「cooldownTurns:1」が実質ノークールダウンと同義になってしまう
      // （使った直後のラウンド終了処理で1→0まで進んでしまうため）。設定した
      // ラウンドぶんだけは減算をスキップし、次のラウンド以降で正しく減り
      // 始めるようにする。
      this._skillCooldownsSetThisRound.add(tech.id);
    }
    // 装備onSkillエフェクト（cdRefund/haste）は、旧・単一skill運用時と同じ
    // 意味論のまま「何らかのとくぎ/じゅもんを使った」瞬間全般に効かせる
    for (const eff of this._effectsOf('onSkill')) {
      if (eff.kind === 'cdRefund' && Math.random() < eff.chance) this.skillCooldowns[tech.id] = 0;
      else if (eff.kind === 'haste') { this._tempAtkBonus = eff.power; this._tempAtkTurns = roundsFromSeconds(eff.duration); }
      // 武器Affix「魔力循環の心得」「還元の術理」：じゅもん限定で発動する
      // （spellOnly指定。procChanceは既存のchanceフィールドをそのまま使う）
      else if (eff.spellOnly && kind !== 'spell') continue;
      else if (eff.kind === 'spellMagBuff') this._applyBuffPayload({ magPct: eff.power, turns: eff.turns }, {});
      else if (eff.kind === 'spellMpRefund' && eff.chance != null && Math.random() < eff.chance) {
        const refund = Math.round(tech.mpCost * eff.power);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + refund);
      }
      // Build Affix「魔力反響」：低確率でMAGベースの追加ダメージを飛ばす
      // （技そのものを再帰的に再発動するとMP/CD/連続詠唱等と衝突するため、
      // 「もう一撃分の魔力弾」として独立したダメージ処理にとどめる＝
      // 「連続詠唱との無限連鎖禁止」を構造的に満たす）
      else if (eff.kind === 'spellEcho' && eff.chance != null && Math.random() < eff.chance) {
        const echoTarget = this._pickTarget(targetId);
        if (echoTarget && !echoTarget.dead) {
          const atkValue = this._effectiveMag() * 0.5 * this._mainDmgMult('spell');
          const { damage, critical } = this.calculateDamage(atkValue, echoTarget);
          this._applyDamageToEnemy(echoTarget, damage, critical);
        }
      }
    }

    const result = { action: kind, techId: tech.id, name: tech.name, techType: tech.type, goldSpent, targets: [] };
    const dispatchTechnique = () => {
      switch (tech.type) {
        case 'damage': this._resolveTechniqueDamage(tech, targetId, result, kind); break;
        case 'heal': this._resolveTechniqueHeal(tech, result); break;
        case 'buff': this._resolveTechniqueBuff(tech, result); break;
        case 'debuff': this._resolveTechniqueDebuff(tech, targetId, result); break;
        case 'steal': this._resolveTechniqueSteal(tech, targetId, result); break;
        case 'inspect': this._resolveTechniqueInspect(tech, targetId, result); break;
        case 'burst': this._resolveTechniqueBurst(tech, targetId, result, kind); break;
        case 'cleanse': this._resolveTechniqueCleanse(tech, result); break;
        case 'utility': this._resolveTechniqueUtility(tech, result); break;
        default: break;
      }
    };
    dispatchTechnique();
    // 賢者MASTER「連続詠唱」：直前に予約されていれば、次に唱えたspell1回に
    // 限り2回発動させる（MPは2回分消費、不足していれば1回のみで諦める＝
    // ラウンド自体はすでに成立しているので失敗にはしない）。連続詠唱自身の
    // 再発動はtech.armDoubleCastで明示的に除外しているため無限ループしない
    if (kind === 'spell' && this._doubleCastArmed && !tech.armDoubleCast) {
      this._doubleCastArmed = false;
      if (this.player.mp >= tech.mpCost) {
        this.player.mp -= tech.mpCost;
        dispatchTechnique();
        result.doubleCast = true;
      }
    }
    this._lastActionWasAttack = tech.type === 'damage' || tech.type === 'burst';
    this._actionTypesUsed.add(kind === 'spell' ? 'spell' : 'skill');
    this._checkActionDiversityBurst(result);
    return result;
  }

  _resolveTargets(tech, targetId) {
    if (tech.target === 'allEnemies') return this.aliveEnemies.slice();
    if (tech.target === 'self') return [];
    const t = this._pickTarget(targetId);
    return t ? [t] : [];
  }

  _resolveTechniqueDamage(tech, targetId, result, kind) {
    // 星詠みの魔女「流星」：ランダムな相手へ独立してhit数ぶん撃つ特殊分岐
    if (tech.target === 'randomEnemies') { this._resolveTechniqueDamageRandom(tech, result); return; }
    // hybrid：パラディン/魔法剣士/森の吟遊詩人等、ATKとMAGを両方参照する
    // ハイブリッド攻撃（新フィールド。既存のmagic:trueとは独立に扱う）
    const statValue = tech.hybrid ? (this._effectiveAtk() + this._effectiveMag()) / 2
      : (tech.magic ? this._effectiveMag() : this._effectiveAtk());
    const hits = tech.hits || 1;
    const targets = this._resolveTargets(tech, targetId);
    if (targets.length === 0) { result.noTarget = true; return; }
    const opts = {};
    if (tech.armorPenBonus) opts.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, this._effectiveArmorPen() + tech.armorPenBonus);
    // critBonus：魔法剣士「雷鳴斬」・急所突き等、この技の一撃だけ会心率に加算する
    if (tech.critBonus) opts.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, this._effectiveCritPct() + tech.critBonus);
    // 自己参照の条件付き威力ボーナス（先攻/回避直後/Boss予兆中/直前の行動/
    // 背水/回避回数）。対象ごとには変わらないため先に1回だけ計算する
    let conditionBonusPower = 0;
    if (tech.conditionBonus && this._conditionMet(tech.conditionBonus)) conditionBonusPower += tech.conditionBonus.power;
    if (tech.lowHpScalePower) {
      const hpRatio = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
      conditionBonusPower += tech.lowHpScalePower.maxBonus * Math.max(0, 1 - hpRatio);
    }
    if (tech.evasionCountScale) {
      const c = tech.evasionCountScale;
      conditionBonusPower += Math.min(c.max, c.perCount * (this._playerEvasionCount || 0));
    }
    for (const target of targets) {
      // 暗殺拳MASTER「暗殺」：雑魚のみ低確率の即死。Eliteには一切効かず、
      // Bossは即死せずtargetBonus（Execution扱い）へ完全に置き換わる
      if (tech.instaKill && !target.dead && !target.boss && !target.elite && Math.random() < tech.instaKill.chance) {
        const dmg = target.hp;
        const hit = this._applyDamageToEnemy(target, dmg, false);
        result.targets.push({
          targetId: target.id, targetName: target.name, damage: dmg, defeated: target.dead,
          critical: false, criticalCount: 0, hitCount: 1, effects: hit.effects, kill: hit.kill, instaKilled: true,
        });
        continue;
      }
      const targetBonusPower = this._targetBonusPower(tech.targetBonus, target);
      let totalDamage = 0, criticalCount = 0, hitsLanded = 0;
      const effects = []; let kill = null;
      for (let i = 0; i < hits; i++) {
        if (target.dead) break;
        const power = tech.power + conditionBonusPower + targetBonusPower;
        const atkValue = statValue * power * this._mainDmgMult(kind);
        const { damage, critical } = this.calculateDamage(atkValue, target, opts);
        if (critical) criticalCount++;
        hitsLanded++;
        totalDamage += damage;
        const hit = this._applyDamageToEnemy(target, damage, critical, i, hits);
        effects.push(...hit.effects);
        if (hit.kill) kill = hit.kill;
        // 狩猟王「追撃」：会心が出たら同じ相手へ即座に追加の一撃を加える
        if (critical && tech.critFollowup && !target.dead) {
          const followAtk = statValue * tech.power * tech.critFollowup.powerMult * this._mainDmgMult(kind);
          const follow = this.calculateDamage(followAtk, target, opts);
          hitsLanded++;
          totalDamage += follow.damage;
          if (follow.critical) criticalCount++;
          const followHit = this._applyDamageToEnemy(target, follow.damage, follow.critical);
          effects.push(...followHit.effects);
          if (followHit.kill) kill = followHit.kill;
        }
      }
      if (tech.weaken && !target.dead) this._applyWeakenList(target, tech.weaken, target);
      if (tech.dot && !target.dead) {
        this._applyDotToTarget(target, tech.dot.power, tech.dot.turns, tech.dot.maxStacks || 99);
        this.applyEffect('onDot', {}); // 武器Affix「毒煙の呼吸」
      }
      result.targets.push({
        targetId: target.id, targetName: target.name, damage: totalDamage, defeated: target.dead,
        critical: criticalCount > 0, criticalCount, hitCount: hitsLanded, effects, kill,
      });
    }
    // プリマ・ディーヴァ「剣の舞曲」等：攻撃と同時に自分へバフをかける
    if (tech.selfBuff) this._applyBuffPayload(tech.selfBuff, result);
  }

  // 星詠みの魔女「流星」専用：固定hit数ぶん、毎回独立してランダムな生存中の
  // 敵を選び直す（過剰乱数防止のためhit数自体は固定・SPD等に依存しない）
  _resolveTechniqueDamageRandom(tech, result) {
    const hits = tech.hits || 1;
    const statValue = tech.magic ? this._effectiveMag() : this._effectiveAtk();
    for (let i = 0; i < hits; i++) {
      const alive = this.aliveEnemies;
      if (alive.length === 0) break;
      const target = alive[Math.floor(Math.random() * alive.length)];
      const atkValue = statValue * tech.power * this._mainDmgMult();
      const { damage, critical } = this.calculateDamage(atkValue, target);
      const hit = this._applyDamageToEnemy(target, damage, critical);
      let entry = result.targets.find((t) => t.targetId === target.id);
      if (!entry) {
        entry = { targetId: target.id, targetName: target.name, damage: 0, criticalCount: 0, hitCount: 0, effects: [], defeated: false, kill: null };
        result.targets.push(entry);
      }
      entry.damage += damage; entry.hitCount++;
      if (critical) entry.criticalCount++;
      entry.effects.push(...hit.effects);
      entry.defeated = target.dead;
      entry.critical = entry.criticalCount > 0;
      if (hit.kill) entry.kill = hit.kill;
    }
    if (result.targets.length === 0) result.noTarget = true;
  }

  // weaken（能力低下）・dot（毒/DoT付与）・stun（低確率の行動阻害）のいずれか、
  // または複数を組み合わせて持つ「純粋なデバフ技」（ダメージを伴わない）を扱う。
  // 錬金術師「毒薬」のようにweakenを持たずdotのみの技もあるため、両方とも
  // 存在チェックしてから適用する。
  _resolveTechniqueDebuff(tech, targetId, result) {
    const targets = this._resolveTargets(tech, targetId);
    if (targets.length === 0) { result.noTarget = true; return; }
    for (const target of targets) {
      const entry = { targetId: target.id, targetName: target.name };
      if (tech.weaken) {
        // 星詠みの魔女「星蝕」・幻術師「幻覚」：weakenは単一オブジェクトでも
        // 配列（複数ステータス同時弱体）でも受理できる
        const applied = this._applyWeakenList(target, tech.weaken, target);
        entry.weakenApplied = applied;
        entry.weakenStat = applied[0].stat; // 既存BattleLog互換のためトップレベルにも残す
        entry.weakenPct = applied[0].pct;
      }
      if (tech.dot) {
        this._applyDotToTarget(target, tech.dot.power, tech.dot.turns, tech.dot.maxStacks || 99);
        entry.dotApplied = true;
        entry.dotStacks = target.dotStacks;
        // 武器Affix「毒煙の呼吸」：DoT付与時にMP回復
        entry.dotAffixEvents = this.applyEffect('onDot', {});
      }
      // 狩猟王「狩人の印」：Boss/Elite限定のマーク（既存weakenと対になる
      // enemy.vulnerable。マーク中は一律ダメージ増加がcalculateDamage側で乗る）
      if (tech.vulnerable && (!tech.vulnerable.bossEliteOnly || target.boss || target.elite)) {
        target.vulnerable = { pct: tech.vulnerable.pct, turnsLeft: tech.vulnerable.turns };
        entry.marked = true;
      }
      // 忍者「影縫い」・魔法使い「氷槍」：Bossには完全停止を適用しない（弱体化）
      if (tech.stunChance && !(tech.stunExcludesBoss && target.boss) && Math.random() < tech.stunChance) {
        target.frozenTurns = Math.max(target.frozenTurns, tech.stunTurns || 1);
        entry.stunned = true;
      }
      // 密偵「偵察」・語り部「魔物語り」：解析（学者「解析」と同じ情報）を
      // デバフと同時に行う
      if (tech.inspect) {
        entry.inspected = {
          name: target.name, hp: target.hp, maxHp: target.maxHp,
          atk: target.atk, def: target.def, spd: target.spd, boss: target.boss, elite: target.elite,
        };
      }
      result.targets.push(entry);
    }
    // 幻惑の舞姫「幻惑舞」：敵デバフと同時に自分へバフをかける
    if (tech.selfBuff) this._applyBuffPayload(tech.selfBuff, result);
    // バランス再較正（低耐久上級職の生存格差是正）：debuff型技のtelegraphBonus。
    // buff/utility型と違い「弱体化そのものを置き換える」のではなく、敵への
    // 効果はそのままに、Boss予兆が出ている間だけ自己バフを追加で乗せる
    // （元指示2・4番：予兆を見る意味を維持しつつ、職の個性に沿った反応技にする）
    if (tech.telegraphBonus && this._hasActiveTelegraph()) {
      if (tech.telegraphBonus.selfBuff) this._applyBuffPayload(tech.telegraphBonus.selfBuff, result);
      // バランス再較正：他のtelegraphBonus実装（buff/utility型）と同じく、
      // guardOverrideが指定されていればここでguarding=trueを立てる。これが
      // ないと「ぼうぎょ扱い」にならずGUARD_DAMAGE_MULT(0.6)が一切乗らない
      // まま、AIがこの技をぼうぎょの代わりに選んでしまい、素のぼうぎょより
      // 弱い防御になってしまう事故を防ぐ
      if (tech.telegraphBonus.guardOverride) {
        this.player.guarding = true;
        this.player.guardOverrideMult = tech.telegraphBonus.guardOverride.mult;
        this.player.guardOverrideTurns = tech.telegraphBonus.guardOverride.turns;
      }
      result.telegraphBonusApplied = true;
    }
  }

  _resolveTechniqueHeal(tech, result) {
    const healPowerMult = state.jobMasterHealPowerMult();
    const healMult = this.stage.healMult || 1;
    const amount = Math.round(this.player.maxHp * tech.healPct * healPowerMult * healMult + this._effectiveMag() * (tech.healMagRatio || 0));
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
    result.healAmount = amount;
    // ギルドマスター「補給」：Gold消費でHP/MPを同時回復する
    if (tech.mpRestorePct) {
      const mpAmount = Math.round(this.player.maxMp * tech.mpRestorePct);
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpAmount);
      result.mpRestored = mpAmount;
    }
    // プリマ・ディーヴァ「癒しの舞曲」・聖歌隊長/村の癒し手のMASTER技等：
    // 回復と同時にバフをかける（既存_applyBuffPayloadをそのまま再利用）
    if (tech.buff) this._applyBuffPayload(tech.buff, result);
  }

  _setBuff(stat, pct, turns) { this.player.buffs[stat] = { mult: 1 + pct, turnsLeft: turns }; }
  _setAddBuff(key, value, turns) {
    if (key === 'critAdd') this.player.buffs.critAdd = { value: Math.min(value, CAPS_LAYER.CRIT_PCT_MAX), turnsLeft: turns };
    else if (key === 'evasionAdd') this.player.buffs.evasionAdd = { value: Math.min(value, CAPS_LAYER.EVASION_MAX), turnsLeft: turns };
    else if (key === 'regenAdd') this.player.buffs.regenAdd = { value, turnsLeft: turns };
  }

  _applyBuffPayload(b, result) {
    if (!b) return;
    if (b.atkPct) this._setBuff('atk', b.atkPct, b.turns);
    if (b.defPct) this._setBuff('def', b.defPct, b.turns);
    if (b.spdPct) this._setBuff('spd', b.spdPct, b.turns);
    if (b.magPct) this._setBuff('mag', b.magPct, b.turns);
    if (b.critAdd) this._setAddBuff('critAdd', b.critAdd, b.turns);
    if (b.evasionAdd) this._setAddBuff('evasionAdd', b.evasionAdd, b.turns);
    if (b.regenAdd) this._setAddBuff('regenAdd', b.regenAdd, b.turns);
    if (b.goldMultAdd) { this._tempGoldBonus = b.goldMultAdd; this._tempGoldBonusTurns = b.turns; }
    if (b.bossGuardPct) { this.player.guardOverrideMult = 1 - b.bossGuardPct; this.player.guardOverrideTurns = b.turns; }
    if (b.bossDmgAdd) { this._tempBossDmgBonus = b.bossDmgAdd; this._tempBossDmgTurns = b.turns; }
    if (b.dmgBonusAdd) { this._tempDmgBonus = b.dmgBonusAdd; this._tempDmgBonusTurns = b.turns; }
    // 上級職向けに追加した一時ボーナス各種（元指示：どうしても必要なものだけ
    // 汎用status/buff構造へ追加する。いずれも既存の_tempXxx/_tempXxxTurnsと
    // 同じ「turnsで必ず切れる」パターンを踏襲している）
    if (b.armorPenAdd) { this._tempArmorPenBonus = b.armorPenAdd; this._tempArmorPenTurns = b.turns; }
    if (b.goldCostReduceAdd) { this._tempGoldCostReduce = b.goldCostReduceAdd; this._tempGoldCostReduceTurns = b.turns; }
    if (b.dropRateMultAdd) { this._tempDropRateBonus = b.dropRateMultAdd; this._tempDropRateBonusTurns = b.turns; }
    if (b.debuffPowerAdd) { this._tempDebuffPowerBonus = b.debuffPowerAdd; this._tempDebuffPowerBonusTurns = b.turns; }
    if (b.expMultAdd) { this._tempExpBonus = b.expMultAdd; this._tempExpBonusTurns = b.turns; }
    if (b.hybridAtkAdd) { this._tempHybridMagRatio = b.hybridAtkAdd.ratio; this._tempHybridMagTurns = b.hybridAtkAdd.turns; }
    // 魔導技師MASTER「超過駆動」：設置中の自動砲台がある場合だけ威力を底上げする
    if (b.turretPowerAdd && this.player.autoTurret) this.player.autoTurret.power += b.turretPowerAdd;
    result.buffed = true;
  }

  _resolveTechniqueBuff(tech, result) {
    // 農民「根性」・剛力士MASTER「仁王立ち」・鉄農兵MASTER「不屈の農兵」等：
    // HPが低いほど恩恵が大きい（無駄打ちを避けるため、通常時も最低限のbuffは
    // 必ず得られるようにしてある）。lowHpBonus側はatkPct/defPct/guardOverride
    // まで受理できるよう一般化してある
    if (tech.lowHpThreshold != null && tech.lowHpBonus) {
      const hpRatio = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
      if (hpRatio <= tech.lowHpThreshold) {
        if (tech.lowHpBonus.healPct) {
          const amount = Math.round(this.player.maxHp * tech.lowHpBonus.healPct);
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
          result.healAmount = amount;
        }
        this._applyBuffPayload({ atkPct: tech.lowHpBonus.atkPct, defPct: tech.lowHpBonus.defPct, turns: tech.lowHpBonus.turns }, result);
        if (tech.lowHpBonus.guardOverride) {
          this.player.guarding = true;
          this.player.guardOverrideMult = tech.lowHpBonus.guardOverride.mult;
          this.player.guardOverrideTurns = tech.lowHpBonus.guardOverride.turns;
        }
        return;
      }
    }
    // パラディン「聖盾」・巫女「神託」の同型buff版等：Boss予兆が出ている間に
    // 使うと、通常のbuffの代わりに強化版（telegraphBonus）が乗る
    if (tech.telegraphBonus && this._hasActiveTelegraph()) {
      if (tech.telegraphBonus.buff) this._applyBuffPayload(tech.telegraphBonus.buff, result);
      if (tech.telegraphBonus.guardOverride) {
        this.player.guarding = true;
        this.player.guardOverrideMult = tech.telegraphBonus.guardOverride.mult;
        this.player.guardOverrideTurns = tech.telegraphBonus.guardOverride.turns;
      }
      result.telegraphBonusApplied = true;
      if (tech.haste) { this._hasteInitiativeBonus = tech.haste.power; this._hasteInitiativeTurns = tech.haste.turns; }
      return;
    }
    this._applyBuffPayload(tech.buff, result);
    if (tech.haste) { this._hasteInitiativeBonus = tech.haste.power; this._hasteInitiativeTurns = tech.haste.turns; }
  }

  _resolveTechniqueUtility(tech, result) {
    // 巫女MASTER「神託」等（utility型のtelegraphBonus）：Boss予兆が出ている
    // 間に使うと通常のguardOverride/buffの代わりに強化版が乗る
    if (tech.telegraphBonus && this._hasActiveTelegraph()) {
      if (tech.telegraphBonus.guardOverride) {
        this.player.guarding = true;
        this.player.guardOverrideMult = tech.telegraphBonus.guardOverride.mult;
        this.player.guardOverrideTurns = tech.telegraphBonus.guardOverride.turns;
      }
      if (tech.telegraphBonus.buff) this._applyBuffPayload(tech.telegraphBonus.buff, result);
      result.telegraphBonusApplied = true;
    } else {
      if (tech.guardOverride) {
        this.player.guarding = true;
        this.player.guardOverrideMult = tech.guardOverride.mult;
        this.player.guardOverrideTurns = tech.guardOverride.turns;
      }
      if (tech.buff) this._applyBuffPayload(tech.buff, result);
    }
    if (tech.tempEffect) this._addTempEffect(tech.tempEffect.effect, tech.tempEffect.turns);
    // パラディン「癒しの反撃」：カウンター＋回復を同時に一時付与する等、
    // 複数effectを同時に付与したい場合はtempEffects（配列）を使う
    if (tech.tempEffects) for (const te of tech.tempEffects) this._addTempEffect(te.effect, te.turns);
    // 賢者MASTER「連続詠唱」：次のspell1回を2回発動させる予約
    if (tech.armDoubleCast) this._doubleCastArmed = true;
    // パラディンMASTER「不落の誓い」：致死ダメージを1戦1回だけ耐える権利を起動
    if (tech.deathGuard) this._paladinDeathGuardArmed = true;
    // トレジャーハンター「発掘」・大商人「市場支配」：戦闘クリア時の追加報酬を予約
    if (tech.bonusRewardArm) this._battleEndBonusReward = { goldPct: tech.bonusRewardArm.goldPct, dropChance: tech.bonusRewardArm.dropChance };
    // トレジャーハンターMASTER「大発見」：既存_rollDrop()のみを使うため
    // Boss固有武器・初回クリア報酬（別経路）は対象外
    if (tech.instantDropRoll && Math.random() < tech.instantDropRoll.chance) {
      const dropInfo = this._rollDrop();
      if (dropInfo) result.instantDrop = dropInfo;
    }
    // 魔導技師「自動砲台」：設置（既存の一時効果と同じturns管理）
    if (tech.autoTurretArm) this.player.autoTurret = { power: tech.autoTurretArm.power, turnsLeft: tech.autoTurretArm.turns };
    result.utility = true;
  }

  // 盗賊「盗む」：同一敵からの連続窃盗を防ぐため、_stolenEnemyIdsで1戦/1敵に
  // 制限する（既存の_rollDrop・stateのGold加算をそのまま再利用する）
  _resolveTechniqueSteal(tech, targetId, result) {
    const target = this._pickTarget(targetId);
    if (!target) { result.noTarget = true; return; }
    if (this._stolenEnemyIds.has(target.id)) { result.alreadyStolen = true; return; }
    this._stolenEnemyIds.add(target.id);
    const goldGain = Math.max(1, Math.round(target.gold * (tech.stealGoldMult || 1.5)));
    state.gainGold(goldGain);
    this.runGold += goldGain;
    result.stolenGold = goldGain;
    if (Math.random() < (tech.stealDropChance || 0.25)) {
      const dropInfo = this._rollDrop();
      if (dropInfo) result.stolenItem = dropInfo;
    }
  }

  // 学者「解析」：敵のステータスをログに表示するだけの情報技（Bossにも有効）
  _resolveTechniqueInspect(tech, targetId, result) {
    const target = this._pickTarget(targetId);
    if (!target) { result.noTarget = true; return; }
    result.inspected = {
      name: target.name, hp: target.hp, maxHp: target.maxHp,
      atk: target.atk, def: target.def, spd: target.spd, boss: target.boss, elite: target.elite,
    };
  }

  // 錬金術師「起爆」：対象の現在のDoT（burnStack）を消費してボーナスダメージを与える
  _resolveTechniqueBurst(tech, targetId, result, kind) {
    const target = this._pickTarget(targetId);
    if (!target) { result.noTarget = true; return; }
    // 幻術師MASTER「幻毒爆」：stackSource:'debuffCount'でDoTだけでなく
    // weakenの本数も合算できるよう一般化した（既定'dot'は錬金術師「起爆」と
    // 完全に同じ挙動のまま）
    const stacks = tech.stackSource === 'debuffCount'
      ? (target.dotStacks || 0) + (target.weaken ? Object.keys(target.weaken).length : 0)
      : (target.dotStacks || 0);
    const atkValue = this._effectiveAtk() * (tech.power + stacks * (tech.stackPowerMult || 0.5)) * this._mainDmgMult(kind);
    const { damage, critical } = this.calculateDamage(atkValue, target);
    const hit = this._applyDamageToEnemy(target, damage, critical);
    target.dotStacks = 0; target.dotTurnsLeft = 0;
    if (tech.stackSource === 'debuffCount') target.weaken = {};
    result.targets.push({
      targetId: target.id, targetName: target.name, damage, critical, defeated: target.dead,
      effects: hit.effects, kill: hit.kill, consumedStacks: stacks,
    });
  }

  // 僧侶「浄化」：現状プレイヤーへweaken/DoTを与える敵手段は存在しないため、
  // 空のnegativeStatusをクリアするだけの将来拡張向けスキャフォールドとして動作する
  _resolveTechniqueCleanse(tech, result) {
    this.player.negativeStatus = { weaken: {}, dotStacks: 0, dotTurnsLeft: 0 };
    result.cleansed = true;
  }

  // 技（大工「反撃」等）が付与する一時的なonHit/onCrit/onHurt/onKill効果。
  // 既存の装備固有効果（_applyOneEffect）と全く同じ形のオブジェクトを
  // this.effectsへ一時的に追加するだけなので、新しい発動経路を作らずに
  // 既存のcounter等をそのまま再利用できる。
  _addTempEffect(effObj, turns) {
    this.effects.push({ ...effObj, __tempTurnsLeft: turns });
  }

  _playerGuard() {
    this.player.guarding = true;
    // 武器Affix（Part A）：ぼうぎょ成功時に発動するonGuardトリガー
    const guardEvents = this.applyEffect('onGuard', {});
    return { action: 'guard', guardEvents };
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
    const chance = clamp(0.5 + (this._effectiveSpd() - avgEnemySpd) * 0.01 - stagePenalty, 0.1, 0.9);
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
      // 武器Affix（Part A）proc暴走防止：perActionCapを持つ効果は、
      // 1プレイヤーアクション（通常攻撃/とくぎ/じゅもん1回）につき最大N回
      // までしか発動しない。multi-hit通常攻撃・拳聖等の連撃でonHit/onCritが
      // 何度も呼ばれても、同じAffixが際限なく積み重ならないようにする
      // （performPlayerAction()で1アクションごとにカウンタをリセットする）
      if (eff.perActionCap) {
        const key = eff.__affixId || eff.kind;
        const used = this._actionProcCounts[key] || 0;
        if (used >= eff.perActionCap) continue;
        this._actionProcCounts[key] = used + 1;
      }
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
      // Build Affix「血刃」：HPが閾値以下の間だけLifestealが上乗せされる
      // （既存lifestealと同じLIFESTEAL_PCT_MAX上限を共有する）
      if (eff.kind === 'lifestealLowHp' && this._hpRatio() <= eff.hpThreshold) {
        const allowed = Math.max(0, CAPS_LAYER.LIFESTEAL_PCT_MAX - (ctx.lifestealUsed || 0));
        const applied = Math.min(eff.power, allowed);
        ctx.lifestealUsed = (ctx.lifestealUsed || 0) + applied;
        const healed = Math.round(dmg * applied);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healed);
        return { kind: 'lifestealLowHp', amount: healed };
      }
      // 武器Affix「呪毒の刃」：hit時低確率でDoTを付与する
      if (eff.kind === 'hitApplyDot' && !target.dead) {
        this._applyDotToTarget(target, eff.power, eff.dotTurns || 3, eff.maxStacks || 3);
        return { kind: 'hitApplyDot', stacks: target.dotStacks };
      }
      // Build Affix「千刃」：multi-hit通常攻撃/連撃技の最後の一撃にだけ
      // 追加ダメージを乗せる（ctx.hitIndex/ctx.hitsTotalが渡されない
      // 呼び出し元では単発とみなしそのまま発動する）
      if (eff.kind === 'lastHitBonus' && !target.dead) {
        const isLast = ctx.hitsTotal == null || ctx.hitIndex === ctx.hitsTotal - 1;
        if (!isLast) return null;
        const bonus = Math.round(dmg * eff.power);
        const kill = this._applyRawDamageAndReward(target, bonus);
        return { kind: 'lastHitBonus', amount: bonus, targetName: target.name, targetDead: target.dead, kill };
      }
      if (eff.kind === 'burnDamage' && !target.dead) {
        const burn = Math.round(this.player.atk * eff.power);
        const kill = this._applyRawDamageAndReward(target, burn);
        return { kind: 'burnDamage', amount: burn, targetName: target.name, targetDead: target.dead, kill };
      }
      if (eff.kind === 'bloodChalice') {
        this._bloodChaliceBonus = eff.power;
        this._bloodChaliceTurns = roundsFromSeconds(eff.duration);
        return { kind: 'bloodChalice' };
      }
      if (eff.kind === 'weaken' && !target.dead) {
        this._applyWeakenToTarget(target, eff.stat, eff.power, roundsFromSeconds(eff.duration));
        return { kind: 'weaken', stat: eff.stat };
      }
      if (eff.kind === 'burnStack' && !target.dead) {
        // ChatGPTレビュー指摘4番：durationをそのままroundsFromSeconds()に
        // 通すと「何ラウンド居座るか」であって「何回tickするか」ではなく
        // なってしまう（実時間ではtickInterval=1秒毎、duration=3〜4秒＝
        // 3〜4回tickしていたのに、roundsFromSeconds(3〜4)は1ラウンドにしか
        // ならず、1ラウンド1tickの本実装では合計tick数が実時間の1/3〜1/4に
        // 減ってしまっていた）。「1ラウンドにつき1tick」という分かりやすい
        // ターン制の運用は保ったまま、tick回数（=dotTurnsLeft）自体を
        // duration/tickIntervalの実時間tick総数で決めることで、1tickあたりの
        // 威力（dotPower）は変えずに合計期待ダメージを実時間相当に保つ。
        const turns = Math.max(1, Math.round(eff.duration / (eff.tickInterval || TEXT_BATTLE_LAYER.SECONDS_PER_ROUND)));
        this._applyDotToTarget(target, eff.power, turns, eff.maxStacks);
        return { kind: 'burnStack', stacks: target.dotStacks };
      }
      if (eff.kind === 'everyNHits' && !target.dead) {
        this._hitCounters[eff.id] = (this._hitCounters[eff.id] || 0) + 1;
        if (this._hitCounters[eff.id] % eff.n === 0) {
          const burst = Math.round(this.player.atk * eff.power);
          if (eff.aoe) {
            const hits = [];
            const kills = [];
            for (const e of this.aliveEnemies) {
              const kill = this._applyRawDamageAndReward(e, burst);
              hits.push(e.name);
              if (kill) kills.push({ name: e.name, kill });
            }
            return { kind: 'everyNHits', amount: burst, aoe: true, hits, kills };
          }
          const kill = this._applyRawDamageAndReward(target, burst);
          return { kind: 'everyNHits', amount: burst, aoe: false, targetName: target.name, targetDead: target.dead, kill };
        }
        return null;
      }
    } else if (trigger === 'onCrit') {
      const { target } = ctx;
      if (eff.kind === 'lightning' && !target.dead) {
        const bolt = Math.round(this.player.atk * eff.power);
        const kill = this._applyRawDamageAndReward(target, bolt);
        return { kind: 'lightning', amount: bolt, targetName: target.name, targetDead: target.dead, kill };
      }
      if (eff.kind === 'timeStop' && !target.dead) {
        target.frozenTurns = Math.max(target.frozenTurns, roundsFromSeconds(eff.duration));
        return { kind: 'timeStop' };
      }
      // 武器Affix「会心の癒し」「会心の閃き」「魔力循環」（Build強化型込み）
      if (eff.kind === 'healOnCrit') {
        const healed = Math.round(this.player.maxHp * eff.power);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healed);
        return { kind: 'healOnCrit', amount: healed };
      }
      if (eff.kind === 'mpOnCrit') {
        const restored = Math.round(this.player.maxMp * eff.power);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + restored);
        return { kind: 'mpOnCrit', amount: restored };
      }
      // 武器Affix「会心の連撃」：会心時に低確率で追撃（perActionCapで暴走防止済み）
      if (eff.kind === 'critExtraAttack' && !target.dead) {
        const atkValue = this._effectiveAtk() * eff.power;
        const { damage } = this.calculateDamage(atkValue, target, { noBossMult: false });
        const hit = this._applyDamageToEnemy(target, damage, false);
        return { kind: 'critExtraAttack', amount: damage, targetName: target.name, targetDead: target.dead, kill: hit.kill };
      }
      // 武器Affix「会心の高揚」「会心の踏込」：会心時に短時間の自己バフ
      if (eff.kind === 'critAtkBuff') { this._applyBuffPayload({ atkPct: eff.power, turns: eff.turns }, {}); return { kind: 'critAtkBuff' }; }
      if (eff.kind === 'critSpdBuff') { this._applyBuffPayload({ spdPct: eff.power, turns: eff.turns }, {}); return { kind: 'critSpdBuff' }; }
    } else if (trigger === 'onHurt') {
      const { attacker } = ctx;
      if (eff.kind === 'counter' && attacker && !attacker.dead) {
        const counterDmg = Math.round(this.player.atk * eff.power);
        const kill = this._applyRawDamageAndReward(attacker, counterDmg);
        return { kind: 'counter', amount: counterDmg, targetName: attacker.name, targetDead: attacker.dead, kill };
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
        const kills = [];
        for (const e of this.aliveEnemies) {
          if (e === enemy) continue;
          const kill = this._applyRawDamageAndReward(e, nova);
          hits.push(e.name);
          if (kill) kills.push({ name: e.name, kill });
        }
        return { kind: 'deathNova', amount: nova, hits, kills };
      }
      // 語り部「勝利の物語」：撃破時に短時間の自己バフが自動発動する
      // （既存の_addTempEffectでonKillトリガーへ一時付与された効果を、
      // 通常のonKillディスパッチ経路でそのまま処理するだけの薄い追加）
      if (eff.kind === 'selfBuffOnKill') {
        this._applyBuffPayload(eff.buffPayload, {});
        return { kind: 'selfBuffOnKill' };
      }
      // 武器Affix「喰らいし刃」「魂の残滓」：撃破時にHP/MPを回復する
      if (eff.kind === 'healOnKill') {
        const healed = Math.round(this.player.maxHp * eff.power);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healed);
        return { kind: 'healOnKill', amount: healed };
      }
      if (eff.kind === 'mpOnKill') {
        const restored = Math.round(this.player.maxMp * eff.power);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + restored);
        return { kind: 'mpOnKill', amount: restored };
      }
    } else if (trigger === 'onEvade') {
      // 剣豪「見切り」・鉄農兵系：回避に成功した瞬間の反撃（既存counterと
      // 同じ計算式を、新しいトリガー名onEvadeで発火させるだけ）
      const { attacker } = ctx;
      if (eff.kind === 'counter' && attacker && !attacker.dead) {
        const counterDmg = Math.round(this.player.atk * eff.power);
        const kill = this._applyRawDamageAndReward(attacker, counterDmg);
        return { kind: 'counter', amount: counterDmg, targetName: attacker.name, targetDead: attacker.dead, kill };
      }
      // 武器Affix「見切りの心得」：回避成功後、短時間Critが上がる
      if (eff.kind === 'evadeCritBuff') {
        this._applyBuffPayload({ critAdd: eff.power, turns: eff.turns }, {});
        return { kind: 'evadeCritBuff' };
      }
    } else if (trigger === 'onGuard') {
      // 武器Affix「守りの心得」「静寂の呼吸」「受けの構え」「鉄の復讐」：
      // ぼうぎょ成功時に発動する（_playerGuard()から呼ばれる新規trigger）
      if (eff.kind === 'healOnGuard') {
        const healed = Math.round(this.player.maxHp * eff.power);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healed);
        return { kind: 'healOnGuard', amount: healed };
      }
      if (eff.kind === 'mpOnGuard') {
        const restored = Math.round(this.player.maxMp * eff.power);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + restored);
        return { kind: 'mpOnGuard', amount: restored };
      }
      if (eff.kind === 'guardNextAtkBuff') {
        this._tempAtkBonus = eff.power; this._tempAtkTurns = 1;
        return { kind: 'guardNextAtkBuff' };
      }
      // Build Affix「鉄の復讐」：次に被弾した瞬間だけ反撃する一時効果を積む
      // （既存の技tempEffect＝_addTempEffectと全く同じ仕組みを再利用）
      if (eff.kind === 'guardCounter') {
        this._addTempEffect({ trigger: 'onHurt', kind: 'counter', power: eff.power }, 1);
        return { kind: 'guardCounter' };
      }
    } else if (trigger === 'onDot') {
      // 武器Affix「毒煙の呼吸」：DoT付与時にMP回復
      if (eff.kind === 'mpOnDot') {
        const restored = Math.round(this.player.maxMp * eff.power);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + restored);
        return { kind: 'mpOnDot', amount: restored };
      }
    }
    return null;
  }

  _checkActionDiversityBurst(result) {
    const eff = this._effectsOf('passive').find((e) => e.kind === 'actionDiversityBurst');
    if (!eff || this._actionTypesUsed.size < 2) return; // ターン制では通常攻撃/とくぎの2種のみ運用
    const dmg = Math.round(this.player.atk * eff.power);
    const hits = [];
    const kills = [];
    for (const e of this.aliveEnemies) {
      const kill = this._applyRawDamageAndReward(e, dmg);
      hits.push(e.name);
      if (kill) kills.push({ name: e.name, kill });
    }
    result.actionDiversityBurst = { amount: dmg, hits, kills };
    this._actionTypesUsed.clear();
  }

  // dmgを与え、生きていればonHit/（criticalなら）onCrit系固有効果を適用する。
  // 1hitぶんの結果をまとめて返す（ChatGPTレビュー指摘1番：multi-hitは
  // このメソッドを1hitごとに呼び出すことで、1hit単位のonHit/onCrit発火・
  // lifesteal上限を成立させる。criticalは呼び出し側がそのhitの会心判定
  // 結果を明示的に渡す＝以前参照していた未初期化のthis.lastHitCritは廃止）。
  // hitIndex/hitsTotal（Build Affix「千刃」用）：multi-hit呼び出し元だけが
  // 渡す。省略時（他の全呼び出し）は単発扱いとしてlastHitBonusが素直に発動する
  _applyDamageToEnemy(target, dmg, critical = false, hitIndex = null, hitsTotal = null) {
    const killResult = this._applyRawDamageAndReward(target, dmg);
    const hitEvents = this.applyEffect('onHit', { target, dmg, lifestealUsed: 0, hitIndex, hitsTotal });
    const critEvents = critical ? this.applyEffect('onCrit', { target }) : [];
    return {
      damage: dmg, targetId: target.id, targetName: target.name, defeated: target.dead,
      effects: [...hitEvents, ...critEvents], kill: killResult,
    };
  }

  // 通常攻撃・スキル以外の経路（DoT/AoE/追撃/deathNova等）で敵を倒しても、
  // 必ず一度だけ撃破処理（EXP/Gold/Drop/onKill）に到達させるための共通処理
  // （ChatGPTレビュー指摘2番）。enemy._rewardsGranted（_grantKillRewards内で
  // 立てる）により、同じ敵への複数の経路からの呼び出しでも報酬の二重取得は
  // 発生しない。
  _applyRawDamageAndReward(enemy, dmg) {
    this._applyRawDamage(enemy, dmg);
    if (enemy.dead && !enemy._rewardsGranted) return this._grantKillRewards(enemy);
    return null;
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
    // 武器Affix（Part A）：深淵深度・Elite・Boss討伐でAffix品質が少し上がる
    const dropCtx = { depth: this.stage.isAbyss ? (this.stage.abyssDepth || 0) : 0, elite: !!enemy.elite, boss: !!enemy.boss };
    const drops = [];
    const dropInfo = this._rollDrop(dropCtx); if (dropInfo) drops.push(dropInfo);
    const weaponDropInfo = this._rollWeaponDrop(dropCtx); if (weaponDropInfo) drops.push(weaponDropInfo);
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
      const bossWeaponDrop = this._rollBossWeaponDrop(dropCtx);
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
    // 商人「商魂」・農民「大収穫」：戦闘中の一時的なGold獲得ボーナス
    if (this._tempGoldBonusTurns > 0) m *= (1 + this._tempGoldBonus);
    // 武器Affix「商才」
    m *= 1 + sumPassivePower(this.effects, 'goldMultAdd');
    return m;
  }
  _expMult() {
    let m = this.blessing && this.blessing.kind === 'expMult' ? 1 + this.blessing.power : 1;
    if (this.stage.isAbyss && this.stage.boss) m *= state.abyssBossFloorRewardMult();
    // 語り部「伝説の一節」：数ターンの経験値取得ボーナス
    if (this._tempExpBonusTurns > 0) m *= (1 + this._tempExpBonus);
    // 武器Affix「習熟の心得」
    m *= 1 + sumPassivePower(this.effects, 'expMultAdd');
    return m;
  }
  // トレジャーハンター「目利き」・大商人「鑑定眼」：戦闘中だけドロップ率を
  // 底上げする一時ボーナス（既存のstate.dropRateMult()等・永続進行度は変更しない）。
  // 武器Affix「幸運」も同じ「戦闘中だけの掛け算ボーナス」枠に合流させる
  _dropChanceBonusMult() {
    let m = this._tempDropRateBonusTurns > 0 ? (1 + this._tempDropRateBonus) : 1;
    m *= 1 + sumPassivePower(this.effects, 'dropRateMultAdd');
    return m;
  }

  _rollWeaponDrop(dropCtx) {
    if (Math.random() > WEAPON_CODEX_LAYER.DROP_CHANCE * state.dropRateMult() * this._dropChanceBonusMult()) return null;
    const pool = weaponDropPoolForStage(this.stage);
    if (pool.length === 0) return null;
    const totalW = pool.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalW;
    for (const d of pool) {
      r -= d.weight;
      if (r <= 0) {
        const isNew = state.addItem(d.itemId, 1, dropCtx);
        this.runItems.push(d.itemId);
        return this._describeDrop(d.itemId, isNew, state.consumeLastWeaponInstanceId());
      }
    }
    return null;
  }

  _rollBossWeaponDrop(dropCtx) {
    if (this._bossWeaponDropped || !this.chapter) return null;
    const bossWeapon = bossWeaponForChapter(this.chapter.id);
    if (!bossWeapon) return null;
    if (Math.random() > WEAPON_CODEX_LAYER.BOSS_WEAPON_DROP_CHANCE) return null;
    this._bossWeaponDropped = true;
    const isNew = state.addItem(bossWeapon.id, 1, dropCtx);
    this.runItems.push(bossWeapon.id);
    return this._describeDrop(bossWeapon.id, isNew, state.consumeLastWeaponInstanceId());
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

  _rollDrop(dropCtx) {
    const table = this.stage.dropTable || [];
    if (table.length === 0) return null;
    const abyssMult = this.stage.isAbyss ? (this.stage.dropMult || 1) * state.abyssDropRateMult() : 1;
    const chance = ECONOMY.BASE_DROP_CHANCE * state.dropRateMult() * abyssMult * this._dropChanceBonusMult();
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
        const isNew = state.addItem(d.itemId, 1, dropCtx);
        this.runItems.push(d.itemId);
        return this._describeDrop(d.itemId, isNew, state.consumeLastWeaponInstanceId());
      }
    }
    return null;
  }

  // instanceId（武器Affix・Part A）：武器ドロップの場合だけ渡される。
  // Legendary以上のAffixを含む場合はhasRareAffixを立て、画面側のログ演出
  // （元指示「レアAffix演出」）が参照できるようにする
  _describeDrop(itemId, isNew, instanceId) {
    const item = getItem(itemId);
    if (item) {
      const affixes = instanceId ? state.weaponInstanceAffixes(instanceId) : [];
      return {
        itemId, name: item.name, rarity: item.rarity, isNew, isBossWeapon: !!item.isBossWeapon,
        instanceId: instanceId || null, affixCount: affixes.length,
        hasRareAffix: hasRareAffix(affixes), highestAffixRarity: highestAffixRarity(affixes),
      };
    }
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
    if (Math.random() < this._effectiveEvasion()) {
      const evadeEvents = this._onPlayerEvaded(enemy);
      return { enemyId: enemy.id, name: enemy.name, kind: 'attack', evaded: true, evadeEvents };
    }
    const dmg = this._enemyAttackDamage(enemyAtk);
    this.player.hp -= dmg;
    const hurtEvents = this.applyEffect('onHurt', { attacker: enemy });
    return { enemyId: enemy.id, name: enemy.name, kind: 'attack', damage: dmg, evaded: false, hurtEvents };
  }

  // 剣豪「見切り」・怪盗MASTER「背後の一撃」・幻惑の舞姫MASTER「夢幻乱舞」：
  // 回避成功を検知する3箇所（通常敵・Boss通常攻撃・Boss特殊攻撃）で共通に呼ぶ
  _onPlayerEvaded(attacker) {
    this._playerEvadedLastRound = true;
    this._playerEvasionCount = (this._playerEvasionCount || 0) + 1;
    return this.applyEffect('onEvade', { attacker });
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

    // 新規の特殊攻撃を予兆する／雑魚を召喚する／通常攻撃する、の判定。
    // ------------------------------------------------------------
    // バランス再較正（元指示：Boss手番の優先度競合によるstarvation防止）：
    // 旧実装はslam→charge→projectile→summonの順に「早い者勝ち」で判定して
    // おり、どれか1つが自分のカウンタを0にした瞬間に即returnしていた。
    // slamが最短間隔（約2ラウンド）のため最も頻繁に条件を満たし、その度に
    // charge/projectile/summon側のカウンタ判定そのものへ処理が到達しなくなる
    // （早期returnで後続のif文が実行されない＝後続の技は「順番待ちで減り
    // 続ける」だけになり、20手番中でも滅多に順番が回ってこない：実測で
    // summonが5章Bossの20手番中0回だった）。
    // 修正：まず全ての技のカウンタを毎回必ず減算し、「準備完了(<=0)」に
    // なった技を全て集めてから、直前に使った技を除外した上で乱数選択する
    // （どれも準備完了していなければ通常攻撃）。選ばれなかった準備完了済みの
    // 技はカウンタをリセットしない＝次の判定機会でも引き続き候補に残るため、
    // 取りこぼされない。同じ技の連続使用も（他に選択肢がある限り）避ける。
    const phaseMult = enemy.aiPhase === 2 ? BOSS_AI_LAYER.PHASE2_ATTACK_INTERVAL_MULT : 1;
    const readyMoves = [];
    if (enemy.slamTurns != null) { enemy.slamTurns--; if (enemy.slamTurns <= 0) readyMoves.push('slam'); }
    if (enemy.chargeTurns != null) { enemy.chargeTurns--; if (enemy.chargeTurns <= 0) readyMoves.push('charge'); }
    if (enemy.projectileTurns != null) { enemy.projectileTurns--; if (enemy.projectileTurns <= 0) readyMoves.push('projectile'); }
    if (enemy.summonTurns != null) { enemy.summonTurns--; if (enemy.summonTurns <= 0) readyMoves.push('summon'); }
    if (readyMoves.length > 0) {
      let candidates = readyMoves;
      if (readyMoves.length > 1 && enemy._lastMoveKind) {
        const withoutLast = readyMoves.filter((k) => k !== enemy._lastMoveKind);
        if (withoutLast.length > 0) candidates = withoutLast;
      }
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      enemy._lastMoveKind = chosen;
      if (chosen === 'summon') {
        enemy.summonTurns = Math.max(1, Math.round(roundsFromSeconds(BOSS_AI_LAYER.SUMMON_INTERVAL_SEC) * phaseMult));
        return this._bossSummon(enemy, justPhased);
      }
      return this._startBossTelegraph(enemy, chosen, phaseMult, justPhased);
    }

    // 通常攻撃
    const enemyAtk = this._effectiveEnemyStat(enemy, 'atk');
    if (Math.random() < this._effectiveEvasion()) {
      const evadeEvents = this._onPlayerEvaded(enemy);
      return { enemyId: enemy.id, name: enemy.name, kind: 'attack', evaded: true, phased: justPhased, evadeEvents };
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
    if (Math.random() < this._effectiveEvasion()) {
      const evadeEvents = this._onPlayerEvaded(enemy);
      return { enemyId: enemy.id, name: enemy.name, kind: 'special', specialKind: kind, evaded: true, phased: !!justPhased, evadeEvents };
    }
    const dmg = this._enemyAttackDamage(enemyAtk, { mult: multByKind[kind] });
    this.player.hp -= dmg;
    const hurtEvents = this.applyEffect('onHurt', { attacker: enemy });
    return { enemyId: enemy.id, name: enemy.name, kind: 'special', specialKind: kind, damage: dmg, evaded: false, hurtEvents, phased: !!justPhased };
  }

  // Boss AI「雑魚召喚」（元指示7番：summon）：現在の遭遇グループへ手下を
  // 追加する。報酬インフレを避けるためxp/goldは与えない（元battle.jsと同じ）。
  // バランス再較正：Boss手番のstarvation修正により、これまで滅多に選ばれな
  // かったsummonが定期的に発動するようになったため、長引いたBoss戦で手下が
  // 際限なく積み上がらないよう同時召喚数の上限を設ける（元指示：6〜8体）。
  _bossSummon(enemy, justPhased) {
    const added = [];
    const aliveNonBoss = this.enemies.filter((e) => !e.dead && !e.boss).length;
    const room = Math.max(0, BOSS_AI_LAYER.SUMMON_MAX_ALIVE - aliveNonBoss);
    const spawnCount = Math.min(BOSS_AI_LAYER.SUMMON_COUNT, room);
    for (let i = 0; i < spawnCount; i++) {
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
    // 上限に達していて1体も召喚できなかった場合は、召喚を試みたが増援が
    // 間に合わなかった、という体裁にする（BattleLog側でaddedが空の分岐を用意）
    return { enemyId: enemy.id, name: enemy.name, kind: 'summon', added, capped: spawnCount === 0, phased: !!justPhased };
  }

  // ---------------------------------------------------------
  // ラウンド進行（advanceTurn）：先攻/後攻の決定→プレイヤー行動→敵の手番→
  // ラウンド終了処理（DoT・バフ/デバフのターン経過・戦闘終了判定）
  // 元指示5番：initiative = spd + 小さな乱数、でシンプルに先攻/後攻を決める。
  // ---------------------------------------------------------
  advanceTurn(command) {
    const events = [];
    this.round++;
    // 怪盗MASTER「背後の一撃」等：直前の敵手番の回避判定は毎ラウンド持ち越さない
    // （このラウンドの敵手番でまた立て直る。playerFirstかどうかで「前ラウンド」
    // 「同ラウンド」いずれの回避も拾えるようここでリセットする）
    this._playerEvadedLastRound = false;

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

    // とくぎ・じゅもんは、MP不足/クールダウン中/未習得で実行そのものが
    // 成立しない場合、にげるのBoss不可判定と同じく「行動選択自体が無効」
    // として扱い、ラウンドを消費しない（元指示：MP不足の場合はターンを
    // 消費しない仕様を推奨）。実行できる場合は、下の先攻/後攻ロジックに
    // そのまま合流させる（performPlayerAction→_playerTechnique()が
    // 実際の消費・効果適用を行う）。
    let preResolvedPlayerResult = null;
    if (command.type === 'skill' || command.type === 'spell') {
      const probe = this._probeTechnique(command.type, command.techId);
      if (!probe.ok) {
        const result = { action: command.type, blocked: true, reason: probe.reason };
        events.push({ type: 'playerAction', result });
        return { events, over: false };
      }
      // ガードと全く同じ理由で、自己対象のbuff/utility技（挑発・不屈の構え・
      // 受け流し・要塞化・魔力集中・鼓舞の歌等）は、先攻/後攻の判定結果に
      // 関わらずこのラウンドの敵行動解決より前に実行しておく必要がある。
      // でなければ、敵が先攻の場面で「防御系とくぎを選んだのに同じラウンドの
      // 敵攻撃を防げない」という、ぼうぎょで既に修正済みのバグと同じ問題が
      // 受け流し・要塞化等でも再発する（実測：guardedDamageが軽減されない
      // 不具合として発覚）。
      if (probe.tech.target === 'self' && (probe.tech.type === 'buff' || probe.tech.type === 'utility')) {
        preResolvedPlayerResult = this.performPlayerAction(command);
        events.push({ type: 'playerAction', result: preResolvedPlayerResult });
      }
    }

    // ガードは「このラウンドに飛んでくる敵の攻撃を軽減する」ためのコマンドなので、
    // 先攻/後攻の判定結果に関わらず、このラウンドの敵行動解決より前に有効化しておく
    // 必要がある。旧実装ではperformPlayerAction経由の_playerGuard()でしか
    // guarding=trueにしておらず、敵が先攻（プレイヤーよりSPDが低い場面）の場合に
    // 「ガードを選んだのに同じラウンドの敵攻撃を防げない」バグがあった
    // （3章のtank系敵での検証で発覚）。
    if (command.type === 'guard') this.player.guarding = true;

    const playerInitiative = this._effectiveSpd() + this._hasteInitiativeBonus + rand(0, 8);
    const alive = this.aliveEnemies;
    const enemyInitiative = (alive.reduce((s, e) => s + e.spd, 0) / Math.max(1, alive.length)) + rand(0, 8);
    const playerFirst = playerInitiative >= enemyInitiative;
    // 剣豪「居合」・密偵「奇襲」等：このラウンド先攻したかを技解決側から読めるようにする
    this._lastPlayerFirst = playerFirst;

    const runPlayer = () => {
      if (preResolvedPlayerResult) return preResolvedPlayerResult; // 既に実行済み（二重実行防止）
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
      // 狩猟王「狩人の印」：既存weakenと同じturns管理のマーク
      if (enemy.vulnerable && enemy.vulnerable.turnsLeft > 0) {
        enemy.vulnerable.turnsLeft--;
        if (enemy.vulnerable.turnsLeft <= 0) enemy.vulnerable = null;
      }
      if (enemy.dotStacks > 0 && enemy.dotTurnsLeft > 0) {
        // 武器Affix「毒手」：DoT Damage+
        const dotDmgMult = 1 + sumPassivePower(this.effects, 'dotDmg');
        const dmg = Math.max(1, Math.round(this.player.atk * enemy.dotPower * enemy.dotStacks * dotDmgMult));
        // ChatGPTレビュー指摘2番：DoT撃破も他の経路と同じ共通処理へ統一する
        const kill = this._applyRawDamageAndReward(enemy, dmg);
        events.push({ type: 'dotTick', enemyId: enemy.id, name: enemy.name, amount: dmg, targetDead: enemy.dead, kill });
        enemy.dotTurnsLeft--;
        if (enemy.dotTurnsLeft <= 0) enemy.dotStacks = 0;
      }
    }
    // player.buffsの汎用構造（元指示：どうしても必要な汎用status構造）：
    // ステータスごとに独立したターン経過。旧buffAtkMult/buffDefMult/
    // buffTurns（ATK・DEFが1本のタイマーで連動していた）はこれに統合した。
    for (const key of Object.keys(this.player.buffs)) {
      const b = this.player.buffs[key];
      if (b.turnsLeft > 0) {
        b.turnsLeft--;
        if (b.turnsLeft <= 0) { b.mult = 1; b.value = 0; }
      }
    }
    if (this.player.guardOverrideTurns > 0) {
      this.player.guardOverrideTurns--;
      if (this.player.guardOverrideTurns <= 0) this.player.guardOverrideMult = null;
    }
    if (this._bloodChaliceTurns > 0) this._bloodChaliceTurns--;
    if (this._tempAtkTurns > 0) this._tempAtkTurns--;
    if (this._hasteInitiativeTurns > 0) { this._hasteInitiativeTurns--; if (this._hasteInitiativeTurns <= 0) this._hasteInitiativeBonus = 0; }
    if (this._tempGoldBonusTurns > 0) this._tempGoldBonusTurns--;
    if (this._tempBossDmgTurns > 0) this._tempBossDmgTurns--;
    if (this._tempDmgBonusTurns > 0) this._tempDmgBonusTurns--;
    // 上級職向けに追加した一時ボーナス各種のターン経過（既存パターンと同型）
    if (this._tempGoldCostReduceTurns > 0) this._tempGoldCostReduceTurns--;
    if (this._tempDropRateBonusTurns > 0) this._tempDropRateBonusTurns--;
    if (this._tempDebuffPowerBonusTurns > 0) this._tempDebuffPowerBonusTurns--;
    if (this._tempExpBonusTurns > 0) this._tempExpBonusTurns--;
    if (this._tempArmorPenTurns > 0) this._tempArmorPenTurns--;
    if (this._tempHybridMagTurns > 0) this._tempHybridMagTurns--;
    // 魔導技師「自動砲台」：ラウンド終了時に1回だけ自動で追撃する（既存の
    // calculateDamage/_applyRawDamageAndRewardをそのまま呼ぶだけの軽量tick。
    // DoT tick等と同様、onHit/onCritは発火させない＝「命中」ではなく設置物の
    // 自動着弾という扱いにしてある）
    if (this.player.autoTurret && this.player.autoTurret.turnsLeft > 0 && this.aliveEnemies.length > 0) {
      const target = this.aliveEnemies[0];
      const atkValue = this._effectiveMag() * this.player.autoTurret.power * this._mainDmgMult();
      const { damage, critical } = this.calculateDamage(atkValue, target);
      const kill = this._applyRawDamageAndReward(target, damage);
      events.push({ type: 'autoTurret', targetId: target.id, targetName: target.name, damage, critical, targetDead: target.dead, kill });
      this.player.autoTurret.turnsLeft--;
      if (this.player.autoTurret.turnsLeft <= 0) this.player.autoTurret = null;
    }
    for (const key in this.skillCooldowns) {
      if (this._skillCooldownsSetThisRound.has(key)) continue;
      if (this.skillCooldowns[key] > 0) this.skillCooldowns[key]--;
    }
    this._skillCooldownsSetThisRound.clear();
    // 大工「反撃」等、技が一時的に付与したonHit/onCrit/onHurt/onKill効果の期限切れ処理
    this.effects = this.effects.filter((e) => {
      if (e.__tempTurnsLeft == null) return true;
      e.__tempTurnsLeft--;
      return e.__tempTurnsLeft > 0;
    });
    this._updatePassiveEffects();
    // ChatGPTレビュー指摘4番：_regenPowerは（CAPS_LAYER.REGEN_PCT_PER_SEC_MAXも
    // 含めて）「1秒あたり」の割合のまま保持している。1ラウンド
    // ＝TEXT_BATTLE_LAYER.SECONDS_PER_ROUND秒相当なので、1ラウンドに1回しか
    // 適用しないここでは秒あたりの値をそのまま使うと弱体化する（例：
    // 1%/秒のはずが1%/ラウンドになってしまい、本来の1/SECONDS_PER_ROUNDに
    // 減ってしまう）。SECONDS_PER_ROUNDを掛けて「1ラウンドあたり」の割合に
    // 換算してから適用する。
    if (this._regenPower > 0) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * this._regenPower * TEXT_BATTLE_LAYER.SECONDS_PER_ROUND);
    }
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
    // 僧侶「祈り」・吟遊詩人「癒しの旋律」：一時的なregenボーナスも同じ
    // 「毎秒%」の意味で合算し、既存のCAPS_LAYER上限をそのまま適用する
    if (this.player.buffs.regenAdd.turnsLeft > 0) regenPower += this.player.buffs.regenAdd.value;
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
      // 深淵の蘇生（既存・より強力な50%蘇生）を優先し、それが使えない場合に
      // のみ農民MASTER「百姓魂」を判定する（重複ルール：深淵蘇生が最優先）
      if (this.stage.isAbyss && !this._abyssReviveUsed && state.hasAbyssRevive()) {
        this._abyssReviveUsed = true;
        this.player.hp = Math.round(this.player.maxHp * 0.5);
        return { over: false, revived: true };
      }
      if (state.currentJobId === 'farmer' && state.isMastered('farmer') && !this._farmerSurviveUsed) {
        this._farmerSurviveUsed = true;
        if (Math.random() < FARMER_SURVIVE_CHANCE) {
          this.player.hp = 1;
          return { over: false, revived: true, farmerSurvive: true };
        }
      }
      // パラディンMASTER「不落の誓い」：技を使って起動していた場合のみ、
      // 1戦1回だけ致死ダメージを耐える（深淵蘇生→百姓魂→この順で判定する
      // ことで、既存の死亡回避系と重複しても二重発動しない）
      if (this._paladinDeathGuardArmed && !this._paladinSurviveUsed) {
        this._paladinSurviveUsed = true;
        this._paladinDeathGuardArmed = false;
        this.player.hp = 1;
        return { over: false, revived: true, paladinGuard: true };
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
        // トレジャーハンター「発掘」・大商人「市場支配」：戦闘クリア時に1回だけ
        // 追加報酬を判定する。既存runGoldに対する割合ボーナスのみ・
        // 既存_rollDrop()（ステージのdropTableのみ）しか使わないため、
        // Boss固有武器・初回クリア報酬（別経路）は対象外＝無限増殖しない
        if (this._battleEndBonusReward) {
          const bonus = this._battleEndBonusReward;
          this._battleEndBonusReward = null;
          if (bonus.goldPct && this.runGold > 0) {
            const bonusGold = Math.round(this.runGold * bonus.goldPct);
            if (bonusGold > 0) { state.gainGold(bonusGold); this.runGold += bonusGold; }
          }
          if (bonus.dropChance && Math.random() < bonus.dropChance) this._rollDrop();
        }
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
