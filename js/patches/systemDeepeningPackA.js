import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { getItem } from '../data/equipment.js';
import {
  equippedSdUniqueIdentities,
  classifyEnemyIntent,
} from '../data/systemDeepeningPackA.js';

function baseItemId(rawId){
  const item=getItem(rawId);
  return item?.id||rawId;
}
function uniqueIdentities(){
  return equippedSdUniqueIdentities(state.data?.equipped||{},baseItemId);
}
function knownInCodex(enemy){return !!state.data?.monsterCodex?.[enemy?.type];}
function isExecuteWindow(enemy,ratio){return !!(enemy&&enemy.maxHp>0&&enemy.hp/enemy.maxHp<=ratio);}
function uniqueMult(engine,target){
  let mult=1;const reasons=[];
  for(const identity of uniqueIdentities()){
    if(identity.kind==='execute'&&isExecuteWindow(target,identity.hpRatio)){
      mult*=identity.activeMult;reasons.push(identity.name);
    }else if(identity.kind==='codexKnown'&&knownInCodex(target)){
      mult*=identity.activeMult;reasons.push(identity.name);
    }else if(identity.kind==='guardCounter'&&engine._sdGuardAttack){
      mult*=identity.counterMult;reasons.push(identity.name);
    }
  }
  return {mult,reasons};
}

// C0: keep the three player-owned Unique IDs useful, but make every effect
// concrete. No BREAK / GUARD / ANALYSIS tag or MASTER-route synergy is read.
const previousDamage=BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage=function c0ConcreteUniqueDamage(atk,target,opts={}){
  const out=previousDamage.call(this,atk,target,opts);
  const {mult,reasons}=uniqueMult(this,target);
  if(mult!==1){
    out.damage=Math.max(1,Math.round(out.damage*mult));
    if(reasons.length)out.systemDeepening={mult,reasons};
  }
  return out;
};

// 王墓の反勢 remains a direct effect of the existing ぼうぎょ command.
const previousAttack=BattleEngine.prototype._playerAttack;
BattleEngine.prototype._playerAttack=function c0GuardCounterAttack(targetId){
  this._sdGuardAttack=!!this.player?.guarding;
  try{return previousAttack.call(this,targetId);}finally{this._sdGuardAttack=false;}
};

// Compatibility hook for any old internal caller. There is no Job synergy layer.
state.systemDeepeningBuildSummary=function systemDeepeningBuildSummary(){
  return {unique:uniqueIdentities(),job:[]};
};

function ensureIntentStyles(){
  if(document.getElementById('enemyIntentStyles'))return;
  const style=document.createElement('style');
  style.id='enemyIntentStyles';
  style.textContent=`
    .tb-intent-line{font-size:10px;line-height:1.25;margin-top:3px;opacity:.86;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .tb-intent-line.danger{font-weight:800;opacity:1}
    @media(max-height:700px){.tb-intent-line{font-size:9px;margin-top:2px}}
  `;
  document.head.appendChild(style);
}

// Enemy Intent survives C0 as readable enemy behavior. Player-facing labels are
// Japanese-first; internal kind values may remain English identifiers.
const previousRenderEnemies=TextBattleScreen.prototype._renderEnemies;
TextBattleScreen.prototype._renderEnemies=function c0EnemyIntentRender(){
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
    line.textContent=`${intent.label} — ${intent.text}`;
    card.appendChild(line);
  });
};

ensureIntentStyles();
