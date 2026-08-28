/* Enemy 3.0 B6 — encounter-level synergy runtime. */
import { BattleEngine } from '../battleEngine.js';
import { enemy3SynergyShouldReserveSkill,enemy3SynergyStatMultiplier } from '../data/enemy3EncounterSynergy.js';

const proto=BattleEngine.prototype;

const STAT_MARK=Symbol.for('bladeVale.enemy3EncounterSynergy.stats');
if(!proto[STAT_MARK]){
  proto[STAT_MARK]=true;
  const originalEffective=proto._effectiveEnemyStat;
  proto._effectiveEnemyStat=function(enemy,stat){
    return originalEffective.call(this,enemy,stat)*enemy3SynergyStatMultiplier(this,enemy,stat);
  };
}

function applyEncounterSynergy(engine,enemy){
  if(!enemy||enemy.dead)return;
  enemy.combat3WillUseSkill=enemy3SynergyShouldReserveSkill(engine,enemy,enemy.combat3WillUseSkill);
}

const TURN_MARK=Symbol.for('bladeVale.enemy3EncounterSynergy.turn');
if(!proto[TURN_MARK]){
  proto[TURN_MARK]=true;
  const originalTurn=proto.performEnemyTurn;
  proto.performEnemyTurn=function(enemy){
    applyEncounterSynergy(this,enemy);
    const result=originalTurn.call(this,enemy);
    applyEncounterSynergy(this,enemy);
    if(result){
      const multAtk=enemy3SynergyStatMultiplier(this,enemy,'atk');
      const multSpd=enemy3SynergyStatMultiplier(this,enemy,'spd');
      if(multAtk>1||multSpd>1)result.encounterSynergy={atkMult:multAtk,spdMult:multSpd};
    }
    return result;
  };
}

export { applyEncounterSynergy };
