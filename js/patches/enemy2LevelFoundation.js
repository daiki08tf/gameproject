import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { attachEnemyLevelMetadata } from '../data/enemyLevel.js';

const ENGINE_MARK = Symbol.for('bladeVale.enemy2LevelFoundation.engine');
if (!BattleEngine.prototype[ENGINE_MARK]) {
  BattleEngine.prototype[ENGINE_MARK] = true;
  const originalSpawnEnemy = BattleEngine.prototype._spawnEnemy;
  BattleEngine.prototype._spawnEnemy = function(type) {
    const enemy = originalSpawnEnemy.call(this, type);
    return attachEnemyLevelMetadata(enemy, this.stage);
  };
}

const SCREEN_MARK = Symbol.for('bladeVale.enemy2LevelFoundation.screen');
if (!TextBattleScreen.prototype[SCREEN_MARK]) {
  TextBattleScreen.prototype[SCREEN_MARK] = true;
  const originalRenderEnemies = TextBattleScreen.prototype._renderEnemies;
  TextBattleScreen.prototype._renderEnemies = function() {
    const result = originalRenderEnemies.call(this);
    const cards = [...(this.el?.enemyList?.querySelectorAll?.('.tb-enemy-card') || [])];
    for (let i = 0; i < cards.length; i++) {
      const enemy = this.engine?.enemies?.[i];
      const name = cards[i].querySelector?.('.tb-enemy-name-row span:first-child');
      if (!enemy || !name || !Number.isFinite(enemy.level)) continue;
      name.textContent = `${enemy.name} Lv.${Math.round(enemy.level).toLocaleString('ja-JP')}`;
    }
    return result;
  };
}
