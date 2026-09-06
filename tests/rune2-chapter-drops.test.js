import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RUNE2_DEFS,
  runesForStage,
  runeSourceLabel,
  rune2ForgeCost,
  rune2Power,
} from '../js/data/runes2.js';

test('Rune 2.1 owns exactly one bounded, implemented Rune per Story chapter 1-36', () => {
  assert.equal(RUNE2_DEFS.length, 36);
  for (let chapter = 1; chapter <= 36; chapter++) {
    const defs = RUNE2_DEFS.filter((r) => r.chapter === chapter);
    assert.equal(defs.length, 1, `chapter ${chapter}`);
    assert.ok(defs[0].maxMarks > 0);
    assert.ok(defs[0].kind === 'statMult' || defs[0].effect);
    assert.ok(!defs[0].id.startsWith('ob_'));
  }
});

test('every numbered stage in one chapter points at that chapter Rune only', () => {
  assert.equal(runesForStage('1-1')[0]?.id, 'force');
  assert.equal(runesForStage('1-5')[0]?.id, 'force');
  assert.equal(runesForStage('14-B')[0]?.id, 'observe');
  assert.equal(runesForStage('36-1')[0]?.id, 'branch_point');
  assert.deepEqual(runesForStage('observedbranch-tree-sovereign-1'), []);
  assert.deepEqual(runesForStage('secret-old-king-tomb'), []);
});

test('Rune source labels describe chapters rather than World 3 regions', () => {
  assert.equal(runeSourceLabel(RUNE2_DEFS[0]), '第1章');
  assert.equal(runeSourceLabel(RUNE2_DEFS[35]), '第36章');
  for (const rune of RUNE2_DEFS) assert.equal(rune.regionId, undefined);
});

test('basic stats use the approved +1% per mark and stop at their explicit cap', () => {
  for (const id of ['force', 'ironclad', 'wise', 'notfall', 'spirit', 'godspeed']) {
    assert.equal(rune2Power(id, 1), .01);
    assert.equal(rune2Power(id, 100), 1);
    assert.equal(rune2Power(id, 99999), 1);
  }
});

test('every scalable special effect stays bounded beyond its maximum level', () => {
  for (const rune of RUNE2_DEFS.filter((r) => r.perMark)) {
    assert.equal(rune2Power(rune, rune.maxMarks), rune2Power(rune, 99999), rune.id);
  }
});

test('Blacksmith cost uses existing Gold and Manastone and cannot exceed max level', () => {
  const first = rune2ForgeCost('force', 1, 1);
  assert.deepEqual(first, { levels:1, gold:61, manastone:1 });
  assert.equal(rune2ForgeCost('force', 100, 1).levels, 0);
  const late = rune2ForgeCost('branch_point', 1, 1);
  assert.ok(late.gold > first.gold);
  assert.ok(late.manastone > first.manastone);
});

