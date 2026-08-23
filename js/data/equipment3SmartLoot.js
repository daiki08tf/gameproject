/* ============================================================
   Equipment 3.0 E8 — Smart Loot / Loot Filter 3.0 rules
   ============================================================ */
import { rarityIndex } from './equipment.js';
import { describeAffix } from './affixes.js';

export const DEFAULT_LOOT_FILTER_3 = Object.freeze({
  minRarity: 'normal',
  minItemPower: 0,
  minGreater: 0,
  legendaryOnly: false,
  cursedOnly: false,
  weaponType: 'all',
  affixQuery: '',
  autoLock: Object.freeze({
    enabled: true,
    legendary: true,
    cursed: true,
    minGreater: 2,
    minItemPower: 0,
    affixQuery: '',
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

export function normalizeLootFilter3(raw = {}) {
  const auto = raw?.autoLock || {};
  return {
    minRarity: raw?.minRarity || DEFAULT_LOOT_FILTER_3.minRarity,
    minItemPower: intInRange(raw?.minItemPower, 0, 10000, 0),
    minGreater: intInRange(raw?.minGreater, 0, 3, 0),
    legendaryOnly: !!raw?.legendaryOnly,
    cursedOnly: !!raw?.cursedOnly,
    weaponType: raw?.weaponType || 'all',
    affixQuery: text(raw?.affixQuery),
    autoLock: {
      enabled: auto.enabled !== false,
      legendary: auto.legendary !== false,
      cursed: auto.cursed !== false,
      minGreater: intInRange(auto.minGreater, 0, 3, DEFAULT_LOOT_FILTER_3.autoLock.minGreater),
      minItemPower: intInRange(auto.minItemPower, 0, 10000, 0),
      affixQuery: text(auto.affixQuery),
    },
  };
}

function affixHaystack(inst) {
  const values = [];
  for (const affix of inst?.affixes || []) {
    const d = describeAffix(affix);
    values.push(affix.id, d?.name, d?.desc);
  }
  return values.filter(Boolean).join(' ').toLowerCase();
}

export function matchesAffixQuery(inst, query) {
  const q = text(query).toLowerCase();
  if (!q) return true;
  return affixHaystack(inst).includes(q);
}

export function equipment3FilterMatches(item, inst = null, rawFilter = {}) {
  const filter = normalizeLootFilter3(rawFilter);
  if (!item) return false;
  if (rarityIndex(item.rarity) < rarityIndex(filter.minRarity)) return false;

  // Equipment 3.0の詳細条件は武器個体にだけ適用する。
  // 防具・アクセサリの画面までIP条件で空にしないため、従来通りレアリティだけを見る。
  if (item.slot !== 'weapon') return true;

  if (filter.weaponType !== 'all' && item.weaponType !== filter.weaponType) return false;

  const needsInstance = filter.minItemPower > 0
    || filter.minGreater > 0
    || filter.legendaryOnly
    || filter.cursedOnly
    || !!filter.affixQuery;
  if (needsInstance && !inst) return false;
  if (!inst) return true;

  if ((Number(inst.itemPower) || 0) < filter.minItemPower) return false;
  if ((Number(inst.greaterAffixCount) || 0) < filter.minGreater) return false;
  if (filter.legendaryOnly && !inst.legendaryEffectId) return false;
  if (filter.cursedOnly && !inst.curseId) return false;
  if (!matchesAffixQuery(inst, filter.affixQuery)) return false;
  return true;
}

export function smartLootReasons(item, inst = null, rawFilter = {}) {
  const filter = normalizeLootFilter3(rawFilter);
  const rule = filter.autoLock;
  if (!rule.enabled || !item || item.slot !== 'weapon' || !inst) return [];

  const reasons = [];
  const greater = Math.max(0, Math.floor(Number(inst.greaterAffixCount) || 0));
  const ip = Math.max(0, Math.floor(Number(inst.itemPower) || 0));

  if (rule.legendary && inst.legendaryEffectId) reasons.push('Legendary Effect');
  if (rule.cursed && inst.curseId) reasons.push('Cursed Affix');
  if (rule.minGreater > 0 && greater >= rule.minGreater) reasons.push(`Greater×${greater}`);
  if (rule.minItemPower > 0 && ip >= rule.minItemPower) reasons.push(`IP${ip}`);
  if (rule.affixQuery && matchesAffixQuery(inst, rule.affixQuery)) reasons.push(`Affix:${rule.affixQuery}`);
  return reasons;
}

export function shouldAutoLockEquipment(item, inst = null, rawFilter = {}) {
  return smartLootReasons(item, inst, rawFilter).length > 0;
}
