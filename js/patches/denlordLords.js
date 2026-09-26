/* ============================================================
   Denlord 再臨 / 超再臨 — 外伝の巣の主を再戦するプレステージ層。
   ------------------------------------------------------------
   その外伝の最終Stageを一度クリアした後、同じStageへ挑むと
   番獣は【再臨】個体として強化されて現れる。
   - 再臨個体はHP/ATK/DEFが強化され、撃破報酬も増える
   - 再臨個体を倒して勧誘に成功すると、継承特性『再臨』を持つ
     legendary以上の個体が仲間になる
   - 状態はstageProgressのクリア記録から導出するため、新しい
     セーブ領域も通貨も持たない

   Session 7 — 超再臨: 再臨個体を一度撃破した後の再来戦は
   【超再臨】としてさらに一段上がる。
   - でかいだけではなく、専用の二位相プロファイル
     （denlord-*-super）で「主の本領」を二回読ませる
   - 撃破すると勧誘に成功した個体は『超再臨』特性を持つ
     mythic級（超再臨を越えた個体）
   - 記録は denlordPrestigeClears[type]（additive、撃破数のみ）
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { denlordForEnemyType } from '../data/denlords.js';

function prestigeClears(type) {
  return (state.data.denlordPrestigeClears || {})[type] || 0;
}
state.denlordPrestigeDefeats = function denlordPrestigeDefeats(enemyType) {
  return prestigeClears(enemyType);
};

const previousSpawn = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function denlordSpawn(type) {
  const enemy = previousSpawn.call(this, type);
  const lord = denlordForEnemyType(type);
  if (!lord || !enemy || enemy.denlordPrestige) return enemy;
  if (this.stage?.id !== lord.finaleStageId) return enemy;
  if (!state.isStageCleared?.(lord.finaleStageId)) return enemy;
  // Session 7 — 超再臨：再臨を一度制した後の再来戦。
  const isSuper = lord.super && prestigeClears(type) >= 1;
  const p = isSuper ? lord.super : lord.prestige;
  enemy.hp = Math.round(enemy.hp * p.hpMult);
  enemy.maxHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * p.atkMult);
  enemy.def = Math.round(enemy.def * p.defMult);
  enemy.xp = Math.round(enemy.xp * (isSuper ? 2.2 : 1.5));
  enemy.gold = Math.round(enemy.gold * (isSuper ? 2.2 : 1.5));
  enemy.name = `${p.namePrefix}${enemy.name}`;
  enemy.denlordPrestige = true;
  if (isSuper) enemy.superPrestige = true;
  return enemy;
};

// 再臨（超再臨含む）撃破数の記録。combat3BossEncounter の
// _grantKillRewards wrap より後段に乗せて minion扱いと競合しない。
const previousGrant = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function denlordTrackGrant(enemy) {
  const result = previousGrant.call(this, enemy);
  if (enemy?.denlordPrestige && enemy.type) {
    state.data.denlordPrestigeClears ||= {};
    state.data.denlordPrestigeClears[enemy.type] = (state.data.denlordPrestigeClears[enemy.type] || 0) + 1;
    state.save();
  }
  return result;
};

// 外伝画面側で「再臨が待っている」を知らせるための問い合わせ。
state.denlordPrestigeAvailable = function denlordPrestigeAvailable(enemyType) {
  const lord = denlordForEnemyType(enemyType);
  return !!(lord && this.isStageCleared?.(lord.finaleStageId));
};
state.denlordSuperPrestigeAvailable = function denlordSuperPrestigeAvailable(enemyType) {
  const lord = denlordForEnemyType(enemyType);
  return !!(lord?.super && this.isStageCleared?.(lord.finaleStageId) && prestigeClears(enemyType) >= 1);
};
