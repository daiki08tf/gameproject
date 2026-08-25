/* Phase 8 — Skill Constellation allocation runtime. */
import { state } from '../state.js';
import { constellationTreeFor, constellationNode } from '../data/jobConstellationTrees.js';
import { CAPS_LAYER } from '../data/balance.js';
import { chainMethod } from './patchUtils.js';

function ensure(target = state) {
  target.data.jobConstellation ||= {};
  return target.data.jobConstellation;
}

// One SP per Job level after Lv1. MASTER node itself is free but requires
// both the normal MASTER flag and its prerequisite path.
state.constellationPointsEarned = function(jobId) {
  return Math.max(0, this.jobProgress(jobId).level - 1);
};
state.constellationPurchased = function(jobId) {
  return new Set(ensure(this)[jobId] || []);
};
state.constellationPointsSpent = function(jobId) {
  const bought = this.constellationPurchased(jobId);
  return constellationTreeFor(jobId).reduce((sum, n) => sum + (bought.has(n.id) ? n.cost : 0), 0);
};
state.constellationPointsAvailable = function(jobId) {
  return Math.max(0, this.constellationPointsEarned(jobId) - this.constellationPointsSpent(jobId));
};
state.constellationNodeStatus = function(jobId, nodeId) {
  const n = constellationNode(jobId, nodeId);
  if (!n) return { exists:false, bought:false, canBuy:false };
  const bought = this.constellationPurchased(jobId);
  const prereq = n.requires.every((id) => bought.has(id));
  const masteryOk = n.kind !== 'master' || this.isMastered(jobId);
  const canBuy = !bought.has(n.id) && prereq && masteryOk && this.constellationPointsAvailable(jobId) >= n.cost;
  return { exists:true, bought:bought.has(n.id), prereq, masteryOk, canBuy, node:n };
};
state.buyConstellationNode = function(jobId, nodeId) {
  const status = this.constellationNodeStatus(jobId, nodeId);
  if (!status.canBuy) return false;
  const data = ensure(this);
  data[jobId] ||= [];
  data[jobId].push(nodeId);
  this.save();
  return true;
};
state.activeConstellationNodes = function(jobId = this.currentJobId) {
  const bought = this.constellationPurchased(jobId);
  return constellationTreeFor(jobId).filter((n) => bought.has(n.id));
};

chainMethod(state, 'getStats', (previous) => function constellationStats() {
  const stats = previous();
  for (const n of this.activeConstellationNodes()) {
    for (const [key, mult] of Object.entries(n.statMult || {})) {
      if (key === 'spd') stats.spd = Math.max(0.1, Math.round(stats.spd * mult * 10) / 10);
      else if (stats[key] != null) stats[key] = Math.max(1, Math.round(stats[key] * mult));
    }
    for (const [key, add] of Object.entries(n.statAdd || {})) {
      if (key === 'critPct') stats.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, stats.critPct + add);
      else if (key === 'armorPen') stats.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, (stats.armorPen || 0) + add);
      else if (key === 'evasion') stats.evasion = Math.min(CAPS_LAYER.EVASION_MAX, (stats.evasion || 0) + add);
    }
  }
  return stats;
});

const previousEffects = state.getEquippedEffects.bind(state);
state.getEquippedEffects = function constellationEffects() {
  const effects = previousEffects();
  for (const n of this.activeConstellationNodes()) for (const effect of n.effects || []) effects.push({ ...effect, __constellation:n.id });
  return effects;
};

ensure();
