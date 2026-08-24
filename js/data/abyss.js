/* ============================================================
   深淵（Abyss）ステージ生成 — Equipment 3.0 E9
   本編15章（Lv700 / IP1000）からLv99,999 / IP10,000へ接続する長期エンドゲーム。
   3,000階でレベル/IP軸は上限へ到達し、それ以降は自己ベスト更新帯として継続する。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { ENEMY_TYPES } from './enemies.js';
import { ABYSS_LAYER } from './balance.js';
import { setDropsForDepth } from './equipment3Sets.js';
import {
  abyssRecommendedLevel,
  abyssTargetItemPower,
  abyssEraForDepth,
  abyssCombatScale,
  abyssStageExpBudget,
} from './abyssEndgame.js';

const CH15 = CHAPTER_SPECS.find((c) => c.num === 15);

export const ABYSS_MODIFIERS = [
  { id: 'mod_frenzy', name: '狂乱の霧', desc: '敵SPD+25% ／ 獲得ゴールド+40%', enemySpeedMult: 1.25, goldMult: 1.4 },
  { id: 'mod_fortress', name: '鉄壁の守り', desc: '敵の防御力+30% ／ ドロップ率+50%', enemyDefMult: 1.3, dropMult: 1.5 },
  { id: 'mod_swarm', name: '群れの巣窟', desc: '出現数+30% ／ 獲得経験値+30%', enemyCountMult: 1.3, expMult: 1.3 },
  { id: 'mod_glass', name: '脆き猛威', desc: '敵HP-20% ／ 敵攻撃力+35%', enemyHpMult: 0.8, enemyAtkMult: 1.35 },
  { id: 'mod_venom', name: '瘴気だまり', desc: '回復量-30% ／ 獲得経験値+25%', healMult: 0.7, expMult: 1.25 },
  { id: 'mod_blessed', name: '静穏の加護', desc: '回復量+50% ／ 獲得ゴールド-15%', healMult: 1.5, goldMult: 0.85 },
];

function modifiersForDepth(depth) {
  const count = isAbyssBossFloor(depth) ? 2 : 1;
  const pool = [...ABYSS_MODIFIERS];
  const picks = [];
  let seed = (depth * 2654435761) % 2147483647;
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    seed = (seed * 48271) % 2147483647;
    const idx = seed % pool.length;
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}

const ABYSS_NAMES = {
  normal: '深淵の徘徊者', fast: '深淵の疾影', tank: '深淵の巨影', boss: '深淵の支配者',
};

function chapter15Anchor(kind) {
  const key = kind === 'boss' ? 'ch15_boss' : `ch15_${kind}`;
  return ENEMY_TYPES[key] || ENEMY_TYPES[kind] || { hp: 1, atk: 1, def: 0, speed: 80, xp: 1, gold: 1 };
}

function scaleArchetype(kind, depth, goldMult, expMult) {
  const anchor = chapter15Anchor(kind);
  const scale = abyssCombatScale(depth);
  const boss = kind === 'boss';
  const rewardRatio = Math.max(1, scale.level / 700);
  return {
    ...anchor,
    name: ABYSS_NAMES[kind],
    boss,
    hp: Math.max(1, Math.round(anchor.hp * scale.hp)),
    atk: Math.max(1, Math.round(anchor.atk * scale.atk)),
    def: Math.max(0, Math.round(anchor.def * scale.def)),
    xp: Math.max(1, Math.round(anchor.xp * Math.pow(rewardRatio, 0.78) * expMult)),
    gold: Math.max(1, Math.round(anchor.gold * Math.pow(rewardRatio, 0.62) * goldMult)),
  };
}

export function isAbyssBossFloor(depth) {
  return depth % ABYSS_LAYER.BOSS_FLOOR_INTERVAL === 0;
}

function ch15DropTable(depth, bossFloor) {
  const dt = [
    { itemId: `${CH15.id}_named_${CH15.items.named.slot}`, weight: 1 },
  ];
  if (CH15.items.named2) dt.push({ itemId: `${CH15.id}_named2_${CH15.items.named2.slot}`, weight: 1 });
  // Equipment 3.0 Phase 1: fixed Set gear starts appearing at milestone depths.
  // The newest unlocked set is intentionally more target-farmable; older sets
  // remain obtainable at lower weight so progression never permanently locks them out.
  dt.push(...setDropsForDepth(depth, bossFloor));
  return dt;
}

export function buildAbyssStage(rawDepth) {
  const depth = Math.max(1, Math.floor(Number(rawDepth) || 1));
  const normalId = `abyss_${depth}_normal`;
  const fastId = `abyss_${depth}_fast`;
  const tankId = `abyss_${depth}_tank`;
  const bossId = `abyss_${depth}_boss`;

  const modifiers = modifiersForDepth(depth);
  const modMult = (key) => modifiers.reduce((m, x) => m * (x[key] || 1), 1);
  const goldMult = modMult('goldMult');
  const expMult = modMult('expMult');
  const enemyCountMult = modMult('enemyCountMult');
  const dropMult = modMult('dropMult');
  const healMult = modMult('healMult');
  const enemyAtkMult = modMult('enemyAtkMult');
  const enemyDefMult = modMult('enemyDefMult');
  const enemySpeedMult = modMult('enemySpeedMult');
  const enemyHpMult = modMult('enemyHpMult');

  ENEMY_TYPES[normalId] = scaleArchetype('normal', depth, goldMult, expMult);
  ENEMY_TYPES[fastId] = scaleArchetype('fast', depth, goldMult, expMult);
  ENEMY_TYPES[tankId] = scaleArchetype('tank', depth, goldMult, expMult);
  ENEMY_TYPES[bossId] = scaleArchetype('boss', depth, goldMult, expMult);

  const bossFloor = isAbyssBossFloor(depth);
  const waves = bossFloor
    ? [
        { type: normalId, count: 3, interval: 1.0 },
        { type: bossId, count: 1, interval: 0 },
      ]
    : [
        { type: normalId, count: Math.round((3 + Math.min(12, Math.floor(depth / 40))) * enemyCountMult), interval: 1.1 },
        { type: fastId, count: Math.round((2 + Math.min(9, Math.floor(depth / 55))) * enemyCountMult), interval: 0.9 },
        { type: tankId, count: Math.round((1 + Math.min(7, Math.floor(depth / 70))) * enemyCountMult), interval: 1.8 },
      ];

  const level = abyssRecommendedLevel(depth);
  const itemPower = abyssTargetItemPower(depth);
  const era = abyssEraForDepth(depth);
  const expBudget = abyssStageExpBudget(depth) * expMult * (bossFloor ? 1.35 : 1);
  const goldReward = 200 * chapterMult(15) * Math.pow(Math.max(1, level / 700), 0.72)
    * goldMult * (bossFloor ? ABYSS_LAYER.BOSS_REWARD_MULT : 1);

  return {
    id: `abyss-${depth}`,
    name: `深淵 ${depth}階${bossFloor ? '（ボスフロア）' : ''}`,
    recLevel: level,
    boss: bossFloor,
    isAbyss: true,
    abyssDepth: depth,
    abyssEra: era,
    itemPowerTarget: itemPower,
    waves,
    rewards: { gold: Math.max(1, Math.round(goldReward)), exp: Math.max(1, Math.round(expBudget)) },
    dropTable: ch15DropTable(depth, bossFloor),
    modifiers: modifiers.map((m) => ({ id: m.id, name: m.name, desc: m.desc })),
    dropMult, healMult,
    enemyAtkMult, enemyDefMult, enemySpeedMult, enemyHpMult,
    dropRegionTags: ['fire', 'ice', 'lightning', 'wind', 'light', 'dark', 'poison'],
  };
}
