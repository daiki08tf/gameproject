/* Phase 9.8 — 機巧賢者 combat identity: tactical diversity becomes real power. */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { secretJobPhase2 } from '../data/secretJobPhase2.js';

function isMechanosage(engine){return engine?._secretJob?.id==='secret_mechanosage'||state.data.activeSecretJobId==='secret_mechanosage';}
function rules(){return secretJobPhase2('secret_mechanosage')?.rules||{};}
function commandKey(command){if(!command?.type)return null;if(command.type==='skill'||command.type==='spell')return `${command.type}:${command.techId||'any'}`;return command.type;}
function broken(target){return !!(target&&(target.breakGauge<=0||target.breakTurns>0||target.brokenTurns>0||target.staggered||target.isBroken));}

const previousDamage=BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage=function phase9MechanosageDamage(...args){
  const result=previousDamage.apply(this,args);if(!isMechanosage(this)||!result)return result;
  const target=args[1],r=rules(),count=Math.min(this._mechanosageActions?.size||0,r.maxDiversity||4);
  let mult=1+count*(r.actionDiversity||.08);
  if(state.isMastered?.('secret_mechanosage'))mult*=1+(r.masterBonus||.16);
  if(broken(target))mult*=1+(r.breakBonus||.18);
  if(Number.isFinite(result.damage))result.damage=Math.max(1,Math.round(result.damage*mult));
  return result;
};

const previousAdvance=BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn=function phase9MechanosageAdvance(command){
  this._mechanosageActions||=new Set();
  const before=this._mechanosageActions.size;
  const out=previousAdvance.call(this,command);
  if(isMechanosage(this)&&!out?.result?.retreated){
    const key=commandKey(command);if(key)this._mechanosageActions.add(key);
    const r=rules(),cap=(r.maxDiversity||4)+(state.isMastered?.('secret_mechanosage')?1:0);
    if(this._mechanosageActions.size>cap){const first=this._mechanosageActions.values().next().value;this._mechanosageActions.delete(first);}
    if(this._mechanosageActions.size!==before&&Array.isArray(out?.events))out.events.push({type:'mechanosageDiversity',count:this._mechanosageActions.size,cap,power:this._mechanosageActions.size*(r.actionDiversity||.08)});
  }
  return out;
};

BattleEngine.prototype.mechanosageSummary=function(){if(!isMechanosage(this))return null;const r=rules(),count=this._mechanosageActions?.size||0;return{count,cap:(r.maxDiversity||4)+(state.isMastered?.('secret_mechanosage')?1:0),damageBonus:count*(r.actionDiversity||.08),breakBonus:r.breakBonus||.18};};
