/* Blade Vale Progression 2.0 — design-time simulator
 * Runtime codeではない。仕様調整用。
 * Run: node scripts/progression2-sim.mjs
 */

const LEVEL_CAP = 99_999;
const CHECKPOINTS = [1, 100, 1_000, 1_999, 2_000, 5_000, 10_000, 50_000, 99_999];

function expToNext(level) {
  const l = Math.max(1, Math.min(LEVEL_CAP, level));
  return Math.round(30 + 14 * l + 3.0 * Math.pow(l, 1.32));
}

function growthWeightForLevel(level) {
  if (level <= 100) return 1.00;
  if (level <= 1_000) return 0.50;
  if (level <= 10_000) return 0.20;
  return 0.08;
}

// Lv1からtargetLevelまでに「通常の1Lv成長何回分」を得るか。
function cumulativeGrowthUnits(targetLevel) {
  let units = 0;
  const segments = [
    [2, 100, 1.00],
    [101, 1_000, 0.50],
    [1_001, 10_000, 0.20],
    [10_001, LEVEL_CAP, 0.08],
  ];
  for (const [start, end, weight] of segments) {
    const hi = Math.min(targetLevel, end);
    if (hi >= start) units += (hi - start + 1) * weight;
  }
  return units;
}

function inheritanceRatePct(level, inheritanceCount) {
  return level < 2_000
    ? level / 200 + inheritanceCount
    : level / 100 + inheritanceCount;
}

function inheritanceBonusPoints(level, inheritanceCount) {
  return level < 2_000
    ? inheritanceCount
    : (level - 2_000) + inheritanceCount;
}

function runeCapacity(historicalMaxLevel) {
  return Math.min(LEVEL_CAP, Math.max(1, historicalMaxLevel));
}

// 5%/刻のRune例。同一Rune内は加算%、最後に1倍率として乗せる。
function forceRuneMultiplier(activeMarks) {
  return 1 + 0.05 * Math.max(0, activeMarks);
}

function challengeLevel(activeChallengeMarks) {
  return Math.floor(Math.max(0, activeChallengeMarks) / 100);
}

function challengeModifiers(challengeLv) {
  return {
    enemyLevel: 1 + 0.10 * challengeLv,
    enemyHp: 1 + 0.10 * challengeLv,
    enemyAtk: 1 + 0.05 * challengeLv,
    exp: 1 + 0.10 * challengeLv,
    gold: 1 + 0.05 * challengeLv,
    runeDropRelative: 1 + 0.02 * challengeLv,
    rareRelative: 1 + 0.01 * challengeLv,
  };
}

function expectedClearsForMarks({ targetMarks, baseDropChance, avgMarksPerDrop = 1 }) {
  return targetMarks / (baseDropChance * avgMarksPerDrop);
}

console.log('\n=== Progression 2.0 Level / Inheritance Checkpoints ===');
console.table(CHECKPOINTS.map((level) => ({
  level,
  expToNext: expToNext(level),
  growthUnits: Number(cumulativeGrowthUnits(level).toFixed(1)),
  inherit0: `${inheritanceRatePct(level, 0).toFixed(3)}%`,
  inherit5: `${inheritanceRatePct(level, 5).toFixed(3)}%`,
  inherit20: `${inheritanceRatePct(level, 20).toFixed(3)}%`,
  bp0: inheritanceBonusPoints(level, 0),
  bp5: inheritanceBonusPoints(level, 5),
  runeCapacity: runeCapacity(level),
})));

console.log('\n=== Force Rune (5% per active mark, additive inside Rune) ===');
console.table([0, 1, 10, 50, 100, 500, 1_000, 10_000, 99_999].map((marks) => ({
  marks,
  multiplier: `${forceRuneMultiplier(marks).toFixed(2)}x`,
})));

console.log('\n=== Challenge examples ===');
console.table([0, 100, 500, 1_000, 2_000, 5_000].map((marks) => {
  const lv = challengeLevel(marks);
  const m = challengeModifiers(lv);
  return {
    marks,
    challengeLv: lv,
    enemyHp: `${m.enemyHp.toFixed(2)}x`,
    enemyAtk: `${m.enemyAtk.toFixed(2)}x`,
    exp: `${m.exp.toFixed(2)}x`,
    runeDropRelative: `${m.runeDropRelative.toFixed(2)}x`,
  };
}));

console.log('\n=== Rune grind sanity check (no Challenge bonus) ===');
const grindCases = [
  { name: 'basic 5%', chance: 0.05 },
  { name: 'mid 2%', chance: 0.02 },
  { name: 'rare 0.5%', chance: 0.005 },
];
console.table(grindCases.flatMap((g) => [100, 500, 1_000].map((targetMarks) => ({
  rune: g.name,
  targetMarks,
  expectedClearsAtPlus1: Math.round(expectedClearsForMarks({ targetMarks, baseDropChance: g.chance })),
  expectedClearsAtAvgPlus3: Math.round(expectedClearsForMarks({ targetMarks, baseDropChance: g.chance, avgMarksPerDrop: 3 })),
}))));

console.log('\nNOTE: This simulator is a tuning aid. Values are not runtime balance until approved and moved into balance.js.');
