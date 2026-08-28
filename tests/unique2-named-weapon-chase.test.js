import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';
import { getItem } from '../js/data/equipment.js';
import { unique2IdentityById } from '../js/data/unique2IdentityLibrary.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';

const phase8Weapons = BOUNTY_UNIQUES.filter((item) => item.phase8 && item.slot === 'weapon');
const mappedWeapons = BOUNTY_UNIQUES.filter((item) => item.slot === 'weapon' && item.unique2IdentityId);

test('Unique 2.0 Named weapons cover every existing weapon family at definition level', () => {
  assert.equal(phase8Weapons.length, 6, '8C should add only the six previously uncovered weapon families');
  assert.deepEqual(
    new Set(phase8Weapons.map((item) => item.weaponType)),
    new Set(['axe', 'bow', 'dagger', 'knuckle', 'instrument', 'rod']),
  );
  assert.deepEqual(
    new Set(mappedWeapons.map((item) => item.weaponType)),
    new Set(['sword', 'axe', 'staff', 'bow', 'dagger', 'knuckle', 'instrument', 'rod']),
    'existing sword/staff plus 8C additions should cover all eight families',
  );

  for (const item of mappedWeapons) {
    const identity = unique2IdentityById(item.unique2IdentityId);
    assert.ok(identity, `${item.id} references a missing Unique 2.0 identity`);
    assert.equal(identity.family, item.weaponType, `${item.id} identity family mismatch`);
    assert.ok(item.effects?.length, `${item.id} must keep a gameplay-changing FIXED identity`);
  }
});

test('8C Named weapons are content-ready but do not invent a distribution system', () => {
  for (const item of phase8Weapons) {
    assert.equal(item.distributionPending, true);
    assert.equal(item.bountyId, null);
    assert.equal(item.sourceStageId, undefined);
    assert.equal(item.currency, undefined);
    assert.equal(item.affixes, undefined, 'random Options belong to the instance layer, not the fixed Unique template');
    assert.equal(item.options, undefined, 'Unique FIXED identity must not consume random Option slots');
  }
});

test('duplicate 8C Named weapon drops become distinct instances with max-three random Options', () => {
  state.resetAll();
  state.data.nextInstanceSeq = 9100;

  for (const item of phase8Weapons) {
    const before = new Set(Object.keys(state.data.weaponInstances || {}));
    state.addItem(item.id, 2, { depth: 5000, elite: true, boss: true, itemPowerTarget: 10000 });
    const ids = Object.keys(state.data.weaponInstances || {}).filter((id) => !before.has(id) && id.startsWith(`${item.id}#`));
    assert.equal(ids.length, 2, `${item.id} duplicate chase must preserve two physical copies`);
    assert.notEqual(ids[0], ids[1]);

    for (const id of ids) {
      const inst = state.data.weaponInstances[id];
      assert.ok(inst, `${id} missing weapon instance data`);
      assert.ok(Array.isArray(inst.affixes));
      assert.ok(inst.affixes.length <= 3, `${id} exceeded max-three random Options`);
      const resolved = getItem(id);
      assert.equal(resolved?.id, item.id, `${id} must resolve back to the Named Unique template`);
      assert.equal(resolved?.unique2IdentityId, item.unique2IdentityId, `${id} lost its FIXED identity`);
      assert.deepEqual(resolved?.effects, item.effects, `${id} fixed effects changed when instanced`);
    }
  }
});
