import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CHARACTER_LEVEL_MAX,
  characterExpToNext,
  cumulativeCharacterExpToLevel,
} from '../js/data/progression.js';
import {
  abyssCombatScale,
  abyssRecommendedLevel,
  abyssStageExpBudget,
  abyssTargetItemPower,
} from '../js/data/abyssEndgame.js';
import { endgameRewardProfile } from '../js/data/endgameRewardScaling.js';
import {
  MAX_SAFE_GAME_INTEGER,
  finiteGameNumber,
  safeGameInteger,
  safeRatio,
  percentWidth,
  formatGameNumber,
  numericSafetySnapshot,
} from '../js/data/numericSafety.js';

function assertFiniteSafeInteger(value, label) {
  assert.ok(Number.isFinite(value), `${label} must be finite`);
  assert.ok(Number.isSafeInteger(Math.round(value)), `${label} must remain a safe integer`);
}

test('Character EXP remains finite and safe through Lv99,999', () => {
  assert.equal(CHARACTER_LEVEL_MAX, 99999);
  for (const level of [1, 99, 999, 9999, 10000, 49999, 50000, 74999, 99998]) {
    assertFiniteSafeInteger(characterExpToNext(level), `EXP to next at Lv${level}`);
  }
  const cumulative = cumulativeCharacterExpToLevel(CHARACTER_LEVEL_MAX);
  assertFiniteSafeInteger(cumulative, 'cumulative Character EXP at Lv99,999');
  assert.ok(cumulative < MAX_SAFE_GAME_INTEGER);
});

test('canonical Abyss roadmap stays finite at and beyond the character cap', () => {
  for (const depth of [1, 100, 500, 1000, 2000, 3000, 10000, 1000000]) {
    const scale = abyssCombatScale(depth);
    assert.equal(abyssRecommendedLevel(depth) <= CHARACTER_LEVEL_MAX, true);
    assert.ok(abyssTargetItemPower(depth) <= 10000);
    for (const [key, value] of Object.entries(scale)) assert.ok(Number.isFinite(value), `${key} at ${depth}F`);
    assertFiniteSafeInteger(abyssStageExpBudget(depth), `Abyss EXP at ${depth}F`);
  }
});

test('endgame reward profile never leaks non-finite values at cap checkpoints', () => {
  for (const level of [1, 3000, 9999, 10000, 29999, 49999, 74999, 99999]) {
    const profile = endgameRewardProfile(level);
    for (const [key, value] of Object.entries(profile)) {
      if (typeof value === 'number') assert.ok(Number.isFinite(value), `${key} at Lv${level}`);
    }
  }
});

test('numeric safety helpers neutralize NaN / Infinity and zero denominators', () => {
  assert.equal(finiteGameNumber(Number.NaN), 0);
  assert.equal(finiteGameNumber(Infinity, 7), 7);
  assert.equal(safeGameInteger(Infinity), 0);
  assert.equal(safeGameInteger(MAX_SAFE_GAME_INTEGER * 2), MAX_SAFE_GAME_INTEGER);
  assert.equal(safeRatio(10, 0), 0);
  assert.equal(percentWidth(50, 0), 0);
  assert.equal(percentWidth(150, 100), 100);
  assert.equal(percentWidth(-10, 100), 0);
});

test('large-number presentation is readable and never prints NaN / Infinity', () => {
  assert.equal(formatGameNumber(99999), '99,999');
  assert.equal(formatGameNumber(1234567, { compact: false }), '1,234,567');
  assert.ok(formatGameNumber(1234567, { compact: true }).length < '1,234,567'.length);
  assert.equal(formatGameNumber(NaN), '0');
  assert.equal(formatGameNumber(Infinity), '0');
});

test('numeric safety snapshot reports unsafe values explicitly', () => {
  const snap = numericSafetySnapshot({ ok: 99999, bad: Infinity });
  assert.equal(snap.ok.finite, true);
  assert.equal(snap.ok.safeInteger, true);
  assert.equal(snap.bad.finite, false);
  assert.equal(snap.bad.value, null);
});

test('battle UI still uses bounded HP/MP ratios instead of fixed-width digit assumptions', () => {
  const src = fs.readFileSync(new URL('../js/screens/textBattle.js', import.meta.url), 'utf8');
  assert.match(src, /p\.hp\s*\/\s*p\.maxHp\s*\*\s*100/);
  assert.match(src, /p\.mp\s*\/\s*p\.maxMp\s*\*\s*100/);
  assert.doesNotMatch(src, /slice\([^)]*\).*hp/i);
});
