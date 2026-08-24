import test from 'node:test';
import assert from 'node:assert/strict';
import { ABYSS_ROUTES, abyssRouteChoices } from '../js/data/abyssRoutes.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { findStage } from '../js/data/stages.js';

test('Abyss 3.0 route choices are deterministic and expose 2/3 paths by world state', () => {
  const before = abyssRouteChoices(37, { veilBreached: false });
  const beforeAgain = abyssRouteChoices(37, { veilBreached: false });
  assert.equal(before.length, 2);
  assert.deepEqual(before.map(r => r.id), beforeAgain.map(r => r.id));
  assert.ok(before.every(r => !r.veilOnly));

  const after = abyssRouteChoices(37, { veilBreached: true });
  assert.equal(after.length, 3);
  assert.equal(new Set(after.map(r => r.id)).size, 3);
});

test('every tenth post-Veil floor offers the boundary fracture route', () => {
  const choices = abyssRouteChoices(40, { veilBreached: true });
  assert.ok(choices.some(r => r.id === 'veil_fracture'));
});

test('selected route changes actual risk/reward multipliers and gets a persistent route id', () => {
  const base = buildAbyssStage(73);
  const armory = buildAbyssStage(73, [], { routeId: 'armory' });
  assert.equal(armory.abyssRoute.id, 'armory');
  assert.equal(armory.id, 'abyss-73~armory');
  assert.ok(armory.enemyDefMult > base.enemyDefMult);
  assert.ok(armory.dropMult > base.dropMult);
});

test('route-bearing Abyss stage ids round-trip through findStage for BattleEngine', () => {
  for (const route of ABYSS_ROUTES) {
    const original = buildAbyssStage(91, [], { routeId: route.id });
    const found = findStage(original.id);
    assert.ok(found?.stage);
    assert.equal(found.stage.abyssDepth, 91);
    assert.equal(found.stage.abyssRoute?.id, route.id);
    assert.equal(found.stage.id, original.id);
  }
});

test('legacy plain abyss ids remain compatible', () => {
  const found = findStage('abyss-12');
  assert.ok(found?.stage);
  assert.equal(found.stage.abyssDepth, 12);
  assert.equal(found.stage.abyssRoute, null);
  assert.equal(found.stage.id, 'abyss-12');
});
