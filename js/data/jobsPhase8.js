/* Phase 8 unified job view: basic(15) + advanced(30) + special(10) + hero(1),
   the hand-authored tiered/fusion roster. The 75 auto-generated Fusion pairs
   (data/jobFusion.js) stay computed below (FUSIONS) for save-id compatibility
   and getJob() fallback only -- they are deliberately excluded from the
   active/selectable roster (user decision 2026-09-08: trim the near-duplicate
   auto-generated pairs, keep the tiered system that actually has content).
   The C1 Job Identity Rework's flat 10-job roster is retired the same way:
   each of its 7 real c1Combat loops is grafted onto its nearest tiered
   advanced job below instead of replacing the roster outright. */
import { allJobs as legacyAllJobs, getJob as legacyGetJob, computeStats as legacyComputeStats, TIER_INFO } from './jobs.js';
import { fusionRuntimeJobs, fusionUnlockState, fusionRequirementText } from './fusionRuntime.js';
import { computeC1JobStats, getC1RuntimeJob, C1_TO_LEGACY_HOST } from './jobIdentityMigration.js';

const LEGACY = legacyAllJobs();
const BASIC = LEGACY.filter(j => j.tier === 'basic');
const SPECIAL = LEGACY.filter(j => j.tier === 'special');
const HERO = LEGACY.filter(j => j.tier === 'hero');
const FUSIONS = fusionRuntimeJobs(LEGACY);

// Of the 105 auto-generated Fusion pairs, only the 30 with hand-authored
// legacy content (source==='legacy') stay in the active roster; the 75 pure
// auto-generated pairs are excluded (kept in FUSIONS below only for save-id
// compatibility / getJob() fallback). Sourcing the 30 from FUSIONS rather
// than straight from LEGACY keeps their multi-weapon-affinity metadata
// (.weapons, merged from both parents) that fusionRuntimeJobs() adds.
const LEGACY_ADVANCED_IDS = new Set(LEGACY.filter(j => j.tier === 'advanced').map(j => j.id));
const ADVANCED = FUSIONS.filter(f => LEGACY_ADVANCED_IDS.has(f.id));

// Graft each surviving C1 identity's unique combat loop onto the tiered
// advanced job it was originally drawn from (e.g. c1_vanguard's Pressure
// loop -> battlemaster, the warrior+fighter fusion its own `sources` name).
// Everything else about that job (name, tier, requires, skills, spells,
// weapon affinities) stays exactly what it was.
const GRAFTED_ADVANCED = ADVANCED.map((job) => {
  const c1Id = Object.entries(C1_TO_LEGACY_HOST).find(([, hostId]) => hostId === job.id)?.[0];
  const c1Combat = c1Id ? getC1RuntimeJob(c1Id)?.c1Combat : null;
  return c1Combat ? Object.freeze({ ...job, c1Combat }) : job;
});
const ALL = Object.freeze([...BASIC, ...GRAFTED_ADVANCED, ...SPECIAL, ...HERO]);
const BY_ID = new Map(ALL.map(j => [j.id, j]));

export function getJob(id) { return BY_ID.get(id) || FUSIONS.find((job) => job.id === id) || legacyGetJob(id); }
export function allJobs() { return [...ALL]; }
export function jobsByTier(tier) { return ALL.filter(j => j.tier === tier); }
export function fusionJobs() { return [...FUSIONS]; }
export function computeStats(jobId, level) {
  const c1 = computeC1JobStats(jobId, level); if (c1) return c1;
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
  if (getC1RuntimeJob(jobId)) return true;
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
