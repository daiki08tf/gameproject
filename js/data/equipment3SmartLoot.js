/* ============================================================
   Smart Loot 4.0 — all-slot Option-aware filter/protection rules
   ============================================================ */
import { rarityIndex } from './equipment.js';
import { describeAffix } from './affixes.js';
import { OPTION_RARITY, normalizeOptionLevel, normalizeOptionRarity } from './options4.js';

export const DEFAULT_LOOT_FILTER_3 = Object.freeze({
  minRarity: 'normal',
  minItemPower: 0,
  minGreater: 0,
  legendaryOnly: false,
  cursedOnly: false,
  weaponType: 'all',
  // `affixQuery` is retained for old saves/API callers. `optionQuery` is the
  // player-facing Option4 field and falls back to the old value on migration.
  affixQuery: '',
  optionQuery: '',
  minOptionRarity: 'any',
  minOptionLevel: 0,
  autoLock: Object.freeze({
    enabled: true,
    legendary: true,
    cursed: true,
    minGreater: 2,
    minItemPower: 0,
    // Legacy name kept for save/API compatibility; optionQuery is canonical UI.
    affixQuery: '',
    optionQuery: '',
    // Legacy master switch remains readable. Phase 5B splits the two valuable
    // Fusion-material cases so players can keep Ancient and Lv80+ independently.
    protectFusionMaterials: true,
    protectAncientOption: true,
    protectHighLevelOption: true,
    minOptionRarity: 'ancient',
    minOptionLevel: 80,
  }),
});

function intInRange(value, min, max, fallback = 0) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function text(value) {
  return String(value ?? '').trim();
}

function normalizeOptionRarityFloor(value) {
  const rarity = normalizeOptionRarity(value || DEFAULT_LOOT_FILTER_3.autoLock.minOptionRarity);
  return OPTION_RARITY.includes(rarity) ? rarity : DEFAULT_LOOT_FILTER_3.autoLock.minOptionRarity;
}

function normalizeVisibleOptionRarity(value) {
  if (!value || value === 'any') return 'any';
  return OPTION_RARITY.includes(value) ? value : 'any';
}

export function normalizeLootFilter3(raw = {}) {
  const auto = raw?.autoLock || {};
  const migratedQuery = text(raw?.optionQuery || raw?.affixQuery);
  const migratedAutoQuery = text(auto?.optionQuery || auto?.affixQuery);
  const legacyFusionProtection = auto.protectFusionMaterials !== false;
  const protectAncientOption = auto.protectAncientOption == null
    ? legacyFusionProtection
    : auto.protectAncientOption !== false;
  const protectHighLevelOption = auto.protectHighLevelOption == null
    ? legacyFusionProtection
    : auto.protectHighLevelOption !== false;
  return {
    minRarity: raw?.minRarity || DEFAULT_LOOT_FILTER_3.minRarity,
    minItemPower: intInRange(raw?.minItemPower, 0, 10000, 0),
    minGreater: intInRange(raw?.minGreater, 0, 3, 0),
    legendaryOnly: !!raw?.legendaryOnly,
    cursedOnly: !!raw?.cursedOnly,
    weaponType: raw?.weaponType || 'all',
    affixQuery: migratedQuery,
    optionQuery: migratedQuery,
    minOptionRarity: normalizeVisibleOptionRarity(raw?.minOptionRarity),
    minOptionLevel: intInRange(raw?.minOptionLevel, 0, 100, 0),
    autoLock: {
      enabled: auto.enabled !== false,
      legendary: auto.legendary !== false,
      cursed: auto.cursed !== false,
      minGreater: intInRange(auto.minGreater, 0, 3, DEFAULT_LOOT_FILTER_3.autoLock.minGreater),
      minItemPower: intInRange(auto.minItemPower, 0, 10000, 0),
      affixQuery: migratedAutoQuery,
      optionQuery: migratedAutoQuery,
      protectFusionMaterials: protectAncientOption || protectHighLevelOption,
      protectAncientOption,
      protectHighLevelOption,
      minOptionRarity: normalizeOptionRarityFloor(auto.minOptionRarity),
      minOptionLevel: intInRange(auto.minOptionLevel, 1, 100, DEFAULT_LOOT_FILTER_3.autoLock.minOptionLevel),
    },
  };
}

function affixHaystack(inst) {
  const values = [];
  for (const affix of inst?.affixes || []) {
    const d = describeAffix(affix);
    values.push(affix.id, affix.familyId, d?.name, d?.desc);
  }
  return values.filter(Boolean).join(' ').toLowerCase();
}

export function matchesAffixQuery(inst, query) {
  const q = text(query).toLowerCase();
  if (!q) return true;
  return affixHaystack(inst).includes(q);
}

export function optionFilterMatches(inst, rawFilter = {}) {
  const filter = normalizeLootFilter3(rawFilter);
  const options = inst?.affixes || [];
  const needsOption = !!filter.optionQuery || filter.minOptionRarity !== 'any' || filter.minOptionLevel > 0;
  if (!needsOption) return true;
  if (!options.length) return false;

  const minRarityIndex = filter.minOptionRarity === 'any' ? -1 : OPTION_RARITY.indexOf(filter.minOptionRarity);
  return options.some((option) => {
    if (filter.optionQuery && !matchesAffixQuery({ affixes: [option] }, filter.optionQuery)) return false;
    if (minRarityIndex >= 0 && OPTION_RARITY.indexOf(normalizeOptionRarity(option.rarity)) < minRarityIndex) return false;
    if (filter.minOptionLevel > 0 && normalizeOptionLevel(option.level ?? 1) < filter.minOptionLevel) return false;
    return true;
  });
}

export function equipment3FilterMatches(item, inst = null, rawFilter = {}) {
  const filter = normalizeLootFilter3(rawFilter);
  if (!item) return false;
  if (rarityIndex(item.rarity) < rarityIndex(filter.minRarity)) return false;

  // Weapon family is meaningful only for weapons. All other instance/detail
  // filters now apply consistently to weapon / shield / head / body / accessory.
  if (item.slot === 'weapon' && filter.weaponType !== 'all' && item.weaponType !== filter.weaponType) return false;

  const needsInstance = filter.minItemPower > 0
    || filter.minGreater > 0
    || filter.legendaryOnly
    || filter.cursedOnly
    || !!filter.optionQuery
    || filter.minOptionRarity !== 'any'
    || filter.minOptionLevel > 0;
  if (needsInstance && !inst) return false;
  if (!inst) return true;

  if ((Number(inst.itemPower) || 0) < filter.minItemPower) return false;
  if ((Number(inst.greaterAffixCount) || 0) < filter.minGreater) return false;
  if (filter.legendaryOnly && !inst.legendaryEffectId) return false;
  if (filter.cursedOnly && !inst.curseId) return false;
  if (!optionFilterMatches(inst, filter)) return false;
  return true;
}

function fusionMaterialReasons(inst, rule) {
  if (!inst?.affixes?.length) return [];
  const minRarityIndex = OPTION_RARITY.indexOf(normalizeOptionRarityFloor(rule.minOptionRarity));
  const minLevel = intInRange(rule.minOptionLevel, 1, 100, 80);
  const reasons = [];
  for (const option of inst.affixes) {
    const rarity = normalizeOptionRarity(option.rarity);
    const level = normalizeOptionLevel(option.level ?? 1);
    if (rule.protectAncientOption && OPTION_RARITY.indexOf(rarity) >= minRarityIndex) {
      reasons.push('Ancient Option');
    }
    if (rule.protectHighLevelOption && level >= minLevel) {
      reasons.push(`Option Lv${level}`);
    }
  }
  return [...new Set(reasons)];
}

export function smartLootReasons(item, inst = null, rawFilter = {}) {
  const filter = normalizeLootFilter3(rawFilter);
  const rule = filter.autoLock;
  if (!rule.enabled || !item || !inst) return [];

  const reasons = [];
  const greater = Math.max(0, Math.floor(Number(inst.greaterAffixCount) || 0));
  const ip = Math.max(0, Math.floor(Number(inst.itemPower) || 0));

  if (rule.legendary && inst.legendaryEffectId) reasons.push('Legendary Power');
  if (rule.cursed && inst.curseId) reasons.push('Curse');
  if (rule.minGreater > 0 && greater >= rule.minGreater) reasons.push(`Greater×${greater}`);
  if (rule.minItemPower > 0 && ip >= rule.minItemPower) reasons.push(`IP${ip}`);
  if (rule.optionQuery && matchesAffixQuery(inst, rule.optionQuery)) reasons.push(`Option一致:${rule.optionQuery}`);
  reasons.push(...fusionMaterialReasons(inst, rule));
  return [...new Set(reasons)];
}

export function shouldAutoLockEquipment(item, inst = null, rawFilter = {}) {
  return smartLootReasons(item, inst, rawFilter).length > 0;
}
