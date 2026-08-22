/* ============================================================
   敵データ定義
   第1章は既存のまま。第2章以降は chapters.js のメタデータから
   normal/fast/tank/boss の4アーキタイプを章倍率でスケールして生成する。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { ENEMY_SCALING, chapterScaleMult } from './balance.js';

// 敵の強さ（HP/ATK/DEF）は経済報酬（xp/gold、chapters.jsのchapterMult）とは
// 別軸の倍率で管理する。難易度リバランスにより、1〜5章／6〜10章の2区間
// 指数スケーリングへ変更した（詳細はbalance.jsのENEMY_SCALINGコメント参照）。
// abyss.js（深淵の起点＝章10到達値）からも再利用するためexportする。
export function hpMult(num) { return chapterScaleMult(ENEMY_SCALING.HP_BASE_MULT, ENEMY_SCALING.HP_EARLY_RATE, ENEMY_SCALING.HP_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function atkMult(num) { return chapterScaleMult(ENEMY_SCALING.ATK_BASE_MULT, ENEMY_SCALING.ATK_EARLY_RATE, ENEMY_SCALING.ATK_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function defMult(num) { return chapterScaleMult(ENEMY_SCALING.DEF_BASE_MULT, ENEMY_SCALING.DEF_EARLY_RATE, ENEMY_SCALING.DEF_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
// Boss専用のゆるいHPカーブ（balance.jsのENEMY_SCALING.BOSS_HP_*コメント参照）。
// DEFは通常敵と同じdefMult()を使う＝Bossの硬さはHPでなくDEF＋AIで表現する。
export function bossHpMult(num) { return chapterScaleMult(ENEMY_SCALING.BOSS_HP_BASE_MULT, ENEMY_SCALING.BOSS_HP_EARLY_RATE, ENEMY_SCALING.BOSS_HP_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }

const NORMAL_BASE = { hp: 26, atk: 6, def: 2, speed: 95, radius: 15, color: '#c9505f', xp: 6, gold: 4 };
const FAST_BASE = { hp: 14, atk: 4, def: 0, speed: 180, radius: 11, color: '#e0c94a', xp: 5, gold: 3 };
const TANK_BASE = { hp: 70, atk: 11, def: 5, speed: 62, radius: 22, color: '#8a5cd6', xp: 14, gold: 8 };
const BOSS_BASE = { hp: 420, atk: 16, def: 8, speed: 68, radius: 34, color: '#e0553a', xp: 120, gold: 150, boss: true };
const BRANCH_BASE = { hp: 150, atk: 20, def: 9, speed: 70, radius: 26, color: '#d68b3a', xp: 40, gold: 25, boss: true };

function scale(base, name, num) {
  const isBoss = !!base.boss;
  return {
    ...base, name,
    hp: Math.round(base.hp * (isBoss ? bossHpMult(num) : hpMult(num))),
    atk: Math.round(base.atk * atkMult(num)),
    def: Math.round(base.def * defMult(num)),
    xp: Math.round(base.xp * chapterMult(num)),
    gold: Math.round(base.gold * chapterMult(num)),
  };
}

// 難易度リバランス：第1章もscale(...,1)を通す（以前は素の値をハードコードし
// ていたため、ENEMY_SCALINGの底上げ（HP_BASE_MULT等）が一切効かず、
// 第1章だけが常にどのリバランスからも取り残される状態だった）。
export const ENEMY_TYPES = {
  grunt: scale(NORMAL_BASE, 'ゴブリン', 1),
  fast: scale(FAST_BASE, 'コウモリ', 1),
  tank: scale(TANK_BASE, 'オーガ', 1),
  boss_orcking: scale(BOSS_BASE, 'オークキング', 1),
  branch_goblin_chief: scale(BRANCH_BASE, 'ゴブリンの頭目', 1),
};

for (const ch of CHAPTER_SPECS) {
  ENEMY_TYPES[`${ch.id}_normal`] = scale(NORMAL_BASE, ch.enemies.normal, ch.num);
  ENEMY_TYPES[`${ch.id}_fast`] = scale(FAST_BASE, ch.enemies.fast, ch.num);
  ENEMY_TYPES[`${ch.id}_tank`] = scale(TANK_BASE, ch.enemies.tank, ch.num);
  ENEMY_TYPES[`${ch.id}_boss`] = scale(BOSS_BASE, ch.enemies.boss, ch.num);
  if (ch.branch) ENEMY_TYPES[`${ch.id}_branchboss`] = scale(BRANCH_BASE, ch.branch.enemyName, ch.num);
}
