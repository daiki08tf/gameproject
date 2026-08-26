/* ============================================================
   Phase 10.6 — Numeric safety / large-number presentation
   ------------------------------------------------------------
   Shared helpers for Lv10,000+ / Lv99,999-era values.
   - Runtime math stays as Number while values remain finite/safe.
   - UI-facing values are normalized so NaN / Infinity never leak into text.
   - Large integers keep full precision in tooltips/log-scale contexts while
     compact display can be requested explicitly.
   ============================================================ */

export const MAX_SAFE_GAME_INTEGER = Number.MAX_SAFE_INTEGER;

export function finiteGameNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function safeGameInteger(value, fallback = 0) {
  const n = finiteGameNumber(value, fallback);
  if (n >= MAX_SAFE_GAME_INTEGER) return MAX_SAFE_GAME_INTEGER;
  if (n <= -MAX_SAFE_GAME_INTEGER) return -MAX_SAFE_GAME_INTEGER;
  return Math.round(n);
}

export function safeRatio(numerator, denominator, fallback = 0) {
  const n = finiteGameNumber(numerator, 0);
  const d = finiteGameNumber(denominator, 0);
  if (d === 0) return fallback;
  const ratio = n / d;
  return Number.isFinite(ratio) ? ratio : fallback;
}

export function percentWidth(current, maximum) {
  return Math.max(0, Math.min(100, safeRatio(current, maximum, 0) * 100));
}

export function formatGameNumber(value, { compact = false, maximumFractionDigits = 1 } = {}) {
  const n = finiteGameNumber(value, 0);
  const rounded = Math.round(n);
  if (!compact || Math.abs(rounded) < 1000000) return rounded.toLocaleString('ja-JP');
  return new Intl.NumberFormat('ja-JP', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits,
  }).format(rounded);
}

export function numericSafetySnapshot(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => {
    const n = Number(value);
    return [key, {
      finite: Number.isFinite(n),
      safeInteger: Number.isSafeInteger(Math.round(n)),
      value: Number.isFinite(n) ? n : null,
    }];
  }));
}
