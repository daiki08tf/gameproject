import { state } from '../state.js';
import { computeStats, getJob, TIERS } from '../data/jobs.js';
import { PROGRESSION3_BASE, JOB_EXP_SHARE_BY_TIER, growthForJob, activeJobModifier, jobExpRewardCap } from '../data/progression3.js';
import { chainMethod } from './patchUtils.js';

const GROWTH_STATS=['hp','mp','atk','def','mag','mdef','spd'];

function roundStat(k,v){ return k==='spd' ? Math.round(v*10)/10 : Math.round(v); }

function ensureProgression3(){
  if(!state.data.characterGrowth){
    const level=Math.max(1,Number(state.characterLevel||1));
    const jobId=state.currentJobId;
    const g=growthForJob(jobId);
    const totals={...PROGRESSION3_BASE};
    for(const k of GROWTH_STATS) totals[k]=(totals[k]||0)+(g[k]||0)*(level-1);
    state.data.characterGrowth={ totals, levelHistory:{[jobId]:Math.max(0,level-1)}, migratedAtLevel:level };
    state.save();
  }
  state.data.characterGrowth.totals ??={...PROGRESSION3_BASE};
  state.data.characterGrowth.levelHistory ??={};
  for(const k of GROWTH_STATS) if(!Number.isFinite(state.data.characterGrowth.totals[k])) state.data.characterGrowth.totals[k]=PROGRESSION3_BASE[k]||0;
  return state.data.characterGrowth;
}

state.getCharacterGrowth=function(){ return ensureProgression3(); };
state.getGrowthPerCharacterLevel=function(jobId=this.currentJobId){ return growthForJob(jobId); };
state.getGrowthHistory=function(){ return {...ensureProgression3().levelHistory}; };
state.getCurrentJobStatModifier=function(stat){ return activeJobModifier(this.currentJobId,stat); };

// 転職自体は軽くし、上位職の解放条件（MASTER等）は従来どおり維持する。
state.canChangeAwayFromCurrent=function(){ return true; };

const previousGainExp=state.gainExp.bind(state);
state.gainExp=function progression3GainExp(amount){
  ensureProgression3();
  const beforeLevel=this.characterLevel;
  const beforeJobLevel=this.currentJobLevel;
  const currentJobId=this.currentJobId;
  const beforeJob={...(this.data.jobs[currentJobId]||{level:1,exp:0})};
  const beforeMastered=[...(this.data.mastered||[])];

  // Let Progression 2.0 award the full Character EXP, then replace only the Job-side
  // result. Otherwise huge Chapter 20/Abyss rewards can MASTER a freshly-switched Job
  // in a single clear, destroying Job identity as a side-progression track.
  const result=previousGainExp(amount);
  this.data.jobs[currentJobId]={...beforeJob};
  this.data.mastered=[...beforeMastered];

  // Character Lvアップ時、その瞬間の職業プロファイルに応じた永久成長を刻む。
  const gainedLevels=Math.max(0,this.characterLevel-beforeLevel);
  if(gainedLevels>0){
    const cg=ensureProgression3(), g=growthForJob(currentJobId);
    for(const k of GROWTH_STATS) cg.totals[k]+=g[k]*gainedLevels;
    cg.levelHistory[currentJobId]=(cg.levelHistory[currentJobId]||0)+gainedLevels;
  }

  const tier=getJob(currentJobId)?.tier||'basic';
  const desired=JOB_EXP_SHARE_BY_TIER[tier]??0.10;
  const passive=this.currentJob.passive;
  const commonMult=(passive&&passive.exp?passive.exp:1)*this.awakeningStatMult('exp')*this.jobMasterPassiveMult('exp');
  const uncappedJobExp=Math.round(Math.max(0,Number(amount)||0)*desired*commonMult);
  const rewardCap=jobExpRewardCap(beforeJob.level,(lv)=>this.expToNext(lv));
  const jobExpGained=Math.min(uncappedJobExp,rewardCap);
  const prog=this.data.jobs[currentJobId];
  prog.exp+=jobExpGained;
  const tierInfo=TIERS[tier];
  let jobLeveledUp=false;
  while(prog.exp>=this.expToNext(prog.level)){
    prog.exp-=this.expToNext(prog.level);
    prog.level+=1;
    jobLeveledUp=true;
    if(tierInfo.masteryLv!=null&&prog.level>=tierInfo.masteryLv&&!this.isMastered(currentJobId)) this.data.mastered.push(currentJobId);
  }

  this.save();
  return {...result,jobExpGained,jobExpUncapped:uncappedJobExp,jobExpCapped:uncappedJobExp>rewardCap,jobLeveledUp,jobLevelBefore:beforeJobLevel,jobLevel:this.currentJobLevel};
};

chainMethod(state, 'getStats', (previousGetStats) => function progression3Stats(){
  const old=previousGetStats();
  const cg=ensureProgression3();
  const legacyBase=computeStats(this.currentJobId,this.characterLevel);
  const out={...old};
  for(const k of ['hp','mp','atk','def','mag','spd']){
    const targetBase=(cg.totals[k]||0)*activeJobModifier(this.currentJobId,k);
    const oldBase=Math.max(0.0001,Number(legacyBase[k]||1));
    const externalScale=Math.max(0.1,Number(old[k]||0)/oldBase);
    out[k]=roundStat(k,targetBase*externalScale);
  }
  out.mdef=Math.max(1,Math.round((cg.totals.mdef||PROGRESSION3_BASE.mdef)*activeJobModifier(this.currentJobId,'mdef')));
  return out;
});

const previousBreakdown=state.getStatBreakdown?.bind(state);
state.getStatBreakdown=function progression3Breakdown(stat){
  if(stat==='mdef'){
    const total=this.getStats().mdef;
    return {base:total,characterJobBase:total,inheritance:0,equipment:0,permanent:0,affix:0,codex:0,rune:0,special:0,total};
  }
  const b=previousBreakdown?previousBreakdown(stat):{total:this.getStats()[stat]||0};
  return {...b,total:this.getStats()[stat]??b.total};
};

ensureProgression3();
export { ensureProgression3 };
