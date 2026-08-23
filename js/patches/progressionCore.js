/* ============================================================
   Progression 2.0 — Character / Job split + Character EXP 2.0
   ============================================================ */
import { state } from '../state.js';
import { TIERS } from '../data/jobs.js';
import { CHARACTER_LEVEL_MAX, characterExpToNext, characterLevelBand } from '../data/progression.js';
import { JOB_EXP_REWARD_SHARE, splitProgressionExp } from '../data/jobProgression.js';

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

const originalGainExp=state.gainExp.bind(state);
state.gainExp=function gainExpWithCharacterProgress(amount){
  ensureProgressionData();

  // Character and Job intentionally do NOT receive the same reward amount.
  // Character gets the full reward; Job gets 10% of it so MASTERing a job is
  // a slower side-progression track rather than mirroring Character Lv.
  const passive=this.currentJob.passive;
  const commonExpMult=(passive&&passive.exp?passive.exp:1)*this.awakeningStatMult('exp')*this.jobMasterPassiveMult('exp');
  const characterOnlyMult=Math.max(0,Number(this.characterExpRewardMult?.()??1)||0);
  const split=splitProgressionExp(amount,commonExpMult,characterOnlyMult);

  // originalGainExp applies the same common EXP multipliers internally, so feed it
  // only the unmultiplied 10% share to avoid double-applying bonuses.
  const jobResult=originalGainExp((Math.max(0,Number(amount)||0))*JOB_EXP_REWARD_SHARE);
  const characterGained=split.character;

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
export { ensureProgressionData, JOB_MASTERY_LEVELS, CHARACTER_LEVEL_MAX, JOB_EXP_REWARD_SHARE };
