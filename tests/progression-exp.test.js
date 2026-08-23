import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_LEVEL_MAX,
  characterExpToNext,
  characterLevelBand,
  cumulativeCharacterExpToLevel,
} from '../js/data/progression.js';

test('character EXP curve preserves the opening and reaches Lv99,999 safely', () => {
  assert.equal(CHARACTER_LEVEL_MAX, 99999);
  assert.equal(characterExpToNext(1), 40);
  assert.equal(characterExpToNext(99), 4921);
  assert.equal(characterExpToNext(99999), 0);
  const total = cumulativeCharacterExpToLevel(99999);
  assert.ok(Number.isSafeInteger(total));
  assert.ok(total > 0);
});

test('character EXP checkpoints rise across every long-term band', () => {
  const checkpoints = [1, 100, 1000, 1999, 2000, 5000, 10000, 50000, 99998];
  const values = checkpoints.map(characterExpToNext);
  for (let i = 1; i < values.length; i += 1) {
    assert.ok(values[i] > values[i - 1], `EXP must rise: Lv${checkpoints[i - 1]} -> Lv${checkpoints[i]}`);
  }
});

test('character level bands match the Progression 2.0 milestones', () => {
  assert.equal(characterLevelBand(1).id, 'adventurer');
  assert.equal(characterLevelBand(100).id, 'heroic');
  assert.equal(characterLevelBand(1000).id, 'transcendent');
  assert.equal(characterLevelBand(10000).id, 'divine');
  assert.equal(characterLevelBand(50000).id, 'terminal');
  assert.equal(characterLevelBand(99999).id, 'terminal');
});
