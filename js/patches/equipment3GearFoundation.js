/* ============================================================
   Equipment 3.0 — Armor / Accessory runtime foundation
   ============================================================ */
import { state } from '../state.js';
import { getItem, baseItemId, powerScore, SLOTS } from '../data/equipment.js';
import { splitAffixesForApplication } from '../data/affixes.js';
import { itemPowerBand, affixTierForItemPower } from '../data/equipment3.js';
import { buildGearInstance, EQUIPMENT3_GEAR_SLOTS } from '../data/equipment3Gear.js';
import { CAPS_LAYER } from '../data/balance.js';

function ensureGearData(target = state) {
  target.data.gearInstances ||= {};
  target.data.itemLocked ||= {};
  target.data.itemFavorite ||= {};
  target.data.nextInstanceSeq = Math.max(1, Math.floor(Number(target.data.nextInstanceSeq) || 1));
  return target.data.gearInstances;
}

function repairNextInstanceSeq() {
  ensureGearData();
  let maxSeq = 0;
  const stores = [state.data.weaponInstances || {}, state.data.gearInstances || {}];
  for (const store of stores) {
    for (const id of Object.keys(store)) {
      const m = String(id).match(/#(\d+)$/);
      if (m) maxSeq = Math.max(maxSeq, Number(m[1]) || 0);
    }
  }
  const repaired = Math.max(state.data.nextInstanceSeq, maxSeq + 1);
  if (repaired === state.data.nextInstanceSeq) return false;
  state.data.nextInstanceSeq = repaired;
  return true;
}

state.isGearInstance = function isGearInstance(id) {
  ensureGearData(this);
  return !!this.data.gearInstances[id];
};

state.gearInstanceAffixes = function gearInstanceAffixes(id) {
  ensureGearData(this);
  return this.data.gearInstances[id]?.affixes || [];
};

state.equipmentInstance = function equipmentInstance(id) {
  return this.data.weaponInstances?.[id] || this.data.gearInstances?.[id] || null;
};

state.equipmentRollMeta = function equipmentRollMeta(id) {
  const inst = this.equipmentInstance(id);
  if (!inst) return null;
  const item = getItem(id);
  const band = itemPowerBand(inst.itemPower || 1);
  return {
    itemPower: inst.itemPower || 1,
    affixTier: inst.affixTier || affixTierForItemPower(inst.itemPower || 1),
    displayName: inst.displayName || item?.name || id,
    greaterAffixCount: inst.greaterAffixCount || 0,
    bandId: band.id,
    bandLabel: band.label,
  };
};

state.equipmentDisplayName = function equipmentDisplayName(id) {
  return this.equipmentRollMeta(id)?.displayName || getItem(id)?.name || id;
};

function clearGearInstanceData(id) {
  ensureGearData();
  if (!state.data.gearInstances[id]) return false;
  delete state.data.gearInstances[id];
  delete state.data.itemLocked[id];
  delete state.data.itemFavorite[id];
  delete state.data.weaponAffix2?.[id];
  delete state.data.itemAwakenKills?.[id];
  return true;
}

// This patch is loaded before Smart Loot and the Abyss IP bridge. Therefore the
// outer wrappers still see the completed instance, while Abyss can enrich ctx
// with itemPowerTarget before control reaches here.
const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3GearAddItem(itemId, qty = 1, dropCtx = null) {
  ensureGearData(this);
  repairNextInstanceSeq();

  if (this.data.gearInstances[itemId]) {
    this.data.inventory[itemId] = (this.data.inventory[itemId] || 0) + qty;
    this.save();
    return false;
  }

  const item = getItem(itemId);
  if (!item || !EQUIPMENT3_GEAR_SLOTS.includes(item.slot)) {
    return previousAddItem(itemId, qty, dropCtx);
  }

  const base = baseItemId(itemId);
  const amount = Math.max(1, Math.floor(Number(qty) || 1));
  this._lastGearInstanceIds = [];
  for (let i = 0; i < amount; i += 1) {
    const instanceId = `${base}#${this.data.nextInstanceSeq++}`;
    const inst = buildGearInstance(item, dropCtx || {}, instanceId);
    if (!inst) continue;
    this.data.gearInstances[instanceId] = inst;
    this.data.inventory[instanceId] = 1;
    this._lastGearInstanceIds.push(instanceId);
  }
  this.save();
  return false;
};

state.consumeLastGearInstanceId = function consumeLastGearInstanceId() {
  const ids = this._lastGearInstanceIds || [];
  const id = ids.length ? ids.shift() : null;
  if (!ids.length) this._lastGearInstanceIds = [];
  return id;
};

// Apply non-weapon Affix stats after the existing canonical stat pipeline.
// Weapon Affixes remain owned by state.js and are not touched here.
const previousGetStats = state.getStats.bind(state);
state.getStats = function equipment3GearStats() {
  const stats = previousGetStats();
  const combined = {};
  for (const slot of ['shield', 'head', 'body', 'accessory1', 'accessory2']) {
    const id = this.data.equipped?.[slot];
    if (!id || !this.data.gearInstances?.[id]) continue;
    const { statBonus } = splitAffixesForApplication(this.gearInstanceAffixes(id));
    for (const [key, value] of Object.entries(statBonus)) combined[key] = (combined[key] || 0) + value;
  }

  for (const key of ['hp', 'mp', 'atk', 'def', 'mag']) {
    if (combined[key]) stats[key] = Math.max(1, Math.round(stats[key] * (1 + combined[key])));
  }
  if (combined.spd) stats.spd = Math.max(0.1, Math.round(stats.spd * (1 + combined.spd) * 10) / 10);
  if (combined.critPct) stats.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, stats.critPct + combined.critPct * 100);
  if (combined.armorPen) stats.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, Math.max(0, (stats.armorPen || 0) + combined.armorPen));
  if (combined.evasion) stats.evasion = Math.min(CAPS_LAYER.EVASION_MAX, Math.max(0, (stats.evasion || 0) + combined.evasion));
  return stats;
};

const previousGetEquippedEffects = state.getEquippedEffects.bind(state);
state.getEquippedEffects = function equipment3GearEffects() {
  const effects = previousGetEquippedEffects();
  for (const slot of ['shield', 'head', 'body', 'accessory1', 'accessory2']) {
    const id = this.data.equipped?.[slot];
    if (!id || !this.data.gearInstances?.[id]) continue;
    const split = splitAffixesForApplication(this.gearInstanceAffixes(id));
    effects.push(...split.effects);
  }
  return effects;
};

function effectPowerScore(effects) {
  return (effects || []).reduce((sum, e) => {
    const power = Math.abs(Number(e.power) || 0);
    const chance = e.chance == null ? 1 : Math.max(0, Math.min(1, Number(e.chance) || 0));
    return sum + power * 220 * (e.trigger === 'passive' ? 1 : chance);
  }, 0);
}

function statAffixScore(statBonus) {
  return Object.entries(statBonus || {}).reduce((sum, [stat, value]) => {
    const weight = ['critPct', 'armorPen', 'evasion'].includes(stat) ? 260 : 180;
    return sum + Math.abs(Number(value) || 0) * weight;
  }, 0);
}

state.gearItemPower = function gearItemPower(id) {
  const item = getItem(id);
  if (!item) return -Infinity;
  let score = powerScore(item);
  const inst = this.data.gearInstances?.[id];
  if (!inst) return score;
  const split = splitAffixesForApplication(inst.affixes || []);
  score += statAffixScore(split.statBonus) + effectPowerScore(split.effects);
  return Math.round(score * 10) / 10;
};

state.equipmentPowerScore = function equipmentPowerScore(id) {
  const item = getItem(id);
  if (!item) return -Infinity;
  if (item.slot === 'weapon' && this.weaponItemPower) return this.weaponItemPower(id);
  if (this.data.gearInstances?.[id]) return this.gearItemPower(id);
  return powerScore(item);
};

// Upgrade auto-equip so new armor/accessory Affixes are not ignored.
state.autoEquipBest = function equipment3AutoEquipBest() {
  const pool = { ...this.data.inventory };
  for (const slot of SLOTS) {
    const id = this.data.equipped?.[slot];
    if (id) pool[id] = (pool[id] || 0) + 1;
  }
  const used = {};
  const next = {};

  const takeBest = (slotType) => {
    let best = null;
    let bestScore = -Infinity;
    for (const [id, qty] of Object.entries(pool)) {
      if (qty - (used[id] || 0) <= 0) continue;
      const item = getItem(id);
      if (!item || item.slot !== slotType || !this.canEquipItem(item)) continue;
      const score = this.equipmentPowerScore(id);
      if (score > bestScore) { best = id; bestScore = score; }
    }
    return best;
  };

  for (const slot of ['weapon', 'shield', 'head', 'body']) {
    const id = takeBest(slot);
    next[slot] = id;
    if (id) used[id] = (used[id] || 0) + 1;
  }
  for (const slot of ['accessory1', 'accessory2']) {
    const id = takeBest('accessory');
    next[slot] = id;
    if (id) used[id] = (used[id] || 0) + 1;
  }

  const bag = {};
  for (const [id, qty] of Object.entries(pool)) {
    const left = qty - (used[id] || 0);
    if (left > 0) bag[id] = left;
  }
  this.data.inventory = bag;
  this.data.equipped = next;
  this.save();
};

const previousSellItem = state.sellItem.bind(state);
state.sellItem = function equipment3GearSell(itemId, qty = 1) {
  const result = previousSellItem(itemId, qty);
  if (result !== false && (this.data.inventory[itemId] || 0) <= 0) {
    if (clearGearInstanceData(itemId)) this.save();
  }
  return result;
};

const previousDismantleItem = state.dismantleItem.bind(state);
state.dismantleItem = function equipment3GearDismantle(itemId, qty = 1) {
  const result = previousDismantleItem(itemId, qty);
  if (result !== false && (this.data.inventory[itemId] || 0) <= 0) {
    if (clearGearInstanceData(itemId)) this.save();
  }
  return result;
};

ensureGearData();
if (repairNextInstanceSeq()) state.save();

export { ensureGearData, clearGearInstanceData, repairNextInstanceSeq };
