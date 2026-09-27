/*
 * Pacing Walls — 章の関門（checkpoint）圧。
 *
 * 実機プレイテスト指摘：「新ステージを連続してクリアできてしまい、
 * 周回・装備集め・仲間育成の動機が生まれない」。このパッチは敵の
 * 全体スケーリング（ENEMY_SCALING/chapterMult）に一切触れず、
 * メイン章の関門ステージ（stage.boss / stage.midBoss / stage.checkpoint）
 * にだけ局所的な圧を加える：
 *
 *   1) 最後の非Boss遭遇グループの先頭1体がElite化する（「番人」）。
 *      素体・報酬倍率・Elite AffixはAbyss/巡回の既存Eliteを再利用。
 *   2) 関門のBoss/MidBoss本体にATK/HPの微増（PACING_WALL_LAYER）。
 *
 * メイン章（chapter id が chN）以外 — sideLocation / gaiden / abyss /
 * bounty / branch — には適用しない。エリート番人は撃破報酬も2.5倍なので
 * 「関門は周回先としても旨味がある」構造になる。
 */
import { BattleEngine } from '../battleEngine.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { ABYSS_EXPANSION_LAYER, PACING_WALL_LAYER } from '../data/balance.js';
import { rollEnemy3EliteAffix } from '../data/enemy3EliteAffixes.js';

function isCheckpointStage(engine) {
  const st = engine.stage;
  if (!st || !(st.checkpoint || st.boss || st.midBoss)) return false;
  if (st.isAbyss || st.sideLocation || st.bounty || st.branch || st.isRift) return false;
  return /^ch\d+$/.test(engine.chapter?.id || '');
}

// checkpointステージは「最深部に近いほど危ない場所」—— 雑魚にも
// わずかな攻撃圧を乗せて消耗戦にし、最後の番人隊で押し切られる
// かどうかが実際の分岐点になるようにする。
function isGuardStage(engine) {
  const st = engine.stage;
  return !!(st?.checkpoint && !st.boss && !st.midBoss);
}

function isBossType(type) { return !!ENEMY_TYPES[type]?.boss; }

// combat3BattleGroups が encounterQueue を {bossWave, enemies:[{type,count}]}
// のグループspecへ再構成する。素の {type,count} 形式と両方を受け付ける。
function specIsBoss(s) {
  if (Array.isArray(s.enemies)) return !!s.bossWave || s.enemies.every((e) => isBossType(e.type));
  return isBossType(s.type);
}

function applyGuardElite(enemy, atkExtra = 1) {
  const L = ABYSS_EXPANSION_LAYER;
  enemy.elite = true;
  enemy.hp = enemy.maxHp = Math.round(enemy.hp * L.ELITE_HP_MULT);
  enemy.atk = Math.round(enemy.atk * L.ELITE_ATK_MULT * atkExtra);
  enemy.def = Math.round(enemy.def * L.ELITE_DEF_MULT);
  enemy.xp = Math.round(enemy.xp * L.ELITE_REWARD_MULT);
  enemy.gold = Math.round(enemy.gold * L.ELITE_REWARD_MULT);
  const affix = rollEnemy3EliteAffix(Math.random);
  if (affix) { enemy.enemy3EliteAffix = affix; enemy.enemy3EliteAffixId = affix.id; }
  enemy.pacingGuard = true;
}

const originalSpawn = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function (type) {
  const enemy = originalSpawn.call(this, type);
  if (!enemy || !isCheckpointStage(this)) return enemy;
  const t = ENEMY_TYPES[type];
  if (enemy.boss) {
    const isMid = !!this.stage.midBoss && !this.stage.boss;
    enemy.atk = Math.round(enemy.atk * (isMid ? PACING_WALL_LAYER.MIDBOSS_ATK_MULT : PACING_WALL_LAYER.BOSS_ATK_MULT));
    const hp = Math.round(enemy.hp * (isMid ? PACING_WALL_LAYER.MIDBOSS_HP_MULT : PACING_WALL_LAYER.BOSS_HP_MULT));
    enemy.hp = enemy.maxHp = hp;
    return enemy;
  }
  // 番人：残りの遭遇キューがBoss系のみ = 現在のグループが最後の
  // 非Bossグループ。checkpointステージではそのグループ全員をElite化
  // （最深部の番人隊＝章中盤の実質的な壁）、boss/midBossステージでは
  // 先頭1体の護衛Eliteのみ（Boss本体の圧が主体）。
  if (!enemy.boss && isGuardStage(this)) {
    enemy.atk = Math.round(enemy.atk * PACING_WALL_LAYER.CHECKPOINT_TRASH_ATK_MULT);
  }
  if (!enemy.elite && t && !t.boss
      && this.encounterQueue.every((s) => specIsBoss(s))) {
    const wholeGroup = !!this.stage.checkpoint && !this.stage.boss && !this.stage.midBoss;
    if (wholeGroup || !this._pacingGuardSpawned) {
      this._pacingGuardSpawned = true;
      applyGuardElite(enemy, wholeGroup ? PACING_WALL_LAYER.GUARD_GROUP_ATK_EXTRA : 1);
    }
  }
  return enemy;
};
