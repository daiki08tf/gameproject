/* ============================================================
   Progression 2.0 Phase 4 — Inheritance Core
   ============================================================ */

import { state } from '../state.js';
import { computeStats } from '../data/jobs.js';
import {
  INHERITABLE_STAT_KEYS,
  inheritanceRatePct,
  inheritanceBonusPointGain,
  calculateInheritedStats,
} from '../data/inheritance.js';

function emptyStats() {
  return Object.fromEntries(INHERITABLE_STAT_KEYS.map((key) => [key, 0]));
}

function normalizeStats(value) {
  const out = emptyStats();
  for (const key of INHERITABLE_STAT_KEYS) out[key] = Math.max(0, Math.floor(Number(value?.[key]) || 0));
  return out;
}

function ensureInheritanceData() {
  if (!Number.isFinite(state.data.reincarnations)) state.data.reincarnations = 0;
  state.data.reincarnations = Math.max(0, Math.floor(state.data.reincarnations));
  state.data.inheritedStats = normalizeStats(state.data.inheritedStats);
  state.data.inheritanceAllocated = normalizeStats(state.data.inheritanceAllocated);
  if (!Number.isFinite(state.data.inheritanceBonusPoints)) state.data.inheritanceBonusPoints = 0;
  state.data.inheritanceBonusPoints = Math.max(0, Math.floor(state.data.inheritanceBonusPoints));
  if (!Array.isArray(state.data.inheritanceHistory)) state.data.inheritanceHistory = [];
}

function withLegacyRebirthDisabled(fn) {
  const previous = state.data.reincarnations;
  state.data.reincarnations = 0;
  try { return fn(); }
  finally { state.data.reincarnations = previous; }
}

ensureInheritanceData();

state.inheritanceRatePct = function inheritanceRate(level = this.characterLevel, count = this.data.reincarnations) {
  return inheritanceRatePct(level, count);
};
state.inheritanceBonusPointGain = function inheritanceBp(level = this.characterLevel, count = this.data.reincarnations) {
  return inheritanceBonusPointGain(level, count);
};

state.inheritanceIntrinsicStats = function inheritanceIntrinsicStats() {
  ensureInheritanceData();
  const levelGrowth = computeStats(this.currentJobId, this.characterLevel);
  const out = emptyStats();
  for (const key of INHERITABLE_STAT_KEYS) {
    out[key] = Math.max(0, Math.floor(
      (Number(levelGrowth?.[key]) || 0)
      + (Number(this.data.inheritedStats[key]) || 0)
      + (Number(this.data.inheritanceAllocated[key]) || 0)
    ));
  }
  return out;
};

state.inheritancePreview = function inheritancePreview() {
  ensureInheritanceData();
  const level = this.characterLevel;
  const count = this.data.reincarnations;
  const ratePct = inheritanceRatePct(level, count);
  const bonusPoints = inheritanceBonusPointGain(level, count);
  const sourceStats = this.inheritanceIntrinsicStats();
  const nextInheritedStats = calculateInheritedStats(sourceStats, level, count);
  return { level, count, ratePct, bonusPoints, sourceStats, nextInheritedStats };
};

state.performInheritance = function performInheritance() {
  ensureInheritanceData();
  const preview = this.inheritancePreview();
  this.data.inheritedStats = normalizeStats(preview.nextInheritedStats);
  this.data.inheritanceBonusPoints += preview.bonusPoints;
  this.data.reincarnations += 1;
  this.data.characterLevel = 1;
  this.data.characterExp = 0;
  this.data.inheritanceHistory.push({
    at: Date.now(),
    fromLevel: preview.level,
    ratePct: preview.ratePct,
    bonusPoints: preview.bonusPoints,
    inheritedStats: normalizeStats(preview.nextInheritedStats),
  });
  if (this.data.inheritanceHistory.length > 50) this.data.inheritanceHistory.shift();
  this.save();
  return preview;
};

state.reincarnationCost = function progression2InheritanceCost() { return { gold: 0, manastone: 0 }; };
state.reincarnate = function progression2ReincarnateAlias() { this.performInheritance(); return true; };

state.inheritanceUnspentPoints = function inheritanceUnspentPoints() {
  ensureInheritanceData();
  const spent = INHERITABLE_STAT_KEYS.reduce((sum, key) => sum + (Number(this.data.inheritanceAllocated[key]) || 0), 0);
  return Math.max(0, this.data.inheritanceBonusPoints - spent);
};

state.allocateInheritancePoints = function allocateInheritancePoints(stat, amount = 1) {
  ensureInheritanceData();
  if (!INHERITABLE_STAT_KEYS.includes(stat)) return 0;
  const requested = Math.max(0, Math.floor(Number(amount) || 0));
  const used = Math.min(requested, this.inheritanceUnspentPoints());
  if (used <= 0) return 0;
  this.data.inheritanceAllocated[stat] += used;
  this.save();
  return used;
};

state.resetInheritanceAllocation = function resetInheritanceAllocation() {
  ensureInheritanceData();
  this.data.inheritanceAllocated = emptyStats();
  this.save();
  return true;
};

// Stop the legacy +3% reincarnation multiplier, then add inherited/BP stats as
// the new persistent initial-stat layer. Future Rune 2.0 loads after this layer.
const phase3GetStats = state.getStats.bind(state);
const phase3GetStatBreakdown = state.getStatBreakdown.bind(state);

state.getStats = function getStatsWithInheritance() {
  ensureInheritanceData();
  const base = withLegacyRebirthDisabled(() => phase3GetStats());
  const out = { ...base };
  for (const key of INHERITABLE_STAT_KEYS) {
    const add = (Number(this.data.inheritedStats[key]) || 0) + (Number(this.data.inheritanceAllocated[key]) || 0);
    if (key === 'spd') out[key] = Math.round(((Number(out[key]) || 0) + add) * 10) / 10;
    else out[key] = Math.round((Number(out[key]) || 0) + add);
  }
  return out;
};

state.getStatBreakdown = function getStatBreakdownWithInheritance(stat) {
  ensureInheritanceData();
  const legacy = withLegacyRebirthDisabled(() => phase3GetStatBreakdown(stat));
  const inheritance = INHERITABLE_STAT_KEYS.includes(stat)
    ? (Number(this.data.inheritedStats[stat]) || 0) + (Number(this.data.inheritanceAllocated[stat]) || 0)
    : 0;
  const total = Number(this.getStats()?.[stat] ?? legacy.total ?? 0);
  const values = {
    characterJobBase: Number(legacy.characterJobBase ?? legacy.base ?? 0),
    inheritance,
    equipment: Number(legacy.equipment || 0),
    permanent: Number(legacy.permanent || 0),
    affix: Number(legacy.affix || 0),
    codex: Number(legacy.codex || 0),
    rune: Number(legacy.rune || 0),
  };
  const accounted = Object.values(values).reduce((sum, v) => sum + v, 0);
  const special = Math.round((total - accounted) * 10) / 10;
  return { ...legacy, ...values, base: values.characterJobBase, inheritance, special, total };
};

export { INHERITABLE_STAT_KEYS, ensureInheritanceData, withLegacyRebirthDisabled };
