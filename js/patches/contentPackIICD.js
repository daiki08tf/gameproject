/* Content Pack II C+D — Secret Chains / Hidden Boss / Companion / Reward runtime. */
import './contentPackIIAB.js';
import { state } from '../state.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { COMPANION_SPECIES } from '../data/companions.js';
import { COMPANION_ROLES } from '../data/phase12CompanionPack.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP2_SECRET_CHAINS,CP2_HIDDEN_BOSSES,CP2_SECRET_COMPANIONS,cp2ChainProgress } from '../data/contentPackIICD.js';

const BOSS_REWARDS=Object.freeze({
  cp2_boss_nest_mother:{items:['uq_cp2_silent_bell','uq_cp2_nest_heart'],companion:'cp2_silver_fawn'},
  cp2_boss_cinder_hart:{items:['uq_cp2_ash_antler','uq_cp2_procession_guard'],companion:'cp2_cinder_fawn'},
  cp2_boss_octave_warden:{items:['uq_cp2_eighth_edge','uq_cp2_zero_spine'],companion:'cp2_rib_drake'},
  cp2_boss_palimsest:{items:['uq_cp2_margin_ledger','uq_cp2_octave_shell'],companion:'cp2_margin_sprite'},
  cp2_boss_parallax:{items:['uq_cp2_parallax_eye','uq_cp2_blind_wall','uq_cp2_dual_signal','uq_cp2_unknown_focus'],companion:'cp2_parallax_wisp'},
});

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}

function registerCompanions(){
  for(const def of Object.values(CP2_SECRET_COMPANIONS)){
    if(COMPANION_SPECIES[def.id])continue;
    COMPANION_SPECIES[def.id]={...def,type:'monster',roleName:COMPANION_ROLES[def.role]?.name||def.role,recruit:{baseChance:0},contentPackII:true,secret:true};
  }
}
registerCompanions();

function chainState(chain){return cp2ChainProgress(chain,{discoveries:world().discoveries,isStageCleared:id=>state.isStageCleared(id)});}
function syncChains(){
  for(const chain of Object.values(CP2_SECRET_CHAINS)){
    const p=chainState(chain); if(p.completed===0)continue;
    const hint=p.resolved?chain.resolution:p.next?.text||chain.steps[Math.max(0,p.completed-1)]?.text;
    put(`rumor:cp2:chain:${chain.id}`,{name:`秘密連鎖：${chain.name}`,hint,rumor:true,rumorId:`cp2-chain:${chain.id}`,contentPackII:true,secretChain:true,chainId:chain.id,chainCompleted:p.completed,chainTotal:p.total,rumorState:p.resolved?'resolved':'tracking',rumorStateLabel:p.resolved?'解決済み':'追跡中'});
    if(p.resolved)put(`cp2:chain:${chain.id}`,{name:`秘密連鎖：${chain.name}`,hint:chain.resolution,contentPackII:true,secretChain:true,chainResolved:true,chainId:chain.id});
  }
}
state.cp2SecretChains=function(){syncChains();return Object.values(CP2_SECRET_CHAINS).map(c=>({...chainState(c),definition:c}));};

function registerBoss(def){
  if(ENEMY_TYPES[def.name])return;
  const src=ENEMY_TYPES[def.sourceEnemyId];if(!src)return;
  ENEMY_TYPES[def.bossId]={...src,name:def.name,hp:Math.max(1,Math.round(src.hp*def.hpMult)),atk:Math.max(1,Math.round(src.atk*def.atkMult)),def:Math.max(0,Math.round(src.def*def.defMult)),speed:Math.max(1,Math.round((src.speed||80)*def.speedMult)),boss:true,contentPackII:true,cp2HiddenBoss:true};
}
function eligibleBosses(stageId){
  syncChains();
  return Object.entries(CP2_HIDDEN_BOSSES).filter(([id,def])=>def.stageId===stageId&&chainState(CP2_SECRET_CHAINS[def.chainId]).resolved&&!world().discoveries[`cp2:boss:${id}:cleared`]);
}

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp2CDStart(stageId,onEnd,blessingId){
  const wrappedEnd=(result)=>{
    if(result?.cleared&&this._cp2CDBosses?.length){
      for(const bossId of this._cp2CDBosses){
        if(world().discoveries[`cp2:boss:${bossId}:cleared`])continue;
        const def=CP2_HIDDEN_BOSSES[bossId],reward=BOSS_REWARDS[bossId]||{items:[]};
        put(`cp2:boss:${bossId}:cleared`,{name:`討伐：${def.name}`,hint:'秘密連鎖の終端で観測された個体を撃破した。',contentPackII:true,hiddenBoss:true,bossId,chainId:def.chainId,clearedAt:Date.now()});
        for(const itemId of reward.items)state.addItem(itemId,1,{boss:true});
        if(reward.companion&&state.createCompanion){
          const already=Object.values(state.data.companionInstances||{}).some(x=>x?.speciesId===reward.companion);
          if(!already)state.createCompanion(reward.companion,{epithet:'秘密連鎖の仔'});
        }
      }
      // Eighth-rib resolution also reveals a non-boss juvenile tied to Zero Station.
      if(this._cp2CDBosses.includes('cp2_boss_octave_warden')&&state.createCompanion){
        const already=Object.values(state.data.companionInstances||{}).some(x=>x?.speciesId==='cp2_zero_larva');
        if(!already)state.createCompanion('cp2_zero_larva',{epithet:'第零線より来たもの'});
      }
      syncChains();state.save();
    }
    return onEnd?.(result);
  };
  const out=previousStart.call(this,stageId,wrappedEnd,blessingId);
  const list=eligibleBosses(stageId);this._cp2CDBosses=[];
  for(const [bossId,def] of list){
    registerBoss(def);if(!ENEMY_TYPES[bossId])continue;
    this.engine.encounterQueue.push({type:bossId,count:1});
    this.engine.totalToDefeat+=1;
    this._cp2CDBosses.push(bossId);
  }
  return out;
};

const previousReveal=TextBattleScreen.prototype._revealNextGroupIfNeeded;
TextBattleScreen.prototype._revealNextGroupIfNeeded=function cp2CDReveal(){
  const before=new Set((this.engine?.aliveEnemies||[]).map(e=>e.id));
  const out=previousReveal.apply(this,arguments);
  const found=(this.engine?.aliveEnemies||[]).find(e=>e.cp2HiddenBoss&&!before.has(e.id));
  if(found){
    this._cp2CDBossShown??=new Set();
    if(!this._cp2CDBossShown.has(found.id)){
      this._cp2CDBossShown.add(found.id);
      this._pushLines(['複数地域で集めた手掛かりが、ひとつの輪郭へ収束する。',`HIDDEN BOSS — ${found.name}`]);
    }
  }
  return out;
};

// Keep notebook automatic; chain records appear beside existing rumors.
const previousNotebook=state.rumorNotebook?.bind(state);
if(previousNotebook&&!state.rumorNotebook.__cp2cd){
  const wrapped=function cp2CDNotebook(){syncChains();return previousNotebook();};wrapped.__cp2cd=true;state.rumorNotebook=wrapped;
}

syncChains();
export {syncChains,BOSS_REWARDS};
