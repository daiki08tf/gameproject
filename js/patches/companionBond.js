/* ============================================================
   Monster Ranch 1.5 — Bond progression
   Individual long-term progression for companions.
   ============================================================ */
import { state } from '../state.js';
import { chainMethod } from './patchUtils.js';

export const BOND_MAX_LEVEL = 10;
export const BOND_BATTLE_EXP = 3;
export const BOND_BOSS_BONUS = 5;
export const BOND_MILESTONES = Object.freeze({
  2:'信頼', 4:'共鳴', 6:'阿吽', 8:'盟友', 10:'魂の契り',
});
export function bondExpToNext(level){return Math.round(18+level*14+Math.pow(level,1.45)*4);}
function ensureBond(inst){if(!inst)return; if(!Number.isFinite(inst.bondLevel))inst.bondLevel=1;if(!Number.isFinite(inst.bondExp))inst.bondExp=0;if(!Number.isFinite(inst.battlesTogether))inst.battlesTogether=0;}
function ensureAll(){for(const inst of Object.values(state.data.companionInstances||{}))ensureBond(inst);}
ensureAll();

state.companionBond=function companionBond(id){const inst=this.data.companionInstances?.[id];if(!inst)return null;ensureBond(inst);return{level:inst.bondLevel,exp:inst.bondExp,next:inst.bondLevel>=BOND_MAX_LEVEL?0:bondExpToNext(inst.bondLevel),battles:inst.battlesTogether||0,milestone:BOND_MILESTONES[inst.bondLevel]||null};};
state.gainCompanionBond=function gainCompanionBond(id,amount,{battle=false}={}){const inst=this.data.companionInstances?.[id];if(!inst||amount<=0)return{gained:0,leveledUp:false};ensureBond(inst);if(battle)inst.battlesTogether=(inst.battlesTogether||0)+1;if(inst.bondLevel>=BOND_MAX_LEVEL){this.save();return{gained:0,leveledUp:false,level:BOND_MAX_LEVEL};}const gained=Math.max(1,Math.round(amount));inst.bondExp+=gained;let leveledUp=false;while(inst.bondLevel<BOND_MAX_LEVEL&&inst.bondExp>=bondExpToNext(inst.bondLevel)){inst.bondExp-=bondExpToNext(inst.bondLevel);inst.bondLevel++;leveledUp=true;}if(inst.bondLevel>=BOND_MAX_LEVEL)inst.bondExp=0;this.save();return{gained,leveledUp,level:inst.bondLevel,milestone:BOND_MILESTONES[inst.bondLevel]||null};};
state.gainPartyBond=function gainPartyBond(amount,opts={}){return(this.activeCompanionIds?.()||[]).map(id=>({id,...this.gainCompanionBond(id,amount,opts)}));};
state.companionBondStatMult=function companionBondStatMult(id){const b=this.companionBond(id);return b?1+Math.max(0,b.level-1)*.008:1;};

// One award per cleared battle. This deliberately uses the battle finish seam rather
// than adding another reward/kill wrapper, so multi-enemy fights cannot over-award Bond.
chainMethod(state,'createCompanion',(previous,functionCreate)=>(speciesId,opts={})=>{const id=previous(speciesId,opts);if(id){const inst=state.data.companionInstances[id];ensureBond(inst);state.save();}return id;});

state.awardCompanionBattleBond=function awardCompanionBattleBond({boss=false,cleared=true}={}){if(!cleared)return[];return this.gainPartyBond(BOND_BATTLE_EXP+(boss?BOND_BOSS_BONUS:0),{battle:true});};

export function bondLabel(level){if(level>=10)return'魂の契り';if(level>=8)return'盟友';if(level>=6)return'阿吽';if(level>=4)return'共鳴';if(level>=2)return'信頼';return'出会い';}
