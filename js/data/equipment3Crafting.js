/* ============================================================
   Equipment 3.0 E6 — Blacksmith 3.0 crafting rules
   ============================================================ */
import { GREATER_AFFIX_MULT, GREATER_AFFIX_MAX_PER_ITEM } from './equipment3Greater.js';

export const EQUIPMENT3_CRAFT_COST = Object.freeze({
  REROLL_AFFIX: Object.freeze({ gold: 8000, essence: 3 }),
  TEMPER_VALUE: Object.freeze({ gold: 5000, essence: 2 }),
  GREATER_ASCEND: Object.freeze({ gold: 25000, essence: 12, manastone: 10 }),
  EXTRACT_LEGENDARY: Object.freeze({ gold: 15000, essence: 5 }),
  IMPRINT_LEGENDARY: Object.freeze({ gold: 30000, manastone: 20 }),
});

export function greaterAffixCount(affixes) {
  return (affixes || []).filter((a) => !!a?.greater).length;
}

export function canGreaterAscendAffix(affixes, index) {
  if (!Array.isArray(affixes) || index < 0 || index >= affixes.length) return false;
  if (affixes[index]?.greater) return false;
  return greaterAffixCount(affixes) < GREATER_AFFIX_MAX_PER_ITEM;
}

function round2(v) { return Math.round(v * 100) / 100; }

// 数値再鍛錬は最初に得た基準値から±10%だけ揺らす。
// 再鍛錬を繰り返して無限に数値を積めないよう、基準値は固定する。
export function temperAffixValue(affix, rng = Math.random) {
  if (!affix) return null;
  const out = { ...affix };
  const current = Number(out.roll) || 0;
  const originalBase = Number.isFinite(out.temperBaseRoll)
    ? out.temperBaseRoll
    : out.greater && Number.isFinite(out.baseRoll)
      ? out.baseRoll
      : current / (out.greater ? GREATER_AFFIX_MULT : 1);
  out.temperBaseRoll = round2(originalBase);
  const quality = 0.90 + Math.max(0, Math.min(1, Number(rng()) || 0)) * 0.20;
  const normalRoll = round2(out.temperBaseRoll * quality);
  if (out.greater) {
    out.baseRoll = normalRoll;
    out.roll = round2(normalRoll * GREATER_AFFIX_MULT);
  } else {
    out.roll = normalRoll;
  }
  return out;
}

export function ascendAffixToGreater(affix) {
  if (!affix || affix.greater) return affix ? { ...affix } : null;
  const out = { ...affix };
  const base = Number.isFinite(out.temperBaseRoll) ? out.temperBaseRoll : Number(out.roll) || 0;
  out.baseRoll = round2(base);
  out.roll = round2(out.baseRoll * GREATER_AFFIX_MULT);
  out.greater = true;
  out.greaterEvaluated = true;
  out.forgedGreater = true;
  return out;
}

export function costAffordable(data, cost) {
  if (!data || !cost) return false;
  if ((data.gold || 0) < (cost.gold || 0)) return false;
  if ((data.weaponEssence || 0) < (cost.essence || 0)) return false;
  if ((data.manastone || 0) < (cost.manastone || 0)) return false;
  return true;
}
