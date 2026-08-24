import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGearInstance } from '../js/data/equipment3Gear.js';
import { getItem } from '../js/data/equipment.js';
import { state } from '../js/state.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';
import '../js/patches/equipment3GearFoundation.js';

test('high-IP armor/accessory pool can roll Legendary and Cursed packages', () => {
  const item = { ...getItem('ac_relic_l'), rarity: 'mythic' };
  let legendary = null;
  let cursed = null;
  for (let i = 1; i <= 500 && (!legendary || !cursed); i += 1) {
    const inst = buildGearInstance(item, { itemPowerTarget: 10000, nemesis: true }, `gear-special#${i}`);
    if (inst.legendaryEffectId && !legendary) legendary = inst;
    if (inst.curseId && !cursed) cursed = inst;
  }
  assert.ok(legendary, 'expected at least one Legendary package in deterministic high-end sample');
  assert.ok(cursed, 'expected at least one Cursed package in deterministic high-end sample');
  assert.match(legendary.displayName, /《.+》/);
  assert.match(cursed.displayName, /【呪:.+】/);
});

test('gear Legendary effects and Curse penalties share canonical combat paths', () => {
  state.resetAll();
  state.data.gearInstances = {
    'ac_ring_n#950': {
      itemId: 'ac_ring_n', slot: 'accessory', itemPower: 9000, affixTier: 9,
      affixes: [], legendaryEffectId: 'thunderheart', curseId: 'blood_contract',
    },
  };
  state.data.equipped.accessory1 = 'ac_ring_n#950';
  const cursedStats = state.getStats();
  const effects = state.getEquippedEffects();

  state.data.equipped.accessory1 = 'ac_ring_n';
  const normalStats = state.getStats();

  assert.ok(cursedStats.hp < normalStats.hp);
  assert.ok(effects.some((e) => e.__equipment3GearSpecial === 'thunderheart' && e.kind === 'critExtraAttack'));
  assert.ok(effects.some((e) => e.__equipment3GearCurse === 'blood_contract' && e.kind === 'dmgBonusAdd'));
});

test('gear power score accounts for upside and downside packages', () => {
  state.resetAll();
  state.data.gearInstances = {
    'ac_ring_n#951': { itemId: 'ac_ring_n', slot: 'accessory', itemPower: 8000, affixTier: 8, affixes: [], legendaryEffectId: 'thunderheart', curseId: null },
    'ac_ring_n#952': { itemId: 'ac_ring_n', slot: 'accessory', itemPower: 8000, affixTier: 8, affixes: [], legendaryEffectId: null, curseId: null },
  };
  assert.ok(state.gearItemPower('ac_ring_n#951') > state.gearItemPower('ac_ring_n#952'));
});
