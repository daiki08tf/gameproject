import test from 'node:test';
import assert from 'node:assert/strict';
import { journeyName, VEIL_FRAGMENTS, discoveredVeilFragments, latestVeilFragment, veilWorldState } from '../js/data/worldVeil.js';

test('journey presentation hides internal chapter numbering', () => {
  assert.equal(journeyName({ name: '第1章 はじまりの平原' }), 'はじまりの平原');
  assert.equal(journeyName({ name: '第20章 始原の深淵' }), '始原の深淵');
  assert.equal(journeyName({ name: '月蝕の境界' }), '月蝕の境界');
});

test('Veil lore is discovered only through cleared journey milestones', () => {
  const cleared = new Set(['10-5', '15-5', '16-8']);
  const found = discoveredVeilFragments(id => cleared.has(id));
  assert.deepEqual(found.map(x => x.id), ['uneasy_world', 'broken_boundary', 'seven_hollows']);
  assert.equal(latestVeilFragment(id => cleared.has(id))?.id, 'seven_hollows');
});

test('The Veil name is withheld until the boundary journey reveals it', () => {
  const named = VEIL_FRAGMENTS.find(x => x.id === 'the_veil_named');
  assert.equal(named.unlockStageId, '19-8');
  for (const fragment of VEIL_FRAGMENTS.slice(0, VEIL_FRAGMENTS.indexOf(named))) {
    assert.equal(fragment.text.includes('The Veil'), false);
  }
});

test('final journey milestone changes the world state after the guardian truth', () => {
  const allCleared = id => VEIL_FRAGMENTS.some(fragment => fragment.unlockStageId === id);
  assert.equal(veilWorldState(allCleared), 'veil_breached');
  assert.equal(veilWorldState(() => false), 'quiet');
});
