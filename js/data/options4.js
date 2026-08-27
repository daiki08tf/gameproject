/* ============================================================
   Gear Overhaul — Option 4.0 compatibility foundation
   ------------------------------------------------------------
   Phase 1 starts by adding stable Option metadata without changing the
   existing Affix combat pipeline. Existing `affixes[].roll` remains
   authoritative until the value-curve migration is explicitly enabled.
   ============================================================ */

import { AFFIX_RARITY, affixRarityIndex } from './affixes.js';

export const OPTION_SCHEMA_VERSION = 1;
export const OPTION_LEVEL_MIN = 1;
export const OPTION_LEVEL_MAX = 100;

// Canonical random-option counts approved by the Gear Overhaul roadmap.
export const OPTION_COUNT_BY_EQUIPMENT_RARITY = Object.freeze({
  normal: Object.freeze([0, 1]),
  rare: Object.freeze([1, 1]),
  epic: Object.freeze([1, 2]),
  legendary: Object.freeze([2, 3]),
  mythic: Object.freeze([3, 3]),
});

export const OPTION_RARITY = Object.freeze([...AFFIX_RARITY]);

// Authored rarity ladders are keyed by stable family id. Families without a
// ladder intentionally fall back to the current Affix display name until they
// are audited, so this foundation does not create placeholder nonsense names.
export const OPTION_NAME_LADDERS = Object.freeze({
  atk_pct: Object.freeze({
    common: '怪力',
    uncommon: '剛力',
    rare: '豪腕',
    epic: '鬼力',
    legendary: '覇力',
    mythic: '神力',
    ancient: '天威',
  }),
});

export const OPTION_CURVE_CLASS = Object.freeze({
  RAW_PCT: 'raw_pct',
  SMALL_PCT: 'small_pct',
  PROC_CHANCE: 'proc_chance',
  TRIGGER_POWER: 'trigger_power',
  DISCRETE: 'discrete',
  UTILITY: 'utility',
});

function clampInt(value, lo, hi) {
  const n = Math.floor(Number(value));
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

export function optionCountRange(equipmentRarity) {
  return OPTION_COUNT_BY_EQUIPMENT_RARITY[equipmentRarity] || OPTION_COUNT_BY_EQUIPMENT_RARITY.normal;
}

export function optionDisplayName(familyId, rarity, fallbackName = familyId) {
  return OPTION_NAME_LADDERS[familyId]?.[rarity] || fallbackName || familyId;
}

export function normalizeOptionLevel(level) {
  return clampInt(level, OPTION_LEVEL_MIN, OPTION_LEVEL_MAX);
}

export function normalizeOptionRarity(rarity) {
  return affixRarityIndex(rarity) >= 0 ? rarity : OPTION_RARITY[0];
}

/**
 * Backward-compatible view of a current Affix as an Option 4.0 record.
 *
 * `roll` remains preserved and authoritative during Phase 1. New drops and
 * migrations can safely attach level/xp metadata before combat-value formulas
 * move from roll bands to rarity + level curves.
 */
export function optionFromAffix(affix, { level = OPTION_LEVEL_MIN, xp = 0 } = {}) {
  if (!affix?.id) return null;
  return {
    ...affix,
    optionSchemaVersion: OPTION_SCHEMA_VERSION,
    familyId: affix.familyId || affix.id,
    rarity: normalizeOptionRarity(affix.rarity),
    level: normalizeOptionLevel(affix.level ?? level),
    xp: Math.max(0, Math.floor(Number(affix.xp ?? xp) || 0)),
  };
}

export function isOption4(value) {
  return !!value
    && value.optionSchemaVersion === OPTION_SCHEMA_VERSION
    && typeof value.familyId === 'string'
    && normalizeOptionLevel(value.level) === value.level;
}

export function optionMaterialEfficiency(targetRarity, materialRarity) {
  const target = Math.max(0, affixRarityIndex(normalizeOptionRarity(targetRarity)));
  const material = Math.max(0, affixRarityIndex(normalizeOptionRarity(materialRarity)));
  if (material >= target) return 1;
  const gap = target - material;
  return gap === 1 ? 0.8 : gap === 2 ? 0.6 : gap === 3 ? 0.4 : 0.2;
}
