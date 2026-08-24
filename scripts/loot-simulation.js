import { AFFIXES, WEAPON_TYPE_AFFIX_BIAS } from '../js/data/affixes.js';
import { affixRarityDistributionForItemPower } from '../js/data/equipment3AffixQuality.js';
import { greaterAffixChance } from '../js/data/equipment3Greater.js';
import { legendaryEffectChance, cursedAffixChance } from '../js/data/equipment3Legendary.js';

export const DEFAULT_IP_CHECKPOINTS = Object.freeze([1000, 3000, 5000, 8000, 10000]);
export const DEFAULT_SAMPLE_COUNT = 100000;
export const DEFAULT_AFFIX_COUNT = 4;

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'ancient'];
const WEAPON_TYPES = ['sword', 'axe', 'staff', 'bow', 'dagger', 'knuckle', 'instrument', 'rod'];
const ARCHETYPES_PER_WEAPON_FAMILY = 3;
const WEAPON_BIAS_WEIGHT = 2.2;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function hashSeed(value) {
  let h = 2166136261;
  for (const ch of String(value || 'bladevale-loot')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

export function createSeededRandom(seed = 'bladevale-loot') {
  let state = hashSeed(seed);
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function sourceContext(source) {
  const key = String(source || 'normal').toLowerCase();
  if (key === 'elite') return { elite: true };
  if (key === 'boss') return { boss: true };
  if (key === 'ex') return { ex: true, boss: true };
  if (key === 'nemesis') return { nemesis: true, boss: true };
  return {};
}

function pickWeightedRarity(dist, random) {
  let cursor = random();
  for (const rarity of RARITY_ORDER) {
    cursor -= dist[rarity] || 0;
    if (cursor <= 0) return rarity;
  }
  return RARITY_ORDER[RARITY_ORDER.length - 1];
}

function rarityAtLeast(rarity, minimum) {
  return RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf(minimum);
}

function pct(v, n) { return n > 0 ? v / n : 0; }
function oneIn(rate) { return rate > 0 ? 1 / rate : Infinity; }

function weightedAffixPool(weaponType) {
  const biasCats = WEAPON_TYPE_AFFIX_BIAS[weaponType] || [];
  return Object.entries(AFFIXES).map(([id, def]) => ({
    id,
    def,
    weight: biasCats.includes(def.category) ? WEAPON_BIAS_WEIGHT : 1,
  }));
}

function pickAffixIdentity(pool, usedIds, usedGroups, random) {
  const eligible = pool.filter(({ id, def }) => !usedIds.has(id) && !(def.exclusiveGroup && usedGroups.has(def.exclusiveGroup)));
  if (!eligible.length) return null;
  const total = eligible.reduce((sum, row) => sum + row.weight, 0);
  let cursor = random() * total;
  for (const row of eligible) {
    cursor -= row.weight;
    if (cursor <= 0) return row;
  }
  return eligible[eligible.length - 1];
}

function rollAffixIdentities(weaponType, count, random) {
  const pool = weightedAffixPool(weaponType);
  const usedIds = new Set();
  const usedGroups = new Set();
  const out = [];
  let guard = 0;
  while (out.length < count && guard < 200) {
    guard += 1;
    const row = pickAffixIdentity(pool, usedIds, usedGroups, random);
    if (!row) break;
    usedIds.add(row.id);
    if (row.def.exclusiveGroup) usedGroups.add(row.def.exclusiveGroup);
    out.push(row.id);
  }
  return out;
}

function normalizeRequiredAffixes(requiredAffixes) {
  const list = Array.isArray(requiredAffixes)
    ? requiredAffixes
    : String(requiredAffixes || '').split(',');
  return [...new Set(list.map((v) => String(v).trim()).filter((v) => AFFIXES[v]))];
}

function hasAllAffixes(rolled, required) {
  if (!required.length) return true;
  const ids = new Set(rolled);
  return required.every((id) => ids.has(id));
}

/**
 * Build-target assumptions are intentionally explicit:
 * - weapon family drops are uniform across the 8 mastery families
 * - archetype is uniform across the 3 archetypes in a family
 * - Affix identity uses the same category bias/exclusive-group rules as the game
 * This does not pretend to model stage-specific base-item table weights; it is a
 * repeatable planning estimate for how multiplicative targeting affects rarity.
 */
export function simulateLootCheckpoint({
  itemPower,
  samples = DEFAULT_SAMPLE_COUNT,
  itemRarity = 'legendary',
  affixCount = DEFAULT_AFFIX_COUNT,
  source = 'normal',
  seed = 'bladevale-loot',
  targetWeaponType = null,
  targetArchetype = false,
  requiredAffixes = [],
} = {}) {
  const ip = clamp(Math.floor(Number(itemPower) || 1), 1, 10000);
  const n = Math.max(1, Math.floor(Number(samples) || DEFAULT_SAMPLE_COUNT));
  const count = clamp(Math.floor(Number(affixCount) || DEFAULT_AFFIX_COUNT), 1, 5);
  const ctx = sourceContext(source);
  const item = { rarity: itemRarity };
  const targetType = WEAPON_TYPES.includes(targetWeaponType) ? targetWeaponType : null;
  const required = normalizeRequiredAffixes(requiredAffixes);
  const random = createSeededRandom(`${seed}:${ip}:${itemRarity}:${source}:${count}:${targetType || 'any'}:${targetArchetype}:${required.join('+')}`);

  const rarityDist = affixRarityDistributionForItemPower(ip, ctx);
  const greaterChance = greaterAffixChance(ip, ctx);
  const legendaryChance = legendaryEffectChance(item, ip, ctx);
  const curseChance = cursedAffixChance(item, ip, ctx);

  const rarityCounts = Object.fromEntries(RARITY_ORDER.map((r) => [r, 0]));
  const greaterCounts = [0, 0, 0, 0];
  let legendaryEffects = 0;
  let curses = 0;
  let mythicPlusItems = 0;
  let ancientItems = 0;
  let godRolls = 0;
  let jackpotRolls = 0;
  let targetFamilyHits = 0;
  let targetArchetypeHits = 0;
  let affixPackageHits = 0;
  let buildTargetHits = 0;
  let trueGodRolls = 0;

  for (let sample = 0; sample < n; sample += 1) {
    const rolledWeaponType = WEAPON_TYPES[Math.floor(random() * WEAPON_TYPES.length)];
    const rolledArchetype = Math.floor(random() * ARCHETYPES_PER_WEAPON_FAMILY);
    const familyMatch = !targetType || rolledWeaponType === targetType;
    const archetypeMatch = familyMatch && (!targetArchetype || rolledArchetype === 0);
    if (familyMatch) targetFamilyHits += 1;
    if (archetypeMatch) targetArchetypeHits += 1;

    const affixIds = rollAffixIdentities(rolledWeaponType, count, random);
    const affixMatch = hasAllAffixes(affixIds, required);
    if (affixMatch) affixPackageHits += 1;
    if (archetypeMatch && affixMatch) buildTargetHits += 1;

    let greater = 0;
    let hasMythicPlus = false;
    let hasAncient = false;

    for (let a = 0; a < count; a += 1) {
      const rarity = pickWeightedRarity(rarityDist, random);
      rarityCounts[rarity] += 1;
      hasMythicPlus ||= rarityAtLeast(rarity, 'mythic');
      hasAncient ||= rarity === 'ancient';
      if (greater < 3 && random() < greaterChance) greater += 1;
    }

    const hasLegendaryEffect = random() < legendaryChance;
    const hasCurse = random() < curseChance;

    greaterCounts[Math.min(3, greater)] += 1;
    if (hasLegendaryEffect) legendaryEffects += 1;
    if (hasCurse) curses += 1;
    if (hasMythicPlus) mythicPlusItems += 1;
    if (hasAncient) ancientItems += 1;

    const god = hasLegendaryEffect && hasMythicPlus && greater >= 2;
    const jackpot = hasLegendaryEffect && hasAncient && greater >= 3;
    if (god) godRolls += 1;
    if (jackpot) jackpotRolls += 1;
    if (archetypeMatch && affixMatch && god) trueGodRolls += 1;
  }

  const totalAffixes = n * count;
  const godRate = pct(godRolls, n);
  const jackpotRate = pct(jackpotRolls, n);
  const buildRate = pct(buildTargetHits, n);
  const trueGodRate = pct(trueGodRolls, n);
  return {
    itemPower: ip,
    samples: n,
    itemRarity,
    affixCount: count,
    source,
    targeting: {
      targetWeaponType: targetType,
      targetArchetype: !!targetArchetype,
      requiredAffixes: required,
      assumptions: { weaponFamilies: WEAPON_TYPES.length, archetypesPerFamily: ARCHETYPES_PER_WEAPON_FAMILY },
    },
    theoretical: { rarityDist, greaterChance, legendaryChance, curseChance },
    observed: {
      affixRarity: Object.fromEntries(RARITY_ORDER.map((r) => [r, pct(rarityCounts[r], totalAffixes)])),
      greater0: pct(greaterCounts[0], n),
      greater1: pct(greaterCounts[1], n),
      greater2: pct(greaterCounts[2], n),
      greater3: pct(greaterCounts[3], n),
      legendaryEffect: pct(legendaryEffects, n),
      curse: pct(curses, n),
      mythicPlusItem: pct(mythicPlusItems, n),
      ancientItem: pct(ancientItems, n),
      godRoll: godRate,
      jackpotRoll: jackpotRate,
      godRollOneIn: oneIn(godRate),
      jackpotOneIn: oneIn(jackpotRate),
      targetFamily: pct(targetFamilyHits, n),
      targetArchetype: pct(targetArchetypeHits, n),
      affixPackage: pct(affixPackageHits, n),
      buildTarget: buildRate,
      buildTargetOneIn: oneIn(buildRate),
      trueGodRoll: trueGodRate,
      trueGodRollOneIn: oneIn(trueGodRate),
    },
  };
}

export function runLootSimulation(options = {}) {
  const checkpoints = options.itemPowers || DEFAULT_IP_CHECKPOINTS;
  return checkpoints.map((itemPower) => simulateLootCheckpoint({ ...options, itemPower }));
}

function percent(value) { return `${(Number(value || 0) * 100).toFixed(2)}%`; }
function odds(value) { return Number.isFinite(value) ? `1/${Math.max(1, Math.round(value)).toLocaleString('en-US')}` : '-'; }

export function formatLootSimulation(results) {
  const lines = [];
  lines.push('Blade Vale — Equipment 3.0 Loot Simulation');
  lines.push('God Roll = Legendary Effect + Mythic以上Affix + Greater×2以上');
  lines.push('Jackpot = Legendary Effect + Ancient Affix + Greater×3');
  const target = results[0]?.targeting;
  if (target?.targetWeaponType || target?.targetArchetype || target?.requiredAffixes?.length) {
    lines.push(`Build Target = weapon:${target.targetWeaponType || 'any'} / archetype:${target.targetArchetype ? 'exact' : 'any'} / affixes:${target.requiredAffixes.join(',') || 'any'}`);
    lines.push('True God = Build Target + God Roll');
  }
  lines.push('');
  lines.push('IP | Mythic+ item | Ancient item | G×2 | G×3 | Leg.Effect | Curse | God Roll | Jackpot | Build Target | True God');
  lines.push('---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:');
  for (const row of results) {
    const o = row.observed;
    lines.push([
      row.itemPower,
      percent(o.mythicPlusItem),
      percent(o.ancientItem),
      percent(o.greater2),
      percent(o.greater3),
      percent(o.legendaryEffect),
      percent(o.curse),
      `${percent(o.godRoll)} (${odds(o.godRollOneIn)})`,
      `${percent(o.jackpotRoll)} (${odds(o.jackpotOneIn)})`,
      `${percent(o.buildTarget)} (${odds(o.buildTargetOneIn)})`,
      `${percent(o.trueGodRoll)} (${odds(o.trueGodRollOneIn)})`,
    ].join(' | '));
  }
  return lines.join('\n');
}

function parseArgs(argv) {
  const out = {};
  for (const raw of argv) {
    const m = raw.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const [, key, value] = m;
    if (key === 'samples') out.samples = Number(value);
    else if (key === 'rarity') out.itemRarity = value;
    else if (key === 'affixes') out.affixCount = Number(value);
    else if (key === 'source') out.source = value;
    else if (key === 'seed') out.seed = value;
    else if (key === 'ip') out.itemPowers = value.split(',').map(Number).filter(Number.isFinite);
    else if (key === 'target-weapon') out.targetWeaponType = value;
    else if (key === 'target-archetype') out.targetArchetype = ['1', 'true', 'yes'].includes(value.toLowerCase());
    else if (key === 'require-affixes') out.requiredAffixes = value.split(',');
  }
  return out;
}

const isCli = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isCli) {
  const options = parseArgs(process.argv.slice(2));
  const results = runLootSimulation(options);
  console.log(formatLootSimulation(results));
}
