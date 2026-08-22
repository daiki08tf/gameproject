/* ============================================================
   永続プレイヤーステート（localStorage保存）
   死亡してもリセットされない：レベル・職業・装備・所持品を保持
   ============================================================ */
import { getJob, computeStats, isUnlocked, TIERS } from './data/jobs.js';
import { getItem, powerScore, SLOTS, weaponAffinityBonus, slotsForEnhanceLevel, WEAPON_MASTERY_THRESHOLD, rarityIndex, RARITY_ORDER } from './data/equipment.js';
import { getRune } from './data/runes.js';
import { EFFECTS } from './data/chapters.js';
import { isAbyssUnlocked } from './data/stages.js';
import { EQUIPMENT_LAYER, REBIRTH_LAYER, AWAKENING_LAYER, AWAKENED_EQUIP_LAYER, ARTIFACT_LAYER, EXTREME_AFFIX_LAYER, AWAKENED_ITEM_LAYER } from './data/balance.js';
import { ALL_AWAKENING_NODES, getAwakeningNodeDef, awakeningNodeCostFor } from './data/awakening.js';
import { getArtifact } from './data/artifacts.js';

const SAVE_KEY = 'bladevale_save_v1';

function defaultSave() {
  return {
    gold: 50,
    manastone: 0,
    currentJobId: 'warrior',
    jobs: { warrior: { level: 1, exp: 0 } },
    mastered: [],
    inventory: {},
    equipped: { weapon: 'wp_sword_n', shield: null, head: null, body: null, accessory1: null, accessory2: null },
    weaponEnhance: {},
    runeSockets: {},
    weaponMastery: {},
    reincarnations: 0,
    stageProgress: {},
    awakeningPoints: 0,
    awakeningTree: {},
    awakenings: 0,
    awakenedWeapons: {},
    unlockedArtifacts: [],
    equippedArtifacts: [null, null, null],
    abyssBestDepth: 0,
    weaponAffix: {},
    lootFilter: { minRarity: 'normal' },
    itemAwakenKills: {},
    weaponAffix2: {},
  };
}

class StateManager {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return { ...defaultSave(), ...JSON.parse(raw) };
    } catch (e) { /* ignore corrupt save */ }
    return defaultSave();
  }

  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* storage unavailable */ }
  }

  resetAll() {
    this.data = defaultSave();
    this.save();
  }

  // ---------- 職業 ----------
  get currentJobId() { return this.data.currentJobId; }
  get currentJob() { return getJob(this.data.currentJobId); }

  jobProgress(jobId) { return this.data.jobs[jobId] || { level: 1, exp: 0 }; }
  get currentLevel() { return this.jobProgress(this.currentJobId).level; }
  get currentExp() { return this.jobProgress(this.currentJobId).exp; }

  masteredSet() { return new Set(this.data.mastered); }
  isMastered(jobId) { return this.data.mastered.includes(jobId); }

  expToNext(level) { return Math.round(20 + level * 18 + Math.pow(level, 1.6) * 2); }

  canChangeAwayFromCurrent() {
    const tier = TIERS[this.currentJob.tier];
    if (tier.changeableLv == null) return true;
    return this.currentLevel >= tier.changeableLv;
  }

  canSwitchTo(jobId) {
    return isUnlocked(jobId, this.masteredSet());
  }

  changeJob(jobId) {
    if (!this.canChangeAwayFromCurrent()) return { ok: false, reason: 'current_locked' };
    if (!this.canSwitchTo(jobId)) return { ok: false, reason: 'target_locked' };
    if (!this.data.jobs[jobId]) this.data.jobs[jobId] = { level: 1, exp: 0 };
    this.data.currentJobId = jobId;
    this.save();
    return { ok: true };
  }

  gainExp(amount) {
    const passive = this.currentJob.passive;
    const mult = (passive && passive.exp ? passive.exp : 1) * this.awakeningStatMult('exp') * this.jobMasterPassiveMult('exp');
    const gained = Math.round(amount * mult);
    const prog = this.data.jobs[this.currentJobId];
    prog.exp += gained;
    const tier = TIERS[this.currentJob.tier];
    let leveledUp = false;
    while (prog.exp >= this.expToNext(prog.level)) {
      prog.exp -= this.expToNext(prog.level);
      prog.level += 1;
      leveledUp = true;
      if (tier.masteryLv != null && prog.level >= tier.masteryLv && !this.isMastered(this.currentJobId)) {
        this.data.mastered.push(this.currentJobId);
      }
    }
    this.save();
    return { gained, leveledUp };
  }

  // ---------- ゴールド・魔石 ----------
  gainGold(amount) {
    const passive = this.currentJob.passive;
    const mult = (passive && passive.gold ? passive.gold : 1) * this.awakeningStatMult('gold') * this.jobMasterPassiveMult('gold');
    const gained = Math.round(amount * mult);
    this.data.gold += gained;
    this.save();
    return gained;
  }

  addManastone(amount) {
    this.data.manastone += amount;
    this.save();
  }

  dropRateMult() {
    const passive = this.currentJob.passive;
    return (passive && passive.drop ? passive.drop : 1) * this.awakeningStatMult('drop') * this.jobMasterPassiveMult('drop');
  }

  // ---------- ステータス計算（職業ベース＋装備＋強化＋ルーン＋転生＋武器適性） ----------
  getStats() {
    const base = computeStats(this.currentJobId, this.currentLevel);
    const bonus = { hp: 0, mp: 0, atk: 0, def: 0, mag: 0, spd: 0, crit: 0 };

    for (const slot of SLOTS) {
      const id = this.data.equipped[slot];
      if (!id) continue;
      const item = getItem(id);
      if (!item) continue;
      const baseMult = slot === 'weapon'
        ? 1 + this.weaponEnhanceLevel(id) * EQUIPMENT_LAYER.ENHANCE_BONUS_PER_LEVEL
              + this.weaponAwakenedRank(id) * AWAKENED_EQUIP_LAYER.BONUS_PER_RANK
        : 1;
      // 極Affixは特定の1ステータスだけに追加%を乗せる（強化・目覚めと同じ
      // 「まとめて1つの倍率にしてから掛ける」方式を、対象ステータスにだけ適用）
      // 1本目（weaponAffix）は武器限定だが、覚醒装備（キル数）で解放される
      // 2本目（weaponAffix2）は対象装備が武器以外（アクセ・胴）の場合もあるため
      // スロットを問わず適用する。
      const affix = slot === 'weapon' ? this.weaponAffix(id) : null;
      const affix2 = this.weaponAffix2(id);
      for (const k in item.stats) {
        let mult = baseMult;
        if (affix && affix.stat === k) mult += affix.pct;
        if (affix2 && affix2.stat === k) mult += affix2.pct;
        bonus[k] = (bonus[k] || 0) + item.stats[k] * mult;
      }
    }

    const weaponId = this.data.equipped.weapon;
    if (weaponId) {
      for (const runeId of this.getRuneSockets(weaponId)) {
        if (!runeId) continue;
        const rune = getRune(runeId);
        if (rune && rune.kind === 'stat') bonus[rune.stat] = (bonus[rune.stat] || 0) + rune.value;
      }
    }

    const rebirthMult = 1 + this.data.reincarnations * REBIRTH_LAYER.STAT_BONUS_PER_REBIRTH;
    const permMult = (stat) => rebirthMult * this.jobMasterStatMult(stat) * this.awakeningStatMult(stat);
    const stats = {
      // 転生遺物「死王の指骨」：最大HP-30%（deathKingHpMult）の代わりに極Affix強化
      hp: Math.round((base.hp + bonus.hp) * permMult('hp') * this.deathKingHpMult()),
      mp: Math.round((base.mp + bonus.mp) * permMult('mp')),
      atk: Math.round((base.atk + bonus.atk) * permMult('atk')),
      def: Math.round((base.def + bonus.def) * permMult('def')),
      mag: Math.round((base.mag + bonus.mag) * permMult('mag')),
      spd: Math.round((base.spd + bonus.spd) * permMult('spd') * 10) / 10,
      // critPctはPhase 1以前から転生の永続倍率を掛けていない（加算のみ）ため、その挙動は
      // 変えず、覚醒ツリー・職業MASTER（基本職の固定ボーナス＋上級/特級職の「得意武器
      // 装備時+X%」条件付き能力）のボーナスだけをここに乗せる。
      critPct: Math.min(75,
        (base.critPct + bonus.crit * 0.8) * this.jobMasterStatMult('crit') * this.awakeningStatMult('crit')
        + this.jobMasterWeaponMatchCritBonus() * 100),
    };
    const weaponItem = getItem(weaponId);
    const affinity = weaponAffinityBonus(weaponItem, this.currentJob.weapon);
    if (affinity) stats[affinity.stat] = Math.round(stats[affinity.stat] * affinity.mult);
    return stats;
  }

  // 装備中の固有装備＋ルーン＋セット中の秘宝が持つ特殊効果を全て集める（戦闘エンジンから参照）
  getEquippedEffects() {
    const effects = [];
    for (const slot of SLOTS) {
      const item = getItem(this.data.equipped[slot]);
      if (!item || !item.effects) continue;
      // 覚醒装備（キル数）がtier2（100キル）に達した固有装備は、
      // 固有能力そのもの（chance/power）が強化された状態で発動する
      const boosted = this.itemAwakenTier(item.id) >= 2;
      for (const eff of item.effects) effects.push(boosted ? this._boostedItemEffect(eff) : eff);
    }
    const weaponId = this.data.equipped.weapon;
    if (weaponId) {
      for (const runeId of this.getRuneSockets(weaponId)) {
        if (!runeId) continue;
        const rune = getRune(runeId);
        if (rune && rune.kind === 'effect') effects.push(EFFECTS[rune.effectId]);
      }
    }
    for (const artifactId of this.data.equippedArtifacts.slice(0, this.artifactSlotCount())) {
      if (!artifactId) continue;
      const artifact = getArtifact(artifactId);
      if (!artifact) continue;
      // 秘宝（EFFECT_ARTIFACTS）はchapters.jsのEFFECTSを参照するだけ、
      // 転生遺物（RELICS）は自身がそのままtrigger/kind等を持つ効果オブジェクト
      if (artifact.effectId) effects.push(EFFECTS[artifact.effectId]);
      else effects.push(artifact);
    }
    return effects;
  }

  // 覚醒装備tier2（100キル）による固有能力の強化：chance/powerを底上げした
  // 複製を返す（元のEFFECTS/item.effects定義そのものは書き換えない）
  _boostedItemEffect(eff) {
    const boosted = { ...eff };
    const mult = 1 + AWAKENED_ITEM_LAYER.TIER2_EFFECT_BOOST;
    if (boosted.chance != null) boosted.chance = Math.min(1, boosted.chance * mult);
    if (boosted.power != null) boosted.power = boosted.power * mult;
    return boosted;
  }

  // ---------- 覚醒装備（本来仕様：固有効果を持つ特殊装備限定、キル数で成長） ----------
  // 対象は固有効果(effects)を持つ装備のみ。通常装備は覚醒装備の対象外
  // （「覚醒でどんな装備でも最強になる設計は禁止」という元指示のとおり）。
  isAwakenedItemEligible(itemId) {
    const item = getItem(itemId);
    return !!(item && item.effects && item.effects.length > 0);
  }

  itemAwakenKillCount(itemId) { return this.data.itemAwakenKills[itemId] || 0; }

  itemAwakenTier(itemId) {
    const kills = this.itemAwakenKillCount(itemId);
    if (kills >= AWAKENED_ITEM_LAYER.KILLS_TIER2) return 2;
    if (kills >= AWAKENED_ITEM_LAYER.KILLS_TIER1) return 1;
    return 0;
  }

  // 現在装備中の対象装備すべてに1キル分加算する（対象外の装備は無視）
  addItemAwakenKills() {
    let changed = false;
    for (const slot of SLOTS) {
      const itemId = this.data.equipped[slot];
      if (!itemId || !this.isAwakenedItemEligible(itemId)) continue;
      this.data.itemAwakenKills[itemId] = (this.data.itemAwakenKills[itemId] || 0) + 1;
      changed = true;
    }
    if (changed) this.save();
  }

  weaponAffix2(itemId) { return this.data.weaponAffix2[itemId] || null; }

  // tier1（50キル）到達で解放される第2の極Affixスロット。武器の強化/目覚め
  // MAXという既存の極Affixのゲートとは無関係に、キル数だけで解放される
  // （アクセサリ・胴装備の覚醒装備にも同じ仕組みを使うため）。
  canRollAffix2(itemId) {
    if (this.itemAwakenTier(itemId) < 1) return false;
    return this.data.gold >= EXTREME_AFFIX_LAYER.ROLL_COST_GOLD && this.data.manastone >= EXTREME_AFFIX_LAYER.ROLL_COST_MANASTONE;
  }

  rollAffix2(itemId) {
    if (!this.canRollAffix2(itemId)) return false;
    const item = getItem(itemId);
    const pool = item ? Object.keys(item.stats) : [];
    if (pool.length === 0) return false;
    this.data.gold -= EXTREME_AFFIX_LAYER.ROLL_COST_GOLD;
    this.data.manastone -= EXTREME_AFFIX_LAYER.ROLL_COST_MANASTONE;
    const stat = pool[Math.floor(Math.random() * pool.length)];
    const deathKingBonus = this.hasEquippedArtifactKind('deathking') ? getArtifact('relic_deathking').affixBonus : 0;
    const pct = EXTREME_AFFIX_LAYER.MIN_PCT + deathKingBonus + Math.random() * (EXTREME_AFFIX_LAYER.MAX_PCT - EXTREME_AFFIX_LAYER.MIN_PCT);
    this.data.weaponAffix2[itemId] = { stat, pct: Math.round(pct * 1000) / 1000 };
    this.save();
    return this.data.weaponAffix2[itemId];
  }

  // 装備中または所持中（強化素材・未使用ストックとして）かどうか。
  // 覚醒ツリー「宝物庫の記憶」の判定に使う。
  ownsItem(itemId) {
    if ((this.data.inventory[itemId] || 0) > 0) return true;
    return SLOTS.some((slot) => this.data.equipped[slot] === itemId);
  }

  // 現在スロットにセットされている秘宝/転生遺物の中に、指定kindのものがあるか
  hasEquippedArtifactKind(kind) {
    for (const artifactId of this.data.equippedArtifacts.slice(0, this.artifactSlotCount())) {
      if (!artifactId) continue;
      const artifact = getArtifact(artifactId);
      if (artifact && artifact.kind === kind) return true;
    }
    return false;
  }

  // 転生遺物「死王の指骨」：最大HP-30%の代わりを担う倍率
  deathKingHpMult() {
    if (!this.hasEquippedArtifactKind('deathking')) return 1;
    const artifact = getArtifact('relic_deathking');
    return 1 + artifact.power;
  }

  // ---------- 装備・インベントリ ----------
  addItem(itemId, qty = 1) {
    this.data.inventory[itemId] = (this.data.inventory[itemId] || 0) + qty;
    this.save();
  }

  equipItem(slot, itemId) {
    const prev = this.data.equipped[slot];
    if (itemId) {
      if ((this.data.inventory[itemId] || 0) <= 0) return false;
      if (slot === 'weapon') {
        const item = getItem(itemId);
        if (item && item.weaponType && !this.canUseWeaponType(item.weaponType)) return false;
      }
      this.data.inventory[itemId] -= 1;
      if (this.data.inventory[itemId] <= 0) delete this.data.inventory[itemId];
    }
    if (prev) this.addItem(prev, 1);
    this.data.equipped[slot] = itemId || null;
    this.save();
    return true;
  }

  autoEquipBest() {
    const pool = { ...this.data.inventory };
    for (const slot of SLOTS) {
      const id = this.data.equipped[slot];
      if (id) pool[id] = (pool[id] || 0) + 1;
    }
    const used = {};
    const newEquipped = {};

    const takeBest = (slotType) => {
      let best = null, bestScore = -1;
      for (const id in pool) {
        const remaining = pool[id] - (used[id] || 0);
        if (remaining <= 0) continue;
        const item = getItem(id);
        if (!item || item.slot !== slotType) continue;
        if (slotType === 'weapon' && item.weaponType && !this.canUseWeaponType(item.weaponType)) continue;
        const score = powerScore(item);
        if (score > bestScore) { bestScore = score; best = id; }
      }
      return best;
    };

    for (const slot of ['weapon', 'shield', 'head', 'body']) {
      const chosen = takeBest(slot);
      newEquipped[slot] = chosen;
      if (chosen) used[chosen] = (used[chosen] || 0) + 1;
    }

    const accCandidates = [];
    for (const id in pool) {
      const item = getItem(id);
      if (!item || item.slot !== 'accessory') continue;
      const remaining = pool[id] - (used[id] || 0);
      for (let i = 0; i < remaining; i++) accCandidates.push(id);
    }
    accCandidates.sort((a, b) => powerScore(getItem(b)) - powerScore(getItem(a)));
    newEquipped.accessory1 = accCandidates[0] || null;
    if (accCandidates[0]) used[accCandidates[0]] = (used[accCandidates[0]] || 0) + 1;
    newEquipped.accessory2 = accCandidates[1] || null;
    if (accCandidates[1]) used[accCandidates[1]] = (used[accCandidates[1]] || 0) + 1;

    const newBag = {};
    for (const id in pool) {
      const left = pool[id] - (used[id] || 0);
      if (left > 0) newBag[id] = left;
    }
    this.data.inventory = newBag;
    this.data.equipped = newEquipped;
    this.save();
  }

  // ---------- 武器種マスター（職業の装備制限） ----------
  weaponKillCount(weaponType) { return this.data.weaponMastery[weaponType] || 0; }

  isWeaponMastered(weaponType) { return this.weaponKillCount(weaponType) >= WEAPON_MASTERY_THRESHOLD; }

  // 現在の職業がその武器種を装備できるか（自分の得意武器 or マスター済みの武器種）
  canUseWeaponType(weaponType) {
    return this.currentJob.weapon === weaponType || this.isWeaponMastered(weaponType);
  }

  addWeaponKill(weaponType) {
    if (!weaponType) return;
    this.data.weaponMastery[weaponType] = (this.data.weaponMastery[weaponType] || 0) + 1;
    this.save();
  }

  // ---------- 鍛冶屋：武器強化（同じ武器の合成） ----------
  weaponEnhanceLevel(itemId) { return this.data.weaponEnhance[itemId] || 0; }

  enhanceCost(level) { return EQUIPMENT_LAYER.ENHANCE_GOLD_BASE + level * EQUIPMENT_LAYER.ENHANCE_GOLD_PER_LEVEL; }

  // +が上がるほど必要な同じ武器の個数も増える（Lv0→1は1個、Lv1→2は2個…）
  enhanceMaterialCount(level) { return level + 1; }

  canEnhanceWeapon(itemId) {
    const level = this.weaponEnhanceLevel(itemId);
    if (level >= EQUIPMENT_LAYER.ENHANCE_MAX_LEVEL) return false;
    if ((this.data.inventory[itemId] || 0) < this.enhanceMaterialCount(level)) return false;
    return this.data.gold >= this.enhanceCost(level);
  }

  enhanceWeapon(itemId) {
    if (!this.canEnhanceWeapon(itemId)) return false;
    const level = this.weaponEnhanceLevel(itemId);
    this.data.gold -= this.enhanceCost(level);
    this.data.inventory[itemId] -= this.enhanceMaterialCount(level);
    if (this.data.inventory[itemId] <= 0) delete this.data.inventory[itemId];
    this.data.weaponEnhance[itemId] = level + 1;
    this.save();
    return true;
  }

  // ---------- 鍛冶屋：ルーン ----------
  getRuneSockets(itemId) {
    const count = slotsForEnhanceLevel(this.weaponEnhanceLevel(itemId));
    const arr = this.data.runeSockets[itemId] || [];
    const out = [];
    for (let i = 0; i < count; i++) out.push(arr[i] || null);
    return out;
  }

  craftRune(runeId) {
    const rune = getRune(runeId);
    if (!rune || !rune.craftable) return false;
    if (this.data.manastone < rune.craftCost.manastone || this.data.gold < rune.craftCost.gold) return false;
    this.data.manastone -= rune.craftCost.manastone;
    this.data.gold -= rune.craftCost.gold;
    this.addItem(runeId, 1);
    return true;
  }

  socketRune(itemId, slotIndex, runeId) {
    const sockets = this.getRuneSockets(itemId).slice();
    if (slotIndex < 0 || slotIndex >= sockets.length) return false;
    if ((this.data.inventory[runeId] || 0) < 1) return false;
    const prev = sockets[slotIndex];
    this.data.inventory[runeId] -= 1;
    if (this.data.inventory[runeId] <= 0) delete this.data.inventory[runeId];
    if (prev) this.addItem(prev, 1);
    sockets[slotIndex] = runeId;
    this.data.runeSockets[itemId] = sockets;
    this.save();
    return true;
  }

  unsocketRune(itemId, slotIndex) {
    const sockets = this.getRuneSockets(itemId).slice();
    if (!sockets[slotIndex]) return false;
    this.addItem(sockets[slotIndex], 1);
    sockets[slotIndex] = null;
    this.data.runeSockets[itemId] = sockets;
    this.save();
    return true;
  }

  // ---------- 鍛冶屋：転生 ----------
  // 勇者解放などの前提条件は設けず、コストさえ払えればいつでも転生可能
  canReincarnate() {
    return true;
  }

  reincarnationCost() {
    const n = this.data.reincarnations;
    return {
      gold: REBIRTH_LAYER.GOLD_COST_BASE + n * REBIRTH_LAYER.GOLD_COST_PER_REBIRTH,
      manastone: REBIRTH_LAYER.MANASTONE_COST_BASE + n * REBIRTH_LAYER.MANASTONE_COST_PER_REBIRTH,
    };
  }

  reincarnate() {
    if (!this.canReincarnate()) return false;
    const cost = this.reincarnationCost();
    if (this.data.gold < cost.gold || this.data.manastone < cost.manastone) return false;
    this.data.gold -= cost.gold;
    this.data.manastone -= cost.manastone;
    this.data.reincarnations += 1;
    this.save();
    return true;
  }

  // ---------- 職業MASTER ----------
  // マスター済み職業は、現在職に関係なく永続ボーナスを持ち越す。
  // 覚醒でリセットされることはない（マスター済みリストは覚醒対象外）。
  //   基本職：職業ごとに個性を持つ固定ボーナス（job.masterBonus）
  //   上級・特級職：単純なステータス加算ではなく条件付き能力（job.masterAbility）
  masteredJobs() {
    const list = [];
    for (const jobId of this.data.mastered) {
      const job = getJob(jobId);
      if (job) list.push(job);
    }
    return list;
  }

  // 基本職MASTERの「特定ステータスへの永続加算」ボーナス（stat単位）
  jobMasterStatMult(stat) {
    let mult = 1;
    for (const job of this.masteredJobs()) {
      const b = job.masterBonus;
      if (b && b.kind === 'stat' && b.stat === stat) mult += b.pct;
    }
    return mult;
  }

  // 基本職MASTERの「経験値/ゴールド/ドロップ率」への永続加算ボーナス
  jobMasterPassiveMult(channel) {
    let mult = 1;
    for (const job of this.masteredJobs()) {
      const b = job.masterBonus;
      if (b && b.kind === 'passive' && b.channel === channel) mult += b.pct;
    }
    return mult;
  }

  jobMasterSkillPowerMult() {
    let mult = 1;
    for (const job of this.masteredJobs()) {
      if (job.masterBonus && job.masterBonus.kind === 'skillPower') mult += job.masterBonus.pct;
    }
    return mult;
  }

  jobMasterHealPowerMult() {
    let mult = 1;
    for (const job of this.masteredJobs()) {
      if (job.masterBonus && job.masterBonus.kind === 'healPower') mult += job.masterBonus.pct;
    }
    return mult;
  }

  // 上級・特級職MASTERの条件付き能力一覧
  masterAbilities() {
    return this.masteredJobs().filter((job) => job.masterAbility);
  }

  // 「得意武器装備時、会心率+X%」：現在の装備武器の武器種と、その職業自身の
  // 得意武器種が一致していれば発動する（現在職とは無関係、常に判定される）
  jobMasterWeaponMatchCritBonus() {
    const weaponItem = getItem(this.data.equipped.weapon);
    const weaponType = weaponItem ? weaponItem.weaponType : null;
    if (!weaponType) return 0;
    let bonus = 0;
    for (const job of this.masterAbilities()) {
      const a = job.masterAbility;
      if (a.condition === 'weaponMatch' && job.weapon === weaponType && a.effect.stat === 'crit') bonus += a.effect.pct;
    }
    return bonus;
  }

  // 「HPが一定割合以下の間、与ダメージ+X%」：戦闘中のライブHP割合を渡して判定する
  // （同種効果は加算せず最大値を採用＝スタックによるインフレを防ぐ）
  jobMasterLowHpDamageBonus(hpRatio) {
    let bonus = 0;
    for (const job of this.masterAbilities()) {
      const a = job.masterAbility;
      if (a.condition === 'lowHp' && hpRatio <= a.threshold) bonus = Math.max(bonus, a.effect.pct);
    }
    return bonus;
  }

  // 「常時、スキルクールダウン-X%」：複数あれば加算するが下限50%を設ける
  jobMasterCooldownMult() {
    let mult = 1;
    for (const job of this.masterAbilities()) {
      const a = job.masterAbility;
      if (a.condition === 'always' && a.effect.stat === 'cooldown') mult += a.effect.pct;
    }
    return Math.max(0.5, mult);
  }

  // ---------- 覚醒（Reincarnation 2.0：プレステージリセット） ----------
  // 保持している全職業の中で最も高いレベル。覚醒の可否・獲得ポイントの基準にする。
  highestJobLevel() {
    let max = 1;
    for (const jobId in this.data.jobs) {
      const lv = this.data.jobs[jobId].level || 1;
      if (lv > max) max = lv;
    }
    return max;
  }

  canAwaken() {
    return this.highestJobLevel() >= AWAKENING_LAYER.MIN_LEVEL_TO_AWAKEN;
  }

  // 元指示の「転生ポイント」仕様：最高到達レベルだけでなく、深淵到達階・
  // 職業MASTER数からも加算される（「最短周回だけが正解」にならないよう、
  // レベル上げ一辺倒ではない複数の稼ぎ方を用意する）。
  awakenPreviewPoints() {
    const levelPart = Math.floor(this.highestJobLevel() / AWAKENING_LAYER.POINTS_PER_LEVEL_DIVISOR);
    const abyssPart = Math.floor(this.data.abyssBestDepth * AWAKENING_LAYER.POINTS_PER_ABYSS_DEPTH);
    const masterPart = this.data.mastered.length * AWAKENING_LAYER.POINTS_PER_MASTERED_JOB;
    return levelPart + abyssPart + masterPart;
  }

  // 覚醒ツリー「不滅の魂」（輪廻系統の大型ノード）：覚醒後の初期レベル。
  // 未取得なら1（元指示の「転生後初期Lv」に対応する大型ノード）。
  awakeningStartLevel() {
    const rank = this.awakeningNodeRank('awk_startlevel');
    if (rank <= 0) return 1;
    const node = getAwakeningNodeDef('awk_startlevel');
    return node.levels[rank - 1];
  }

  // 全職業のレベル・経験値だけをリセットする（初期値は上記の「不滅の魂」で
  // 底上げ可能）。装備・所持品・ゴールド・魔石・マスター済み職業・武器熟練度・
  // 転生回数・ステージ進行（章の解放状況含む）は一切失わない。
  awaken() {
    if (!this.canAwaken()) return false;
    const gained = this.awakenPreviewPoints();
    const startLevel = this.awakeningStartLevel();
    for (const jobId in this.data.jobs) {
      this.data.jobs[jobId] = { level: startLevel, exp: 0 };
    }
    this.data.awakeningPoints += gained;
    this.data.awakenings += 1;
    this.save();
    return gained;
  }

  // 覚醒ツリー：statごとの永続倍率（1 + Σ rank * pctPerRank）
  awakeningStatMult(stat) {
    let mult = 1;
    for (const node of ALL_AWAKENING_NODES) {
      if (node.stat !== stat || node.levels) continue; // levelsを持つノード(不滅の魂)は別枠
      mult += this.awakeningNodeRank(node.id) * node.pctPerRank;
    }
    return mult;
  }

  // 覚醒ツリー「覇者の一撃」（征服系統の大型ノード）：ボスへの与ダメージ倍率
  awakeningBossDmgMult() { return this.awakeningStatMult('bossDmg'); }

  // 覚醒ツリー「宝物庫の記憶」（探求系統の大型ノード）：ドロップ時に未所持
  // アイテムを優先する確率（0〜1）
  awakeningUnownedBiasChance() {
    const rank = this.awakeningNodeRank('awk_unowned');
    const node = getAwakeningNodeDef('awk_unowned');
    return Math.min(1, rank * node.pctPerRank);
  }

  awakeningNodeRank(id) { return this.data.awakeningTree[id] || 0; }

  canBuyAwakeningNode(id) {
    const node = getAwakeningNodeDef(id);
    if (!node) return false;
    const rank = this.awakeningNodeRank(id);
    if (rank >= node.maxRank) return false;
    return this.data.awakeningPoints >= awakeningNodeCostFor(node, rank);
  }

  buyAwakeningNode(id) {
    if (!this.canBuyAwakeningNode(id)) return false;
    const node = getAwakeningNodeDef(id);
    const rank = this.awakeningNodeRank(id);
    this.data.awakeningPoints -= awakeningNodeCostFor(node, rank);
    this.data.awakeningTree[id] = rank + 1;
    this.save();
    return true;
  }

  // ---------- 目覚めた装備（Phase 3：武器強化MAX後、覚醒ポイントでさらに強化） ----------
  weaponAwakenedRank(itemId) { return this.data.awakenedWeapons[itemId] || 0; }

  awakenWeaponCost(rank) { return AWAKENED_EQUIP_LAYER.COST_BASE + rank * AWAKENED_EQUIP_LAYER.COST_PER_RANK; }

  canAwakenWeapon(itemId) {
    if (this.data.awakenings < AWAKENED_EQUIP_LAYER.REQUIRE_AWAKENINGS) return false;
    if (this.weaponEnhanceLevel(itemId) < AWAKENED_EQUIP_LAYER.REQUIRE_ENHANCE_LEVEL) return false;
    const rank = this.weaponAwakenedRank(itemId);
    if (rank >= AWAKENED_EQUIP_LAYER.MAX_RANK) return false;
    return this.data.awakeningPoints >= this.awakenWeaponCost(rank);
  }

  awakenWeapon(itemId) {
    if (!this.canAwakenWeapon(itemId)) return false;
    const rank = this.weaponAwakenedRank(itemId);
    this.data.awakeningPoints -= this.awakenWeaponCost(rank);
    this.data.awakenedWeapons[itemId] = rank + 1;
    this.save();
    return true;
  }

  // ---------- 極Affix（Phase 5：強化＋目覚めMAXの武器だけの最後の仕上げ） ----------
  weaponAffix(itemId) { return this.data.weaponAffix[itemId] || null; }

  canRollAffix(itemId) {
    if (this.weaponEnhanceLevel(itemId) < EXTREME_AFFIX_LAYER.REQUIRE_ENHANCE_LEVEL) return false;
    if (this.weaponAwakenedRank(itemId) < EXTREME_AFFIX_LAYER.REQUIRE_AWAKENED_RANK) return false;
    return this.data.gold >= EXTREME_AFFIX_LAYER.ROLL_COST_GOLD && this.data.manastone >= EXTREME_AFFIX_LAYER.ROLL_COST_MANASTONE;
  }

  // 何度でも再抽選できる（都度コストを払い、既存のAffixを新しい抽選結果で上書きする）。
  // ロール対象ステータスは、その武器が実際に持つステータスの中からのみ選ぶ
  // （武器種によって持たないステータスがあるため、存在しないキーを選んで
  // NaNになるのを防ぐ）。
  rollAffix(itemId) {
    if (!this.canRollAffix(itemId)) return false;
    const item = getItem(itemId);
    const pool = item ? Object.keys(item.stats) : [];
    if (pool.length === 0) return false;
    this.data.gold -= EXTREME_AFFIX_LAYER.ROLL_COST_GOLD;
    this.data.manastone -= EXTREME_AFFIX_LAYER.ROLL_COST_MANASTONE;
    const stat = pool[Math.floor(Math.random() * pool.length)];
    // 転生遺物「死王の指骨」：極Affixの効果量そのものを底上げする
    const deathKingBonus = this.hasEquippedArtifactKind('deathking') ? getArtifact('relic_deathking').affixBonus : 0;
    const pct = EXTREME_AFFIX_LAYER.MIN_PCT + deathKingBonus + Math.random() * (EXTREME_AFFIX_LAYER.MAX_PCT - EXTREME_AFFIX_LAYER.MIN_PCT);
    this.data.weaponAffix[itemId] = { stat, pct: Math.round(pct * 1000) / 1000 };
    this.save();
    return this.data.weaponAffix[itemId];
  }

  // ---------- Loot Filter（Phase 5：装備画面の所持品一覧を表示上だけ絞り込む） ----------
  // ドロップ抽選そのものには一切影響しない、純粋な表示フィルター。
  setLootFilterMinRarity(rarity) {
    if (!RARITY_ORDER.includes(rarity)) return false;
    this.data.lootFilter.minRarity = rarity;
    this.save();
    return true;
  }

  passesLootFilter(item) {
    if (!item) return true;
    return rarityIndex(item.rarity) >= rarityIndex(this.data.lootFilter.minRarity);
  }

  // ---------- 覚醒アーティファクト（秘宝、Phase 3） ----------
  // 覚醒回数に応じて解放されるスロット数（最大3）
  artifactSlotCount() {
    return ARTIFACT_LAYER.SLOT_UNLOCK_AWAKENINGS.filter((t) => this.data.awakenings >= t).length;
  }

  artifactUnlockCost() {
    return ARTIFACT_LAYER.UNLOCK_COST_BASE + this.data.unlockedArtifacts.length * ARTIFACT_LAYER.UNLOCK_COST_PER_ARTIFACT;
  }

  isArtifactUnlocked(id) { return this.data.unlockedArtifacts.includes(id); }

  canUnlockArtifact(id) {
    if (this.isArtifactUnlocked(id)) return false;
    return this.data.awakeningPoints >= this.artifactUnlockCost();
  }

  unlockArtifact(id) {
    if (!this.canUnlockArtifact(id)) return false;
    this.data.awakeningPoints -= this.artifactUnlockCost();
    this.data.unlockedArtifacts.push(id);
    this.save();
    return true;
  }

  // slotIndex に artifactId をセットする（nullで解除）。既に別スロットに
  // セット済みの秘宝を選んだ場合は、そちらのスロットから外して付け替える。
  equipArtifact(slotIndex, artifactId) {
    if (slotIndex < 0 || slotIndex >= this.artifactSlotCount()) return false;
    if (artifactId && !this.isArtifactUnlocked(artifactId)) return false;
    const slots = this.data.equippedArtifacts.slice();
    if (artifactId) {
      const dupIdx = slots.indexOf(artifactId);
      if (dupIdx !== -1) slots[dupIdx] = null;
    }
    slots[slotIndex] = artifactId || null;
    this.data.equippedArtifacts = slots;
    this.save();
    return true;
  }

  // ---------- ステージ進行 ----------
  isStageCleared(stageId) { return !!(this.data.stageProgress[stageId] && this.data.stageProgress[stageId].cleared); }

  recordStageResult(stageId, cleared) {
    const wasFirstClear = cleared && !this.isStageCleared(stageId);
    this.data.stageProgress[stageId] = { cleared: this.isStageCleared(stageId) || cleared };
    this.save();
    return { wasFirstClear };
  }

  // ---------- 深淵（Abyss、Phase 4） ----------
  // 深淵は無限に深くなるため、章のように stageProgress へ1階ごと記録すると
  // セーブが際限なく肥大化する。代わりに「最高到達階」だけを永続保持する
  // （下がることはない＝非破壊）。
  isAbyssUnlocked() { return isAbyssUnlocked((id) => this.isStageCleared(id)); }

  recordAbyssClear(depth) {
    if (depth > this.data.abyssBestDepth) this.data.abyssBestDepth = depth;
    this.save();
  }
}

export const state = new StateManager();
