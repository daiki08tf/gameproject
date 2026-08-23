/* ============================================================
   Job Progression — short-form profession growth
   ------------------------------------------------------------
   Character Lv is the long-term 1..99,999 axis. Job Lv is deliberately
   much faster and exists for skill unlocks, MASTER and job changing.
   ============================================================ */

export const JOB_EXP_TIER_MULT = Object.freeze({
  basic: 1.00,
  advanced: 1.15,
  special: 1.30,
  hero: 1.50,
});

// Required Job EXP to advance from `level` to `level + 1`.
// This is intentionally shallower than Character EXP from Lv1 onward so the
// two level displays no longer move in lockstep during normal play.
export function jobExpToNext(level, tier = 'basic') {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  const tierMult = JOB_EXP_TIER_MULT[tier] || 1;
  const base = 12 + lv * 8 + 1.2 * Math.pow(lv, 1.35);
  return Math.max(1, Math.round(base * tierMult));
}

export function cumulativeJobExpToLevel(targetLevel, tier = 'basic') {
  const target = Math.max(1, Math.floor(Number(targetLevel) || 1));
  let total = 0;
  for (let lv = 1; lv < target; lv += 1) total += jobExpToNext(lv, tier);
  return total;
}
