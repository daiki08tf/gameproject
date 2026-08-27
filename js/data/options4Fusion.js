/* ============================================================
   Gear Overhaul Phase 2 — Option Fusion core
   ------------------------------------------------------------
   Equipment itself is the material. Fusion never adds a currency and never
   promotes Option rarity. The target Option keeps its family/rarity/Greater
   identity while same-family materials add deterministic Option EXP.
   ============================================================ */
import {
  OPTION_LEVEL_MAX,
  OPTION_RARITY,
  canonicalOptionFamilyId,
  normalizeOptionLevel,
  normalizeOptionRarity,
  optionMaterialEfficiency,
  optionValueAtLevel,
} from './options4.js';

export const OPTION_FUSION_SCHEMA_VERSION = 1;

export const OPTION_MATERIAL_BASE_XP = Object.freeze({
  common: 18,
  uncommon: 24,
  rare: 32,
  epic: 44,
  legendary: 60,
  mythic: 82,
  ancient: 110,
});

export function optionXpToNext(level) {
  const lv = normalizeOptionLevel(level);
  if (lv >= OPTION_LEVEL_MAX) return 0;
  return Math.round(30 + lv * 6 + Math.pow(lv, 1.35) * 1.4);
}

export function sameOptionFamily(a, b) {
  if (!a || !b) return false;
  return canonicalOptionFamilyId(a.familyId || a.id || '')
    === canonicalOptionFamilyId(b.familyId || b.id || '');
}

export function optionMaterialXp(targetOption, materialOption) {
  if (!sameOptionFamily(targetOption, materialOption)) return 0;
  const targetRarity = normalizeOptionRarity(targetOption.rarity);
  const materialRarity = normalizeOptionRarity(materialOption.rarity);
  const base = OPTION_MATERIAL_BASE_XP[materialRarity] || OPTION_MATERIAL_BASE_XP.common;
  const materialLevel = normalizeOptionLevel(materialOption.level ?? 1);
  const levelFactor = 1 + (materialLevel - 1) / 100;
  const efficiency = optionMaterialEfficiency(targetRarity, materialRarity);
  return Math.max(1, Math.round(base * levelFactor * efficiency));
}

export function optionFusionPreview(targetOption, materialOption) {
  const xp = optionMaterialXp(targetOption, materialOption);
  if (!xp) return { ok: false, reason: 'family_mismatch', xp: 0 };
  const beforeLevel = normalizeOptionLevel(targetOption.level ?? 1);
  const beforeXp = Math.max(0, Math.floor(Number(targetOption.xp) || 0));
  const after = applyOptionFusionXp(targetOption, xp);
  return {
    ok: true,
    xp,
    efficiency: optionMaterialEfficiency(
      normalizeOptionRarity(targetOption.rarity),
      normalizeOptionRarity(materialOption.rarity),
    ),
    beforeLevel,
    beforeXp,
    afterLevel: after.level,
    afterXp: after.xp,
    levelsGained: after.level - beforeLevel,
    capped: after.level >= OPTION_LEVEL_MAX,
  };
}

export function applyOptionFusionXp(targetOption, gainedXp) {
  if (!targetOption) return null;
  const familyId = canonicalOptionFamilyId(targetOption.familyId || targetOption.id || '');
  const rarity = normalizeOptionRarity(targetOption.rarity);
  let level = normalizeOptionLevel(targetOption.level ?? 1);
  let xp = Math.max(0, Math.floor(Number(targetOption.xp) || 0));
  xp += Math.max(0, Math.floor(Number(gainedXp) || 0));

  while (level < OPTION_LEVEL_MAX) {
    const needed = optionXpToNext(level);
    if (needed <= 0 || xp < needed) break;
    xp -= needed;
    level += 1;
  }
  if (level >= OPTION_LEVEL_MAX) xp = 0;

  return {
    ...targetOption,
    familyId,
    rarity,
    level,
    xp,
    roll: optionValueAtLevel(familyId, rarity, level, targetOption.roll, { greater: !!targetOption.greater }),
    optionValueVersion: 2,
    optionFusionSchemaVersion: OPTION_FUSION_SCHEMA_VERSION,
  };
}

export function optionRarityGap(targetRarity, materialRarity) {
  const t = Math.max(0, OPTION_RARITY.indexOf(normalizeOptionRarity(targetRarity)));
  const m = Math.max(0, OPTION_RARITY.indexOf(normalizeOptionRarity(materialRarity)));
  return m - t;
}
