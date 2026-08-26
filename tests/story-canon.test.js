import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CENTRAL_MYSTERY,
  WORLD_LAYERS,
  VEIL_CANON,
  ENDGAME_STORY_MEANINGS,
  STORY_ARCS,
  CLUE_LADDER,
  STORY_WRITING_RULES,
  storyArcForChapter,
  storyCanonSummary,
} from '../js/data/storyCanon.js';
import { VEIL_CANON_DEFINITION } from '../js/data/worldVeil.js';

test('story canon defines the central modern-world mystery and player objective', () => {
  assert.match(CENTRAL_MYSTERY.question, /現代世界/);
  assert.match(CENTRAL_MYSTERY.playerObjective, /境界/);
});

test('all required world layers have distinct canonical roles', () => {
  for (const id of ['human','heaven','underworld','boundary','machine','modern']) {
    assert.ok(WORLD_LAYERS[id]);
    assert.ok(WORLD_LAYERS[id].name.length > 0);
    assert.ok(WORLD_LAYERS[id].role.length > 0);
    assert.ok(WORLD_LAYERS[id].relation.length > 0);
  }
  assert.notEqual(WORLD_LAYERS.heaven.kind, WORLD_LAYERS.machine.kind);
});

test('The Veil has one canonical network definition shared with presentation data', () => {
  assert.match(VEIL_CANON.definition, /境界網/);
  assert.equal(VEIL_CANON_DEFINITION, VEIL_CANON.definition);
  assert.match(VEIL_CANON.keys, /第八鍵/);
});

test('existing endgame systems receive narrative meaning instead of parallel replacements', () => {
  for (const id of ['abyss','worldTier','nemesis','secretRealm','keyDungeon','uniqueTrial','raid','machineWorld']) {
    assert.equal(typeof ENDGAME_STORY_MEANINGS[id], 'string');
    assert.ok(ENDGAME_STORY_MEANINGS[id].length > 15);
  }
});

test('chapter arcs preserve Ch1-25 and formally map Story Expansion I through Ch30', () => {
  assert.equal(storyArcForChapter(1)?.id, 'arc1');
  assert.equal(storyArcForChapter(15)?.id, 'arc1');
  assert.equal(storyArcForChapter(16)?.id, 'arc2');
  assert.equal(storyArcForChapter(20)?.id, 'arc2');
  assert.equal(storyArcForChapter(21)?.id, 'arc3');
  assert.equal(storyArcForChapter(25)?.id, 'arc3');
  assert.equal(storyArcForChapter(26)?.id, 'arc4');
  assert.equal(storyArcForChapter(30)?.id, 'arc4');
  assert.equal(storyArcForChapter(31), null);
});

test('clue ladder delays explicit modern-world evidence until the latest tier', () => {
  assert.equal(CLUE_LADDER[0].tier, 1);
  assert.equal(CLUE_LADDER.at(-1).label, '現代世界');
  assert.ok(CLUE_LADDER.at(-1).examples.some(x => x.includes('日')));
});

test('writing rules protect mobile readability and progression separation', () => {
  assert.ok(STORY_WRITING_RULES.some(x => x.includes('mobile')));
  assert.ok(STORY_WRITING_RULES.some(x => x.includes('progression')));
  assert.equal(STORY_ARCS.length, 5);
  assert.equal(storyCanonSummary().arcCount, 5);
});
