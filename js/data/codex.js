/* ============================================================
   Codex 2.0 - monster collection as permanent progression
   ============================================================ */

export const CODEX_MILESTONES = Object.freeze([
  { id: 'seen', label: '遭遇', points: 1, test: e => !!e.seen },
  { id: 'kill1', label: '初撃破', points: 1, test: e => (e.kills || 0) >= 1 },
  { id: 'kill10', label: '10体撃破', points: 1, test: e => (e.kills || 0) >= 10 },
  { id: 'kill100', label: '100体撃破', points: 1, test: e => (e.kills || 0) >= 100 },
  { id: 'recruited', label: '仲間化', points: 1, test: e => !!e.recruited },
  { id: 'rare', label: 'Rare個体', points: 1, test: e => !!e.rare },
  { id: 'legendary', label: 'Legendary個体', points: 1, test: e => !!e.legendary },
]);

export function codexEntryPoints(entry = {}) {
  return CODEX_MILESTONES.reduce((sum, m) => sum + (m.test(entry) ? m.points : 0), 0);
}

export function codexCompletion(entries = {}, knownEnemyIds = []) {
  const ids = [...new Set(knownEnemyIds)];
  const maxPoints = ids.length * CODEX_MILESTONES.length;
  if (!maxPoints) return { points: 0, maxPoints: 0, pct: 0 };
  const points = ids.reduce((sum, id) => sum + codexEntryPoints(entries[id]), 0);
  return { points, maxPoints, pct: Math.min(100, points / maxPoints * 100) };
}

// CodexはRuneのような巨大な乗算源にせず、小さな永続成長＋収集効率を担当する。
export function codexBonuses(completionPct = 0) {
  const p = Math.max(0, Math.min(100, completionPct));
  return {
    allStatMult: 1 + (p >= 25 ? 0.01 : 0) + (p >= 75 ? 0.01 : 0),
    dropMult: 1 + (p >= 50 ? 0.05 : 0),
    expMult: 1 + (p >= 75 ? 0.10 : 0),
    rareEncounterMult: 1 + (p >= 90 ? 0.05 : 0),
    complete: p >= 100,
  };
}

export function ensureCodexEntry(entries, enemyId, enemyName = enemyId) {
  if (!entries[enemyId]) entries[enemyId] = { name: enemyName, seen: false, kills: 0, recruited: false, rare: false, legendary: false, activities: [] };
  if (enemyName && !entries[enemyId].name) entries[enemyId].name = enemyName;
  if (!Array.isArray(entries[enemyId].activities)) entries[enemyId].activities = [];
  return entries[enemyId];
}
