/* Phase 8 — compatibility facade for the canonical 15C2 Fusion catalog. */
import {
  BASIC_JOB_ORDER,
  ALL_FUSION_JOBS,
  fusionPairKey,
  getFusionJob,
  getFusionJobById as getCanonicalFusionJobById,
  validateFusionDefinitions,
} from './jobFusion.js';

export const BASIC_FUSION_JOB_IDS = BASIC_JOB_ORDER;
export const FUSION_JOBS = Object.freeze(ALL_FUSION_JOBS.map(job=>Object.freeze({...job,legacy:job.source==='legacy'})));
const BY_PAIR=new Map(FUSION_JOBS.map(job=>[fusionPairKey(...job.parents),job]));
const BY_ID=new Map(FUSION_JOBS.map(job=>[job.id,job]));
export { fusionPairKey };
export function getFusionJobByParents(a,b){return BY_PAIR.get(fusionPairKey(a,b))||getFusionJob(a,b)||null;}
export function getFusionJobById(id){return BY_ID.get(id)||getCanonicalFusionJobById(id)||null;}
export function unlockedFusionJobs(masteredSet){const mastered=masteredSet instanceof Set?masteredSet:new Set(masteredSet||[]);return FUSION_JOBS.filter(job=>job.parents.every(id=>mastered.has(id)));}
export function fusionRegistryAudit(){return validateFusionDefinitions(ALL_FUSION_JOBS);}
