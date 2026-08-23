import test from 'node:test';
import assert from 'node:assert/strict';
import { jobExpToNext, cumulativeJobExpToLevel } from '../js/data/jobProgression.js';
import { characterExpToNext } from '../js/data/progression.js';

test('Job EXP curve is distinct and faster than Character EXP from the opening', () => {
  for (const lv of [1, 5, 10, 20, 40, 60]) {
    assert.ok(jobExpToNext(lv, 'basic') < characterExpToNext(lv), `Lv${lv}`);
  }
});

test('higher job tiers are progressively slower without using Character EXP curve', () => {
  const lv = 20;
  assert.ok(jobExpToNext(lv, 'basic') < jobExpToNext(lv, 'advanced'));
  assert.ok(jobExpToNext(lv, 'advanced') < jobExpToNext(lv, 'special'));
  assert.ok(jobExpToNext(lv, 'special') < jobExpToNext(lv, 'hero'));
});

test('Job MASTER targets remain practical short-form goals', () => {
  const basic = cumulativeJobExpToLevel(20, 'basic');
  const advanced = cumulativeJobExpToLevel(40, 'advanced');
  const special = cumulativeJobExpToLevel(60, 'special');
  const hero = cumulativeJobExpToLevel(100, 'hero');
  assert.ok(basic > 0 && advanced > basic && special > advanced && hero > special);
  assert.ok(basic < 10000);
  assert.ok(hero < 200000);
});
