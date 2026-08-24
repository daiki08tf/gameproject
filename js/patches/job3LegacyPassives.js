/* ============================================================
   Job 3.0 — Inherited MASTER passives
   ------------------------------------------------------------
   Up to three mastered Jobs can lend half-strength versions of the MASTER node
   from their selected specialization. Existing automatic MASTER bonuses remain
   untouched. A Job never inherits its own node while it is the active Job.
   ============================================================ */
import { state } from '../state.js';
import { getJob } from '../data/jobs.js';
import { CAPS_LAYER } from '../data/balance.js';

export const JOB3_LEGACY_SLOT_COUNT = 3;

function ensureLegacyData(target = state) {
  if (!Array.isArray(target.data.job3LegacySlots)) target.data.job3LegacySlots = [];
  target.data.job3LegacySlots = [...new Set(target.data.job3LegacySlots)]
    .filter((id) => target.isMastered(id) && getJob(id))
    .slice(0, JOB3_LEGACY_SLOT_COUNT);
  return target.data.job3LegacySlots;
}

function halfMultiplier(mult) {
  const n = Number(mult) || 1;
  return 1 + (n - 1) * 0.5;
}

function inheritedNodePayload(node, sourceJobId) {
  if (!node) return null;
  const statMult = {};
  const statAdd = {};
  for (const [key, value] of Object.entries(node.statMult || {})) statMult[key] = halfMultiplier(value);
  for (const [key, value] of Object.entries(node.statAdd || {})) statAdd[key] = (Number(value) || 0) * 0.5;
  const effects = (node.effects || []).map((effect) => ({
    ...effect,
    power: effect.power == null ? effect.power : (Number(effect.power) || 0) * 0.5,
    chance: effect.chance == null ? effect.chance : (Number(effect.chance) || 0) * 0.5,
    __job3Legacy: sourceJobId,
  }));
  return { sourceJobId, nodeName: node.name, statMult, statAdd, effects };
}

state.job3LegacySlots = function job3LegacySlots() {
  return ensureLegacyData(this).slice();
};

state.canEquipJob3Legacy = function canEquipJob3Legacy(jobId) {
  return this.isMastered(jobId) && !!getJob(jobId);
};

state.toggleJob3Legacy = function toggleJob3Legacy(jobId) {
  if (!this.canEquipJob3Legacy(jobId)) return false;
  const slots = ensureLegacyData(this);
  const index = slots.indexOf(jobId);
  if (index >= 0) slots.splice(index, 1);
  else {
    if (slots.length >= JOB3_LEGACY_SLOT_COUNT) return false;
    slots.push(jobId);
  }
  this.data.job3LegacySlots = slots;
  this.save();
  return true;
};

state.job3LegacyPayloads = function job3LegacyPayloads() {
  const out = [];
  for (const jobId of ensureLegacyData(this)) {
    if (jobId === this.currentJobId) continue; // no double-dipping own specialization
    const masterNode = this.job3ActiveNodes(jobId).find((node) => node.level === 'master');
    const payload = inheritedNodePayload(masterNode, jobId);
    if (payload) out.push(payload);
  }
  return out;
};

state.job3LegacyStatus = function job3LegacyStatus() {
  const equipped = new Set(ensureLegacyData(this));
  return this.masteredJobs().map((job) => {
    const masterNode = this.job3ActiveNodes(job.id).find((node) => node.level === 'master') || null;
    return {
      jobId: job.id,
      jobName: job.name,
      routeId: this.job3SelectedRoute(job.id),
      routeName: this.job3SpecializationStatus(job.id).find((r) => r.selected)?.name || '',
      nodeName: masterNode?.name || '',
      nodeDesc: masterNode?.desc || '',
      equipped: equipped.has(job.id),
      suppressed: equipped.has(job.id) && job.id === this.currentJobId,
    };
  });
};

const previousGetStats = state.getStats.bind(state);
state.getStats = function job3LegacyStats() {
  const stats = previousGetStats();
  const mult = {};
  const add = {};
  for (const payload of this.job3LegacyPayloads()) {
    for (const [key, value] of Object.entries(payload.statMult || {})) mult[key] = (mult[key] || 1) * value;
    for (const [key, value] of Object.entries(payload.statAdd || {})) add[key] = (add[key] || 0) + value;
  }
  for (const key of ['hp','mp','atk','def','mag']) if (mult[key]) stats[key] = Math.max(1, Math.round(stats[key] * mult[key]));
  if (mult.spd) stats.spd = Math.max(0.1, Math.round(stats.spd * mult.spd * 10) / 10);
  if (add.critPct) stats.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, stats.critPct + add.critPct);
  if (add.armorPen) stats.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, Math.max(0, (stats.armorPen || 0) + add.armorPen));
  if (add.evasion) stats.evasion = Math.min(CAPS_LAYER.EVASION_MAX, Math.max(0, (stats.evasion || 0) + add.evasion));
  return stats;
};

const previousGetEquippedEffects = state.getEquippedEffects.bind(state);
state.getEquippedEffects = function job3LegacyEffects() {
  const effects = previousGetEquippedEffects();
  for (const payload of this.job3LegacyPayloads()) effects.push(...payload.effects);
  return effects;
};

ensureLegacyData();

export { ensureLegacyData, inheritedNodePayload };
