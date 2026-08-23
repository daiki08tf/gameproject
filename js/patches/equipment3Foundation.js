/* ============================================================
   Equipment 3.0 E1-E2 compatibility layer
   - persists Item Power on weapon instances
   - derives Affix Tier from Item Power
   - generates readable Prefix/Suffix names from existing Affix categories
   - backfills old weapon instances without rerolling any Affix
   ============================================================ */
import { state } from '../state.js';
import { getItem, baseItemId } from '../data/equipment.js';
import { describeAffix } from '../data/affixes.js';
import {
  itemPowerForDrop,
  affixTierForItemPower,
  generatedEquipmentName,
  itemPowerBand,
} from '../data/equipment3.js';

function enrichInstance(instanceId, ctx = {}) {
  const inst = state.data.weaponInstances?.[instanceId];
  if (!inst) return false;
  const item = getItem(inst.itemId || baseItemId(instanceId));
  if (!item || item.slot !== 'weapon') return false;

  let changed = false;
  if (!Number.isFinite(inst.itemPower)) {
    inst.itemPower = itemPowerForDrop(item, ctx, instanceId);
    changed = true;
  }
  const affixTier = affixTierForItemPower(inst.itemPower);
  if (inst.affixTier !== affixTier) {
    inst.affixTier = affixTier;
    changed = true;
  }
  const descriptions = (inst.affixes || []).map(describeAffix);
  const displayName = generatedEquipmentName(item.name, descriptions);
  if (inst.displayName !== displayName) {
    inst.displayName = displayName;
    changed = true;
  }
  if (inst.equipment3Version !== 1) {
    inst.equipment3Version = 1;
    changed = true;
  }
  return changed;
}

function backfillEquipment3Instances() {
  let changed = false;
  for (const id of Object.keys(state.data.weaponInstances || {})) {
    if (enrichInstance(id)) changed = true;
  }
  if (changed) state.save();
}

const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3AddItem(itemId, qty = 1, dropCtx = null) {
  const beforeSeq = Math.max(1, Math.floor(Number(this.data.nextInstanceSeq) || 1));
  const item = getItem(itemId);
  const result = previousAddItem(itemId, qty, dropCtx);
  const afterSeq = Math.max(beforeSeq, Math.floor(Number(this.data.nextInstanceSeq) || beforeSeq));

  let changed = false;
  if (item?.slot === 'weapon' && !this.data.weaponInstances?.[itemId]) {
    const base = baseItemId(itemId);
    for (let seq = beforeSeq; seq < afterSeq; seq++) {
      const id = `${base}#${seq}`;
      if (enrichInstance(id, dropCtx || {})) changed = true;
    }
  }
  if (changed) this.save();
  return result;
};

state.weaponRollMeta = function weaponRollMeta(itemId) {
  const inst = this.data.weaponInstances?.[itemId];
  if (!inst) return null;
  const band = itemPowerBand(inst.itemPower || 1);
  return {
    itemPower: inst.itemPower || 1,
    affixTier: inst.affixTier || affixTierForItemPower(inst.itemPower || 1),
    displayName: inst.displayName || getItem(itemId)?.name || itemId,
    bandId: band.id,
    bandLabel: band.label,
  };
};

state.weaponDisplayName = function weaponDisplayName(itemId) {
  return this.weaponRollMeta(itemId)?.displayName || getItem(itemId)?.name || itemId;
};

state.weaponRollItemPower = function weaponRollItemPower(itemId) {
  return this.weaponRollMeta(itemId)?.itemPower || 0;
};

backfillEquipment3Instances();

export { enrichInstance, backfillEquipment3Instances };
