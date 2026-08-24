/* ============================================================
   Equipment 3.0 — Set bonus runtime
   ============================================================ */
import { state } from '../state.js';
import { getItem, SLOTS } from '../data/equipment.js';
import { EQUIPMENT3_SETS } from '../data/equipment3Sets.js';
import { CAPS_LAYER } from '../data/balance.js';

state.equipmentSetCounts = function equipmentSetCounts() {
  const counts = {};
  for (const slot of SLOTS) {
    const id = this.data.equipped?.[slot];
    const item = id ? getItem(id) : null;
    if (!item?.setId) continue;
    counts[item.setId] = (counts[item.setId] || 0) + 1;
  }
  return counts;
};

state.activeEquipmentSetBonuses = function activeEquipmentSetBonuses() {
  const counts = this.equipmentSetCounts();
  const active = [];
  for (const [setId, count] of Object.entries(counts)) {
    const def = EQUIPMENT3_SETS[setId];
    if (!def) continue;
    for (const threshold of [2, 3]) {
      if (count < threshold || !def.bonuses?.[threshold]) continue;
      active.push({ setId, setName: def.name, pieces: count, threshold, ...def.bonuses[threshold] });
    }
  }
  return active;
};

const previousGetStats = state.getStats.bind(state);
state.getStats = function equipment3SetStats() {
  const stats = previousGetStats();
  const mult = {};
  const add = {};
  for (const bonus of this.activeEquipmentSetBonuses()) {
    for (const [key, value] of Object.entries(bonus.statMult || {})) mult[key] = (mult[key] || 1) * value;
    for (const [key, value] of Object.entries(bonus.statAdd || {})) add[key] = (add[key] || 0) + value;
  }

  for (const key of ['hp', 'mp', 'atk', 'def', 'mag']) {
    if (mult[key]) stats[key] = Math.max(1, Math.round(stats[key] * mult[key]));
  }
  if (mult.spd) stats.spd = Math.max(0.1, Math.round(stats.spd * mult.spd * 10) / 10);
  if (add.critPct) stats.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, stats.critPct + add.critPct);
  if (add.armorPen) stats.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, Math.max(0, (stats.armorPen || 0) + add.armorPen));
  if (add.evasion) stats.evasion = Math.min(CAPS_LAYER.EVASION_MAX, Math.max(0, (stats.evasion || 0) + add.evasion));
  return stats;
};

const previousGetEquippedEffects = state.getEquippedEffects.bind(state);
state.getEquippedEffects = function equipment3SetEffects() {
  const effects = previousGetEquippedEffects();
  for (const bonus of this.activeEquipmentSetBonuses()) {
    for (const effect of bonus.effects || []) {
      effects.push({ ...effect, __equipment3Set: bonus.setId, __setThreshold: bonus.threshold });
    }
  }
  return effects;
};

state.equipmentSetStatus = function equipmentSetStatus() {
  const counts = this.equipmentSetCounts();
  return Object.entries(EQUIPMENT3_SETS).map(([setId, def]) => ({
    setId,
    name: def.name,
    count: counts[setId] || 0,
    twoPieceActive: (counts[setId] || 0) >= 2,
    threePieceActive: (counts[setId] || 0) >= 3,
    twoPieceDesc: def.bonuses?.[2]?.desc || '',
    threePieceDesc: def.bonuses?.[3]?.desc || '',
  }));
};
