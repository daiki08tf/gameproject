/* ============================================================
   Gear Overhaul — Option 4.0 canonical foundation
   ------------------------------------------------------------
   Phase 1B-1D: stable Option metadata, authored rarity identity,
   Lv1-100 curves and drop-time starting levels for the core raw-stat
   families. Existing non-migrated Affix families keep their saved roll
   until their own curve class is authored.
   ============================================================ */

export const OPTION_SCHEMA_VERSION = 1;
export const OPTION_LEVEL_MIN = 1;
export const OPTION_LEVEL_MAX = 100;

export const OPTION_RARITY = Object.freeze([
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'ancient',
]);

export const OPTION_COUNT_BY_EQUIPMENT_RARITY = Object.freeze({
  normal: Object.freeze([0, 1]),
  rare: Object.freeze([1, 1]),
  epic: Object.freeze([1, 2]),
  legendary: Object.freeze([2, 3]),
  mythic: Object.freeze([3, 3]),
});

export const OPTION_NAME_LADDERS = Object.freeze({
  atk_pct: Object.freeze({ common:'怪力', uncommon:'剛力', rare:'豪腕', epic:'鬼力', legendary:'覇力', mythic:'神力', ancient:'天威' }),
  mag_pct: Object.freeze({ common:'魔力', uncommon:'魔導', rare:'秘術', epic:'魔極', legendary:'賢者', mythic:'神秘', ancient:'天啓' }),
  def_pct: Object.freeze({ common:'頑健', uncommon:'堅牢', rare:'鉄壁', epic:'金剛', legendary:'不壊', mythic:'神鎧', ancient:'絶対防壁' }),
  hp_pct: Object.freeze({ common:'体力', uncommon:'壮健', rare:'不屈', epic:'豪胆', legendary:'不死身', mythic:'神命', ancient:'天命' }),
  mp_pct: Object.freeze({ common:'精神', uncommon:'魔泉', rare:'深魔', epic:'魔海', legendary:'大魔源', mythic:'神泉', ancient:'無窮' }),
  spd_pct: Object.freeze({ common:'軽快', uncommon:'疾風', rare:'迅雷', epic:'瞬迅', legendary:'神速', mythic:'雷神', ancient:'天駆' }),
  crit_pct: Object.freeze({ common:'鋭眼', uncommon:'鷹眼', rare:'慧眼', epic:'心眼', legendary:'天眼', mythic:'神眼', ancient:'万象視' }),
  evasion_pct: Object.freeze({ common:'身軽', uncommon:'軽業', rare:'見切り', epic:'幻歩', legendary:'無影', mythic:'神避', ancient:'空蝉' }),
  armorpen_pct: Object.freeze({ common:'貫き', uncommon:'甲砕き', rare:'破甲', epic:'断甲', legendary:'穿界', mythic:'神穿', ancient:'天断' }),
});

export const OPTION_CURVE_CLASS = Object.freeze({
  RAW_PCT: 'raw_pct',
  MEDIUM_PCT: 'medium_pct',
  SMALL_PCT: 'small_pct',
  PROC_CHANCE: 'proc_chance',
  TRIGGER_POWER: 'trigger_power',
  DISCRETE: 'discrete',
  UTILITY: 'utility',
});

const RAW_BASE = Object.freeze([2, 3, 4, 5.5, 7, 9, 12]);
const RAW_PER_LEVEL = Object.freeze([0.08, 0.10, 0.12, 0.15, 0.18, 0.22, 0.28]);
const MEDIUM_BASE = Object.freeze([1, 1.5, 2.2, 3.2, 4.5, 6, 8]);
const MEDIUM_PER_LEVEL = Object.freeze([0.035, 0.045, 0.055, 0.07, 0.09, 0.115, 0.145]);

export const OPTION_FAMILY_CURVES = Object.freeze({
  atk_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.RAW_PCT, base: RAW_BASE, perLevel: RAW_PER_LEVEL }),
  mag_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.RAW_PCT, base: RAW_BASE, perLevel: RAW_PER_LEVEL }),
  def_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.RAW_PCT, base: RAW_BASE, perLevel: RAW_PER_LEVEL }),
  hp_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.RAW_PCT, base: RAW_BASE, perLevel: RAW_PER_LEVEL }),
  mp_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.RAW_PCT, base: RAW_BASE, perLevel: RAW_PER_LEVEL }),
  spd_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.MEDIUM_PCT, base: MEDIUM_BASE, perLevel: MEDIUM_PER_LEVEL }),
  crit_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.MEDIUM_PCT, base: MEDIUM_BASE, perLevel: MEDIUM_PER_LEVEL }),
  evasion_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.MEDIUM_PCT, base: MEDIUM_BASE, perLevel: MEDIUM_PER_LEVEL }),
  armorpen_pct: Object.freeze({ curve: OPTION_CURVE_CLASS.MEDIUM_PCT, base: MEDIUM_BASE, perLevel: MEDIUM_PER_LEVEL }),
});

function clampInt(value, lo, hi) {
  const n = Math.floor(Number(value));
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}
function clamp(value, lo, hi) { return Math.max(lo, Math.min(hi, value)); }
function rarityIndex(rarity) { return OPTION_RARITY.indexOf(rarity); }
function round2(value) { return Math.round(value * 100) / 100; }
function hashUnit(text) {
  let h = 2166136261;
  for (const ch of String(text || 'bladevale-option')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function optionCountRange(equipmentRarity) {
  return OPTION_COUNT_BY_EQUIPMENT_RARITY[equipmentRarity] || OPTION_COUNT_BY_EQUIPMENT_RARITY.normal;
}

export function optionDisplayName(familyId, rarity, fallbackName = familyId) {
  return OPTION_NAME_LADDERS[familyId]?.[normalizeOptionRarity(rarity)] || fallbackName || familyId;
}

export function normalizeOptionLevel(level) {
  return clampInt(level, OPTION_LEVEL_MIN, OPTION_LEVEL_MAX);
}

export function normalizeOptionRarity(rarity) {
  return rarityIndex(rarity) >= 0 ? rarity : OPTION_RARITY[0];
}

export function hasAuthoredOptionCurve(familyId) {
  return !!OPTION_FAMILY_CURVES[familyId];
}

export function optionValueAtLevel(familyId, rarity, level, fallbackRoll = 0, { greater = false } = {}) {
  const curve = OPTION_FAMILY_CURVES[familyId];
  if (!curve) return Number(fallbackRoll) || 0;
  const ri = Math.max(0, rarityIndex(normalizeOptionRarity(rarity)));
  const lv = normalizeOptionLevel(level);
  const milestones = [25, 50, 75, 100].filter((mark) => lv >= mark).length;
  const masteryMult = 1 + milestones * 0.02;
  const base = curve.base[ri] || 0;
  const perLevel = curve.perLevel[ri] || 0;
  const greaterMult = greater ? 1.5 : 1;
  return round2((base + (lv - 1) * perLevel) * masteryMult * greaterMult);
}

/**
 * Initial Option Lv for a newly rolled item.
 * Lv100 remains primarily a fusion/mastery endpoint. High-IP premium sources
 * can occasionally drop a near-mastered Option, but never a natural Lv100.
 */
export function optionStartingLevel(itemPower, ctx = {}, key = '') {
  const ip = clamp(Math.floor(Number(itemPower) || 1), 1, 10000);
  const p = (ip - 1) / 9999;
  const premium = (ctx.elite ? 2 : 0) + (ctx.boss ? 5 : 0) + (ctx.ex ? 6 : 0) + (ctx.nemesis ? 10 : 0);
  let min = 1 + Math.floor(p * 34) + Math.floor(premium * 0.35);
  let max = 10 + Math.floor(p * 55) + premium;
  min = clampInt(min, 1, 75);
  max = clampInt(Math.max(min, max), min, 90);
  const jackpot = p >= 0.85 && hashUnit(`${key}:jackpot`) > 0.985;
  if (jackpot) return 91 + Math.floor(hashUnit(`${key}:jackpot-level`) * 7); // 91-97
  return min + Math.floor(hashUnit(`${key}:level`) * (max - min + 1));
}

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

export function applyAuthoredOptionValue(affix, { itemPower = 1, ctx = {}, key = '', initializeLevel = false } = {}) {
  if (!affix?.id) return affix;
  const option = optionFromAffix(affix, {
    level: initializeLevel ? optionStartingLevel(itemPower, ctx, key || affix.id) : (affix.level ?? 1),
    xp: affix.xp ?? 0,
  });
  if (!hasAuthoredOptionCurve(option.familyId)) return option;
  return {
    ...option,
    roll: optionValueAtLevel(option.familyId, option.rarity, option.level, option.roll, { greater: !!option.greater }),
    optionValueVersion: 1,
  };
}

export function isOption4(value) {
  return !!value
    && value.optionSchemaVersion === OPTION_SCHEMA_VERSION
    && typeof value.familyId === 'string'
    && normalizeOptionLevel(value.level) === value.level;
}

export function optionMaterialEfficiency(targetRarity, materialRarity) {
  const target = Math.max(0, rarityIndex(normalizeOptionRarity(targetRarity)));
  const material = Math.max(0, rarityIndex(normalizeOptionRarity(materialRarity)));
  if (material >= target) return 1;
  const gap = target - material;
  return gap === 1 ? 0.8 : gap === 2 ? 0.6 : gap === 3 ? 0.4 : 0.2;
}
