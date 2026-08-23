/* ============================================================
   Equipment 3.0 E8 — Smart Loot / Loot Filter 3.0 runtime
   ============================================================ */
import { state } from '../state.js';
import { getItem, baseItemId } from '../data/equipment.js';
import {
  normalizeLootFilter3,
  equipment3FilterMatches,
  smartLootReasons,
  shouldAutoLockEquipment,
} from '../data/equipment3SmartLoot.js';

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function ensureLootFilter3(target = state) {
  const before = target.data.lootFilter || {};
  const next = normalizeLootFilter3(before);
  target.data.lootFilter = next;
  return { filter: next, changed: !sameJson(before, next) };
}

state.getLootFilter3 = function getLootFilter3() {
  return ensureLootFilter3(this).filter;
};

state.setLootFilterMinRarity = function setLootFilterMinRarity(rarity) {
  const current = this.getLootFilter3();
  this.data.lootFilter = normalizeLootFilter3({ ...current, minRarity: rarity || 'normal' });
  this.save();
  return this.data.lootFilter;
};

state.updateLootFilter3 = function updateLootFilter3(patch = {}) {
  const current = this.getLootFilter3();
  const merged = {
    ...current,
    ...patch,
    autoLock: patch.autoLock
      ? { ...current.autoLock, ...patch.autoLock }
      : current.autoLock,
  };
  this.data.lootFilter = normalizeLootFilter3(merged);
  this.save();
  return this.data.lootFilter;
};

state.resetLootFilter3 = function resetLootFilter3() {
  const current = this.getLootFilter3();
  this.data.lootFilter = normalizeLootFilter3({ minRarity: current.minRarity });
  this.save();
  return this.data.lootFilter;
};

state.passesLootFilter = function passesLootFilter(itemOrId, maybeItem = null) {
  let itemId = null;
  let item = maybeItem;
  if (typeof itemOrId === 'string') {
    itemId = itemOrId;
    item = item || getItem(itemId);
  } else {
    item = itemOrId;
  }
  const inst = itemId ? this.data.weaponInstances?.[itemId] || null : null;
  return equipment3FilterMatches(item, inst, this.getLootFilter3());
};

state.smartLootReasons = function stateSmartLootReasons(itemId) {
  const item = getItem(itemId);
  const inst = this.data.weaponInstances?.[itemId] || null;
  return smartLootReasons(item, inst, this.getLootFilter3());
};

state.shouldAutoLockEquipment = function stateShouldAutoLockEquipment(itemId) {
  const item = getItem(itemId);
  const inst = this.data.weaponInstances?.[itemId] || null;
  return shouldAutoLockEquipment(item, inst, this.getLootFilter3());
};

state.applySmartLootLocks = function applySmartLootLocks() {
  let count = 0;
  this.data.itemLocked ||= {};
  for (const itemId of Object.keys(this.data.weaponInstances || {})) {
    if ((this.data.inventory[itemId] || 0) <= 0) continue;
    if (this.data.itemLocked[itemId]) continue;
    if (!this.shouldAutoLockEquipment(itemId)) continue;
    this.data.itemLocked[itemId] = true;
    count += 1;
  }
  if (count > 0) this.save();
  return count;
};

// E1-E6の付与処理がすべて完了したあとに、この一番外側のaddItemラッパーで
// Smart Lootを判定する。これによりIP / Greater / Legendary / Curseを
// 完成済みの個体として評価し、ドロップ直後から保護できる。
const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3SmartLootAddItem(itemId, qty = 1, dropCtx = null) {
  const beforeSeq = Math.max(1, Math.floor(Number(this.data.nextInstanceSeq) || 1));
  const item = getItem(itemId);
  const result = previousAddItem(itemId, qty, dropCtx);
  const afterSeq = Math.max(beforeSeq, Math.floor(Number(this.data.nextInstanceSeq) || beforeSeq));

  let changed = false;
  if (item?.slot === 'weapon' && !this.data.weaponInstances?.[itemId]) {
    const base = baseItemId(itemId);
    this.data.itemLocked ||= {};
    for (let seq = beforeSeq; seq < afterSeq; seq += 1) {
      const instanceId = `${base}#${seq}`;
      if (!this.data.weaponInstances?.[instanceId]) continue;
      if (!this.shouldAutoLockEquipment(instanceId)) continue;
      this.data.itemLocked[instanceId] = true;
      changed = true;
    }
  }
  if (changed) this.save();
  return result;
};

const normalized = ensureLootFilter3(state);
if (normalized.changed) state.save();

export { ensureLootFilter3 };
