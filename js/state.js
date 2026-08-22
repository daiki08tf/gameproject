/* ============================================================
   永続プレイヤーステート（localStorage保存）
   死亡してもリセットされない：レベル・職業・装備・所持品を保持
   ============================================================ */
import { getJob, computeStats, isUnlocked, TIERS } from './data/jobs.js';
import { getItem, powerScore, SLOTS, weaponAffinityBonus } from './data/equipment.js';

const SAVE_KEY = 'bladevale_save_v1';

function defaultSave() {
  return {
    gold: 50,
    currentJobId: 'warrior',
    jobs: { warrior: { level: 1, exp: 0 } },
    mastered: [],
    inventory: {},
    equipped: { weapon: 'wp_sword_n', shield: null, head: null, body: null, accessory1: null, accessory2: null },
    stageProgress: {},
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
    const mult = passive && passive.exp ? passive.exp : 1;
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

  // ---------- ゴールド ----------
  gainGold(amount) {
    const passive = this.currentJob.passive;
    const mult = passive && passive.gold ? passive.gold : 1;
    const gained = Math.round(amount * mult);
    this.data.gold += gained;
    this.save();
    return gained;
  }

  dropRateMult() {
    const passive = this.currentJob.passive;
    return passive && passive.drop ? passive.drop : 1;
  }

  // ---------- ステータス計算（職業ベース＋装備ボーナス＋武器適性） ----------
  getStats() {
    const base = computeStats(this.currentJobId, this.currentLevel);
    const bonus = { hp: 0, mp: 0, atk: 0, def: 0, mag: 0, spd: 0, crit: 0 };
    for (const slot of SLOTS) {
      const id = this.data.equipped[slot];
      if (!id) continue;
      const item = getItem(id);
      if (!item) continue;
      for (const k in item.stats) bonus[k] = (bonus[k] || 0) + item.stats[k];
    }
    const stats = {
      hp: Math.round(base.hp + bonus.hp),
      mp: Math.round(base.mp + bonus.mp),
      atk: Math.round(base.atk + bonus.atk),
      def: Math.round(base.def + bonus.def),
      mag: Math.round(base.mag + bonus.mag),
      spd: Math.round((base.spd + bonus.spd) * 10) / 10,
      critPct: Math.min(75, base.critPct + bonus.crit * 0.8),
    };
    const weaponItem = getItem(this.data.equipped.weapon);
    const affinity = weaponAffinityBonus(weaponItem, this.currentJob.weapon);
    if (affinity) stats[affinity.stat] = Math.round(stats[affinity.stat] * affinity.mult);
    return stats;
  }

  // 装備中の固有アイテムが持つ特殊効果を全て集める（戦闘エンジンから参照）
  getEquippedEffects() {
    const effects = [];
    for (const slot of SLOTS) {
      const item = getItem(this.data.equipped[slot]);
      if (item && item.effects) effects.push(...item.effects);
    }
    return effects;
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

  // ---------- ステージ進行 ----------
  isStageCleared(stageId) { return !!(this.data.stageProgress[stageId] && this.data.stageProgress[stageId].cleared); }

  recordStageResult(stageId, cleared) {
    const wasFirstClear = cleared && !this.isStageCleared(stageId);
    this.data.stageProgress[stageId] = { cleared: this.isStageCleared(stageId) || cleared };
    this.save();
    return { wasFirstClear };
  }
}

export const state = new StateManager();
