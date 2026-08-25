import { ALL_FUSION_JOBS, getFusionJobById } from './jobFusion.js';

export function fusionRuntimeJobs(baseJobs) {
  const byId = new Map(baseJobs.map(j => [j.id, j]));
  return ALL_FUSION_JOBS.map(f => {
    const existing = byId.get(f.id);
    if (existing) return { ...existing, fusion: f, isFusionJob: true };
    const parents = f.parents.map(id => byId.get(id)).filter(Boolean);
    const profile = {};
    for (const k of ['hp','mp','atk','def','mag','spd','crit']) profile[k] = parents.reduce((s,p)=>s+(p.profile?.[k]||1),0)/Math.max(1,parents.length);
    return {
      id: f.id, name: f.name, tier: 'advanced', requires: [...f.parents],
      profile, weapon: parents[0]?.weapon || 'sword', skills: [], spells: [],
      fusion: f, isFusionJob: true,
      masterAbility: { condition:'always', effect:{ stat:'cooldown', pct:-0.03 } },
    };
  });
}

export function fusionUnlockState(jobId, masteredSet) {
  const f = getFusionJobById(jobId);
  if (!f) return null;
  const mastered = masteredSet instanceof Set ? masteredSet : new Set(masteredSet || []);
  const count = f.parents.filter(id => mastered.has(id)).length;
  return { unlocked: count === 2, masteredParents: count, parents: [...f.parents] };
}

export function fusionRequirementText(jobId, getJob) {
  const f = getFusionJobById(jobId);
  if (!f) return null;
  return f.parents.map(id => getJob(id)?.name || id).join('＋') + ' を両方マスター';
}
