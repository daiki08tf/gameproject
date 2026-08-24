/* ============================================================
   Equipment 3.0 E1-E2 compatibility layer
   - persists Item Power on weapon instances
   - derives Affix Tier from Item Power
   - generates readable Prefix/Suffix names from existing Affix categories
   - backfills old weapon instances without rerolling any Affix
   - repairs persisted instance metadata without changing rolled outcomes
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
import { getLegendaryEffect, getCursedAffix } from '../data/equipment3Legendary.js';

function canonicalDisplayName(item, inst) {
  const descriptions = (inst.affixes || []).map(describeAffix);
  const generated = generatedEquipmentName(item.name, descriptions);
  const greaterCount = (inst.affixes || []).filter((a) => !!a?.greater).length;
  const tags = [];
  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  if (legendary) tags.push(`《${legendary.name}》`);
  if (curse) tags.push(`【呪:${curse.name}】`);
  return `${greaterCount ? `${'★'.repeat(greaterCount)} ` : ''}${generated}${tags.length ? ` ${tags.join(' ')}` : ''}`;
}

function enrichInstance(instanceId, ctx = {}) {
  const inst = state.data.weaponInstances?.[instanceId];
  if (!inst) return false;
  const item = getItem(inst.itemId || baseItemId(instanceId));
  if (!item || item.slot !== 'weapon') return false;

  let changed = false;
  if (!Array.isArray(inst.affixes)) {
    inst.affixes = [];
    changed = true;
  }
  if (!Number.isFinite(inst.itemPower)) {
    inst.itemPower = itemPowerForDrop(item, ctx, instanceId);
    changed = true;
  }
  const affixTier = affixTierForItemPower(inst.itemPower);
  if (inst.affixTier !== affixTier) {
    inst.affixTier = affixTier;
    changed = true;
  }

  // greaterAffixCount is derived data. Crafting and old migrations can leave the
  // cached number stale; Smart Loot and presentation both read it, so repair it
  // from the actual Affix flags on load without rerolling anything.
  const actualGreaterCount = inst.affixes.filter((a) => !!a?.greater).length;
  if (inst.greaterAffixCount !== actualGreaterCount) {
    inst.greaterAffixCount = actualGreaterCount;
    changed = true;
  }

  // E1 used to rebuild displayName from Prefix/Suffix only on every page load,
  // stripping the persisted ★ / Legendary / Curse tags that E3/E4 had added.
  // Reconstruct the full canonical name from saved fields instead.
  const displayName = canonicalDisplayName(item, inst);
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

function repairNextInstanceSeq() {
  let maxSeq = 0;
  for (const id of Object.keys(state.data.weaponInstances || {})) {
    const match = String(id).match(/#(\d+)$/);
    if (match) maxSeq = Math.max(maxSeq, Number(match[1]) || 0);
  }
  const current = Math.max(1, Math.floor(Number(state.data.nextInstanceSeq) || 1));
  const repaired = Math.max(current, maxSeq + 1);
  if (state.data.nextInstanceSeq === repaired) return false;
  state.data.nextInstanceSeq = repaired;
  return true;
}

function backfillEquipment3Instances() {
  let changed = repairNextInstanceSeq();
  for (const id of Object.keys(state.data.weaponInstances || {})) {
    if (enrichInstance(id)) changed = true;
  }
  if (changed) state.save();
}

const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3AddItem(itemId, qty = 1, dropCtx = null) {
  // Guard against a restored/edited save whose next sequence counter points at an
  // already existing instance. Repair before the base addItem() allocates ids.
  repairNextInstanceSeq();
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

export { enrichInstance, backfillEquipment3Instances, repairNextInstanceSeq, canonicalDisplayName };
