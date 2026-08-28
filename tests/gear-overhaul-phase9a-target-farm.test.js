import assert from 'node:assert/strict';
import { UNIQUE2_TARGET_FARM_PROFILES, applyUnique2TargetFarm } from '../js/data/gearOverhaulPhase9TargetFarm.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { buildRiftStage } from '../js/data/riftStages.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { bountyUniqueById } from '../js/data/uniqueEquipment.js';

const ids = UNIQUE2_TARGET_FARM_PROFILES.map(x => x.itemId);
assert.equal(UNIQUE2_TARGET_FARM_PROFILES.length, 6);
assert.equal(new Set(ids).size, 6);
for (const id of ids) {
  const item = bountyUniqueById(id);
  assert.ok(item, `missing Unique item ${id}`);
  assert.equal(item.slot, 'weapon');
  assert.equal(item.unique, true);
  assert.ok(item.unique2IdentityId);
}

const normal = applyUnique2TargetFarm({ id:'normal', dropTable:[] });
assert.equal(normal.dropTable.length, 0);
assert.equal(normal.unique2TargetFarm, undefined);

const abyss1200 = buildAbyssStage(1200, [], { routeId:'armory' });
assert.ok(abyss1200.dropTable.some(x => x.itemId === 'uq_u2_grimhead'));
assert.ok(!abyss1200.dropTable.some(x => x.itemId === 'uq_u2_alka'));
assert.ok(abyss1200.unique2TargetFarm.some(x => x.itemId === 'uq_u2_grimhead'));

const abyss1800 = buildAbyssStage(1800, [], { routeId:'armory' });
assert.ok(abyss1800.dropTable.some(x => x.itemId === 'uq_u2_grimhead'));
assert.ok(abyss1800.dropTable.some(x => x.itemId === 'uq_u2_alka'));

const wrongAbyssRoute = buildAbyssStage(1800, [], { routeId:'blood_mist' });
assert.ok(!wrongAbyssRoute.dropTable.some(x => ids.includes(x.itemId)));

const baseKey = {
  id:'test', name:'test', recLevel:5000, itemPowerTarget:8000,
  dangers:[], reward:'treasure', dangerScore:0,
};
const windRift = buildRiftStage({ ...baseKey, id:'wind', element:'wind' });
assert.ok(windRift.dropTable.some(x => x.itemId === 'uq_u2_asterion'));
assert.ok(!windRift.dropTable.some(x => x.itemId === 'uq_u2_miasma'));

const poisonRift = buildRiftStage({ ...baseKey, id:'poison', element:'poison' });
assert.ok(poisonRift.dropTable.some(x => x.itemId === 'uq_u2_miasma'));
assert.ok(!poisonRift.dropTable.some(x => x.itemId === 'uq_u2_asterion'));

const fireRift = buildRiftStage({ ...baseKey, id:'fire', element:'fire' });
assert.ok(!fireRift.dropTable.some(x => x.itemId === 'uq_u2_asterion' || x.itemId === 'uq_u2_miasma'));

const library = buildSecretRealmStage('secret-inverted-library');
assert.ok(library, 'inverted library must exist');
assert.ok(library.dropTable.some(x => x.itemId === 'uq_u2_cadenza'));

const eighthFinal = buildSecretRealmStage('secret-eighth-key-3');
assert.ok(eighthFinal?.phase9EighthKeyFinal);
assert.ok(eighthFinal.dropTable.some(x => x.itemId === 'uq_u2_seraphim'));

const eighthFirst = buildSecretRealmStage('secret-eighth-key-1');
assert.ok(!eighthFirst.dropTable.some(x => x.itemId === 'uq_u2_seraphim'));

for (const profile of UNIQUE2_TARGET_FARM_PROFILES) {
  assert.ok(profile.weight > 0 && profile.weight <= 0.12, `${profile.id} weight out of target-farm envelope`);
}

console.log('Gear Overhaul Phase 9A target-farm tests passed');
