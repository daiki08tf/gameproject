import test from 'node:test';
import assert from 'node:assert/strict';
import { RUNE2_DEFS, runesForStage, runeSourceLabel } from '../js/data/runes2.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';

// Previously all 18 base Rune 2.0 defs were pinned to one or two exact stage
// ids, all inside chapters 1-15 — so chapters 16-36 (more than half the
// story, including all of The Veil onward) produced zero rune drops no
// matter how much a player played there. This reassigns each base rune to a
// World 3.0 travel region (existing authority, js/data/world3Regions.js) so
// ANY stage clear within that region's chapters is drop-eligible, not just
// one specific stage — and spreads the 18 runes across all 9 regions so
// chapters 1-36 are all viable, ongoing rune-hunting destinations.

test('every base Rune 2.0 def is tied to a real World 3.0 region, not a bare stage id', () => {
  const baseRunes = RUNE2_DEFS.filter(r => !r.id.startsWith('ob_'));
  for (const rune of baseRunes) {
    assert.ok(rune.regionId, `${rune.id} must declare a regionId`);
    assert.ok(WORLD3_REGIONS.some(region => region.id === rune.regionId), `${rune.id}'s regionId must be a real World 3.0 region`);
    assert.ok(!Array.isArray(rune.stageIds), `${rune.id} must not also carry a legacy stageIds list`);
  }
});

test('every World 3.0 region (chapters 1-36, no gaps) has at least one rune assigned', () => {
  for (const region of WORLD3_REGIONS) {
    const assigned = RUNE2_DEFS.filter(r => r.regionId === region.id);
    assert.ok(assigned.length > 0, `region ${region.id} (${region.name}) must have at least one rune`);
  }
});

test('runesForStage matches by region: any stage in the same region yields the same region runes', () => {
  // ch1 and ch4 both sit in the frontier region (chapters 1-4).
  const first = runesForStage('1-5').map(r => r.id).sort();
  const last = runesForStage('4-2').map(r => r.id).sort();
  assert.deepEqual(first, last);
  assert.ok(first.includes('force'));
  assert.ok(first.includes('ironclad'));
});

test('late-game chapters (16-36) are now real rune-hunting destinations', () => {
  assert.ok(runesForStage('16-1').some(r => r.id === 'swift'));
  assert.ok(runesForStage('25-8').some(r => r.id === 'gold'));
  assert.ok(runesForStage('30-4').some(r => r.id === 'challenge'));
  assert.ok(runesForStage('36-1').some(r => r.id === 'fate'));
});

test('Observed Branch M5 runes keep exact-stage matching (they sit outside the chapter/region numbering)', () => {
  const ob = RUNE2_DEFS.filter(r => r.id.startsWith('ob_'));
  for (const rune of ob) {
    assert.ok(Array.isArray(rune.stageIds) && rune.stageIds.length > 0, `${rune.id} must keep an explicit stageIds list`);
    assert.ok(!rune.regionId, `${rune.id} must not also carry a regionId`);
  }
});

test('runeSourceLabel shows a region name for base runes and the stage list for Observed Branch runes', () => {
  const force = RUNE2_DEFS.find(r => r.id === 'force');
  assert.match(runeSourceLabel(force), /開拓辺境/);
  const obVerdant = RUNE2_DEFS.find(r => r.id === 'ob_verdant');
  assert.equal(runeSourceLabel(obVerdant), 'observedbranch-tree-sovereign-1');
});
