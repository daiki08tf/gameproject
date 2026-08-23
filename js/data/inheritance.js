export const INHERITABLE_STAT_KEYS = ['hp', 'mp', 'atk', 'def', 'mag', 'spd'];

export function inheritanceRatePct(level, inheritanceCount = 0) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  const n = Math.max(0, Math.floor(Number(inheritanceCount) || 0));
  return lv < 2000 ? (lv / 200 + n) : (lv / 100 + n);
}

export function inheritanceBonusPointGain(level, inheritanceCount = 0) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  const n = Math.max(0, Math.floor(Number(inheritanceCount) || 0));
  return lv < 2000 ? n : Math.max(0, lv - 2000) + n;
}

export function calculateInheritedStats(sourceStats, level, inheritanceCount = 0) {
  const ratePct = inheritanceRatePct(level, inheritanceCount);
  return Object.fromEntries(INHERITABLE_STAT_KEYS.map((key) => [
    key,
    Math.max(0, Math.floor((Number(sourceStats?.[key]) || 0) * ratePct / 100)),
  ]));
}
