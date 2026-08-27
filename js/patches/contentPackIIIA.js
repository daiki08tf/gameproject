/* Content Pack III A — post-Ch30 observation reflux runtime. */
import './progression3OuterStory.js';
import './contentPackIIE.js';
import { state } from '../state.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP3_RUMORS,CP3_HIDDEN_ENCOUNTERS,CP3_HIDDEN_ROUTES,cp3RumorState,cp3EncounterChance } from '../data/contentPackIIIA.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function storyComplete(){return Boolean(state.isStageCleared?.('30-8'));}
function codexKnown(enemyId){const e=state.data.monsterCodex?.[enemyId]||{};return !!e.analyzed||(e.kills||0)>=10;}

export function syncCP3(){
  if(!storyComplete())return [];
  const d=world().discoveries;
  for(const rumor of CP3_RUMORS){
    if(!state.isStageCleared?.(rumor.stageId)&&!d[`cp3:encounter:${rumor.id}`])continue;
    const s=cp3RumorState({rumor,discoveries:d,storyComplete:true,isStageCleared:id=>state.isStageCleared?.(id)});
    put(`rumor:cp3:${rumor.id}`,{
      name:`噂：${rumor.name}`,rumor:true,rumorId:`cp3:${rumor.id}`,contentPackIII:true,targetChapter:rumor.chapter,
      rumorState:s,rumorStateLabel:s==='resolved'?'解決済み':s==='tracking'?'追跡中':'未解決',
      hint:s==='resolved'?(d[`cp3:encounter:${rumor.id}`]?.resolution||rumor.tracking):s==='tracking'?rumor.tracking:rumor.text,
    });
  }
  return Object.entries(d).filter(([,v])=>v?.contentPackIII);
}

state.cp3Rumors=function(){syncCP3();return this.rumorNotebook().filter(r=>r.contentPackIII);};
state.cp3HiddenRoutes=function(){syncCP3();return Object.entries(world().discoveries).filter(([,v])=>v?.contentPackIII&&v?.hiddenRoute).map(([id,v])=>({id,...v}));};

function postStoryBaseline(sourceEnemyId){
  const src=ENEMY_TYPES[sourceEnemyId];if(!src)return null;
  const suffix=String(sourceEnemyId).replace(/^ch\d+_/,'');
  const benchmark=ENEMY_TYPES[`ch30_${suffix}`]||ENEMY_TYPES.ch30_normal||src;
  return {src,benchmark};
}
function registerEnemy(def){
  if(ENEMY_TYPES[def.enemyId])return true;
  const base=postStoryBaseline(def.sourceEnemyId);if(!base)return false;
  const{src,benchmark}=base;
  // Preserve the old-region identity/actions, but CP3 only exists after Ch30:
  // its combat floor must therefore be the equivalent Ch30 archetype rather
  // than the original Ch21–24 raw stats.
  ENEMY_TYPES[def.enemyId]={...src,name:def.name,hp:Math.max(1,Math.round(benchmark.hp*1.14)),atk:Math.max(1,Math.round(benchmark.atk*1.10)),def:Math.max(0,Math.round(benchmark.def*1.06)),speed:Math.max(1,Math.round((benchmark.speed||src.speed||80)*1.08)),xp:Math.max(Number(src.xp)||0,Number(benchmark.xp)||0),boss:false,contentPackIII:true,cp3HiddenEncounter:true,cp3PostStoryScaled:true};
  return true;
}
function shouldInject(engine,def){
  if(!storyComplete())return false;
  syncCP3();
  const rumor=CP3_RUMORS.find(r=>r.id===def.rumorId);if(!rumor)return false;
  const s=cp3RumorState({rumor,discoveries:world().discoveries,storyComplete:true,isStageCleared:id=>state.isStageCleared?.(id)});
  const chance=cp3EncounterChance({baseChance:def.chance,rumorState:s,codexKnown:codexKnown(def.sourceEnemyId)});
  engine.cp3HiddenLead={...def,rumorState:s,effectiveChance:chance};
  return chance>0&&Math.random()<chance;
}

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp3Start(stageId,onEnd,blessingId){
  const out=previousStart.call(this,stageId,onEnd,blessingId);
  const def=CP3_HIDDEN_ENCOUNTERS[stageId];
  if(def&&registerEnemy(def)&&shouldInject(this.engine,def)){
    // Keep the first visible encounter unchanged; add exactly one compact follow-up.
    this.engine.encounterQueue.unshift({type:def.enemyId,count:1});
    this.engine.totalToDefeat+=1;
    this.engine.cp3HiddenInjected=def.enemyId;
  }
  return out;
};

const previousReveal=TextBattleScreen.prototype._revealNextGroupIfNeeded;
TextBattleScreen.prototype._revealNextGroupIfNeeded=function cp3Reveal(){
  const before=new Set((this.engine?.aliveEnemies||[]).map(e=>e.id));
  const out=previousReveal.apply(this,arguments);
  const def=this.engine&&CP3_HIDDEN_ENCOUNTERS[this.engine.stage?.id];if(!def)return out;
  const found=(this.engine.aliveEnemies||[]).find(e=>e.type===def.enemyId&&!before.has(e.id));if(!found)return out;
  this._cp3EncounterSeen??=new Set();if(this._cp3EncounterSeen.has(found.id))return out;this._cp3EncounterSeen.add(found.id);
  const rumor=CP3_RUMORS.find(r=>r.id===def.rumorId),route=CP3_HIDDEN_ROUTES[def.routeId];
  this._pushLines(['Ch30で返された観測が、古い地域の法則へ逆流している。',`HIDDEN ENCOUNTER — ${found.name}`]);
  put(`cp3:encounter:${def.rumorId}`,{name:`逆流観測：${found.name}`,contentPackIII:true,hiddenEncounter:true,rumorId:def.rumorId,chapter:rumor?.chapter,resolution:`「${found.name}」は外部から来た生物ではない。既存の存在が、返された観測によって別の挙動を獲得したものだった。`});
  if(route)put(`cp3:route:${def.routeId}`,{name:`隠し経路：${route.name}`,hint:route.clue,rewardHint:route.rewardHint,contentPackIII:true,hiddenRoute:true,routeId:def.routeId,targetChapter:route.chapter});
  syncCP3();state.save();
  return out;
};

syncCP3();
