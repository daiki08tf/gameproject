/* ============================================================
   Equipment 3.0 E1-E2 compatibility layer
   - persists Item Power on weapon instances
   - derives Option tier from Item Power
   - generates readable rarity-name + Lv presentation
   - backfills old weapon instances without rerolling any Option
   - repairs persisted instance metadata without changing rolled outcomes
   ============================================================ */
import { state } from '../state.js';
import { getItem, baseItemId } from '../data/equipment.js';
import { describeAffix } from '../data/affixes.js';
import '../data/options4RarityFloors.js';
import { optionCountRange, optionFromAffix, applyAuthoredOptionValue, optionDisplayLabel } from '../data/options4.js';
import {
  itemPowerForDrop,
  affixTierForItemPower,
  generatedEquipmentName,
  itemPowerBand,
} from '../data/equipment3.js';
import { getLegendaryEffect, getCursedAffix } from '../data/equipment3Legendary.js';

function canonicalDisplayName(item, inst) {
  const descriptions = (inst.affixes || []).map((a) => {
    const d = describeAffix(a);
    return { ...d, name: optionDisplayLabel(a, d.name) };
  });
  const generated = generatedEquipmentName(item.name, descriptions);
  const greaterCount = (inst.affixes || []).filter((a) => !!a?.greater).length;
  const tags = [];
  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  if (legendary) tags.push(`《${legendary.name}》`);
  if (curse) tags.push(`【呪:${curse.name}】`);
  return `${greaterCount ? `${'★'.repeat(greaterCount)} ` : ''}${generated}${tags.length ? ` ${tags.join(' ')}` : ''}`;
}

function capNewWeaponOptions(inst, item) {
  if (!inst || !item || item.slot !== 'weapon' || !Array.isArray(inst.affixes)) return false;
  const [, max] = optionCountRange(item.rarity);
  if (inst.affixes.length <= max) return false;
  inst.affixes = inst.affixes.slice(0, max);
  inst.optionCountVersion = 1;
  return true;
}

function attachNewWeaponOptionMetadata(inst, ctx = {}, instanceId = '') {
  if (!inst || !Array.isArray(inst.affixes)) return false;
  let changed = false;
  const itemPower = Math.max(1, Math.floor(Number(inst.itemPower) || 1));
  inst.affixes = inst.affixes.map((affix, index) => {
    const alreadyCurrent = affix?.optionValueVersion === 2;
    if (alreadyCurrent) return affix;
    const base = optionFromAffix(affix);
    const next = applyAuthoredOptionValue(base, {
      itemPower,
      ctx,
      key: `${instanceId}:${base?.familyId || base?.id}:${index}:${itemPower}`,
      initializeLevel: true,
    });
    if (next !== affix) changed = true;
    return next;
  });
  if (changed) {
    inst.optionMetadataVersion = 3;
    inst.optionValueAuthorityVersion = 2;
  }
  return changed;
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

  const actualGreaterCount = inst.affixes.filter((a) => !!a?.greater).length;
  if (inst.greaterAffixCount !== actualGreaterCount) {
    inst.greaterAffixCount = actualGreaterCount;
    changed = true;
  }

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
      const inst = this.data.weaponInstances?.[id];
      if (capNewWeaponOptions(inst, item)) changed = true;
      if (enrichInstance(id, dropCtx || {})) changed = true;
      if (attachNewWeaponOptionMetadata(inst, dropCtx || {}, id)) changed = true;
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

export {
  enrichInstance,
  backfillEquipment3Instances,
  repairNextInstanceSeq,
  canonicalDisplayName,
  capNewWeaponOptions,
  attachNewWeaponOptionMetadata,
};
