/* ============================================================
   Equipment 3.0 E3 — Greater Affix runtime integration
   ============================================================ */
import { state } from '../state.js';
import { getItem, baseItemId } from '../data/equipment.js';
import { describeAffix } from '../data/affixes.js';
import { generatedEquipmentName } from '../data/equipment3.js';
import { applyGreaterAffixes } from '../data/equipment3Greater.js';

function applyGreaterToInstance(instanceId, ctx = {}) {
  const inst = state.data.weaponInstances?.[instanceId];
  if (!inst || !Number.isFinite(inst.itemPower)) return false;
  if (inst.greaterAffixVersion === 1) return false;

  const result = applyGreaterAffixes(inst.affixes || [], inst.itemPower, ctx, instanceId);
  inst.affixes = result.affixes;
  inst.greaterAffixCount = result.greaterCount;
  inst.greaterAffixChance = result.chance;
  inst.greaterAffixVersion = 1;

  const item = getItem(inst.itemId || baseItemId(instanceId));
  if (item) {
    const descriptions = inst.affixes.map(describeAffix);
    const generated = generatedEquipmentName(item.name, descriptions);
    inst.displayName = result.greaterCount > 0
      ? `${'★'.repeat(result.greaterCount)} ${generated}`
      : generated;
  }
  return true;
}

const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3GreaterAddItem(itemId, qty = 1, dropCtx = null) {
  const beforeSeq = Math.max(1, Math.floor(Number(this.data.nextInstanceSeq) || 1));
  const item = getItem(itemId);
  const result = previousAddItem(itemId, qty, dropCtx);
  const afterSeq = Math.max(beforeSeq, Math.floor(Number(this.data.nextInstanceSeq) || beforeSeq));

  let changed = false;
  if (item?.slot === 'weapon' && !this.data.weaponInstances?.[itemId]) {
    const base = baseItemId(itemId);
    for (let seq = beforeSeq; seq < afterSeq; seq++) {
      const id = `${base}#${seq}`;
      if (applyGreaterToInstance(id, dropCtx || {})) changed = true;
    }
  }
  if (changed) this.save();
  return result;
};

state.weaponGreaterAffixCount = function weaponGreaterAffixCount(itemId) {
  return Math.max(0, Math.floor(Number(this.data.weaponInstances?.[itemId]?.greaterAffixCount) || 0));
};

export { applyGreaterToInstance };
