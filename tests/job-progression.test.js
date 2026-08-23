import test from 'node:test';
import assert from 'node:assert/strict';
import { JOB_EXP_REWARD_SHARE, splitProgressionExp } from '../js/data/jobProgression.js';

test('Job receives 10% while Character receives the full EXP reward', () => {
  assert.equal(JOB_EXP_REWARD_SHARE, 0.10);
  assert.deepEqual(splitProgressionExp(100), { character: 100, job: 10 });
  assert.deepEqual(splitProgressionExp(250), { character: 250, job: 25 });
});

test('common EXP bonuses apply to both tracks but Character-only bonus does not boost Job EXP', () => {
  assert.deepEqual(splitProgressionExp(100, 1.2, 1), { character: 120, job: 12 });
  assert.deepEqual(splitProgressionExp(100, 1.2, 1.1), { character: 132, job: 12 });
});

test('invalid or negative rewards cannot reduce either progression track', () => {
  assert.deepEqual(splitProgressionExp(-100), { character: 0, job: 0 });
  assert.deepEqual(splitProgressionExp(Number.NaN), { character: 0, job: 0 });
});
