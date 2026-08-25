import { getJob } from './jobs.js';

export const PROGRESSION3_BASE = { hp:44, mp:8, atk:6, def:5, mag:5, mdef:5, spd:5 };
export const PROGRESSION3_GROWTH = { hp:4.5, mp:1.2, atk:1, def:1, mag:1, mdef:1, spd:0.4 };
export const JOB_EXP_SHARE_BY_TIER = { basic:0.30, advanced:0.20, special:0.15, hero:0.10 };
export const JOB_ACTIVE_MOD_STRENGTH = 0.15;
export const JOB_LEVELS_PER_REWARD_CAP = 3;

export function mdefProfileFor(job){
  const p=job?.profile||{};
  return Math.max(0.5,Math.min(1.7,(Number(p.mag||1)*0.55)+(Number(p.def||1)*0.45)));
}

export function profileValueFor(job,stat){
  if(stat==='mdef') return mdefProfileFor(job);
  return Number(job?.profile?.[stat]??1);
}

export function growthForJob(jobId){
  const job=getJob(jobId);
  const out={};
  for(const stat of Object.keys(PROGRESSION3_GROWTH)){
    out[stat]=PROGRESSION3_GROWTH[stat]*profileValueFor(job,stat);
  }
  return out;
}

export function activeJobModifier(jobId,stat){
  const job=getJob(jobId);
  const p=profileValueFor(job,stat);
  const deviation=Math.max(-0.6,Math.min(0.8,p-1));
  return 1+deviation*JOB_ACTIVE_MOD_STRENGTH;
}

export function jobExpRewardCap(currentLevel, expToNextFn, levels=JOB_LEVELS_PER_REWARD_CAP){
  let level=Math.max(1,Math.floor(Number(currentLevel)||1));
  let cap=0;
  const count=Math.max(1,Math.floor(Number(levels)||JOB_LEVELS_PER_REWARD_CAP));
  for(let i=0;i<count;i+=1){
    cap+=Math.max(1,Math.floor(Number(expToNextFn(level))||1));
    level+=1;
  }
  return cap;
}
