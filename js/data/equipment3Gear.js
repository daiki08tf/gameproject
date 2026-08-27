/* ============================================================
   Equipment 3.0 — Armor / Accessory foundation
   ------------------------------------------------------------
   Non-weapon equipment gets per-drop instances with Item Power, Option rarity,
   Option Lv, slot-biased identities, Greater rolls and shared special packages.
   ============================================================ */
import { AFFIXES, describeAffix } from './affixes.js';
import { EQUIPMENT3_AFFIX_SLOTS, itemPowerForDrop, affixTierForItemPower, generatedEquipmentName } from './equipment3.js';
import { optionFromAffix, applyAuthoredOptionValue, optionDisplayLabel } from './options4.js';
import { applyItemPowerAffixQuality } from './equipment3AffixQuality.js';
import { applyGreaterAffixes } from './equipment3Greater.js';
import { rollLegendaryPackage, getLegendaryEffect, getCursedAffix } from './equipment3Legendary.js';

export const EQUIPMENT3_GEAR_SLOTS = Object.freeze(['shield', 'head', 'body', 'accessory']);

export const GEAR_SLOT_AFFIX_BIAS = Object.freeze({
  shield: Object.freeze({ DEFENSE: 3.0, SUSTAIN: 2.0, BOSS: 1.5, RESOURCE: 1.2 }),
  head: Object.freeze({ MAGIC: 2.5, RESOURCE: 2.5, CRIT: 1.8, UTILITY: 1.5, SPEED: 1.2 }),
  body: Object.freeze({ DEFENSE: 2.8, SUSTAIN: 2.2, STATUS: 1.5, BOSS: 1.3 }),
  accessory: Object.freeze({ BUILD: 2.2, CRIT: 1.8, UTILITY: 1.7, SPEED: 1.5, RESOURCE: 1.5, OFFENSE: 1.3, MAGIC: 1.3 }),
});

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function hashUnit(text) {
  let h = 2166136261;
  for (const ch of String(text || 'gear')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function affixCount(item, instanceId) {
  const [lo, hi] = EQUIPMENT3_AFFIX_SLOTS[item?.rarity] || [0, 1];
  if (lo === hi) return lo;
  return clamp(lo + Math.floor(hashUnit(`${instanceId}:count`) * (hi - lo + 1)), lo, hi);
}

function affixWeight(slot, def) {
  return GEAR_SLOT_AFFIX_BIAS[slot]?.[def.category] || 1;
}

function isEligibleAffix(def, itemPower) {
  if (def.minRarity && itemPower < 3000) return false;
  return true;
}

function chooseAffixIdentities(item, count, itemPower, instanceId) {
  const pool = Object.entries(AFFIXES)
    .filter(([, def]) => isEligibleAffix(def, itemPower))
    .map(([id, def]) => ({ id, def, weight: affixWeight(item.slot, def) }));
  const out = [];
  const usedIds = new Set();
  const usedGroups = new Set();

  for (let index = 0; index < count; index += 1) {
    const eligible = pool.filter(({ id, def }) => !usedIds.has(id) && !(def.exclusiveGroup && usedGroups.has(def.exclusiveGroup)));
    if (!eligible.length) break;
    const total = eligible.reduce((sum, row) => sum + row.weight, 0);
    let cursor = hashUnit(`${instanceId}:affix:${index}`) * total;
    let picked = eligible[eligible.length - 1];
    for (const row of eligible) {
      cursor -= row.weight;
      if (cursor <= 0) { picked = row; break; }
    }
    usedIds.add(picked.id);
    if (picked.def.exclusiveGroup) usedGroups.add(picked.def.exclusiveGroup);
    out.push(optionFromAffix({ id: picked.id, rarity: 'common', roll: 0 }));
  }
  return out;
}

function canonicalGearName(item, inst) {
  const descriptions = (inst.affixes || []).map((a) => {
    const d = describeAffix(a);
    return { ...d, name: optionDisplayLabel(a, d.name) };
  });
  const generated = generatedEquipmentName(item.name, descriptions);
  const tags = [];
  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  if (legendary) tags.push(`《${legendary.name}》`);
  if (curse) tags.push(`【呪:${curse.name}】`);
  return `${inst.greaterAffixCount ? `${'★'.repeat(inst.greaterAffixCount)} ` : ''}${generated}${tags.length ? ` ${tags.join(' ')}` : ''}`;
}

export function buildGearInstance(item, ctx = {}, instanceId = '') {
  if (!item || !EQUIPMENT3_GEAR_SLOTS.includes(item.slot)) return null;
  const itemPower = itemPowerForDrop(item, ctx, instanceId);
  const inst = {
    itemId: item.id,
    slot: item.slot,
    itemPower,
    affixTier: affixTierForItemPower(itemPower),
    affixes: [],
    equipment3GearVersion: 4,
    optionMetadataVersion: 3,
    optionValueAuthorityVersion: 2,
  };

  inst.affixes = chooseAffixIdentities(item, affixCount(item, instanceId), itemPower, instanceId);
  applyItemPowerAffixQuality(inst, ctx, instanceId);
  const greater = applyGreaterAffixes(inst.affixes, itemPower, ctx, instanceId);
  inst.affixes = greater.affixes.map((affix, index) => applyAuthoredOptionValue(affix, {
    itemPower,
    ctx,
    key: `${instanceId}:${affix.familyId || affix.id}:${index}:${itemPower}`,
    initializeLevel: true,
  }));
  inst.greaterAffixCount = inst.affixes.filter((a) => !!a.greater).length;

  const special = rollLegendaryPackage(item, itemPower, ctx, instanceId);
  inst.legendaryEffectId = special.legendaryEffectId;
  inst.curseId = special.curseId;
  inst.displayName = canonicalGearName(item, inst);
  return inst;
}

export function gearSlotLabel(slot) {
  return ({ shield: '盾', head: '頭', body: '胴', accessory: 'アクセサリ' })[slot] || slot;
}

export { canonicalGearName };
