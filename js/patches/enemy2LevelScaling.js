import { BattleEngine } from '../battleEngine.js';
import { attachEnemyLevelMetadata, rollEnemyLevel, applyEnemyLevelScaling } from '../data/enemyLevel.js';

const MARK = Symbol.for('bladeVale.enemy2LevelScaling.engine');
if (!BattleEngine.prototype[MARK]) {
  BattleEngine.prototype[MARK] = true;
  const originalSpawnEnemy = BattleEngine.prototype._spawnEnemy;
  BattleEngine.prototype._spawnEnemy = function(type) {
    const enemy = originalSpawnEnemy.call(this, type);
    const level = rollEnemyLevel(this.stage, enemy);
    attachEnemyLevelMetadata(enemy, this.stage, level);
    return applyEnemyLevelScaling(enemy);
  };
}
