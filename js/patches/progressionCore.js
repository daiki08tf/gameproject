/* ============================================================
   Progression 2.0 — Character / Job split + Character EXP 2.0
   ============================================================ */
import { state } from '../state.js';
import { TIERS } from '../data/jobs.js';
import { CHARACTER_LEVEL_MAX, characterExpToNext, characterLevelBand } from '../data/progression.js';
import { jobExpToNext } from '../data/jobProgression.js';

const JOB_MASTERY_LEVELS = { basic:20, advanced:40, special:60, hero:100 };

function ensureProgressionData(){
  const currentJob=state.data.jobs?.[state.data.currentJobId]||{level:1,exp:0};
  if(!Number.isFinite(state.data.characterLevel))state.data.characterLevel=Math.max(1,Number(currentJob.level)||1);
  if(!Number.isFinite(state.data.characterExp))state.data.characterExp=Math.max(0,Number(currentJob.exp)||0);
  if(!Number.isFinite(state.data.highestCharacterLevel))state.data.highestCharacterLevel=state.data.characterLevel;
  state.data.characterLevel=Math.min(CHARACTER_LEVEL_MAX,Math.max(1,Math.floor(state.data.characterLevel)));
  state.data.characterExp=Math.max(0,Math.floor(state.data.characterExp));
  state.data.highestCharacterLevel=Math.min(CHARACTER_LEVEL_MAX,Math.max(state.data.characterLevel,Math.floor(state.data.highestCharacterLevel)));
}
for(const [tierId,masteryLv] of Object.entries(JOB_MASTERY_LEVELS))if(TIERS[tierId])TIERS[tierId].masteryLv=masteryLv;
ensureProgressionData();
Object.defineProperties(state,{
  characterLevel:{configurable:true,get(){ensureProgressionData();return this.data.characterLevel;}},
  characterExp:{configurable:true,get(){ensureProgressionData();return this.data.characterExp;}},
  highestCharacterLevel:{configurable:true,get(){ensureProgressionData();return this.data.highestCharacterLevel;}},
  currentJobLevel:{configurable:true,get(){return this.jobProgress(this.currentJobId).level;}},
  currentJobExp:{configurable:true,get(){return this.jobProgress(this.currentJobId).exp;}},
});
state.characterExpToNext=function(level=this.characterLevel){return characterExpToNext(level);};
state.characterLevelBand=function(level=this.characterLevel){return characterLevelBand(level);};
state.jobExpToNext=function(level=this.currentJobLevel,jobId=this.currentJobId){const tier=getJobTier(jobId);return jobExpToNext(level,tier);};
// Legacy callers (jobs UI / gainExp in state.js) use expToNext(). Redirect only that
// Job-facing helper to the dedicated short-form curve. Character EXP keeps its own helper.
state.expToNext=function progression2JobExpToNext(level){return this.jobExpToNext(level,this.currentJobId);};

function getJobTier(jobId){
  const job=state.data.currentJobId===jobId?state.currentJob:null;
  if(job?.tier)return job.tier;
  // Fallback for callers before/around a job switch; getJob is indirectly available via current data.
  const previousId=state.data.currentJobId;
  if(previousId===jobId)return state.currentJob?.tier||'basic';
  return 'basic';
}

const originalGainExp=state.gainExp.bind(state);
state.gainExp=function gainExpWithCharacterProgress(amount){
  ensureProgressionData();
  const jobResult=originalGainExp(amount);
  const jobGained=Math.max(0,Number(jobResult?.gained)||0);
  const characterMult=Math.max(0,Number(this.characterExpRewardMult?.() ?? 1)||0);
  const characterGained=Math.max(0,Math.round(jobGained*characterMult));
  let characterLeveledUp=false;
  if(this.data.characterLevel<CHARACTER_LEVEL_MAX){
    this.data.characterExp+=characterGained;
    while(this.data.characterLevel<CHARACTER_LEVEL_MAX){
      const need=this.characterExpToNext(this.data.characterLevel);
      if(need<=0||this.data.characterExp<need)break;
      this.data.characterExp-=need;this.data.characterLevel+=1;characterLeveledUp=true;
    }
    if(this.data.characterLevel>=CHARACTER_LEVEL_MAX){this.data.characterLevel=CHARACTER_LEVEL_MAX;this.data.characterExp=0;}
    this.data.highestCharacterLevel=Math.max(this.data.highestCharacterLevel,this.data.characterLevel);
  }
  this.save();
  return {...jobResult,characterGained,characterLeveledUp,characterLevel:this.data.characterLevel,characterBand:this.characterLevelBand().id,jobLevel:this.currentJobLevel};
};
export { ensureProgressionData, JOB_MASTERY_LEVELS, CHARACTER_LEVEL_MAX };
