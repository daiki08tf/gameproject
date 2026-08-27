import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { AFFIXES } from '../js/data/affixes.js';
import { buildGearInstance, EQUIPMENT3_GEAR_SLOTS } from '../js/data/equipment3Gear.js';
import { getItem } from '../js/data/equipment.js';
import { state } from '../js/state.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';
import '../js/patches/equipment3GearFoundation.js';

test('armor and accessories receive deterministic Equipment 3.0 metadata', () => {
  for (const id of ['sh_aegis_l', 'hd_crown_l', 'bd_dragon_l', 'ac_relic_l']) {
    const item = getItem(id);
    const instanceId = `${id}#777`;
    const a = buildGearInstance(item, { itemPowerTarget: 5000 }, instanceId);
    const b = buildGearInstance(item, { itemPowerTarget: 5000 }, instanceId);
    assert.deepEqual(a, b);
    assert.ok(EQUIPMENT3_GEAR_SLOTS.includes(item.slot));
    assert.ok(a.itemPower >= 4500 && a.itemPower <= 5500);
    assert.equal(a.affixTier, Math.ceil(a.itemPower / 1000));
    assert.ok(a.affixes.length >= 2 && a.affixes.length <= 3);
    assert.ok(a.displayName.includes(item.name));
  }
});

test('slot bias makes shield rolls materially more defensive than accessories', () => {
  const shield = { id: 'sim_shield', name: '試験盾', slot: 'shield', rarity: 'legendary' };
  const accessory = { id: 'sim_accessory', name: '試験指輪', slot: 'accessory', rarity: 'legendary' };
  let shieldDefense = 0;
  let accessoryDefense = 0;
  let shieldTotal = 0;
  let accessoryTotal = 0;
  for (let i = 1; i <= 500; i += 1) {
    const s = buildGearInstance(shield, { itemPowerTarget: 5000 }, `shield#${i}`);
    const a = buildGearInstance(accessory, { itemPowerTarget: 5000 }, `accessory#${i}`);
    for (const affix of s.affixes) {
      shieldTotal += 1;
      if (AFFIXES[affix.id]?.category === 'DEFENSE') shieldDefense += 1;
    }
    for (const affix of a.affixes) {
      accessoryTotal += 1;
      if (AFFIXES[affix.id]?.category === 'DEFENSE') accessoryDefense += 1;
    }
  }
  assert.ok(shieldDefense / shieldTotal > accessoryDefense / accessoryTotal * 1.5);
});

test('non-weapon drops become unique instances and use the shared sequence namespace', () => {
  state.resetAll();
  state.data.nextInstanceSeq = 200;
  state.addItem('sh_iron_r', 2, { itemPowerTarget: 3000 });
  const ids = Object.keys(state.data.gearInstances || {}).filter((id) => id.startsWith('sh_iron_r#'));
  assert.deepEqual(ids.sort(), ['sh_iron_r#200', 'sh_iron_r#201']);
  assert.equal(state.data.inventory['sh_iron_r#200'], 1);
  assert.equal(state.data.inventory['sh_iron_r#201'], 1);
  assert.equal(state.data.nextInstanceSeq, 202);
});

test('equipped gear Affix stats and effects enter the canonical combat paths', () => {
  state.resetAll();
  state.data.gearInstances = {
    'ac_ring_n#900': {
      itemId: 'ac_ring_n', slot: 'accessory', itemPower: 5000, affixTier: 5,
      affixes: [
        { id: 'atk_pct', rarity: 'legendary', roll: 10 },
        { id: 'dmg_all', rarity: 'legendary', roll: 12 },
      ],
    },
  };
  state.data.equipped.accessory1 = 'ac_ring_n#900';
  const withAffix = state.getStats();
  const effects = state.getEquippedEffects();

  state.data.equipped.accessory1 = 'ac_ring_n';
  const legacy = state.getStats();
  assert.ok(withAffix.atk > legacy.atk);
  assert.ok(effects.some((e) => e.__affixId === 'dmg_all' && e.kind === 'dmgBonusAdd'));
});

test('integration order keeps gear before Smart Loot/Abyss and result visibility after weapon bridge', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const gear = main.indexOf("./patches/equipment3GearFoundation.js");
  const smart = main.indexOf("./patches/equipment3SmartLoot.js");
  const abyss = main.indexOf("./patches/equipment3AbyssEndgame.js");
  const weaponResult = main.indexOf("./patches/weaponAffixResultVisibility.js");
  const gearResult = main.indexOf("./patches/equipment3GearResultVisibility.js");
  assert.ok(gear > 0 && gear < smart && smart < abyss);
  assert.ok(weaponResult > 0 && gearResult > weaponResult);
});
