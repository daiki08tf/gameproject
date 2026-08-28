import assert from 'node:assert/strict';
import {
  UNIQUE2_WEAPON_IDENTITIES,
  UNIQUE2_WEAPON_FAMILY_COUNT,
  UNIQUE2_WEAPON_IDENTITY_COUNT,
  unique2IdentityById,
} from '../js/data/unique2IdentityLibrary.js';
import { WEAPON_BUILD_LANES, weaponBuildLaneById } from '../js/data/weaponBuildSynergy.js';
import { WEAPON_TYPES } from '../js/data/weaponTypes.js';

const familyIds = Object.keys(WEAPON_TYPES);
assert.equal(UNIQUE2_WEAPON_FAMILY_COUNT, 8, 'Unique 2.0 must cover the existing 8 mastery families');
assert.deepEqual(Object.keys(UNIQUE2_WEAPON_IDENTITIES).sort(), familyIds.sort(), 'Unique 2.0 families must match live weapon families exactly');
assert.ok(UNIQUE2_WEAPON_IDENTITY_COUNT >= 16, 'each family should begin with multiple Unique identity recipes');

const ids = new Set();
for (const [family, entries] of Object.entries(UNIQUE2_WEAPON_IDENTITIES)) {
  assert.ok(entries.length >= 2, `${family} needs at least two distinct Unique identities`);
  assert.ok(Array.isArray(WEAPON_BUILD_LANES[family]) && WEAPON_BUILD_LANES[family].length >= 3, `${family} must retain multiple build routes`);

  for (const entry of entries) {
    assert.equal(entry.family, family);
    assert.ok(entry.id && entry.name && entry.loop);
    assert.equal(entry.consumesOptionSlot, false, `${entry.id} FIXED identity must stay outside random Options`);
    assert.equal(entry.optionFusionEligible, false, `${entry.id} FIXED identity must not enter Option Fusion`);
    assert.ok(entry.effects.length >= 1, `${entry.id} needs a gameplay effect`);
    assert.ok(entry.buildLaneIds.length >= 1, `${entry.id} needs an existing build-lane connection`);
    assert.ok(!ids.has(entry.id), `duplicate Unique 2.0 identity id: ${entry.id}`);
    ids.add(entry.id);
    assert.equal(unique2IdentityById(entry.id), entry);

    for (const laneId of entry.buildLaneIds) {
      const lane = weaponBuildLaneById(laneId);
      assert.ok(lane, `${entry.id} references missing build lane ${laneId}`);
      assert.ok(WEAPON_BUILD_LANES[family].includes(lane), `${entry.id} must reference a lane from ${family}`);
    }
  }
}

// Phase 8B is an authored recipe layer only: no drop source / currency / save root.
const source = JSON.stringify(UNIQUE2_WEAPON_IDENTITIES);
assert.ok(!source.includes('currency'));
assert.ok(!source.includes('sourceStageId'));
assert.ok(!source.includes('bountyId'));

console.log(`Unique 2.0 identity library: ${UNIQUE2_WEAPON_IDENTITY_COUNT} identities across ${UNIQUE2_WEAPON_FAMILY_COUNT} families`);
