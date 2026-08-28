/* Enemy 3.0 B5 — Rare-only behavior runtime. */
import { BattleEngine } from '../battleEngine.js';
import { assignEnemy3RareBehavior,enemy3RareStatMultiplier,enemy3RareLeechAmount } from '../data/enemy3RareBehaviors.js';

const proto=BattleEngine.prototype;
const SPAWN_MARK=Symbol.for('bladeVale.enemy3RareBehaviors.spawn');
if(!proto[SPAWN_MARK]){
  proto[SPAWN_MARK]=true;
  const originalSpawn=proto._spawnEnemy;
  proto._spawnEnemy=function(type){
    const enemy=originalSpawn.call(this,type);
    assignEnemy3RareBehavior(enemy,Math.random);
    if(enemy?.enemy3RareBehavior&&!enemy.name.includes(`[${enemy.enemy3RareBehavior.name}]`))enemy.name=`[${enemy.enemy3RareBehavior.name}] ${enemy.name}`;
    return enemy;
  };
}

const STAT_MARK=Symbol.for('bladeVale.enemy3RareBehaviors.stats');
if(!proto[STAT_MARK]){
  proto[STAT_MARK]=true;
  const originalEffective=proto._effectiveEnemyStat;
  proto._effectiveEnemyStat=function(enemy,stat){
    return originalEffective.call(this,enemy,stat)*enemy3RareStatMultiplier(enemy,stat,this.player);
  };
}

const TURN_MARK=Symbol.for('bladeVale.enemy3RareBehaviors.turn');
if(!proto[TURN_MARK]){
  proto[TURN_MARK]=true;
  const originalTurn=proto.performEnemyTurn;
  proto.performEnemyTurn=function(enemy){
    const result=originalTurn.call(this,enemy);
    if(enemy?.enemy3RareBehavior){
      if(result&&!result.evaded){
        const amount=enemy3RareLeechAmount(enemy,result.damage);
        if(amount>0){enemy.hp+=amount;result.rareBehaviorHeal=amount;}
      }
      if(result)result.rareBehavior={id:enemy.enemy3RareBehavior.id,name:enemy.enemy3RareBehavior.name};
      enemy.enemy3RareFirstTurn=false;
    }
    return result;
  };
}
