import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inheritanceRatePct,
  inheritanceBonusPointGain,
  calculateInheritedStats,
} from '../js/data/inheritance.js';

test('Lv1999 and Lv2000 use the intended inheritance breakpoint', () => {
  assert.equal(inheritanceRatePct(1999, 0), 9.995);
  assert.equal(inheritanceRatePct(2000, 0), 20);
  assert.equal(inheritanceBonusPointGain(1999, 0), 0);
  assert.equal(inheritanceBonusPointGain(2000, 0), 0);
});

test('inheritance count is added to both rate and BP formulas', () => {
  assert.equal(inheritanceRatePct(1000, 5), 10);
  assert.equal(inheritanceBonusPointGain(1000, 5), 5);
  assert.equal(inheritanceRatePct(3000, 5), 35);
  assert.equal(inheritanceBonusPointGain(3000, 5), 1005);
});

test('high-level inheritance follows the uncapped long-term formula', () => {
  assert.equal(inheritanceRatePct(10000, 0), 100);
  assert.equal(inheritanceRatePct(50000, 0), 500);
  assert.equal(inheritanceRatePct(99999, 0), 999.99);
  assert.equal(inheritanceBonusPointGain(99999, 0), 97999);
});

test('inherited stats are floored from the source stats at the calculated rate', () => {
  const source = { hp: 10000, mp: 2000, atk: 3000, def: 2500, mag: 1200, spd: 800 };
  const inherited = calculateInheritedStats(source, 3000, 5); // 35%
  assert.deepEqual(inherited, { hp: 3500, mp: 700, atk: 1050, def: 875, mag: 420, spd: 280 });
});
