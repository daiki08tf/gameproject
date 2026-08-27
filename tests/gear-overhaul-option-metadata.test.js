import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGearInstance } from '../js/data/equipment3Gear.js';
import { getItem } from '../js/data/equipment.js';
import { state } from '../js/state.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';

test('new armor/accessory Options carry stable family, rarity, level and xp metadata', () => {
  const item = getItem('bd_dragon_l');
  const inst = buildGearInstance(item, { itemPowerTarget: 5000 }, 'bd_dragon_l#option-meta');
  assert.ok(inst.affixes.length >= 2 && inst.affixes.length <= 3);
  for (const option of inst.affixes) {
    assert.equal(option.familyId, option.id);
    assert.equal(option.optionSchemaVersion, 1);
    assert.equal(option.level, 1);
    assert.equal(option.xp, 0);
    assert.equal(typeof option.rarity, 'string');
    assert.equal(Number.isFinite(option.roll), true);
  }
});

test('new weapon Options carry metadata without changing the existing combat roll field', () => {
  state.resetAll();
  state.data.nextInstanceSeq = 810;
  state.addItem('ch30_weapon', 1, { depth: 5000, boss: true, itemPowerTarget: 10000 });
  const inst = state.data.weaponInstances['ch30_weapon#810'];
  assert.ok(inst);
  assert.ok(inst.affixes.length <= 3);
  for (const option of inst.affixes) {
    assert.equal(option.familyId, option.id);
    assert.equal(option.optionSchemaVersion, 1);
    assert.equal(option.level, 1);
    assert.equal(option.xp, 0);
    assert.equal(Number.isFinite(option.roll), true);
  }
});

test('Option metadata is additive: legacy roll remains authoritative during Phase 1', () => {
  const item = getItem('sh_aegis_l');
  const inst = buildGearInstance(item, { itemPowerTarget: 5000 }, 'sh_aegis_l#roll-compat');
  assert.ok(inst.affixes.every(option => Number.isFinite(option.roll)));
});
