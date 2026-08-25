/* Phase 8 unified job view: basic + 105 fusion/advanced + special + hero. */
import { allJobs as legacyAllJobs, getJob as legacyGetJob, computeStats as legacyComputeStats, TIER_INFO } from './jobs.js';
import { fusionRuntimeJobs, fusionUnlockState, fusionRequirementText } from './fusionRuntime.js';

const LEGACY = legacyAllJobs();
const BASIC = LEGACY.filter(j => j.tier === 'basic');
const SPECIAL = LEGACY.filter(j => j.tier === 'special');
const HERO = LEGACY.filter(j => j.tier === 'hero');
const FUSIONS = fusionRuntimeJobs(LEGACY);
const ALL = Object.freeze([...BASIC, ...FUSIONS, ...SPECIAL, ...HERO]);
const BY_ID = new Map(ALL.map(j => [j.id, j]));

export function getJob(id) { return BY_ID.get(id) || legacyGetJob(id); }
export function allJobs() { return [...ALL]; }
export function jobsByTier(tier) { return ALL.filter(j => j.tier === tier); }
export function fusionJobs() { return [...FUSIONS]; }
export function computeStats(jobId, level) {
  const legacy = legacyGetJob(jobId);
  if (legacy) return legacyComputeStats(jobId, level);
  const job = getJob(jobId), tier = TIER_INFO.advanced, L = Math.max(1, level), base = {hp:40,mp:15,atk:8,def:7,mag:7,spd:5,crit:1};
  const growth = {hp:8,mp:3,atk:2,def:2,mag:2,spd:0.3,crit:0.15};
  const out = {};
  for (const k of Object.keys(base)) out[k] = base[k] * job.profile[k] * tier.baseMult + growth[k] * job.profile[k] * tier.growthMult * (L - 1);
  for (const k of ['hp','mp','atk','def','mag']) out[k] = Math.round(out[k]);
  out.spd = Math.round(out.spd * 10) / 10; out.critPct = Math.min(100, Math.round((5 + out.crit * .8) * 10) / 10); return out;
}
export function isUnlocked(jobId, masteredSet) {
  const f = fusionUnlockState(jobId, masteredSet); if (f) return f.unlocked;
  const job = getJob(jobId); if (!job) return false; if (job.tier === 'basic') return true;
  if (job.requiresCount) { const pool=jobsByTier(job.requiresCount.tier).map(j=>j.id); return pool.filter(id=>masteredSet.has(id)).length>=job.requiresCount.count; }
  return (job.requires||[]).every(id=>masteredSet.has(id));
}
export function unlockRequirementText(jobId) {
  const f = fusionRequirementText(jobId, getJob); if (f) return f;
  const job=getJob(jobId); if(!job)return ''; if(job.tier==='basic')return '最初から選択可能'; if(job.requiresCount)return `特級職を${job.requiresCount.count}つ以上マスター`;
  return (job.requires||[]).map(id=>getJob(id)?.name||id).join('＋')+' を両方マスター';
}
export const TIERS = TIER_INFO;
