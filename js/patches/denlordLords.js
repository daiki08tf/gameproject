/* ============================================================
   Denlord 再臨 — 外伝の巣の主を再戦するプレステージ層。
   ------------------------------------------------------------
   その外伝の最終Stageを一度クリアした後、同じStageへ挑むと
   番獣は【再臨】個体として強化されて現れる。
   - 再臨個体はHP/ATK/DEFが強化され、撃破報酬も増える
   - 再臨個体を倒して勧誘に成功すると、継承特性『再臨』を持つ
     legendary以上の個体が仲間になる
   - 状態はstageProgressのクリア記録から導出するため、新しい
     セーブ領域も通貨も持たない
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { denlordForEnemyType } from '../data/denlords.js';

const previousSpawn = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function denlordSpawn(type) {
  const enemy = previousSpawn.call(this, type);
  const lord = denlordForEnemyType(type);
  if (!lord || !enemy || enemy.denlordPrestige) return enemy;
  if (this.stage?.id !== lord.finaleStageId) return enemy;
  if (!state.isStageCleared?.(lord.finaleStageId)) return enemy;
  const p = lord.prestige;
  enemy.hp = Math.round(enemy.hp * p.hpMult);
  enemy.maxHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * p.atkMult);
  enemy.def = Math.round(enemy.def * p.defMult);
  enemy.xp = Math.round(enemy.xp * 1.5);
  enemy.gold = Math.round(enemy.gold * 1.5);
  enemy.name = `${p.namePrefix}${enemy.name}`;
  enemy.denlordPrestige = true;
  return enemy;
};

// 外伝画面側で「再臨が待っている」を知らせるための問い合わせ。
state.denlordPrestigeAvailable = function denlordPrestigeAvailable(enemyType) {
  const lord = denlordForEnemyType(enemyType);
  return !!(lord && this.isStageCleared?.(lord.finaleStageId));
};
