/* ============================================================
   Job 3.0 — Specialization runtime
   ============================================================ */
import { state } from '../state.js';
import { getJob } from '../data/jobs.js';
import { specializationRoutesForJob, activeSpecializationNodes } from '../data/job3Specializations.js';
import { CAPS_LAYER } from '../data/balance.js';

function ensureJob3Data(target = state) {
  target.data.job3Specializations ||= {};
  return target.data.job3Specializations;
}

state.job3SpecializationRoutes = function job3SpecializationRoutes(jobId) {
  return specializationRoutesForJob(getJob(jobId));
};

state.job3SelectedRoute = function job3SelectedRoute(jobId) {
  const routes = this.job3SpecializationRoutes(jobId);
  const selected = ensureJob3Data(this)[jobId];
  return routes.some((r) => r.id === selected) ? selected : (routes[0]?.id || null);
};

state.setJob3Specialization = function setJob3Specialization(jobId, routeId) {
  const routes = this.job3SpecializationRoutes(jobId);
  if (!routes.some((r) => r.id === routeId)) return false;
  ensureJob3Data(this)[jobId] = routeId;
  this.save();
  return true;
};

state.job3ActiveNodes = function job3ActiveNodes(jobId = this.currentJobId) {
  const job = getJob(jobId);
  if (!job) return [];
  const level = this.jobProgress(jobId).level;
  return activeSpecializationNodes(job, level, this.isMastered(jobId), this.job3SelectedRoute(jobId));
};

state.job3SpecializationStatus = function job3SpecializationStatus(jobId) {
  const job = getJob(jobId);
  const routes = this.job3SpecializationRoutes(jobId);
  const selected = this.job3SelectedRoute(jobId);
  const level = this.jobProgress(jobId).level;
  const mastered = this.isMastered(jobId);
  return routes.map((route) => ({
    ...route,
    selected: route.id === selected,
    nodes: route.nodes.map((node) => ({
      ...node,
      active: node.level === 'master' ? mastered : level >= node.level,
    })),
  }));
};

const previousGetStats = state.getStats.bind(state);
state.getStats = function job3SpecializationStats() {
  const stats = previousGetStats();
  const mult = {};
  const add = {};
  for (const node of this.job3ActiveNodes()) {
    for (const [key, value] of Object.entries(node.statMult || {})) mult[key] = (mult[key] || 1) * value;
    for (const [key, value] of Object.entries(node.statAdd || {})) add[key] = (add[key] || 0) + value;
  }
  for (const key of ['hp','mp','atk','def','mag']) if (mult[key]) stats[key] = Math.max(1, Math.round(stats[key] * mult[key]));
  if (mult.spd) stats.spd = Math.max(0.1, Math.round(stats.spd * mult.spd * 10) / 10);
  if (add.critPct) stats.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, stats.critPct + add.critPct);
  if (add.armorPen) stats.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, Math.max(0, (stats.armorPen || 0) + add.armorPen));
  if (add.evasion) stats.evasion = Math.min(CAPS_LAYER.EVASION_MAX, Math.max(0, (stats.evasion || 0) + add.evasion));
  return stats;
};

const previousGetEquippedEffects = state.getEquippedEffects.bind(state);
state.getEquippedEffects = function job3SpecializationEffects() {
  const effects = previousGetEquippedEffects();
  for (const node of this.job3ActiveNodes()) {
    for (const effect of node.effects || []) effects.push({ ...effect, __job3Specialization: this.job3SelectedRoute(this.currentJobId) });
  }
  return effects;
};

ensureJob3Data();
