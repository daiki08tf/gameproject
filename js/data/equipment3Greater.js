/* ============================================================
   Equipment 3.0 E3 — Greater Affix rules
   ------------------------------------------------------------
   Greater Affix is drop-only. Existing saved weapons are not retroactively
   upgraded. When an Affix becomes Greater, its rolled value is multiplied
   before the normal Affix application path, so every existing stat/effect
   system automatically benefits without a second combat formula.
   ============================================================ */
import { ITEM_POWER_MAX } from './equipment3.js';

export const GREATER_AFFIX_MULT = 1.5;
export const GREATER_AFFIX_MAX_PER_ITEM = 3;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }

export function greaterAffixChance(itemPower, ctx = {}) {
  const ip = clamp(Math.floor(Number(itemPower) || 1), 1, ITEM_POWER_MAX);
  let chance = 0;

  if (ip >= 8000) chance = lerp(0.12, 0.18, (ip - 8000) / 2000);
  else if (ip >= 5000) chance = lerp(0.08, 0.12, (ip - 5000) / 3000);
  else if (ip >= 3000) chance = lerp(0.05, 0.08, (ip - 3000) / 2000);
  else if (ip >= 1000) chance = lerp(0.015, 0.05, (ip - 1000) / 2000);
  else if (ip >= 700) chance = lerp(0.0025, 0.01, (ip - 700) / 300);

  if (ctx.elite) chance += 0.01;
  if (ctx.boss) chance += 0.02;
  if (ctx.ex) chance += 0.03;
  if (ctx.nemesis) chance += 0.05;
  return clamp(chance, 0, 0.30);
}

function deterministicUnit(key) {
  const s = String(key || 'greater');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 999999;
}

function round2(v) { return Math.round(v * 100) / 100; }

export function applyGreaterAffixes(affixes, itemPower, ctx = {}, instanceId = '') {
  const out = (affixes || []).map((a) => ({ ...a }));
  const chance = greaterAffixChance(itemPower, ctx);
  let count = 0;

  for (let i = 0; i < out.length; i++) {
    const a = out[i];
    if (a.greaterEvaluated) {
      if (a.greater) count += 1;
      continue;
    }

    a.greaterEvaluated = true;
    if (count >= GREATER_AFFIX_MAX_PER_ITEM || chance <= 0) {
      a.greater = false;
      continue;
    }

    const hit = deterministicUnit(`${instanceId}:${a.id}:${i}:greater`) < chance;
    a.greater = hit;
    if (!hit) continue;

    a.baseRoll = Number(a.roll) || 0;
    a.roll = round2(a.baseRoll * GREATER_AFFIX_MULT);
    count += 1;
  }

  return { affixes: out, greaterCount: count, chance };
}
