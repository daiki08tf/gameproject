import test from 'node:test';
import assert from 'node:assert/strict';
import { AFFIXES } from '../js/data/affixes.js';
import {
  WEAPON_BUILD_LANES,
  WEAPON_BUILD_LANE_COUNT,
  bestWeaponBuildLanes,
  scoreWeaponBuildLane,
} from '../js/data/weaponBuildSynergy.js';

const FAMILIES = ['sword','axe','staff','bow','dagger','knuckle','instrument','rod'];

test('Phase 6C authors exactly three distinct build routes for every existing weapon family', () => {
  assert.equal(WEAPON_BUILD_LANE_COUNT, 24);
  assert.deepEqual(Object.keys(WEAPON_BUILD_LANES).sort(), [...FAMILIES].sort());
  for (const family of FAMILIES) {
    const lanes = WEAPON_BUILD_LANES[family];
    assert.equal(lanes.length, 3, family);
    assert.equal(new Set(lanes.map((x) => x.id)).size, 3, family);
    assert.ok(lanes.every((x) => x.jobs.length >= 1 && x.options.length >= 4 && x.play), family);
  }
});

test('every authored build route references live Option families only', () => {
  for (const [family, lanes] of Object.entries(WEAPON_BUILD_LANES)) {
    for (const lane of lanes) {
      for (const optionId of lane.options) {
        assert.ok(AFFIXES[optionId], `${family}/${lane.id}/${optionId}`);
      }
    }
  }
});

test('no weapon family collapses into one mandatory Option package', () => {
  for (const [family, lanes] of Object.entries(WEAPON_BUILD_LANES)) {
    const optionSets = lanes.map((lane) => new Set(lane.options));
    const intersection = [...optionSets[0]].filter((id) => optionSets.slice(1).every((set) => set.has(id)));
    assert.ok(intersection.length <= 1, `${family}: shared=${intersection.join(',')}`);
    const union = new Set(lanes.flatMap((lane) => lane.options));
    assert.ok(union.size >= 8, `${family}: only ${union.size} option families across 3 routes`);
  }
});

test('build-lane scoring is descriptive only and can identify multiple credible routes', () => {
  const poison = WEAPON_BUILD_LANES.dagger.find((x) => x.id === 'dagger_venom');
  const crit = WEAPON_BUILD_LANES.dagger.find((x) => x.id === 'dagger_trigger');
  assert.deepEqual(scoreWeaponBuildLane(poison, ['dot_dmg','dot_duration']), { hits:2, total:4, ratio:0.5 });
  assert.equal(scoreWeaponBuildLane(crit, ['dot_dmg','dot_duration']).hits, 0);

  const ranked = bestWeaponBuildLanes('dagger', ['crit_pct','crit_extra_hit','every_n_hits']);
  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].lane.id, 'dagger_trigger');
  assert.ok(ranked[0].hits >= 3);
});

test('Phase 6C data introduces no combat multiplier, currency, or progression state', () => {
  for (const lanes of Object.values(WEAPON_BUILD_LANES)) {
    for (const lane of lanes) {
      assert.equal('powerMult' in lane, false);
      assert.equal('bonus' in lane, false);
      assert.equal('currency' in lane, false);
      assert.equal('level' in lane, false);
    }
  }
});
