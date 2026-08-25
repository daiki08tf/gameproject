/* ============================================================
   Progression 3.0 — Abyss endgame roadmap
   - Story now ends around Character Lv3,000 after Chapter 20.
   - Abyss converts depth into the long-term Lv99,999 / IP10,000 axis.
   - After depth 3000 the level/IP caps stay fixed; depth remains a self-best axis.
   ============================================================ */
import { CHARACTER_LEVEL_MAX, characterExpToNext } from './progression.js';
import { ITEM_POWER_MAX } from './equipment3.js';

export const ABYSS_ENDGAME_MILESTONES = Object.freeze([
  { depth: 1,    level: 3000,                itemPower: 3000,  era: '深淵序層' },
  { depth: 100,  level: 9999,                itemPower: 4500,  era: '深淵中層' },
  { depth: 500,  level: 29999,               itemPower: 6500,  era: '超越帯' },
  { depth: 1000, level: 49999,               itemPower: 8000,  era: '神域' },
  { depth: 2000, level: 74999,               itemPower: 9000,  era: '終焉域' },
  { depth: 3000, level: CHARACTER_LEVEL_MAX, itemPower: ITEM_POWER_MAX, era: '深淵最終域' },
]);

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function depthValue(depth) { return Math.max(1, Math.floor(Number(depth) || 1)); }

function interpolate(depth, key) {
  const d = depthValue(depth);
  const first = ABYSS_ENDGAME_MILESTONES[0];
  const last = ABYSS_ENDGAME_MILESTONES[ABYSS_ENDGAME_MILESTONES.length - 1];
  if (d <= first.depth) return first[key];
  if (d >= last.depth) return last[key];
  for (let i = 1; i < ABYSS_ENDGAME_MILESTONES.length; i += 1) {
    const hi = ABYSS_ENDGAME_MILESTONES[i];
    const lo = ABYSS_ENDGAME_MILESTONES[i - 1];
    if (d > hi.depth) continue;
    const t = (d - lo.depth) / (hi.depth - lo.depth);
    return Math.round(lo[key] + (hi[key] - lo[key]) * t);
  }
  return last[key];
}

export function abyssRecommendedLevel(depth) {
  return clamp(interpolate(depth, 'level'), 3000, CHARACTER_LEVEL_MAX);
}

export function abyssTargetItemPower(depth) {
  return clamp(interpolate(depth, 'itemPower'), 3000, ITEM_POWER_MAX);
}

export function abyssEraForDepth(depth) {
  const d = depthValue(depth);
  let current = ABYSS_ENDGAME_MILESTONES[0];
  for (const milestone of ABYSS_ENDGAME_MILESTONES) {
    if (d >= milestone.depth) current = milestone;
    else break;
  }
  return current.era;
}

// Enemy scaling relative to the Lv3,000 / IP3,000 Chapter 20 baseline.
// Character base stats are broadly linear, so ATK/DEF stay close to linear while
// HP is only slightly steeper. Post-cap depth adds a slow self-best multiplier
// without inventing Lv100,000+.
export function abyssCombatScale(depth) {
  const level = abyssRecommendedLevel(depth);
  const ratio = Math.max(1, level / 3000);
  const d = depthValue(depth);
  const postCap = d <= 3000 ? 1 : 1 + Math.log2(1 + (d - 3000) / 500) * 0.08;
  return {
    level,
    hp: Math.pow(ratio, 1.08) * postCap,
    atk: Math.pow(ratio, 0.98) * Math.pow(postCap, 0.75),
    def: Math.pow(ratio, 0.95) * Math.pow(postCap, 0.6),
  };
}

// One clear should meaningfully advance toward the next floor's recommended level.
// The reward is expressed as a fraction of the EXP needed for the number of levels
// crossed by the roadmap between this depth and the next. Enemy EXP supplies the rest.
export function abyssStageExpBudget(depth) {
  const lv = abyssRecommendedLevel(depth);
  const next = abyssRecommendedLevel(depth + 1);
  const deltaLevels = Math.max(1, next - lv);
  const approxNeed = characterExpToNext(lv) * deltaLevels;
  return Math.max(1, Math.round(approxNeed * 0.55));
}

export function abyssLootDepthForItemPower(depth) {
  return depthValue(depth);
}
