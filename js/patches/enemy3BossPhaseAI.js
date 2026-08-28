/* Enemy 3.0 B7 — authored Boss AI phase pressure. */
import { BattleEngine } from '../battleEngine.js';
import { enemy3BossPhaseStatMultiplier,advanceBossSpecialCadence,isEnemy3BossPhase2 } from '../data/enemy3BossPhaseAI.js';
const proto=BattleEngine.prototype;
const STAT_MARK=Symbol.for('bladeVale.enemy3BossPhaseAI.stats');
if(!proto[STAT_MARK]){proto[STAT_MARK]=true;const originalEffective=proto._effectiveEnemyStat;proto._effectiveEnemyStat=function(enemy,stat){return originalEffective.call(this,enemy,stat)*enemy3BossPhaseStatMultiplier(enemy,stat);};}
const TURN_MARK=Symbol.for('bladeVale.enemy3BossPhaseAI.turn');
if(!proto[TURN_MARK]){proto[TURN_MARK]=true;const originalTurn=proto.performEnemyTurn;proto.performEnemyTurn=function(enemy){if(enemy?.boss&&isEnemy3BossPhase2(enemy)&&!enemy.pendingSpecial){enemy._enemy3BossPhaseActionCount=(enemy._enemy3BossPhaseActionCount||0)+1;advanceBossSpecialCadence(enemy);}const result=originalTurn.call(this,enemy);if(result&&enemy?.boss&&isEnemy3BossPhase2(enemy))result.enemy3BossPhase2=true;return result;};}
