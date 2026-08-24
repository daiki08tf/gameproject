export const INHERITABLE_STAT_KEYS = ['hp', 'mp', 'atk', 'def', 'mag', 'spd'];
export const INHERITANCE_MIN_LEVEL = 2000;
export const INHERITANCE_RATE_CAP_PCT = 30;

export function inheritanceRatePct(level, inheritanceCount = 0) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  const n = Math.max(0, Math.floor(Number(inheritanceCount) || 0));
  // Below the actual inheritance gate this value is preview-only. Preserve a
  // small intuitive rise, but do not let repeated resets manufacture progress.
  if (lv < INHERITANCE_MIN_LEVEL) return Math.min(10, lv / 200);

  // Long-form progression: 10% at Lv2,000, gradually reaching 25% at Lv99,999.
  // Previous formula reached 100% at Lv10,000 and ~1000% at cap, recursively
  // multiplying already-inherited stats every cycle. Log growth keeps reaching
  // higher levels meaningful while preventing exponential runaway.
  const maxLevel = 99999;
  const span = Math.log(maxLevel / INHERITANCE_MIN_LEVEL);
  const progress = Math.max(0, Math.min(1, Math.log(lv / INHERITANCE_MIN_LEVEL) / span));
  const levelPart = 10 + 15 * progress;
  const cyclePart = Math.min(5, n * 0.25);
  return Math.min(INHERITANCE_RATE_CAP_PCT, Math.round((levelPart + cyclePart) * 1000) / 1000);
}

export function inheritanceBonusPointGain(level, inheritanceCount = 0) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  const n = Math.max(0, Math.floor(Number(inheritanceCount) || 0));
  if (lv < INHERITANCE_MIN_LEVEL) return 0;
  // BP remains a useful secondary reward, but no longer grants ~98k points from
  // a single capped inheritance. The level component is deliberately linear and
  // shallow; repeat-cycle contribution itself is capped.
  return 5 + Math.floor((lv - INHERITANCE_MIN_LEVEL) / 250) + Math.min(50, n * 2);
}

export function calculateInheritedStats(sourceStats, level, inheritanceCount = 0) {
  const ratePct = inheritanceRatePct(level, inheritanceCount);
  return Object.fromEntries(INHERITABLE_STAT_KEYS.map((key) => [
    key,
    Math.max(0, Math.floor((Number(sourceStats?.[key]) || 0) * ratePct / 100)),
  ]));
}
