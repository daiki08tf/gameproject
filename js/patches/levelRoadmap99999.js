/* ============================================================
   Level Roadmap 99,999 — story progression rebalance
   ------------------------------------------------------------
   Character Lv上限99,999に対して本編15章がLv260前後で終わっていたため、
   本編をLv1〜700の導入・成長帯として再配置する。

   方針:
   - 15章クリア目安をLv700へ拡張
   - 推奨Lvだけでなく敵能力も旧→新Lv比率に連動させる
   - EXP報酬も各章の目標Lv差分から逆算して拡張する
   - Goldは既存経済を壊さないため変更しない
   - Lv700以降はAbyss / EX / Nemesis等の長期育成帯として扱う
   ============================================================ */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { cumulativeCharacterExpToLevel, CHARACTER_LEVEL_MAX } from '../data/progression.js';

export const STORY_LEVEL_ROADMAP = Object.freeze([
  { chapter: 1, min: 1,   max: 15,  oldMax: 8 },
  { chapter: 2, min: 15,  max: 30,  oldMax: 14 },
  { chapter: 3, min: 30,  max: 45,  oldMax: 20 },
  { chapter: 4, min: 45,  max: 65,  oldMax: 27 },
  { chapter: 5, min: 65,  max: 90,  oldMax: 34 },
  { chapter: 6, min: 90,  max: 120, oldMax: 41 },
  { chapter: 7, min: 120, max: 150, oldMax: 48 },
  { chapter: 8, min: 150, max: 180, oldMax: 56 },
  { chapter: 9, min: 180, max: 230, oldMax: 65 },
  { chapter: 10,min: 230, max: 300, oldMax: 80 },
  { chapter: 11,min: 300, max: 360, oldMax: 105 },
  { chapter: 12,min: 360, max: 430, oldMax: 135 },
  { chapter: 13,min: 430, max: 510, oldMax: 170 },
  { chapter: 14,min: 510, max: 600, oldMax: 210 },
  { chapter: 15,min: 600, max: 700, oldMax: 260 },
]);

export const LONG_TERM_LEVEL_ERAS = Object.freeze([
  { id: 'story',       min: 1,     max: 700,   label: '本編15章' },
  { id: 'post_story',  min: 700,   max: 2999,  label: '深淵序層・EX賞金首・隠しBoss' },
  { id: 'abyss',       min: 3000,  max: 9999,  label: '深淵中層・Nemesis' },
  { id: 'transcend',   min: 10000, max: 29999, label: '超越エンドゲーム' },
  { id: 'divine',      min: 30000, max: 49999, label: '神域エンドゲーム' },
  { id: 'terminal',    min: 50000, max: CHARACTER_LEVEL_MAX, label: '終焉域' },
]);

const BASELINE_FULL_CHAPTER_EXP = 681; // 標準5ステージ: 敵EXP+ステージEXPの旧基準合計
const ONE_PASS_TARGET_SHARE = 0.85;    // 章を1周で目標差分の約85%。少量の周回余地を残す

function legacyChapterRewardMult(chapter) {
  return chapter === 1 ? 1 : 1 + (chapter - 1) * 0.35;
}

function targetChapterExpMult(entry) {
  const previousEnd = entry.chapter === 1 ? 1 : STORY_LEVEL_ROADMAP[entry.chapter - 2].max;
  const needed = Math.max(0,
    cumulativeCharacterExpToLevel(entry.max) - cumulativeCharacterExpToLevel(previousEnd)
  );
  return Math.max(1, (needed * ONE_PASS_TARGET_SHARE) / BASELINE_FULL_CHAPTER_EXP);
}

function chapterEnemyKeys(chapter) {
  if (chapter === 1) return ['grunt', 'fast', 'tank', 'boss_orcking', 'branch_goblin_chief'];
  const prefix = `ch${chapter}`;
  return [`${prefix}_normal`, `${prefix}_fast`, `${prefix}_tank`, `${prefix}_boss`, `${prefix}_branchboss`];
}

function scaleRecommendedLevels(chapter, entry) {
  const mainStages = chapter.stages.filter((stage) => !stage.branch);
  const count = Math.max(1, mainStages.length - 1);
  mainStages.forEach((stage, index) => {
    stage.recLevel = Math.round(entry.min + (entry.max - entry.min) * (index / count));
  });
  for (const stage of chapter.stages.filter((stage) => stage.branch)) {
    stage.recLevel = Math.round(entry.min + (entry.max - entry.min) * 0.5);
  }
}

function scaleChapterEnemies(entry) {
  const levelRatio = entry.max / entry.oldMax;
  // Character成長は概ねレベルに対して線形。HPは同比率、ATK/DEFはやや抑えて
  // 一撃死・硬すぎる敵を避けながら旧バランス感を維持する。
  const hpFactor = levelRatio;
  const atkFactor = Math.pow(levelRatio, 0.90);
  const defFactor = Math.pow(levelRatio, 0.85);

  const expFactor = targetChapterExpMult(entry) / legacyChapterRewardMult(entry.chapter);

  for (const key of chapterEnemyKeys(entry.chapter)) {
    const enemy = ENEMY_TYPES[key];
    if (!enemy) continue;
    enemy.hp = Math.max(1, Math.round(enemy.hp * hpFactor));
    enemy.atk = Math.max(1, Math.round(enemy.atk * atkFactor));
    enemy.def = Math.max(0, Math.round(enemy.def * defFactor));
    enemy.xp = Math.max(1, Math.round(enemy.xp * expFactor));
  }

  return { levelRatio, hpFactor, atkFactor, defFactor, expFactor };
}

function scaleStageExp(chapter, entry) {
  const expFactor = targetChapterExpMult(entry) / legacyChapterRewardMult(entry.chapter);
  for (const stage of chapter.stages) {
    if (!stage.rewards || !Number.isFinite(stage.rewards.exp)) continue;
    stage.rewards.exp = Math.max(1, Math.round(stage.rewards.exp * expFactor));
  }
}

function applyRoadmap() {
  if (globalThis.__BLADE_VALE_LEVEL_ROADMAP_99999__) return;
  globalThis.__BLADE_VALE_LEVEL_ROADMAP_99999__ = true;

  const applied = [];
  for (const entry of STORY_LEVEL_ROADMAP) {
    const chapter = CHAPTERS.find((ch) => ch.num === entry.chapter || ch.id === `ch${entry.chapter}`);
    if (!chapter) continue;
    scaleRecommendedLevels(chapter, entry);
    const combat = scaleChapterEnemies(entry);
    scaleStageExp(chapter, entry);
    applied.push({ ...entry, ...combat, expMult: targetChapterExpMult(entry) });
  }

  state.levelRoadmap99999 = {
    cap: CHARACTER_LEVEL_MAX,
    story: STORY_LEVEL_ROADMAP,
    eras: LONG_TERM_LEVEL_ERAS,
    applied,
  };
}

applyRoadmap();
