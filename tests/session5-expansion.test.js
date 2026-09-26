import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, findStage, isChapterUnlocked, finalStageOf } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { DENLORDS, denlordForEnemyType, denlordForSpecies } from '../js/data/denlords.js';
import { getCompanionSpecies } from '../js/data/companions.js';
import { getCompanionSkill } from '../js/data/companionSkills.js';
import { storyArcForChapter } from '../js/data/storyCanon.js';
import { nextStageAfter } from '../js/data/resultNextStage.js';

const GAIDENS = [
  { id: 'gaiden_beasttrail', unlock: '2-5', denlord: 'bt_denlord' },
  { id: 'gaiden_tidepath', unlock: '6-5', denlord: 'tp_denlord' },
  { id: 'gaiden_ashfield', unlock: '11-5', denlord: 'af_denlord' },
];

test('Session5: three gaiden routes each unlock from authored main-story beats', () => {
  for (const g of GAIDENS) {
    const ch = CHAPTERS.find(c => c.id === g.id);
    assert.ok(ch, `${g.id} must exist`);
    assert.equal(ch.gaiden, true);
    assert.equal(ch.unlocksAfter, g.unlock);
    assert.ok(ch.stages.length >= 5, `${g.id} needs destination-scale content`);
    for (const s of ch.stages) assert.equal(findStage(s.id)?.stage.id, s.id);
    const idx = CHAPTERS.findIndex(c => c.id === g.id);
    const cleared = id => id === g.unlock;
    assert.equal(isChapterUnlocked(idx, cleared), true, `${g.id} unlocks after ${g.unlock}`);
    assert.equal(isChapterUnlocked(idx, () => false), false);
  }
});

test('Session5: every gaiden Denlord is registered, recruitable, and resolves a signature bond skill', () => {
  for (const g of GAIDENS) {
    const lord = DENLORDS[g.denlord];
    assert.ok(lord, `${g.denlord} must be in the DENLORD registry`);
    const ch = CHAPTERS.find(c => c.id === g.id);
    assert.equal(lord.finaleStageId, finalStageOf(ch).id, `${g.denlord} finale must be the gaiden's last stage`);
    assert.ok(ENEMY_TYPES[lord.enemyType], `${lord.enemyType} enemy type missing`);
    assert.notEqual(ENEMY_TYPES[lord.enemyType].boss, true, 'Denlord stays recruitable (not Boss-flagged)');
    const species = getCompanionSpecies(lord.speciesId);
    assert.ok(species?.recruit, `${lord.speciesId} must be a recruitable species`);
    assert.ok(getCompanionSkill(species.bondSkillId), `${lord.speciesId} signature bond skill must resolve`);
    assert.equal(denlordForEnemyType(lord.enemyType)?.id, lord.id);
    assert.equal(denlordForSpecies(lord.speciesId)?.id, lord.id);
    assert.ok(lord.prestige?.hpMult > 1 && lord.prestige?.atkMult > 1, `${lord.id} needs prestige scaling`);
  }
});

test('Session5: Arc VI covers ch36-39 and the story continues cleanly through Arc VII and VIII', () => {
  for (const num of [36, 37, 38, 39]) assert.equal(storyArcForChapter(num)?.id, 'arc6', `ch${num} must be Arc VI`);
  for (const num of [40, 41]) assert.equal(storyArcForChapter(num)?.id, 'arc7', `ch${num} must be Arc VII`);
  // Session 7 — Arc VIII 未記録帯（ch42–45）
  for (const num of [42, 43, 44, 45]) assert.equal(storyArcForChapter(num)?.id, 'arc8', `ch${num} must be Arc VIII`);
  const ch39 = CHAPTERS.find(c => c.num === 39);
  assert.ok(ch39 && !ch39.gaiden);
  const boss = ch39.stages.find(s => s.boss);
  assert.ok(boss, 'ch39 needs a final boss stage');
  assert.equal(nextStageAfter(boss)?.id, '40-1', 'ch39 boss must chain into ch40');
  const arc7End = CHAPTERS.find(c => c.num === 41).stages.find(s => s.boss);
  assert.equal(nextStageAfter(arc7End)?.id, '42-1', 'ch41 boss must chain into ch42');
  const lastBoss = CHAPTERS.find(c => c.num === 45).stages.find(s => s.boss);
  assert.equal(nextStageAfter(lastBoss), null, 'the current story end must not chain into gaidens');
});

test('Session5: gaidens do not leak into main progression or Abyss unlock', () => {
  const cleared = () => true;
  for (const g of GAIDENS) {
    const ch = CHAPTERS.find(c => c.id === g.id);
    assert.ok(ch.gaiden, `${g.id} must keep the gaiden flag so progression/Abyss gates ignore it`);
  }
  // Session 7 — 現行の物語終端はnum45。gaiden/探索地点がCHAPTERSに
  // 後続しても main progression には混入しない。
  const last = CHAPTERS.find(c => c.num === 45).stages.find(s => s.boss);
  assert.equal(nextStageAfter(last), null);
});
