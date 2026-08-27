/* Phase 8 — live switching bridge for the 75 generated Fusion Jobs. */
import { state } from '../state.js';
import { getJob as legacyGetJob, computeStats as legacyComputeStats, TIERS } from '../data/jobs.js';
import { getJob, isUnlocked, computeStats } from '../data/jobsPhase8.js';
import { chainMethod } from './patchUtils.js';

Object.defineProperty(state, 'currentJob', { configurable:true, get(){ return getJob(this.data.currentJobId); } });

state.canSwitchTo = function phase8CanSwitchTo(jobId){ return isUnlocked(jobId, this.masteredSet()); };
state.changeJob = function phase8ChangeJob(jobId){
  if(!this.canChangeAwayFromCurrent()) return {ok:false,reason:'current_locked'};
  if(!this.canSwitchTo(jobId)) return {ok:false,reason:'target_locked'};
  if(!getJob(jobId)) return {ok:false,reason:'unknown_job'};
  if(!this.data.jobs[jobId]) this.data.jobs[jobId]={level:1,exp:0};
  this.data.currentJobId=jobId;
  if(jobId.startsWith('fusion_') && this.setActiveFusion) this.setActiveFusion(jobId);
  this.save(); return {ok:true};
};

chainMethod(state, 'getStats', (previousGetStats) => function phase8FusionStats(){
  const jobId=this.currentJobId, legacy=legacyGetJob(jobId);
  if(legacy) return previousGetStats();
  const job=getJob(jobId);
  if(!job?.isFusionJob) return previousGetStats();
  const parentId=job.requires?.[0];
  if(!parentId) return previousGetStats();
  const level=this.currentLevel, original=this.data.currentJobId;
  this.data.currentJobId=parentId;
  let stats;
  try { stats=previousGetStats(); } finally { this.data.currentJobId=original; }
  const parentBase=legacyComputeStats(parentId,level), fusionBase=computeStats(jobId,level);
  for(const k of ['hp','mp','atk','def','mag','spd']){
    if(parentBase[k]>0 && stats[k]!=null) stats[k]=k==='spd'?Math.round(stats[k]*(fusionBase[k]/parentBase[k])*10)/10:Math.max(1,Math.round(stats[k]*(fusionBase[k]/parentBase[k])));
  }
  if(Number.isFinite(fusionBase.critPct)&&Number.isFinite(parentBase.critPct)) stats.critPct=Math.max(0,stats.critPct+(fusionBase.critPct-parentBase.critPct));
  return stats;
});

state.phase8JobRuntimeStatus=function(){const current=getJob(this.currentJobId);return{currentJobId:this.currentJobId,isFusionJob:!!current?.isFusionJob,fusionCount:105,tier:current?.tier||null,masteryLv:current?TIERS[current.tier]?.masteryLv:null};};

queueMicrotask(()=>{
  if(typeof state.setActiveFusion!=='function') return;
  chainMethod(state, 'setActiveFusion', (activate) => function phase8ActivateFusion(fusionId){
    const ok=activate(fusionId); if(!ok||!fusionId?.startsWith('fusion_')) return ok;
    if(!this.data.jobs[fusionId]) this.data.jobs[fusionId]={level:1,exp:0};
    this.data.currentJobId=fusionId; this.save(); return true;
  });
});
