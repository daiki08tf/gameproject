/* ============================================================
   Progression 2.0 Phase 6 — Rune 2.0 special rules
   Pure helpers so balance boundaries can be regression-tested.
   ============================================================ */

export const CHALLENGE_MARKS_PER_LEVEL = 100;
export const CHALLENGE_MAX_LEVEL = 20;

export function challengeLevelForMarks(marks) {
  return Math.min(CHALLENGE_MAX_LEVEL, Math.floor(Math.max(0, Number(marks) || 0) / CHALLENGE_MARKS_PER_LEVEL));
}

export function challengeEnemyHpMult(level) { return 1 + Math.max(0, level) * 0.10; }
export function challengeEnemyAtkMult(level) { return 1 + Math.max(0, level) * 0.05; }
export function challengeExpMult(level) { return 1 + Math.max(0, level) * 0.10; }
export function challengeGoldMult(level) { return 1 + Math.max(0, level) * 0.05; }
export function challengeRuneChanceMult(level) { return 1 + Math.max(0, level) * 0.02; }

export function challengeRuneAmountRange(level) {
  const lv = Math.max(0, Math.min(CHALLENGE_MAX_LEVEL, Math.floor(Number(level) || 0)));
  if (lv >= 15) return [3, 10];
  if (lv >= 10) return [2, 5];
  if (lv >= 5) return [1, 3];
  if (lv >= 1) return [1, 2];
  return [1, 1];
}

export function rollChallengeRuneAmount(level, random = Math.random) {
  const [min, max] = challengeRuneAmountRange(level);
  if (min === max) return min;
  return min + Math.floor(Math.max(0, Math.min(0.999999999, random())) * (max - min + 1));
}

export function greedRemovedRarityTiers(marks) {
  return Math.max(0, Math.floor((Number(marks) || 0) / 50));
}

// Swift / Fists are ★500 milestone runes. Gameplay effect caps at 500 marks,
// while owned marks may continue increasing for collection/progression purposes.
export function speedRuneEffectiveMarks(marks) {
  return Math.min(500, Math.max(0, Math.floor(Number(marks) || 0)));
}

export function swiftInitiativeMult(marks) {
  return 1 + speedRuneEffectiveMarks(marks) * 0.001; // +0.1% / mark, max +50%
}

export function fistsAttackIntervalMult(marks) {
  return 1 - speedRuneEffectiveMarks(marks) * 0.001; // -0.1% / mark, max -50%
}

export function observeTier(marks) {
  const n = Math.max(0, Math.floor(Number(marks) || 0));
  if (n >= 500) return 5;
  if (n >= 250) return 4;
  if (n >= 100) return 3;
  if (n >= 50) return 2;
  if (n >= 1) return 1;
  return 0;
}
