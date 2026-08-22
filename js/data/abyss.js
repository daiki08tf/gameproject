/* ============================================================
   深淵（Abyss）ステージ生成（Blade Vale 2.0 Phase 4、深淵拡張でモディファイア追加）
   全10章のボスを撃破すると解放される、無限に深くなるエンドコンテンツ。
   1〜9999...と際限なく続くため、章のように事前生成せず、
   findStage('abyss-<depth>') が呼ばれるたびにその場でフロアを作る。

   モディファイア／エリートの設計方針：
   このファイルは純粋なデータ生成モジュールとして保つため、プレイヤー状態
   （深淵ツリーの投資状況など）には一切依存させない。エリート出現やモディ
   ファイアの「敵の強さ」側（ATK/DEF/SPD、接触ダメージ）は、深淵ツリーの
   「混沌への耐性」で軽減できる必要があるため、あえてここでは適用せず、
   raw な倍率（enemyAtkMult等）をステージデータとして持たせるだけにして
   おき、実際の適用は state を参照できる battle.js 側（_spawnEnemy等）で
   行う。一方、報酬・出現数・ドロップ率・回復量の倍率はプレイヤー状態に
   依存しない純粋な計算なので、このファイルの中で確定させてしまって良い。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { ENEMY_TYPES } from './enemies.js';
import { ABYSS_LAYER } from './balance.js';

const CH10 = CHAPTER_SPECS.find((c) => c.num === 10);

// 深淵モディファイア：1つにつき必ず「敵を強くする／リスクを増やす」効果と
// 「報酬を増やす」効果がセットになっている（ハイリスク・ハイリターン）。
export const ABYSS_MODIFIERS = [
  { id: 'mod_frenzy', name: '狂乱の霧', desc: '敵の移動速度+25% ／ 獲得ゴールド+40%',
    enemySpeedMult: 1.25, goldMult: 1.4 },
  { id: 'mod_fortress', name: '鉄壁の守り', desc: '敵の防御力+30% ／ ドロップ率+50%',
    enemyDefMult: 1.3, dropMult: 1.5 },
  { id: 'mod_swarm', name: '群れの巣窟', desc: '出現数+30% ／ 獲得経験値+30%',
    enemyCountMult: 1.3, expMult: 1.3 },
  { id: 'mod_glass', name: '脆き猛威', desc: '敵HP-20% ／ 敵攻撃力+35%',
    enemyHpMult: 0.8, enemyAtkMult: 1.35 },
  { id: 'mod_venom', name: '瘴気だまり', desc: '敵との接触ダメージ+25% ／ 獲得経験値+25%',
    contactDmgMult: 1.25, expMult: 1.25 },
  { id: 'mod_blessed', name: '静穏の加護', desc: '回復量+50% ／ 獲得ゴールド-15%',
    healMult: 1.5, goldMult: 0.85 },
];

// depthから決定論的に1つ（ボスフロアは2つ）選ぶ。深淵一覧は毎回その場で
// buildAbyssStage(depth)を呼び直すため、Math.random()で選ぶと開き直す
// たびにモディファイアが変わってしまい混乱する。単純なLCGでdepthから
// 決定論的な擬似乱数列を作り、常に同じ組み合わせになるようにする。
function modifiersForDepth(depth) {
  const count = isAbyssBossFloor(depth) ? 2 : 1;
  const pool = [...ABYSS_MODIFIERS];
  const picks = [];
  let seed = (depth * 2654435761) % 2147483647;
  for (let i = 0; i < count && pool.length > 0; i++) {
    seed = (seed * 48271) % 2147483647;
    const idx = seed % pool.length;
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}

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

// goldMult/expMult はモディファイア由来の「報酬側」倍率（プレイヤー状態に
// 依存しない）。敵の強さ側（hp/atk/def）はここでは一切いじらない
// （エリート化・敵ステータス系モディファイアはbattle.js側で、深淵ツリーの
// 耐性を反映した上で適用する）。
function scaleArchetype(base, depth, goldMult, expMult) {
  return {
    ...base,
    hp: Math.round(base.hp * floorMult(ABYSS_LAYER.HP_STEP, depth)),
    atk: Math.round(base.atk * floorMult(ABYSS_LAYER.ATK_STEP, depth)),
    def: Math.round(base.def * floorMult(ABYSS_LAYER.DEF_STEP, depth)),
    xp: Math.round(base.xp * floorMult(ABYSS_LAYER.REWARD_STEP, depth) * expMult),
    gold: Math.round(base.gold * floorMult(ABYSS_LAYER.REWARD_STEP, depth) * goldMult),
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

  const modifiers = modifiersForDepth(depth);
  const modMult = (key) => modifiers.reduce((m, x) => m * (x[key] || 1), 1);
  const goldMult = modMult('goldMult');
  const expMult = modMult('expMult');
  const enemyCountMult = modMult('enemyCountMult');
  const dropMult = modMult('dropMult');
  const healMult = modMult('healMult');
  const contactDmgMult = modMult('contactDmgMult');
  // 敵の強さ側（ATK/DEF/SPD/HP）は raw のままステージへ持たせる。
  // battle.js が深淵ツリー「混沌への耐性」を反映した上で敵の実体に適用する。
  const enemyAtkMult = modMult('enemyAtkMult');
  const enemyDefMult = modMult('enemyDefMult');
  const enemySpeedMult = modMult('enemySpeedMult');
  const enemyHpMult = modMult('enemyHpMult');

  // ENEMY_TYPES への登録は完全に決定的な式なので、毎回同じキーへ
  // 上書き登録して構わない（メモ化の必要なし）
  ENEMY_TYPES[normalId] = scaleArchetype(ARCHETYPE_BASE.normal, depth, goldMult, expMult);
  ENEMY_TYPES[fastId] = scaleArchetype(ARCHETYPE_BASE.fast, depth, goldMult, expMult);
  ENEMY_TYPES[tankId] = scaleArchetype(ARCHETYPE_BASE.tank, depth, goldMult, expMult);
  ENEMY_TYPES[bossId] = scaleArchetype(ARCHETYPE_BASE.boss, depth, goldMult, expMult);

  const bossFloor = isAbyssBossFloor(depth);
  const waves = bossFloor
    ? [
        { type: normalId, count: 3, interval: 1.0 },
        { type: bossId, count: 1, interval: 0 },
      ]
    : [
        { type: normalId, count: Math.round((3 + Math.min(4, Math.floor(depth / 5))) * enemyCountMult), interval: 1.1 },
        { type: fastId, count: Math.round((2 + Math.min(3, Math.floor(depth / 8))) * enemyCountMult), interval: 0.9 },
        { type: tankId, count: Math.round((1 + Math.min(3, Math.floor(depth / 10))) * enemyCountMult), interval: 1.8 },
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
    rewards: { gold: Math.round(baseReward.gold * rewardMult * goldMult), exp: Math.round(baseReward.exp * rewardMult * expMult) },
    dropTable: ch10DropTable(),
    modifiers: modifiers.map((m) => ({ id: m.id, name: m.name, desc: m.desc })),
    dropMult, healMult, contactDmgMult,
    enemyAtkMult, enemyDefMult, enemySpeedMult, enemyHpMult,
    // 地域別ドロップ傾向（Blade Vale 2.1）：深淵は特定属性に偏らせず、
    // 全属性の武器図鑑武器を等しく対象にする（無限に周回できる終盤の
    // 「何でも掘れる」場として機能させるため）
    dropRegionTags: ['fire', 'ice', 'lightning', 'wind', 'light', 'dark', 'poison'],
  };
}
