/* ============================================================
   Progression 3.0 — Story Expansion 16–20
   ------------------------------------------------------------
   Chapters 16–20 already exist and Abyss unlock currently waits for all
   story chapters. Without this bridge, progression falls from Ch.15 Lv700
   back to Ch.16 Lv260. This patch makes the Veil expansion a continuous
   Lv700→3,000 story/endgame bridge.
   ============================================================ */
import './story11CoreJourney.js';
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { cumulativeCharacterExpToLevel } from '../data/progression.js';

export const STORY_EXPANSION_LEVEL_ROADMAP = Object.freeze([
  { chapter: 16, min: 700,  max: 1000, oldMin: 260, oldMax: 330 },
  { chapter: 17, min: 1000, max: 1350, oldMin: 330, oldMax: 410 },
  { chapter: 18, min: 1350, max: 1750, oldMin: 410, oldMax: 500 },
  { chapter: 19, min: 1750, max: 2250, oldMin: 500, oldMax: 600 },
  { chapter: 20, min: 2250, max: 3000, oldMin: 600, oldMax: 700 },
]);

const ONE_PASS_TARGET_SHARE = 0.85;

function chapterEnemyKeys(chapter) {
  const prefix = `ch${chapter}`;
  return [
    `${prefix}_normal`, `${prefix}_fast`, `${prefix}_tank`,
    `${prefix}_midboss`, `${prefix}_boss`, `${prefix}_branchboss`,
  ];
}

function stageOldLevel(stage, entry) {
  return Math.max(entry.oldMin, Math.min(entry.oldMax, Number(stage.recLevel) || entry.oldMin));
}

function remapLevel(oldLevel, entry) {
  const t = (oldLevel - entry.oldMin) / Math.max(1, entry.oldMax - entry.oldMin);
  return Math.round(entry.min + (entry.max - entry.min) * Math.max(0, Math.min(1, t)));
}

function currentChapterExpBudget(chapter) {
  let total = 0;
  for (const stage of chapter.stages) {
    if (stage.branch) continue;
    total += Number(stage.rewards?.exp) || 0;
    for (const wave of stage.waves || []) {
      const enemy = ENEMY_TYPES[wave.type];
      if (enemy) total += (Number(enemy.xp) || 0) * Math.max(1, Number(wave.count) || 1);
    }
  }
  return Math.max(1, total);
}

function targetChapterExp(entry) {
  const needed = cumulativeCharacterExpToLevel(entry.max) - cumulativeCharacterExpToLevel(entry.min);
  return Math.max(1, needed * ONE_PASS_TARGET_SHARE);
}

function applyExpansionEntry(entry) {
  const chapter = CHAPTERS.find((ch) => ch.num === entry.chapter);
  if (!chapter) return null;

  const oldBudget = currentChapterExpBudget(chapter);
  const expFactor = Math.max(1, targetChapterExp(entry) / oldBudget);
  const levelRatio = entry.max / Math.max(1, entry.oldMax);
  const hpFactor = levelRatio;
  const atkFactor = Math.pow(levelRatio, 0.90);
  const defFactor = Math.pow(levelRatio, 0.85);

  for (const stage of chapter.stages) {
    stage.recLevel = remapLevel(stageOldLevel(stage, entry), entry);
    if (Number.isFinite(stage.rewards?.exp)) {
      stage.rewards.exp = Math.max(1, Math.round(stage.rewards.exp * expFactor));
    }
  }

  for (const key of chapterEnemyKeys(entry.chapter)) {
    const enemy = ENEMY_TYPES[key];
    if (!enemy) continue;
    enemy.hp = Math.max(1, Math.round(enemy.hp * hpFactor));
    enemy.atk = Math.max(1, Math.round(enemy.atk * atkFactor));
    enemy.def = Math.max(0, Math.round(enemy.def * defFactor));
    enemy.xp = Math.max(1, Math.round(enemy.xp * expFactor));
  }

  return { ...entry, rawExpBudget:oldBudget, targetExp:targetChapterExp(entry), levelRatio, hpFactor, atkFactor, defFactor, expFactor };
}

function applyStoryExpansionRoadmap() {
  if (globalThis.__BLADE_VALE_PROGRESSION3_STORY_EXPANSION__) return;
  globalThis.__BLADE_VALE_PROGRESSION3_STORY_EXPANSION__ = true;

  const applied = STORY_EXPANSION_LEVEL_ROADMAP.map(applyExpansionEntry).filter(Boolean);
  state.progression3StoryExpansion = {
    min: STORY_EXPANSION_LEVEL_ROADMAP[0].min,
    max: STORY_EXPANSION_LEVEL_ROADMAP.at(-1).max,
    onePassTargetShare: ONE_PASS_TARGET_SHARE,
    applied,
  };

  if (state.levelRoadmap99999) {
    state.levelRoadmap99999.storyExpansion = STORY_EXPANSION_LEVEL_ROADMAP;
  }
}

applyStoryExpansionRoadmap();
