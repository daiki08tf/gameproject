import './combat3DifficultyRebalance.js';
import { BattleEngine } from '../battleEngine.js';

export const COMBAT3_FORMATION = Object.freeze({
  GUARDIAN_INTERCEPT_CHANCE: 0.60,
  FRONTLINE_SCREEN_CHANCE: 0.25,
  BACKLINE_ROLES: Object.freeze(['caster','support']),
});

function roleId(enemy){ return enemy?.combat3Role?.id || null; }
function isBackline(enemy){ return COMBAT3_FORMATION.BACKLINE_ROLES.includes(roleId(enemy)); }
function pickProtector(engine,target){
  if(!target || !isBackline(target)) return null;
  const alive=engine.aliveEnemies.filter(e=>e.id!==target.id&&!e.dead);
  const guardians=alive.filter(e=>roleId(e)==='guardian');
  if(guardians.length && Math.random()<COMBAT3_FORMATION.GUARDIAN_INTERCEPT_CHANCE){
    return { enemy:guardians[Math.floor(Math.random()*guardians.length)], kind:'guardian' };
  }
  const fronts=alive.filter(e=>roleId(e)==='frontline');
  if(fronts.length && Math.random()<COMBAT3_FORMATION.FRONTLINE_SCREEN_CHANCE){
    return { enemy:fronts[Math.floor(Math.random()*fronts.length)], kind:'frontline' };
  }
  return null;
}

const proto=BattleEngine.prototype;
const originalPick=proto._pickTarget;
proto._pickTarget=function combat3FormationPickTarget(targetId){
  const requested=targetId?this.aliveEnemies.find(e=>e.id===targetId):null;
  if(requested){
    const protector=pickProtector(this,requested);
    if(protector){
      this._combat3LastIntercept={fromId:requested.id,fromName:requested.name,toId:protector.enemy.id,toName:protector.enemy.name,kind:protector.kind};
      return protector.enemy;
    }
  }
  return originalPick.call(this,targetId);
};

const originalAction=proto.performPlayerAction;
proto.performPlayerAction=function combat3FormationPlayerAction(action){
  this._combat3LastIntercept=null;
  const result=originalAction.call(this,action);
  if(this._combat3LastIntercept && result && !result.noTarget){
    result.targetIntercept={...this._combat3LastIntercept};
  }
  return result;
};

export function combat3FormationTarget(engine,target){ return pickProtector(engine,target); }
