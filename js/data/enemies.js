/* ============================================================
   敵データ定義
   第1章は既存のまま。第2章以降は chapters.js のメタデータから
   normal/fast/tank/boss の4アーキタイプを章倍率でスケールして生成する。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';

export const ENEMY_TYPES = {
  grunt: { name: 'ゴブリン', hp: 26, atk: 6, def: 2, speed: 95, radius: 15, color: '#c9505f', xp: 6, gold: 4 },
  fast:  { name: 'コウモリ', hp: 14, atk: 4, def: 0, speed: 180, radius: 11, color: '#e0c94a', xp: 5, gold: 3 },
  tank:  { name: 'オーガ',   hp: 70, atk: 11, def: 5, speed: 62,  radius: 22, color: '#8a5cd6', xp: 14, gold: 8 },
  boss_orcking: {
    name: 'オークキング', hp: 420, atk: 16, def: 8, speed: 68, radius: 34, color: '#e0553a',
    xp: 120, gold: 150, boss: true,
  },
};

const NORMAL_BASE = { hp: 26, atk: 6, def: 2, speed: 95, radius: 15, color: '#c9505f', xp: 6, gold: 4 };
const FAST_BASE = { hp: 14, atk: 4, def: 0, speed: 180, radius: 11, color: '#e0c94a', xp: 5, gold: 3 };
const TANK_BASE = { hp: 70, atk: 11, def: 5, speed: 62, radius: 22, color: '#8a5cd6', xp: 14, gold: 8 };
const BOSS_BASE = { hp: 420, atk: 16, def: 8, speed: 68, radius: 34, color: '#e0553a', xp: 120, gold: 150, boss: true };

function scale(base, name, mult) {
  return {
    ...base, name,
    hp: Math.round(base.hp * mult),
    atk: Math.round(base.atk * mult),
    def: Math.round(base.def * mult),
    xp: Math.round(base.xp * mult),
    gold: Math.round(base.gold * mult),
  };
}

for (const ch of CHAPTER_SPECS) {
  const mult = chapterMult(ch.num);
  ENEMY_TYPES[`${ch.id}_normal`] = scale(NORMAL_BASE, ch.enemies.normal, mult);
  ENEMY_TYPES[`${ch.id}_fast`] = scale(FAST_BASE, ch.enemies.fast, mult);
  ENEMY_TYPES[`${ch.id}_tank`] = scale(TANK_BASE, ch.enemies.tank, mult);
  ENEMY_TYPES[`${ch.id}_boss`] = scale(BOSS_BASE, ch.enemies.boss, mult);
}
