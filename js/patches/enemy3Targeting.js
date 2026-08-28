/* Enemy 3.0 B2 — context-aware action reservation for B1 advanced roles. */
import { BattleEngine } from '../battleEngine.js';
import { enemy3RoleBehaviorProfile } from '../data/enemy3RoleBehaviors.js';
import { enemy3TacticalContext,enemy3ShouldReserveSkill } from '../data/enemy3Targeting.js';

const proto=BattleEngine.prototype;

function applyTacticalReservation(engine,enemy){
  if(!enemy||enemy.dead||enemy.boss||!enemy3RoleBehaviorProfile(enemy))return;
  const ctx=enemy3TacticalContext(engine,enemy);
  enemy.combat3WillUseSkill=enemy3ShouldReserveSkill(ctx,enemy.combat3WillUseSkill);
}

const originalSpawn=proto._spawnEnemy;
proto._spawnEnemy=function(type){
  const enemy=originalSpawn.call(this,type);
  applyTacticalReservation(this,enemy);
  return enemy;
};

const originalTurn=proto.performEnemyTurn;
proto.performEnemyTurn=function(enemy){
  applyTacticalReservation(this,enemy);
  const result=originalTurn.call(this,enemy);
  // Combat 3 reserves the next action at the end of the turn. Refine that
  // reservation after it is created so UI intent and execution stay aligned.
  applyTacticalReservation(this,enemy);
  return result;
};

export { applyTacticalReservation };
