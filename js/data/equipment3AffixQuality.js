/* ============================================================
   Equipment 3.0 — Item Power -> Option quality bridge
   ------------------------------------------------------------
   Keeps the existing seven-rarity distribution, while Gear Overhaul Phase 1
   gives authored core families a drop-time Option Lv and makes rarity + level
   authoritative for their value. Non-authored families keep legacy roll bands.
   ============================================================ */
import { AFFIXES, AFFIX_RARITY, affixRarityIndex } from './affixes.js';
import { applyAuthoredOptionValue } from './options4.js';

const ITEM_POWER_MIN_ENDGAME = 1000;
const ITEM_POWER_MAX = 10000;
const GREATER_MULT = 1.5;

const SCALE = Object.freeze({
  big: [[2, 4], [4, 6], [6, 9], [9, 13], [13, 17], [17, 22], [22, 28]],
  medium: [[1, 2], [2, 3], [3, 4.5], [4.5, 6.5], [6.5, 9], [9, 12], [12, 16]],
  regen: [[0.3, 0.6], [0.6, 0.9], [0.9, 1.3], [1.3, 1.8], [1.8, 2.4], [2.4, 3.1], [3.1, 4.0]],
  small: [[0.5, 1], [1, 1.6], [1.6, 2.4], [2.4, 3.4], [3.4, 4.6], [4.6, 6], [6, 8]],
  chance: [[3, 5], [5, 8], [8, 12], [12, 17], [17, 23], [23, 30], [30, 38]],
});

const BASE_RARITY_WEIGHT = Object.freeze({
  common: 100, uncommon: 55, rare: 26, epic: 11, legendary: 4, mythic: 1.2, ancient: 0.3,
});

const IP_RARITY_SLOPE = Object.freeze({
  common: -2.2,
  uncommon: -1.4,
  rare: -0.6,
  epic: 0.2,
  legendary: 1.2,
  mythic: 2.0,
  ancient: 2.6,
});

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round2(v) { return Math.round(v * 100) / 100; }

function hashUnit(text) {
  let h = 2166136261;
  for (const ch of String(text || 'bladevale')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function affixQualityProgress(itemPower, ctx = {}) {
  const ip = clamp(Math.floor(Number(itemPower) || 1), 1, ITEM_POWER_MAX);
  let p = ip <= ITEM_POWER_MIN_ENDGAME
    ? 0
    : (ip - ITEM_POWER_MIN_ENDGAME) / (ITEM_POWER_MAX - ITEM_POWER_MIN_ENDGAME);
  if (ctx.elite) p += 0.025;
  if (ctx.boss) p += 0.05;
  if (ctx.ex) p += 0.07;
  if (ctx.nemesis) p += 0.10;
  return clamp(p, 0, 1);
}

export function affixRarityWeightsForItemPower(itemPower, ctx = {}) {
  const p = affixQualityProgress(itemPower, ctx);
  const out = {};
  for (const rarity of AFFIX_RARITY) {
    out[rarity] = BASE_RARITY_WEIGHT[rarity] * Math.exp(IP_RARITY_SLOPE[rarity] * p);
  }
  return out;
}

export function affixRarityDistributionForItemPower(itemPower, ctx = {}) {
  const weights = affixRarityWeightsForItemPower(itemPower, ctx);
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(AFFIX_RARITY.map((rarity) => [rarity, weights[rarity] / total]));
}

function pickRarity(itemPower, ctx, key, minRarity = null) {
  const weights = affixRarityWeightsForItemPower(itemPower, ctx);
  const minIndex = minRarity ? Math.max(0, affixRarityIndex(minRarity)) : 0;
  const allowed = AFFIX_RARITY.slice(minIndex);
  const total = allowed.reduce((sum, rarity) => sum + weights[rarity], 0);
  let cursor = hashUnit(`${key}:rarity`) * total;
  for (const rarity of allowed) {
    cursor -= weights[rarity];
    if (cursor <= 0) return rarity;
  }
  return allowed[allowed.length - 1] || AFFIX_RARITY[0];
}

function rollForRarity(def, rarity, key, greater = false) {
  const rarityIndex = Math.max(0, affixRarityIndex(rarity));
  const range = SCALE[def?.scale]?.[rarityIndex];
  if (!range) return null;
  const t = hashUnit(`${key}:roll`);
  const base = range[0] + (range[1] - range[0]) * t;
  return round2(base * (greater ? GREATER_MULT : 1));
}

export function applyItemPowerAffixQuality(inst, ctx = {}, instanceId = '') {
  if (!inst || !Array.isArray(inst.affixes) || inst.affixes.length === 0) return false;
  const itemPower = clamp(Math.floor(Number(inst.itemPower) || 1), 1, ITEM_POWER_MAX);
  let changed = false;

  inst.affixes = inst.affixes.map((affix, index) => {
    const def = AFFIXES[affix.id];
    if (!def) return affix;
    const key = `${instanceId}:${affix.id}:${index}:${itemPower}`;
    const rarity = pickRarity(itemPower, ctx, key, def.minRarity || null);
    const rolled = rollForRarity(def, rarity, key, !!affix.greater);
    const legacyNext = {
      ...affix,
      rarity,
      ...(rolled == null ? {} : { roll: rolled }),
    };
    const next = applyAuthoredOptionValue(legacyNext, {
      itemPower,
      ctx,
      key,
      initializeLevel: true,
    });
    if (next.rarity !== affix.rarity || next.roll !== affix.roll || next.level !== affix.level) changed = true;
    return next;
  });

  inst.affixes.sort((a, b) => affixRarityIndex(b.rarity) - affixRarityIndex(a.rarity));
  inst.affixQualityVersion = 2;
  inst.optionValueAuthorityVersion = 1;
  return changed;
}
