import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INHERITANCE_MIN_LEVEL,
  INHERITANCE_RATE_CAP_PCT,
  inheritanceRatePct,
  inheritanceBonusPointGain,
  calculateInheritedStats,
} from '../js/data/inheritance.js';

test('Lv2000 is the inheritance gate and starts the long-term curve', () => {
  assert.equal(INHERITANCE_MIN_LEVEL, 2000);
  assert.ok(inheritanceRatePct(1999, 0) < 10);
  assert.equal(inheritanceRatePct(2000, 0), 10);
  assert.equal(inheritanceBonusPointGain(1999, 0), 0);
  assert.equal(inheritanceBonusPointGain(2000, 0), 5);
});

test('inheritance count gives only a bounded repeat-cycle bonus', () => {
  assert.equal(inheritanceRatePct(1000, 5), 5);
  assert.equal(inheritanceBonusPointGain(1000, 5), 0);
  assert.ok(inheritanceRatePct(3000, 5) > inheritanceRatePct(3000, 0));
  assert.ok(inheritanceRatePct(3000, 1000) <= INHERITANCE_RATE_CAP_PCT);
  assert.ok(inheritanceBonusPointGain(3000, 1000) < 100);
});

test('high-level inheritance is useful but cannot recursively multiply by 100%+', () => {
  const r10k = inheritanceRatePct(10000, 0);
  const r50k = inheritanceRatePct(50000, 0);
  const rCap = inheritanceRatePct(99999, 0);
  assert.ok(r10k > 10 && r10k < r50k);
  assert.ok(r50k < rCap);
  assert.ok(rCap <= 25.001);
  assert.ok(inheritanceRatePct(99999, 999) <= INHERITANCE_RATE_CAP_PCT);
  assert.ok(inheritanceBonusPointGain(99999, 0) < 500);
});

test('inherited stats are floored from source stats at the bounded calculated rate', () => {
  const source = { hp: 10000, mp: 2000, atk: 3000, def: 2500, mag: 1200, spd: 800 };
  const rate = inheritanceRatePct(3000, 5);
  const inherited = calculateInheritedStats(source, 3000, 5);
  for (const [key, value] of Object.entries(source)) {
    assert.equal(inherited[key], Math.floor(value * rate / 100));
    assert.ok(inherited[key] < value);
  }
});
