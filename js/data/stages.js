/* ============================================================
   ステージ／章データ定義
   第1章は既存のまま。第2章以降は chapters.js のメタデータから
   標準5ステージ構成（雑魚4＋ボス1）を自動生成する。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { buildAbyssStage } from './abyss.js';

const CHAPTER_1 = {
  id: 'ch1',
  name: '第1章 はじまりの平原',
  stages: [
    {
      id: '1-1', name: '平原の入口', recLevel: 1,
      waves: [{ type: 'grunt', count: 5, interval: 1.4 }],
      rewards: { gold: 30, exp: 20 },
      firstClear: { itemId: 'wp_sword_n' },
      dropTable: [{ itemId: 'ac_ring_n', weight: 1 }],
    },
    {
      id: '1-2', name: '風吹く丘', recLevel: 2,
      waves: [
        { type: 'grunt', count: 4, interval: 1.2 },
        { type: 'fast', count: 3, interval: 1.0 },
      ],
      rewards: { gold: 45, exp: 32 },
      firstClear: { itemId: 'sh_wood_n' },
      dropTable: [{ itemId: 'hd_cap_n', weight: 1 }],
    },
    {
      id: '1-3', name: '洞窟の入り口', recLevel: 4,
      waves: [
        { type: 'fast', count: 5, interval: 0.9 },
        { type: 'tank', count: 2, interval: 2.0 },
      ],
      rewards: { gold: 60, exp: 46 },
      firstClear: { itemId: 'bd_cloth_n' },
      dropTable: [{ itemId: 'wp_sword_r', weight: 1 }, { itemId: 'ac_amulet_r', weight: 1 }],
    },
    {
      id: '1-4', name: '魔物の巣窟', recLevel: 6,
      waves: [
        { type: 'grunt', count: 5, interval: 1.0 },
        { type: 'fast', count: 5, interval: 0.8 },
        { type: 'tank', count: 3, interval: 1.8 },
      ],
      rewards: { gold: 90, exp: 70 },
      firstClear: { itemId: 'sh_iron_r' },
      dropTable: [{ itemId: 'hd_helm_r', weight: 1 }, { itemId: 'bd_leather_r', weight: 1 }],
    },
    {
      id: '1-5', name: 'オークキングの城', recLevel: 8, boss: true,
      waves: [
        { type: 'grunt', count: 4, interval: 1.2 },
        { type: 'boss_orcking', count: 1, interval: 0 },
      ],
      rewards: { gold: 200, exp: 150 },
      firstClear: { itemId: 'wp_sword_e' },
      dropTable: [
        { itemId: 'ac_charm_e', weight: 1 }, { itemId: 'bd_plate_e', weight: 1 },
        { itemId: 'rune_effect_counter', weight: 1 },
      ],
    },
    {
      id: '1-B', name: '隠し谷（ゴブリンの頭目）', recLevel: 5, branch: true, requires: '1-3',
      waves: [
        { type: 'grunt', count: 3, interval: 1.2 },
        { type: 'branch_goblin_chief', count: 1, interval: 0 },
      ],
      rewards: { gold: 70, exp: 55 },
      firstClear: { itemId: 'ac_valley_e' },
      dropTable: [],
    },
  ],
};

const STAGE_NAMES = ['入口', '奥地', '深部', '最深部'];

function buildChapter(ch) {
  const mult = chapterMult(ch.num);
  const normalId = `${ch.id}_normal`, fastId = `${ch.id}_fast`, tankId = `${ch.id}_tank`, bossId = `${ch.id}_boss`;
  const rewardBase = [
    { gold: 30, exp: 20 }, { gold: 45, exp: 32 }, { gold: 60, exp: 46 }, { gold: 90, exp: 70 },
  ];
  const stages = [
    {
      id: `${ch.num}-1`, name: `${ch.name}の${STAGE_NAMES[0]}`, recLevel: ch.recLevel[0],
      waves: [{ type: normalId, count: 5, interval: 1.4 }],
      rewards: scaleReward(rewardBase[0], mult),
      dropTable: [{ itemId: `${ch.id}_accessory`, weight: 1 }],
    },
    {
      id: `${ch.num}-2`, name: `${ch.name}の${STAGE_NAMES[1]}`, recLevel: Math.round(ch.recLevel[0] + (ch.recLevel[1] - ch.recLevel[0]) * 0.25),
      waves: [
        { type: normalId, count: 4, interval: 1.2 },
        { type: fastId, count: 3, interval: 1.0 },
      ],
      rewards: scaleReward(rewardBase[1], mult),
      dropTable: [{ itemId: `${ch.id}_shield`, weight: 1 }],
    },
    {
      id: `${ch.num}-3`, name: `${ch.name}の${STAGE_NAMES[2]}`, recLevel: Math.round(ch.recLevel[0] + (ch.recLevel[1] - ch.recLevel[0]) * 0.5),
      waves: [
        { type: fastId, count: 5, interval: 0.9 },
        { type: tankId, count: 2, interval: 2.0 },
      ],
      rewards: scaleReward(rewardBase[2], mult),
      dropTable: [{ itemId: `${ch.id}_weapon`, weight: 1 }, { itemId: `${ch.id}_head`, weight: 1 }],
    },
    {
      id: `${ch.num}-4`, name: `${ch.name}の${STAGE_NAMES[3]}`, recLevel: Math.round(ch.recLevel[0] + (ch.recLevel[1] - ch.recLevel[0]) * 0.75),
      waves: [
        { type: normalId, count: 5, interval: 1.0 },
        { type: fastId, count: 5, interval: 0.8 },
        { type: tankId, count: 3, interval: 1.8 },
      ],
      rewards: scaleReward(rewardBase[3], mult),
      dropTable: [{ itemId: `${ch.id}_body`, weight: 1 }, { itemId: `${ch.id}_accessory`, weight: 1 }],
    },
    {
      id: `${ch.num}-5`, name: `${ch.name}：${ch.enemies.boss}`, recLevel: ch.recLevel[1], boss: true,
      waves: [
        { type: normalId, count: 4, interval: 1.2 },
        { type: bossId, count: 1, interval: 0 },
      ],
      rewards: scaleReward({ gold: 200, exp: 150 }, mult),
      firstClear: { itemId: `${ch.id}_weapon_epic` },
      dropTable: [
        { itemId: `${ch.id}_named_${ch.items.named.slot}`, weight: 1 },
        { itemId: `rune_effect_${ch.items.named.effect}`, weight: 1 },
      ]
        .concat(ch.items.named2 ? [
          { itemId: `${ch.id}_named2_${ch.items.named2.slot}`, weight: 1 },
          { itemId: `rune_effect_${ch.items.named2.effect}`, weight: 1 },
        ] : []),
    },
  ];
  if (ch.branch) {
    stages.push({
      id: `${ch.num}-B`, name: `${ch.name}：隠し道（${ch.branch.enemyName}）`,
      recLevel: Math.round(ch.recLevel[0] + (ch.recLevel[1] - ch.recLevel[0]) * 0.5),
      branch: true, requires: `${ch.num}-3`,
      waves: [
        { type: normalId, count: 3, interval: 1.2 },
        { type: `${ch.id}_branchboss`, count: 1, interval: 0 },
      ],
      rewards: scaleReward({ gold: 70, exp: 55 }, mult),
      firstClear: { itemId: `${ch.id}_branch` },
      dropTable: [],
    });
  }
  return { id: ch.id, name: `第${ch.num}章 ${ch.name}`, stages };
}

function scaleReward(base, mult) {
  return { gold: Math.round(base.gold * mult), exp: Math.round(base.exp * mult) };
}

export const CHAPTERS = [CHAPTER_1, ...CHAPTER_SPECS.map(buildChapter)];

// 各章の「本当のボスステージ」を取得する。
// 分岐（隠し道）ステージは常にboss後ろへpushされて配列の末尾に来るため、
// 単純に stages[stages.length - 1] を使うとボスではなく分岐ステージを
// 拾ってしまう（章の解放条件・推奨Lv表示の両方でバグの元になっていた）。
// boss:true フラグで明示的に探すことで、分岐の有無に関係なく正しく取れる。
export function finalStageOf(chapter) {
  return chapter.stages.find((s) => s.boss) || chapter.stages[chapter.stages.length - 1];
}

export function findStage(stageId) {
  if (stageId.startsWith('abyss-')) {
    const depth = parseInt(stageId.slice('abyss-'.length), 10);
    if (Number.isFinite(depth) && depth >= 1) return { chapter: null, stage: buildAbyssStage(depth) };
    return null;
  }
  for (const ch of CHAPTERS) {
    const st = ch.stages.find((s) => s.id === stageId);
    if (st) return { chapter: ch, stage: st };
  }
  return null;
}

// 章が解放されているか（前章の"ボス"ステージをクリア済みか。分岐ステージは対象外）
export function isChapterUnlocked(chapterIndex, isStageCleared) {
  if (chapterIndex === 0) return true;
  const prevChapter = CHAPTERS[chapterIndex - 1];
  return isStageCleared(finalStageOf(prevChapter).id);
}

// 深淵（Abyss）が解放されているか：全章のボスを撃破済みか
export function isAbyssUnlocked(isStageCleared) {
  return CHAPTERS.every((ch) => isStageCleared(finalStageOf(ch).id));
}
