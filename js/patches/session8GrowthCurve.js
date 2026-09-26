/* ============================================================
   Session 8 — character growth late-curve (scaling-gap fix)
   ------------------------------------------------------------
   Measured problem (scripts/session8-scaling-measure.mjs):
     enemy stats compound per chapter (roadmap hpFactor/atkFactor on
     top of ENEMY_SCALING) while character growth records a flat
     increment per level. A story-only player reaches each boss
     under-level AND under-statted: the real-play sim stalled at
     4-5 (lv52 vs rec65), and even XP×3 only moved the stall to 5-5 —
     the binding constraint was stats, not income.

   Fix: a bounded, read-time multiplier on the four combat stats
   (hp/atk/def/mag) keyed to character level:

       mult(L) = min(4, 1 + 0.02 · max(0, L − 45))

   - Read-time, so totals/levelHistory stay canonical and OLD SAVES
     self-correct (a banked lv300 character immediately gets the
     curve it would have earned under the new rule).
   - Pivot 45 = Chapter 4 entry, where the measured stall begins;
     Chapters 1–3 calibration is untouched.
   - Cap ×4 keeps Lv700+ endgame from trivialising chapter content —
     gear/awakening/rebirth carry the late game as designed.
   - hp/atk/def/mag only; spd/crit untouched so turn order and crit
     pacing stay on their own curves.

   ENEMY_SCALING and chapterMult are deliberately NOT modified.
   Verified: sim clears Ch1–12 under this curve (was: hard stall 4-5).
   ============================================================ */
import { state } from '../state.js';
import { chainMethod } from './patchUtils.js';

export const SESSION8_GROWTH_CURVE = Object.freeze({
  PIVOT_LEVEL: 45,
  RATE: 0.02,
  CAP: 4,
  STATS: ['hp', 'atk', 'def', 'mag'],
});

export function session8GrowthMult(level) {
  const L = Math.max(1, Math.floor(Number(level) || 1));
  return Math.min(SESSION8_GROWTH_CURVE.CAP, 1 + SESSION8_GROWTH_CURVE.RATE * Math.max(0, L - SESSION8_GROWTH_CURVE.PIVOT_LEVEL));
}

if (!state.getStats.__session8Growth) {
  chainMethod(state, 'getStats', (prev) => function session8GrowthStats() {
    const s = prev();
    const mult = session8GrowthMult(this.characterLevel);
    if (mult <= 1) return s;
    for (const k of SESSION8_GROWTH_CURVE.STATS) {
      if (Number.isFinite(s[k])) s[k] = Math.round(s[k] * mult);
    }
    return s;
  });
  state.getStats.__session8Growth = true;
}
