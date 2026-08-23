import test from 'node:test';
import assert from 'node:assert/strict';

import { state } from '../js/state.js';
import { CHARACTER_LEVEL_MAX, JOB_MASTERY_LEVELS } from '../js/patches/progressionCore.js';
import { TIERS } from '../js/data/jobs.js';

test('Progression 2.0 exposes independent character and slower job progression', () => {
  state.resetAll();

  assert.equal(state.characterLevel, 1);
  assert.equal(state.currentJobLevel, 1);
  assert.equal(state.highestCharacterLevel, 1);

  const need = state.characterExpToNext(1);
  const result = state.gainExp(need);
  assert.equal(state.characterLevel, 2);
  assert.equal(state.currentJobLevel, 1, 'Job Lv must not mirror Character Lv from the same reward');
  assert.ok(state.currentJobExp > 0, 'Job still receives its smaller EXP share');
  assert.equal(result.characterLeveledUp, true);

  state.data.jobs.mage = { level: 1, exp: 0 };
  state.data.currentJobId = 'mage';
  assert.equal(state.characterLevel, 2, 'changing job must not reset character level');
  assert.equal(state.currentJobLevel, 1, 'each job keeps its own level');
});

test('character progression caps at Lv99,999 and remembers highest level', () => {
  state.resetAll();
  state.data.characterLevel = CHARACTER_LEVEL_MAX - 1;
  state.data.highestCharacterLevel = CHARACTER_LEVEL_MAX - 1;
  state.data.characterExp = state.characterExpToNext(CHARACTER_LEVEL_MAX - 1) - 1;

  state.gainExp(1);
  assert.equal(state.characterLevel, CHARACTER_LEVEL_MAX);
  assert.equal(state.highestCharacterLevel, CHARACTER_LEVEL_MAX);
  assert.equal(state.characterExp, 0);
  assert.equal(state.characterExpToNext(CHARACTER_LEVEL_MAX), 0);
});

test('job mastery targets follow the Progression 2.0 tier plan', () => {
  for (const [tierId, masteryLv] of Object.entries(JOB_MASTERY_LEVELS)) {
    assert.equal(TIERS[tierId].masteryLv, masteryLv);
  }
  assert.deepEqual(JOB_MASTERY_LEVELS, { basic: 20, advanced: 40, special: 60, hero: 100 });
});
