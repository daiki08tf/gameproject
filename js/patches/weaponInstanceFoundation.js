/* ============================================================
   Weapon instance foundation patch
   ------------------------------------------------------------
   PR#4 introduced per-drop weapon instance IDs (baseItemId#seq).
   This compatibility layer fixes legacy systems that still assumed
   same-name weapons shared one inventory key.

   Kept separate from state.js so the change is easy to review and
   remove once the same logic is folded into StateManager directly.
   ============================================================ */
import { state } from '../state.js';
import {
  getItem,
  baseItemId,
  powerScore,
  SLOTS,
  weaponAffinityBonus,
} from '../data/equipment.js';
import {
  EQUIPMENT_LAYER,
  WEAPON_CODEX_LAYER,
} from '../data/balance.js';
import { splitAffixesForApplication } from '../data/affixes.js';

function effectPowerScore(effects) {
  let score = 0;
  for (const e of effects || []) {
    const p = Math.abs(e.power || 0);
    const chance = e.chance == null ? 1 : Math.max(0, Math.min(1, e.chance));
    const triggerWeight = e.trigger === 'passive' ? 1 : chance;
    score += p * 220 * triggerWeight;
  }
  return score;
}

function statAffixScore(statBonus) {
  let score = 0;
  for (const [stat, value] of Object.entries(statBonus || {})) {
    const weight = (stat === 'critPct' || stat === 'armorPen' || stat === 'evasion') ? 260 : 180;
    score += Math.abs(value || 0) * weight;
  }
  return score;
}

state.weaponItemPower = function weaponItemPower(itemId) {
  const item = getItem(itemId);
  if (!item) return -Infinity;

  let score = powerScore(item);
  if (item.slot !== 'weapon') return score;

  const enhanced = this.weaponEnhanceLevel(itemId);
  score *= 1 + enhanced * EQUIPMENT_LAYER.ENHANCE_BONUS_PER_LEVEL;

  const parts = splitAffixesForApplication(this.weaponInstanceAffixes(itemId));
  score += statAffixScore(parts.statBonus);
  score += effectPowerScore(parts.effects);

  const affinity = weaponAffinityBonus(item, this.currentJob.weapon);
  if (affinity) score *= affinity.mult;

  return Math.round(score * 10) / 10;
};

state.enhanceMaterialCandidates = function enhanceMaterialCandidates(targetId) {
  const targetBase = baseItemId(targetId);
  const out = [];

  for (const [id, qty] of Object.entries(this.data.inventory)) {
    if (qty <= 0) continue;
    if (baseItemId(id) !== targetBase) continue;
    if (this.isItemLocked(id) || this.isItemFavorite(id)) continue;

    const reserve = this.isWeaponInstance(targetId) && id === targetId ? 1 : 0;
    for (let i = reserve; i < qty; i++) out.push(id);
  }

  out.sort((a, b) => this.weaponItemPower(a) - this.weaponItemPower(b));
  return out;
};

state.canEnhanceWeapon = function canEnhanceWeapon(itemId, useEssence = false) {
  const level = this.weaponEnhanceLevel(itemId);
  if (level >= EQUIPMENT_LAYER.ENHANCE_MAX_LEVEL) return false;
  const needed = this.enhanceMaterialCount(level);
  const hasMaterial = useEssence
    ? this.data.weaponEssence >= this.essenceCostForEnhance(level)
    : this.enhanceMaterialCandidates(itemId).length >= needed;
  return hasMaterial && this.data.gold >= this.enhanceCost(level);
};

function clearInstanceData(id) {
  if (!state.isWeaponInstance(id)) return;
  delete state.data.weaponInstances[id];
  delete state.data.weaponEnhance[id];
  delete state.data.runeSockets[id];
  delete state.data.awakenedWeapons[id];
  delete state.data.weaponAffix[id];
  delete state.data.weaponAffix2[id];
  delete state.data.itemAwakenKills[id];
  delete state.data.itemLocked[id];
  delete state.data.itemFavorite[id];
}

function consumeInventoryUnit(id) {
  if ((state.data.inventory[id] || 0) <= 0) return false;
  state.data.inventory[id] -= 1;
  if (state.data.inventory[id] <= 0) {
    delete state.data.inventory[id];
    clearInstanceData(id);
  }
  return true;
}

state.enhanceWeapon = function enhanceWeapon(itemId, useEssence = false) {
  if (!this.canEnhanceWeapon(itemId, useEssence)) return false;

  const level = this.weaponEnhanceLevel(itemId);
  this.data.gold -= this.enhanceCost(level);

  if (useEssence) {
    this.data.weaponEssence -= this.essenceCostForEnhance(level);
  } else {
    const needed = this.enhanceMaterialCount(level);
    const materials = this.enhanceMaterialCandidates(itemId).slice(0, needed);
    if (materials.length < needed) return false;
    for (const id of materials) consumeInventoryUnit(id);
  }

  this.data.weaponEnhance[itemId] = level + 1;
  this.save();
  return true;
};

const originalSellItem = state.sellItem.bind(state);
state.sellItem = function sellItem(itemId, qty = 1) {
  const result = originalSellItem(itemId, qty);
  if (result !== false && (this.data.inventory[itemId] || 0) <= 0) clearInstanceData(itemId);
  if (result !== false) this.save();
  return result;
};

const originalDismantleItem = state.dismantleItem.bind(state);
state.dismantleItem = function dismantleItem(itemId, qty = 1) {
  const result = originalDismantleItem(itemId, qty);
  if (result !== false && (this.data.inventory[itemId] || 0) <= 0) clearInstanceData(itemId);
  if (result !== false) this.save();
  return result;
};

state.autoEquipBest = function autoEquipBest() {
  const pool = { ...this.data.inventory };
  for (const slot of SLOTS) {
    const id = this.data.equipped[slot];
    if (id) pool[id] = (pool[id] || 0) + 1;
  }

  const used = {};
  const newEquipped = {};

  const takeBest = (slotType) => {
    let best = null;
    let bestScore = -Infinity;
    for (const id in pool) {
      const remaining = pool[id] - (used[id] || 0);
      if (remaining <= 0) continue;
      const item = getItem(id);
      if (!item || item.slot !== slotType) continue;
      if (!this.canEquipItem(item)) continue;
      const score = slotType === 'weapon' ? this.weaponItemPower(id) : powerScore(item);
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
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
};

export { clearInstanceData };
