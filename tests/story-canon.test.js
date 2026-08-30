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

test('chapter arcs preserve Ch1-30 and map Story Expansion II as Arc V', () => {
  assert.equal(storyArcForChapter(1)?.id, 'arc1');
  assert.equal(storyArcForChapter(15)?.id, 'arc1');
  assert.equal(storyArcForChapter(16)?.id, 'arc2');
  assert.equal(storyArcForChapter(20)?.id, 'arc2');
  assert.equal(storyArcForChapter(21)?.id, 'arc3');
  assert.equal(storyArcForChapter(25)?.id, 'arc3');
  assert.equal(storyArcForChapter(26)?.id, 'arc4');
  assert.equal(storyArcForChapter(30)?.id, 'arc4');
  assert.equal(storyArcForChapter(31)?.id, 'arc5');
  assert.equal(storyArcForChapter(35)?.id, 'arc5');
  assert.equal(storyArcForChapter(36), null);
});

test('clue ladder preserves modern-world evidence and advances through bidirectional to shared observation', () => {
  assert.equal(CLUE_LADDER[0].tier, 1);
  const modern=CLUE_LADDER.find(t=>t.label==='現代世界');
  assert.ok(modern);
  assert.ok(modern.examples.some(x => x.includes('日')));
  const bidirectional=CLUE_LADDER.find(t=>t.label==='双方向観測');
  assert.ok(bidirectional);
  assert.ok(bidirectional.examples.some(x=>x.includes('再試行')));
  // Ch35/Arc V finale adds tier 8 '共観測' as the new terminal tier built on
  // top of '双方向観測', so the ladder's last entry moves forward with it.
  assert.equal(CLUE_LADDER.at(-1).label, '共観測');
  assert.ok(CLUE_LADDER.at(-1).examples.some(x=>x.includes('協調観測')));
});

test('writing rules protect mobile readability and progression separation', () => {
  assert.ok(STORY_WRITING_RULES.some(x => x.includes('mobile')));
  assert.ok(STORY_WRITING_RULES.some(x => x.includes('progression')));
  assert.equal(STORY_ARCS.length, 5);
  assert.equal(storyCanonSummary().arcCount, 5);
});
