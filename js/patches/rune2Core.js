/* ============================================================
   Progression 2.0 Phase 5 — Rune 2.0 Core
   ============================================================ */

import { state } from '../state.js';
import { RUNE2_DEFS, getRune2, runesForStage } from '../data/runes2.js';

function ensureRune2Data() {
  if (!state.data.rune2Owned || typeof state.data.rune2Owned !== 'object') state.data.rune2Owned = {};
  if (!state.data.rune2Active || typeof state.data.rune2Active !== 'object') state.data.rune2Active = {};
  if (!state.data.rune2Discovered || typeof state.data.rune2Discovered !== 'object') state.data.rune2Discovered = {};
  for (const r of RUNE2_DEFS) {
    state.data.rune2Owned[r.id] = Math.max(0, Math.floor(Number(state.data.rune2Owned[r.id]) || 0));
    state.data.rune2Active[r.id] = Math.max(0, Math.floor(Number(state.data.rune2Active[r.id]) || 0));
  }
}
ensureRune2Data();

state.rune2Capacity = function rune2Capacity() {
  return Math.min(99999, Math.max(1, Math.floor(Number(this.highestCharacterLevel) || 1)));
};

state.rune2ActiveTotal = function rune2ActiveTotal() {
  ensureRune2Data();
  return Object.values(this.data.rune2Active).reduce((s, v) => s + (Number(v) || 0), 0);
};

state.rune2OwnedMarks = function rune2OwnedMarks(id) {
  ensureRune2Data();
  return Math.max(0, Math.floor(Number(this.data.rune2Owned[id]) || 0));
};

state.rune2ActiveMarks = function rune2ActiveMarks(id) {
  ensureRune2Data();
  return Math.max(0, Math.floor(Number(this.data.rune2Active[id]) || 0));
};

state.setRune2ActiveMarks = function setRune2ActiveMarks(id, requested) {
  ensureRune2Data();
  const rune = getRune2(id);
  if (!rune) return false;
  const owned = this.rune2OwnedMarks(id);
  const current = this.rune2ActiveMarks(id);
  const other = this.rune2ActiveTotal() - current;
  const capacityLeft = Math.max(0, this.rune2Capacity() - other);
  const next = Math.max(0, Math.min(owned, capacityLeft, Math.floor(Number(requested) || 0)));
  this.data.rune2Active[id] = next;
  this.save();
  return true;
};

state.addRune2Marks = function addRune2Marks(id, amount = 1) {
  ensureRune2Data();
  const rune = getRune2(id);
  if (!rune) return 0;
  const add = Math.max(0, Math.floor(Number(amount) || 0));
  if (!add) return 0;
  this.data.rune2Owned[id] = this.rune2OwnedMarks(id) + add;
  this.data.rune2Discovered[id] = true;
  this.save();
  return add;
};

state.rune2Starred = function rune2Starred(id) {
  const rune = getRune2(id);
  return !!(rune?.starAt && this.rune2OwnedMarks(id) >= rune.starAt);
};

state.rollRune2DropForStage = function rollRune2DropForStage(stageId, random = Math.random) {
  ensureRune2Data();
  const results = [];
  for (const rune of runesForStage(stageId)) {
    if (random() < rune.dropRate) {
      this.addRune2Marks(rune.id, 1);
      results.push({ id: rune.id, amount: 1, owned: this.rune2OwnedMarks(rune.id) });
    }
  }
  return results;
};

// Old weapon socket runes are neutralized in Phase 5. Their save data is kept for
// compatibility, but they no longer contribute stats/effects. Rune 2.0 is character-wide.
state.getRuneSockets = function rune2LegacySocketsDisabled() { return []; };

const inheritanceGetStats = state.getStats.bind(state);
const inheritanceBreakdown = state.getStatBreakdown.bind(state);

state.getStats = function getStatsWithRune2() {
  ensureRune2Data();
  const stats = { ...inheritanceGetStats() };
  for (const rune of RUNE2_DEFS) {
    if (rune.kind !== 'statMult') continue;
    const marks = this.rune2ActiveMarks(rune.id);
    if (!marks) continue;
    const mult = 1 + rune.perMark * marks;
    if (rune.stat === 'spd') stats[rune.stat] = Math.round((Number(stats[rune.stat] || 0) * mult) * 10) / 10;
    else stats[rune.stat] = Math.round(Number(stats[rune.stat] || 0) * mult);
  }
  return stats;
};

state.getStatBreakdown = function getStatBreakdownWithRune2(stat) {
  ensureRune2Data();
  const before = inheritanceBreakdown(stat);
  const total = Number(this.getStats()?.[stat] ?? before.total ?? 0);
  const preRuneTotal = Number(before.total || 0);
  const rune = Math.round((total - preRuneTotal) * 10) / 10;
  return { ...before, rune, total };
};

export { ensureRune2Data };
