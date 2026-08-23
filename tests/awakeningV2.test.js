import test from 'node:test';
import assert from 'node:assert/strict';
import { AWAKENING_V2_RANKS, evaluateAwakeningRequirements, SYSTEM_ROLE_MAP } from '../js/data/awakeningMilestones.js';

test('Awakening 2.0 uses milestone ranks instead of reset loops', () => {
  assert.equal(AWAKENING_V2_RANKS.length, 4);
  assert.deepEqual(AWAKENING_V2_RANKS.map((r) => r.rank), [1,2,3,4]);
  assert.match(SYSTEM_ROLE_MAP.awakening, /解放/);
  assert.match(SYSTEM_ROLE_MAP.inheritance, /継承/);
});

test('rank 1 requirements must all be satisfied', () => {
  const def = AWAKENING_V2_RANKS[0];
  const fail = evaluateAwakeningRequirements(def, {
    characterLevel: 89,
    masteredJobs: 5,
    abyssDepth: 0,
    rune2OwnedTotal: 0,
    isStageCleared: () => true,
  });
  assert.equal(fail.met, false);

  const pass = evaluateAwakeningRequirements(def, {
    characterLevel: 90,
    masteredJobs: 5,
    abyssDepth: 0,
    rune2OwnedTotal: 0,
    isStageCleared: (id) => id === '5-5',
  });
  assert.equal(pass.met, true);
});

test('rank 4 requires abyss and Rune 2.0 collection progression', () => {
  const def = AWAKENING_V2_RANKS[3];
  const pass = evaluateAwakeningRequirements(def, {
    characterLevel: 3000,
    masteredJobs: 40,
    abyssDepth: 50,
    rune2OwnedTotal: 1000,
    isStageCleared: () => true,
  });
  assert.equal(pass.met, true);
});
