import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { getItem } from '../data/equipment.js';
import {
  equippedSdUniqueIdentities,
  activeSdMasterSynergies,
  isBreakWindow,
  classifyEnemyIntent,
} from '../data/systemDeepeningPackA.js';

function baseItemId(rawId){
  const item=getItem(rawId);
  return item?.id||rawId;
}
function uniqueIdentities(){
  return equippedSdUniqueIdentities(state.data?.equipped||{},baseItemId);
}
function masterSynergies(){
  const jobId=state.currentJobId;
  return activeSdMasterSynergies({
    mastered:!!(jobId&&state.isMastered?.(jobId)),
    routeId:jobId&&state.job3SelectedRoute?state.job3SelectedRoute(jobId):null,
  });
}
function analyzed(enemy){
  return !!state.data?.monsterCodex?.[enemy?.type]?.analyzed;
}
function buildMult(engine,target){
  let mult=1; const reasons=[];
  for(const identity of uniqueIdentities()){
    if(identity.tag==='break'){
      const active=isBreakWindow(target); mult*=active?identity.activeMult:identity.neutralMult;
      if(active)reasons.push(identity.name);
    }else if(identity.tag==='analysis'){
      const active=analyzed(target); mult*=active?identity.activeMult:identity.unknownMult;
      if(active)reasons.push(identity.name);
    }else if(identity.tag==='guard'&&engine._sdGuardAttack){
      mult*=identity.counterMult;reasons.push(identity.name);
    }
  }
  for(const synergy of masterSynergies()){
    if(synergy.tag==='break'&&isBreakWindow(target)){mult*=synergy.activeMult;reasons.push(synergy.name);}
    else if(synergy.tag==='analysis'&&analyzed(target)){mult*=synergy.activeMult;reasons.push(synergy.name);}
    else if(synergy.tag==='guard'&&engine._sdGuardAttack){mult*=synergy.counterMult;reasons.push(synergy.name);}
  }
  return {mult,reasons};
}

// SD-1 / SD-2: one reusable damage hook consumes both equipment identities and
// active mastered Job-route synergies. No save migration or second build system.
const previousDamage=BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage=function systemDeepeningDamage(atk,target,opts={}){
  const out=previousDamage.call(this,atk,target,opts);
  const {mult,reasons}=buildMult(this,target);
  if(mult!==1){
    out.damage=Math.max(1,Math.round(out.damage*mult));
    if(reasons.length)out.systemDeepening={mult,reasons};
  }
  return out;
};

const previousAttack=BattleEngine.prototype._playerAttack;
BattleEngine.prototype._playerAttack=function systemDeepeningGuardAttack(targetId){
  this._sdGuardAttack=!!this.player?.guarding;
  try{return previousAttack.call(this,targetId);}finally{this._sdGuardAttack=false;}
};

state.systemDeepeningBuildSummary=function systemDeepeningBuildSummary(){
  return {
    unique:uniqueIdentities(),
    job:masterSynergies(),
  };
};

// SD-8: append one compact intent line inside each already-bounded enemy card.
// It never creates a sibling panel below the enemy scroller, preserving the
// permanent Phase14 command-reachability contract.
const previousRenderEnemies=TextBattleScreen.prototype._renderEnemies;
TextBattleScreen.prototype._renderEnemies=function systemDeepeningIntentRender(){
  previousRenderEnemies.call(this);
  if(!this.engine)return;
  const cards=[...(this.el.enemyList?.querySelectorAll('.tb-enemy-card')||[])];
  cards.forEach((card,index)=>{
    const enemy=this.engine.enemies?.[index];
    if(!enemy||enemy.dead)return;
    const intent=classifyEnemyIntent(enemy);
    if(!intent)return;
    const line=document.createElement('div');
    line.className=`tb-intent-line${intent.danger?' danger':''}`;
    line.textContent=`${intent.kind} — ${intent.text}`;
    card.appendChild(line);
  });
};
