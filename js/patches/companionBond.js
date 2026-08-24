/* ============================================================
   Monster Ranch 1.5 — Bond progression
   Individual long-term progression for companions.
   ============================================================ */
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { setBondLevelResolver } from '../data/companionBondSkills.js';

export const BOND_MAX_LEVEL = 10;
export const BOND_BATTLE_EXP = 3;
export const BOND_BOSS_BONUS = 5;
export const BOND_MILESTONES = Object.freeze({2:'信頼',4:'共鳴',6:'阿吽',8:'盟友',10:'魂の契り'});
export function bondExpToNext(level){return Math.round(18+level*14+Math.pow(level,1.45)*4);}
function ensureBond(inst){if(!inst)return;if(!Number.isFinite(inst.bondLevel))inst.bondLevel=1;if(!Number.isFinite(inst.bondExp))inst.bondExp=0;if(!Number.isFinite(inst.battlesTogether))inst.battlesTogether=0;}
for(const inst of Object.values(state.data.companionInstances||{}))ensureBond(inst);

state.companionBond=function companionBond(id){const inst=this.data.companionInstances?.[id];if(!inst)return null;ensureBond(inst);return{level:inst.bondLevel,exp:inst.bondExp,next:inst.bondLevel>=BOND_MAX_LEVEL?0:bondExpToNext(inst.bondLevel),battles:inst.battlesTogether||0,milestone:BOND_MILESTONES[inst.bondLevel]||null};};
state.gainCompanionBond=function gainCompanionBond(id,amount,{battle=false}={}){const inst=this.data.companionInstances?.[id];if(!inst||amount<=0)return{gained:0,leveledUp:false};ensureBond(inst);if(battle)inst.battlesTogether=(inst.battlesTogether||0)+1;if(inst.bondLevel>=BOND_MAX_LEVEL){this.save();return{gained:0,leveledUp:false,level:BOND_MAX_LEVEL};}const gained=Math.max(1,Math.round(amount));inst.bondExp+=gained;let leveledUp=false;while(inst.bondLevel<BOND_MAX_LEVEL&&inst.bondExp>=bondExpToNext(inst.bondLevel)){inst.bondExp-=bondExpToNext(inst.bondLevel);inst.bondLevel+=1;leveledUp=true;}if(inst.bondLevel>=BOND_MAX_LEVEL)inst.bondExp=0;this.save();return{gained,leveledUp,level:inst.bondLevel,milestone:BOND_MILESTONES[inst.bondLevel]||null};};
state.gainPartyBond=function gainPartyBond(amount,opts={}){return(this.activeCompanionIds?.()||[]).map(id=>({id,...this.gainCompanionBond(id,amount,opts)}));};
state.companionBondStatMult=function companionBondStatMult(id){const b=this.companionBond(id);return b?1+Math.max(0,b.level-1)*.008:1;};
state.awardCompanionBattleBond=function awardCompanionBattleBond({boss=false,cleared=true}={}){if(!cleared)return[];return this.gainPartyBond(BOND_BATTLE_EXP+(boss?BOND_BOSS_BONUS:0),{battle:true});};
export function bondLabel(level){if(level>=10)return'魂の契り';if(level>=8)return'盟友';if(level>=6)return'阿吽';if(level>=4)return'共鳴';if(level>=2)return'信頼';return'出会い';}

setBondLevelResolver(id=>state.companionBond?.(id)?.level||1);

// Apply the small long-term Bond stat bonus at the companion model boundary.
// getCompanion() returns a fresh model, so this never compounds on saved stats.
const previousGetCompanion=state.getCompanion?.bind(state);
if(previousGetCompanion){state.getCompanion=function bondGetCompanion(instanceId){const c=previousGetCompanion(instanceId);if(!c)return c;const bond=this.companionBond(instanceId),mult=this.companionBondStatMult(instanceId);if(!bond||mult===1)return{...c,bond};const stats={...c.stats};for(const k of ['hp','mp','atk','def','mag','spd'])stats[k]=Math.max(1,Math.round((Number(stats[k])||1)*mult));return{...c,stats,bond};};}

// Award Bond once per cleared battle, not once per enemy kill.
const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function bondBattleStart(stageId,onEnd,blessingId){const wrapped=result=>{if(result?.cleared){const boss=!!this.engine?.enemies?.some(e=>e?.boss);result.companionBondAwards=state.awardCompanionBattleBond({boss,cleared:true});}onEnd(result);};return previousStart.call(this,stageId,wrapped,blessingId);};
