import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  challengeLevelForMarks,
  challengeEnemyHpMult,
  challengeEnemyAtkMult,
  challengeExpMult,
  challengeGoldMult,
  challengeRuneAmountRange,
  greedRemovedRarityTiers,
  swiftInitiativeMult,
  fistsAttackIntervalMult,
  observeTier,
} from '../js/data/rune2SpecialRules.js';

test('Challenge uses 100 marks per level and caps at Lv20', () => {
  assert.equal(challengeLevelForMarks(99), 0);
  assert.equal(challengeLevelForMarks(100), 1);
  assert.equal(challengeLevelForMarks(999), 9);
  assert.equal(challengeLevelForMarks(2000), 20);
  assert.equal(challengeLevelForMarks(99999), 20);
});

test('Challenge Lv10 matches intended enemy and reward multipliers', () => {
  assert.equal(challengeEnemyHpMult(10), 2);
  assert.equal(challengeEnemyAtkMult(10), 1.5);
  assert.equal(challengeExpMult(10), 2);
  assert.equal(challengeGoldMult(10), 1.5);
  assert.deepEqual(challengeRuneAmountRange(10), [2, 5]);
  assert.deepEqual(challengeRuneAmountRange(15), [3, 10]);
});

test('Greed advances one rarity tier per 50 active marks', () => {
  assert.equal(greedRemovedRarityTiers(49), 0);
  assert.equal(greedRemovedRarityTiers(50), 1);
  assert.equal(greedRemovedRarityTiers(100), 2);
});

test('Swift and Fists gameplay effects cap at their ★500 milestone', () => {
  assert.equal(swiftInitiativeMult(500), 1.5);
  assert.equal(swiftInitiativeMult(5000), 1.5);
  assert.equal(fistsAttackIntervalMult(500), 0.5);
  assert.equal(fistsAttackIntervalMult(5000), 0.5);
});

test('Observe unlocks information at 1/50/100/250/500 marks', () => {
  assert.equal(observeTier(0), 0);
  assert.equal(observeTier(1), 1);
  assert.equal(observeTier(50), 2);
  assert.equal(observeTier(100), 3);
  assert.equal(observeTier(250), 4);
  assert.equal(observeTier(500), 5);
});

test('runtime patches are loaded from main', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.match(main, /rune2Special\.js/);
  assert.match(main, /rune2ObserveUi\.js/);
  const patch = fs.readFileSync(new URL('../js/patches/rune2Special.js', import.meta.url), 'utf8');
  assert.match(patch, /_spawnEnemy/);
  assert.match(patch, /rollRune2DropForStagePhase6/);
  assert.match(patch, /rune2GreedRollDrop/);
});
