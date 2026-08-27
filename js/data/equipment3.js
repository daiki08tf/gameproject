/* ============================================================
   Equipment 3.0 — Item Power / naming / affix-role foundation
   ------------------------------------------------------------
   Existing equipment stats and Affix combat effects remain authoritative;
   this layer adds a long-term loot-quality axis from story into Lv99,999.
   ============================================================ */
import { OPTION_COUNT_BY_EQUIPMENT_RARITY } from './options4.js';

export const ITEM_POWER_MAX = 10000;

// Progression 3.0: Chapters 1-15 remain the first story arc (IP <= 1000).
// The Veil arc (Ch16-20) now bridges smoothly from IP1000 to IP3000 so
// Chapter 20 gear naturally hands off to Abyss 1F (target IP3000).
export const CHAPTER_ITEM_POWER = Object.freeze({
  1: [10, 80],
  2: [60, 130],
  3: [110, 190],
  4: [170, 250],
  5: [230, 330],
  6: [300, 400],
  7: [370, 480],
  8: [450, 570],
  9: [540, 660],
  10: [630, 760],
  11: [720, 820],
  12: [790, 870],
  13: [840, 920],
  14: [890, 970],
  15: [930, 1000],
  16: [1000, 1350],
  17: [1300, 1700],
  18: [1650, 2100],
  19: [2050, 2550],
  20: [2500, 3000],
});

export const ITEM_POWER_BANDS = Object.freeze([
  { id: 'story', label: '本編装備', min: 1, max: 999 },
  { id: 'abyssal', label: '境界・深淵装備', min: 1000, max: 2999 },
  { id: 'mythic', label: '神話装備', min: 3000, max: 4999 },
  { id: 'transcendent', label: '超越装備', min: 5000, max: 7999 },
  { id: 'terminal', label: '終焉装備', min: 8000, max: ITEM_POWER_MAX },
]);

// Gear Overhaul Option 4.0 makes one canonical count table authoritative for
// both weapons and armor/accessories. Keep the old export name for compatibility.
export const EQUIPMENT3_AFFIX_SLOTS = OPTION_COUNT_BY_EQUIPMENT_RARITY;

export const AFFIX_NAME_PARTS = Object.freeze({
  OFFENSE: { prefix: '猛攻の', suffix: '・破軍' },
  MAGIC: { prefix: '魔導の', suffix: '・秘奥' },
  CRIT: { prefix: '必殺の', suffix: '・会心' },
  SPEED: { prefix: '迅雷の', suffix: '・疾駆' },
  DEFENSE: { prefix: '不壊の', suffix: '・守護' },
  SUSTAIN: { prefix: '不死の', suffix: '・吸命' },
  RESOURCE: { prefix: '循環する', suffix: '・魔泉' },
  STATUS: { prefix: '蝕む', suffix: '・呪蝕' },
  BOSS: { prefix: '討滅の', suffix: '・屠竜' },
  UTILITY: { prefix: '奇巧の', suffix: '・機巧' },
  TRIGGER: { prefix: '連鎖する', suffix: '・連環' },
  BUILD: { prefix: '異端の', suffix: '・変成' },
});

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function itemPowerBand(itemPower) {
  const ip = clamp(Math.floor(Number(itemPower) || 1), 1, ITEM_POWER_MAX);
  return ITEM_POWER_BANDS.find((band) => ip >= band.min && ip <= band.max) || ITEM_POWER_BANDS[0];
}

export function inferChapterNumber(item) {
  const id = String(item?.id || '');
  const m = id.match(/^ch(\d+)_/);
  if (m) return clamp(Number(m[1]) || 1, 1, 20);
  if (/^(wp_|sh_|hd_|bd_|ac_)/.test(id)) return 1;
  return 1;
}

function deterministicJitter(key) {
  const s = String(key || 'bladevale');
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 9999;
}

export function itemPowerForDrop(item, ctx = {}, instanceKey = '') {
  // E9: Abyss/EX/Nemesis can pass an explicit target IP. Source quality still gives
  // a small positive roll so Boss/Elite/Nemesis remain exciting at the same depth.
  const explicitTarget = Math.floor(Number(ctx.itemPowerTarget) || 0);
  if (explicitTarget > 0) {
    const spread = Math.max(30, Math.round(explicitTarget * 0.025));
    const jitter = Math.round((deterministicJitter(instanceKey) - 0.35) * spread);
    const sourceBonus = (ctx.elite ? Math.round(spread * 0.55) : 0)
      + (ctx.boss ? Math.round(spread * 0.85) : 0)
      + (ctx.nemesis ? Math.round(spread * 1.4) : 0)
      + (ctx.ex ? Math.round(spread * 1.0) : 0);
    return clamp(explicitTarget + jitter + sourceBonus, 1, ITEM_POWER_MAX);
  }

  const depth = Math.max(0, Math.floor(Number(ctx.depth) || 0));
  if (depth > 0) {
    // Legacy/fallback route for callers that provide depth but no explicit E9 target.
    const base = 1000 + Math.floor(Math.pow(depth, 0.92) * 9.5);
    const sourceBonus = (ctx.elite ? 120 : 0) + (ctx.boss ? 180 : 0) + (ctx.nemesis ? 350 : 0) + (ctx.ex ? 220 : 0);
    const jitter = Math.floor(deterministicJitter(instanceKey) * 90);
    return clamp(base + sourceBonus + jitter, 1, ITEM_POWER_MAX);
  }

  const chapter = clamp(Number(ctx.chapter) || inferChapterNumber(item), 1, 20);
  const [lo, hi] = CHAPTER_ITEM_POWER[chapter] || CHAPTER_ITEM_POWER[1];
  const t = deterministicJitter(instanceKey || `${item?.id}:${chapter}`);
  let ip = Math.round(lo + (hi - lo) * t);
  if (ctx.elite) ip += Math.round((hi - lo) * 0.18);
  if (ctx.boss) ip += Math.round((hi - lo) * 0.28);
  // Story/The Veil drops may now legitimately reach IP3000 at Chapter 20.
  return clamp(ip, 1, 3000);
}

export function affixTierForItemPower(itemPower) {
  const ip = clamp(Math.floor(Number(itemPower) || 1), 1, ITEM_POWER_MAX);
  return clamp(Math.ceil(ip / 1000), 1, 10);
}

export function generatedEquipmentName(baseName, affixDescriptions = []) {
  if (!Array.isArray(affixDescriptions) || affixDescriptions.length === 0) return baseName;
  const first = affixDescriptions[0];
  const second = affixDescriptions[1];
  const prefix = AFFIX_NAME_PARTS[first?.category]?.prefix || '';
  const suffix = AFFIX_NAME_PARTS[second?.category]?.suffix || '';
  return `${prefix}${baseName}${suffix}`;
}
