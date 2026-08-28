/* Enemy 3.0 B4 — generic Elite affix runtime. */
import { BattleEngine } from '../battleEngine.js';
import { assignEnemy3EliteAffix,enemy3EliteStatMultiplier,enemy3EliteRegenAmount } from '../data/enemy3EliteAffixes.js';

const proto=BattleEngine.prototype;
const SPAWN_MARK=Symbol.for('bladeVale.enemy3EliteAffixes.spawn');
if(!proto[SPAWN_MARK]){
  proto[SPAWN_MARK]=true;
  const originalSpawn=proto._spawnEnemy;
  proto._spawnEnemy=function(type){
    const enemy=originalSpawn.call(this,type);
    assignEnemy3EliteAffix(enemy,Math.random);
    if(enemy?.enemy3EliteAffix&&!enemy.name.includes(`[${enemy.enemy3EliteAffix.name}]`))enemy.name=`[${enemy.enemy3EliteAffix.name}] ${enemy.name}`;
    return enemy;
  };
}

const STAT_MARK=Symbol.for('bladeVale.enemy3EliteAffixes.stats');
if(!proto[STAT_MARK]){
  proto[STAT_MARK]=true;
  const originalEffective=proto._effectiveEnemyStat;
  proto._effectiveEnemyStat=function(enemy,stat){
    return originalEffective.call(this,enemy,stat)*enemy3EliteStatMultiplier(enemy,stat);
  };
}

const TURN_MARK=Symbol.for('bladeVale.enemy3EliteAffixes.turn');
if(!proto[TURN_MARK]){
  proto[TURN_MARK]=true;
  const originalTurn=proto.performEnemyTurn;
  proto.performEnemyTurn=function(enemy){
    if(enemy?.enemy3EliteAffixId==='regenerating'&&!enemy.dead){
      const amount=enemy3EliteRegenAmount(enemy);
      if(amount>0){enemy.hp+=amount;enemy._enemy3LastEliteRegen=amount;}
    }
    const result=originalTurn.call(this,enemy);
    if(result&&enemy?._enemy3LastEliteRegen){
      result.eliteAffixRegen=enemy._enemy3LastEliteRegen;
      enemy._enemy3LastEliteRegen=0;
    }
    if(result&&enemy?.enemy3EliteAffix)result.eliteAffix={id:enemy.enemy3EliteAffix.id,name:enemy.enemy3EliteAffix.name};
    return result;
  };
}
