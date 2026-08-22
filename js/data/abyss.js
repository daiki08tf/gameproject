/* ============================================================
   深淵（Abyss）ステージ生成（Blade Vale 2.0 Phase 4）
   全10章のボスを撃破すると解放される、無限に深くなるエンドコンテンツ。
   1〜9999...と際限なく続くため、章のように事前生成せず、
   findStage('abyss-<depth>') が呼ばれるたびにその場でフロアを作る。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { ENEMY_TYPES } from './enemies.js';
import { ABYSS_LAYER } from './balance.js';

const CH10 = CHAPTER_SPECS.find((c) => c.num === 10);

// 深淵内の敵アーキタイプの素の基礎値（enemies.jsのNORMAL_BASE等と同じ数値を採用）
const ARCHETYPE_BASE = {
  normal: { name: '深淵の徘徊者', hp: 26, atk: 6, def: 2, speed: 95, radius: 15, color: '#7b3fb0', xp: 6, gold: 4 },
  fast:   { name: '深淵の疾影',   hp: 14, atk: 4, def: 0, speed: 180, radius: 11, color: '#a566d6', xp: 5, gold: 3 },
  tank:   { name: '深淵の巨影',   hp: 70, atk: 11, def: 5, speed: 62, radius: 22, color: '#4b2470', xp: 14, gold: 8 },
  boss:   { name: '深淵の支配者', hp: 420, atk: 16, def: 8, speed: 68, radius: 34, color: '#d048e0', xp: 120, gold: 150, boss: true },
};

// 第10章の強さ（chapterMult(10)）を起点に、深淵専用の刻み幅でさらに伸ばす
function floorMult(step, depth) {
  return chapterMult(10) * (1 + depth * step);
}

function scaleArchetype(base, depth) {
  return {
    ...base,
    hp: Math.round(base.hp * floorMult(ABYSS_LAYER.HP_STEP, depth)),
    atk: Math.round(base.atk * floorMult(ABYSS_LAYER.ATK_STEP, depth)),
    def: Math.round(base.def * floorMult(ABYSS_LAYER.DEF_STEP, depth)),
    xp: Math.round(base.xp * floorMult(ABYSS_LAYER.REWARD_STEP, depth)),
    gold: Math.round(base.gold * floorMult(ABYSS_LAYER.REWARD_STEP, depth)),
  };
}

export function isAbyssBossFloor(depth) {
  return depth % ABYSS_LAYER.BOSS_FLOOR_INTERVAL === 0;
}

// 第10章ボスのドロップテーブルをそのまま再利用する
// （現状、第10章が最高レア帯の装備の唯一の入手源であるため、
//   深淵はその周回・稼ぎ場としてそのまま機能する）
function ch10DropTable() {
  const dt = [
    { itemId: `${CH10.id}_named_${CH10.items.named.slot}`, weight: 1 },
    { itemId: `rune_effect_${CH10.items.named.effect}`, weight: 1 },
  ];
  if (CH10.items.named2) {
    dt.push(
      { itemId: `${CH10.id}_named2_${CH10.items.named2.slot}`, weight: 1 },
      { itemId: `rune_effect_${CH10.items.named2.effect}`, weight: 1 },
    );
  }
  return dt;
}

export function buildAbyssStage(depth) {
  const normalId = `abyss_${depth}_normal`;
  const fastId = `abyss_${depth}_fast`;
  const tankId = `abyss_${depth}_tank`;
  const bossId = `abyss_${depth}_boss`;

  // ENEMY_TYPES への登録は完全に決定的な式なので、毎回同じキーへ
  // 上書き登録して構わない（メモ化の必要なし）
  ENEMY_TYPES[normalId] = scaleArchetype(ARCHETYPE_BASE.normal, depth);
  ENEMY_TYPES[fastId] = scaleArchetype(ARCHETYPE_BASE.fast, depth);
  ENEMY_TYPES[tankId] = scaleArchetype(ARCHETYPE_BASE.tank, depth);
  ENEMY_TYPES[bossId] = scaleArchetype(ARCHETYPE_BASE.boss, depth);

  const bossFloor = isAbyssBossFloor(depth);
  const waves = bossFloor
    ? [
        { type: normalId, count: 3, interval: 1.0 },
        { type: bossId, count: 1, interval: 0 },
      ]
    : [
        { type: normalId, count: 3 + Math.min(4, Math.floor(depth / 5)), interval: 1.1 },
        { type: fastId, count: 2 + Math.min(3, Math.floor(depth / 8)), interval: 0.9 },
        { type: tankId, count: 1 + Math.min(3, Math.floor(depth / 10)), interval: 1.8 },
      ];

  const rewardMult = floorMult(ABYSS_LAYER.REWARD_STEP, depth) * (bossFloor ? ABYSS_LAYER.BOSS_REWARD_MULT : 1);
  const baseReward = { gold: 200, exp: 150 };

  return {
    id: `abyss-${depth}`,
    name: `深淵 ${depth}階${bossFloor ? '（ボスフロア）' : ''}`,
    recLevel: (CH10.recLevel[1] || 80) + depth * 3,
    boss: bossFloor,
    isAbyss: true,
    abyssDepth: depth,
    waves,
    rewards: { gold: Math.round(baseReward.gold * rewardMult), exp: Math.round(baseReward.exp * rewardMult) },
    dropTable: ch10DropTable(),
  };
}
