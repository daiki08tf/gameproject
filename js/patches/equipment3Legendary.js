/* ============================================================
   Equipment 3.0 E4 — Legendary/Cursed runtime integration
   ============================================================ */
import { state } from '../state.js';
import { getItem, baseItemId } from '../data/equipment.js';
import {
  rollLegendaryPackage,
  getLegendaryEffect,
  getCursedAffix,
} from '../data/equipment3Legendary.js';

function applyLegendaryPackage(instanceId, ctx = {}) {
  const inst = state.data.weaponInstances?.[instanceId];
  if (!inst || !Number.isFinite(inst.itemPower)) return false;
  if (inst.legendaryPackageVersion === 1) return false;
  const item = getItem(inst.itemId || baseItemId(instanceId));
  if (!item || item.slot !== 'weapon') return false;

  const rolled = rollLegendaryPackage(item, inst.itemPower, ctx, instanceId);
  inst.legendaryEffectId = rolled.legendaryEffectId;
  inst.curseId = rolled.curseId;
  inst.legendaryEffectChance = rolled.legendaryChance;
  inst.curseChance = rolled.curseChance;
  inst.legendaryPackageVersion = 1;

  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  const tags = [];
  if (legendary) tags.push(`《${legendary.name}》`);
  if (curse) tags.push(`【呪:${curse.name}】`);
  if (tags.length) inst.displayName = `${inst.displayName || item.name} ${tags.join(' ')}`;
  return true;
}

const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3LegendaryAddItem(itemId, qty = 1, dropCtx = null) {
  const beforeSeq = Math.max(1, Math.floor(Number(this.data.nextInstanceSeq) || 1));
  const item = getItem(itemId);
  const result = previousAddItem(itemId, qty, dropCtx);
  const afterSeq = Math.max(beforeSeq, Math.floor(Number(this.data.nextInstanceSeq) || beforeSeq));

  let changed = false;
  if (item?.slot === 'weapon' && !this.data.weaponInstances?.[itemId]) {
    const base = baseItemId(itemId);
    for (let seq = beforeSeq; seq < afterSeq; seq++) {
      const id = `${base}#${seq}`;
      if (applyLegendaryPackage(id, dropCtx || {})) changed = true;
    }
  }
  if (changed) this.save();
  return result;
};

const previousGetEquippedEffects = state.getEquippedEffects.bind(state);
state.getEquippedEffects = function equipment3EquippedEffects() {
  const effects = previousGetEquippedEffects();
  const weaponId = this.data.equipped.weapon;
  const inst = this.data.weaponInstances?.[weaponId];
  if (!inst) return effects;

  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  if (legendary?.effects) effects.push(...legendary.effects.map((e) => ({ ...e, __equipment3Legendary: inst.legendaryEffectId })));
  if (curse?.effects) effects.push(...curse.effects.map((e) => ({ ...e, __equipment3Curse: inst.curseId })));
  return effects;
};

const previousGetStats = state.getStats.bind(state);
state.getStats = function equipment3CursedStats() {
  const stats = previousGetStats();
  const weaponId = this.data.equipped.weapon;
  const inst = this.data.weaponInstances?.[weaponId];
  const curse = getCursedAffix(inst?.curseId);
  if (!curse?.statMult) return stats;

  const out = { ...stats };
  for (const [stat, mult] of Object.entries(curse.statMult)) {
    if (Number.isFinite(out[stat])) out[stat] = Math.max(1, Math.round(out[stat] * mult * 10) / 10);
  }
  return out;
};

state.weaponLegendaryPackage = function weaponLegendaryPackage(itemId) {
  const inst = this.data.weaponInstances?.[itemId];
  if (!inst) return null;
  return {
    legendaryEffectId: inst.legendaryEffectId || null,
    legendaryEffect: getLegendaryEffect(inst.legendaryEffectId),
    curseId: inst.curseId || null,
    curse: getCursedAffix(inst.curseId),
  };
};

export { applyLegendaryPackage };
