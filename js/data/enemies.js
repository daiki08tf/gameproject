/* ============================================================
   敵データ定義
   ============================================================ */

export const ENEMY_TYPES = {
  grunt: { name: 'ゴブリン', hp: 26, atk: 6, def: 2, speed: 95, radius: 15, color: '#c9505f', xp: 6, gold: 4 },
  fast:  { name: 'コウモリ', hp: 14, atk: 4, def: 0, speed: 180, radius: 11, color: '#e0c94a', xp: 5, gold: 3 },
  tank:  { name: 'オーガ',   hp: 70, atk: 11, def: 5, speed: 62,  radius: 22, color: '#8a5cd6', xp: 14, gold: 8 },
  boss_orcking: {
    name: 'オークキング', hp: 420, atk: 16, def: 8, speed: 68, radius: 34, color: '#e0553a',
    xp: 120, gold: 150, boss: true,
  },
};
