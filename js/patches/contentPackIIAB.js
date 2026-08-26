/* Content Pack II A+B — Rumor Expansion / Hidden Encounter / Hidden Route runtime. */
import './systemDeepeningPackC.js';
import { state } from '../state.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { PHASE12_RUMORS } from '../data/phase12WorldActivity.js';
import { PACK_C_SITE_CHAPTER } from '../data/systemDeepeningPackC.js';
import { CP2_RUMORS,CP2_HIDDEN_ENCOUNTERS,CP2_HIDDEN_ROUTES,cp2RumorState,cp2EncounterChance } from '../data/contentPackIIAB.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function baseRumorKnown(siteId){
  const base=PHASE12_RUMORS.find(r=>r.targetSiteId===siteId);if(!base)return false;
  return !!world().discoveries[`rumor:${base.id}`];
}
function mastery(siteId){
  const ch=PACK_C_SITE_CHAPTER[siteId]; if(!ch)return null;
  return state.phase9RegionMastery?.(`ch${ch}`)||state.phase9RegionMastery?.(String(ch))||null;
}
function codexKnown(enemyId){
  const e=state.data.monsterCodex?.[enemyId]||{};
  return !!e.analyzed||(e.kills||0)>=10;
}

function syncCP2(){
  const d=world().discoveries;
  for(const rumor of CP2_RUMORS){
    const shouldKnow=baseRumorKnown(rumor.siteId)||!!d[`trace:${rumor.siteId}`]||state.isStageCleared(rumor.stageId)||!!d[`cp2:encounter:${rumor.id}`];
    if(!shouldKnow)continue;
    const id=`rumor:cp2:${rumor.id}`;
    const s=cp2RumorState({rumor,discoveries:d,isStageCleared:x=>state.isStageCleared(x)});
    const rec=put(id,{name:`噂：${rumor.name}`,rumor:true,rumorId:`cp2:${rumor.id}`,contentPackII:true,targetSiteId:rumor.siteId,rumorState:s,rumorStateLabel:s==='resolved'?'解決済み':s==='tracking'?'追跡中':'未解決',hint:s==='unresolved'?rumor.text:s==='tracking'?rumor.tracking:(d[`cp2:encounter:${rumor.id}`]?.resolution||rumor.tracking)});
    if(s==='resolved'&&!rec.resolvedAt)rec.resolvedAt=Date.now();
  }
}

state.cp2Rumors=function(){syncCP2();return this.rumorNotebook().filter(r=>r.contentPackII);};
state.cp2HiddenRoutes=function(){syncCP2();return Object.entries(world().discoveries).filter(([,v])=>v?.contentPackII&&v?.hiddenRoute).map(([id,v])=>({id,...v}));};

function encounterDefForStage(stageId){return CP2_HIDDEN_ENCOUNTERS[stageId]||null;}
function registerEncounterEnemy(def){
  if(ENEMY_TYPES[def.enemyId])return true;
  const src=ENEMY_TYPES[def.sourceEnemyId];if(!src)return false;
  ENEMY_TYPES[def.enemyId]={...src,name:def.name,hp:Math.max(1,Math.round(src.hp*1.08)),atk:Math.max(1,Math.round(src.atk*1.06)),def:Math.max(0,Math.round(src.def*1.04)),speed:Math.max(1,Math.round((src.speed||80)*1.05)),boss:false,phase12:false,contentPackII:true,cp2HiddenEncounter:true};
  return true;
}

function shouldInject(engine,def){
  syncCP2();
  const rumor=CP2_RUMORS.find(r=>r.id===def.rumorId);if(!rumor)return false;
  const s=cp2RumorState({rumor,discoveries:world().discoveries,isStageCleared:x=>state.isStageCleared(x)});
  const m=mastery(rumor.siteId);
  const chance=cp2EncounterChance({baseChance:def.chance,rumorState:s,mastered:!!m?.mastered,codexKnown:codexKnown(def.sourceEnemyId)});
  engine.cp2HiddenLead={...def,rumorState:s,effectiveChance:chance};
  return chance>0&&Math.random()<chance;
}

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp2Start(stageId,onEnd,blessingId){
  const out=previousStart.call(this,stageId,onEnd,blessingId);
  const def=encounterDefForStage(stageId);
  if(def&&registerEncounterEnemy(def)&&shouldInject(this.engine,def)){
    // The initial encounter is already visible. Insert the hidden ecology as the
    // next compact encounter so it cannot increase the initial enemy-card pile.
    this.engine.encounterQueue.unshift({type:def.enemyId,count:1});
    this.engine.totalToDefeat+=1;
    this.engine.cp2HiddenInjected=def.enemyId;
  }
  return out;
};

const previousReveal=TextBattleScreen.prototype._revealNextGroupIfNeeded;
TextBattleScreen.prototype._revealNextGroupIfNeeded=function cp2Reveal(){
  const before=new Set((this.engine?.aliveEnemies||[]).map(e=>e.id));
  const out=previousReveal.apply(this,arguments);
  const def=this.engine&&encounterDefForStage(this.engine.stage?.id);if(!def)return out;
  const found=(this.engine.aliveEnemies||[]).find(e=>e.type===def.enemyId&&!before.has(e.id));if(!found)return out;
  if(this._cp2EncounterSeen?.has(found.id))return out;
  this._cp2EncounterSeen??=new Set();this._cp2EncounterSeen.add(found.id);
  const rumor=CP2_RUMORS.find(r=>r.id===def.rumorId);
  const route=CP2_HIDDEN_ROUTES[def.routeId];
  this._pushLines(['周囲の既知の痕跡が、一瞬だけ同じ方向を指した。',`HIDDEN ENCOUNTER — ${found.name}`]);
  put(`cp2:encounter:${def.rumorId}`,{name:`観測：${found.name}`,contentPackII:true,hiddenEncounter:true,rumorId:def.rumorId,siteId:rumor?.siteId,resolution:`噂の正体は「${found.name}」だった。だが、その移動先にはまだ続きがある。`});
  if(route)put(`cp2:route:${def.routeId}`,{name:`隠し経路：${route.name}`,hint:route.clue,rewardHint:route.rewardHint,contentPackII:true,hiddenRoute:true,routeId:def.routeId,targetSiteId:route.siteId});
  syncCP2();state.save();
  return out;
};

// Keep automatic notebook behavior: opening Codex after any CP2 progress is enough.
const previousNotebook=state.rumorNotebook?.bind(state);
if(previousNotebook&&!state.rumorNotebook.__cp2){
  const wrapped=function cp2Notebook(){syncCP2();return previousNotebook();};wrapped.__cp2=true;state.rumorNotebook=wrapped;
}

syncCP2();
export { syncCP2 };
