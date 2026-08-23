/* ============================================================
   Progression 2.0 — Character level / EXP curve
   ------------------------------------------------------------
   Character Lv is the long-term progression axis (1..99,999).
   Job Lv keeps its own short-form EXP curve in state.js.

   Design goals:
   - Preserve the current early-game feel through Lv99.
   - Avoid exponential growth that becomes unusable near Lv99,999.
   - Use explicit bands so later content can tune rewards per era.
   - Keep every single-level and cumulative EXP value inside JS safe integers.
   ============================================================ */

export const CHARACTER_LEVEL_MAX = 99999;

export const CHARACTER_LEVEL_BANDS = [
  { id: 'adventurer', label: '冒険者帯', min: 1, max: 99 },
  { id: 'heroic', label: '英雄帯', min: 100, max: 999 },
  { id: 'transcendent', label: '超越帯', min: 1000, max: 9999 },
  { id: 'divine', label: '神域', min: 10000, max: 49999 },
  { id: 'terminal', label: '終焉域', min: 50000, max: CHARACTER_LEVEL_MAX },
];

export function characterLevelBand(level) {
  const lv = Math.min(CHARACTER_LEVEL_MAX, Math.max(1, Math.floor(Number(level) || 1)));
  return CHARACTER_LEVEL_BANDS.find((band) => lv >= band.min && lv <= band.max) || CHARACTER_LEVEL_BANDS[0];
}

// Required EXP to advance from `level` to `level + 1`.
// The constants are intentionally centralized here so Phase 9 balance simulation
// can retune the curve without touching StateManager or UI code.
export function characterExpToNext(level) {
  const lv = Math.min(CHARACTER_LEVEL_MAX, Math.max(1, Math.floor(Number(level) || 1)));
  if (lv >= CHARACTER_LEVEL_MAX) return 0;

  // Lv1-99: current Blade Vale curve, preserving the existing opening tempo.
  if (lv < 100) {
    return Math.round(20 + lv * 18 + Math.pow(lv, 1.6) * 2);
  }

  // Lv100-999: steady acceleration; first long-term leveling band.
  if (lv < 1000) {
    const x = lv - 100;
    return Math.round(5000 + 60 * x + 0.12 * Math.pow(x, 1.45));
  }

  // Lv1000-1999: approach the first major inheritance breakpoint.
  if (lv < 2000) {
    const x = lv - 1000;
    return Math.round(62000 + 150 * x + 0.08 * Math.pow(x, 1.55));
  }

  // Lv2000-9999: inheritance-era progression. Reward scaling will catch up in
  // World Expansion rather than making per-level EXP explode exponentially.
  if (lv < 10000) {
    const x = lv - 2000;
    return Math.round(216000 + 300 * x + 0.02 * Math.pow(x, 1.65));
  }

  // Lv10000-49999: high-end long-form progression.
  if (lv < 50000) {
    const x = lv - 10000;
    return Math.round(2680000 + 900 * x + 0.002 * Math.pow(x, 1.8));
  }

  // Lv50000-99998: final band. Still polynomial and safe for Number arithmetic.
  const x = lv - 50000;
  return Math.round(41000000 + 3000 * x + 0.001 * Math.pow(x, 1.9));
}

export function cumulativeCharacterExpToLevel(targetLevel) {
  const target = Math.min(CHARACTER_LEVEL_MAX, Math.max(1, Math.floor(Number(targetLevel) || 1)));
  let total = 0;
  for (let lv = 1; lv < target; lv += 1) total += characterExpToNext(lv);
  return total;
}
