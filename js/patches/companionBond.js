/* ============================================================
   Monster Ranch 1.5 — Bond progression
   Individual long-term progression for companions.
   ============================================================ */
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { setBondLevelResolver, bondSignatureSkillFor, BOND_SKILL2_LEVEL } from '../data/companionBondSkills.js';
import { pushCompanionMemory } from '../data/companionMemory.js';
import { showToast } from './toastFeedback.js';

export const BOND_MAX_LEVEL = 10;
export const BOND_BATTLE_EXP = 3;
export const BOND_BOSS_BONUS = 5;
export const BOND_MILESTONES = Object.freeze({2:'信頼',4:'共鳴',6:'阿吽',8:'盟友',10:'魂の契り'});
export function bondExpToNext(level){return Math.round(18+level*14+Math.pow(level,1.45)*4);}
function ensureBond(inst){if(!inst)return;if(!Number.isFinite(inst.bondLevel))inst.bondLevel=1;if(!Number.isFinite(inst.bondExp))inst.bondExp=0;if(!Number.isFinite(inst.battlesTogether))inst.battlesTogether=0;}
for(const inst of Object.values(state.data.companionInstances||{}))ensureBond(inst);

state.companionBond=function companionBond(id){const inst=this.data.companionInstances?.[id];if(!inst)return null;ensureBond(inst);return{level:inst.bondLevel,exp:inst.bondExp,next:inst.bondLevel>=BOND_MAX_LEVEL?0:bondExpToNext(inst.bondLevel),battles:inst.battlesTogether||0,milestone:BOND_MILESTONES[inst.bondLevel]||null};};
// Session 6 — 節目の記憶：絆Lvが節目を跨いだとき、個体の memories に
// 「共に歩んだ証」を残す（戦闘力ではなく物語としての蓄積）。
const BOND_MEMORY_LINES=Object.freeze({3:'署名技を覚え、呼吸が合い始めた',5:'頼れる相棒の域に達した',7:'号令に応える呼吸を覚えた',10:'魂の契りを結んだ'});
state.gainCompanionBond=function gainCompanionBond(id,amount,{battle=false}={}){const inst=this.data.companionInstances?.[id];if(!inst||amount<=0)return{gained:0,leveledUp:false};ensureBond(inst);if(battle)inst.battlesTogether=(inst.battlesTogether||0)+1;if(inst.bondLevel>=BOND_MAX_LEVEL){this.save();return{gained:0,leveledUp:false,level:BOND_MAX_LEVEL};}const gained=Math.max(1,Math.round(amount*(this.playerTreeBondExpMult?.()||1)));const prevLevel=inst.bondLevel;inst.bondExp+=gained;let leveledUp=false;while(inst.bondLevel<BOND_MAX_LEVEL&&inst.bondExp>=bondExpToNext(inst.bondLevel)){inst.bondExp-=bondExpToNext(inst.bondLevel);inst.bondLevel+=1;leveledUp=true;}if(inst.bondLevel>=BOND_MAX_LEVEL)inst.bondExp=0;for(const lv of Object.keys(BOND_MEMORY_LINES).map(Number))if(prevLevel<lv&&inst.bondLevel>=lv)pushCompanionMemory(inst,BOND_MEMORY_LINES[lv]);this.save();return{gained,leveledUp,level:inst.bondLevel,milestone:BOND_MILESTONES[inst.bondLevel]||null};};
state.gainPartyBond=function gainPartyBond(amount,opts={}){return(this.activeCompanionIds?.()||[]).map(id=>({id,...this.gainCompanionBond(id,amount,opts)}));};
// 絆Lv → 仲間能力の長期倍率。Session 6 で節目の伸びを追加:
// Lv5「頼れる相棒」+3%、Lv10「魂の契り」+3%。それでもLv10で
// 計1.13倍止まりの有界バフ（個体Lv・進化・種族熟練とは別系統）。
state.companionBondStatMult=function companionBondStatMult(id){const b=this.companionBond(id);if(!b)return 1;return 1+Math.max(0,b.level-1)*.008+(b.level>=5?.03:0)+(b.level>=10?.03:0);};
state.awardCompanionBattleBond=function awardCompanionBattleBond({boss=false,cleared=true}={}){if(!cleared)return[];const before=(this.activeCompanionIds?.()||[]).map(id=>({id,level:this.companionBond(id)?.level||1}));const awards=this.gainPartyBond(BOND_BATTLE_EXP+(boss?BOND_BOSS_BONUS:0),{battle:true});
  for(const a of awards){const prev=before.find(b=>b.id===a.id)?.level||1;if(prev<BOND_SKILL2_LEVEL&&a.level>=BOND_SKILL2_LEVEL){const c=this.getCompanion?.(a.id);const sig=c?bondSignatureSkillFor({id:a.id,speciesId:c.instance?.speciesId,species:c.species,...c.stats,bondLevel:a.level}):null;if(sig){a.skillUnlocked={id:sig.id,name:sig.name};a.name=c.instance?.nickname||c.species?.name||a.id;}}}
  return awards;};
export function bondLabel(level){if(level>=10)return'魂の契り';if(level>=8)return'盟友';if(level>=6)return'阿吽';if(level>=4)return'共鳴';if(level>=2)return'信頼';return'出会い';}

setBondLevelResolver(id=>state.companionBond?.(id)?.level||1);

// Apply the small long-term Bond stat bonus at the companion model boundary.
// getCompanion() returns a fresh model, so this never compounds on saved stats.
const previousGetCompanion=state.getCompanion?.bind(state);
if(previousGetCompanion){state.getCompanion=function bondGetCompanion(instanceId){const c=previousGetCompanion(instanceId);if(!c)return c;const bond=this.companionBond(instanceId),mult=this.companionBondStatMult(instanceId);if(!bond||mult===1)return{...c,bond};const stats={...c.stats};for(const k of ['hp','mp','atk','def','mag','spd'])stats[k]=Math.max(1,Math.round((Number(stats[k])||1)*mult));return{...c,stats,bond};};}

// Award Bond once per cleared battle, not once per enemy kill.
const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function bondBattleStart(stageId,onEnd,blessingId){const wrapped=result=>{if(result?.cleared){const boss=!!this.engine?.enemies?.some(e=>e?.boss);result.companionBondAwards=state.awardCompanionBattleBond({boss,cleared:true});for(const a of result.companionBondAwards)if(a.skillUnlocked&&typeof document!=='undefined')showToast(`[絆] ${a.name}が『${a.skillUnlocked.name}』を覚えた`,3200);}onEnd(result);};return previousStart.call(this,stageId,wrapped,blessingId);};
