import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { state } from '../js/state.js';
import { getItem } from '../js/data/equipment.js';
import { EQUIPMENT3_SETS, SET_EQUIPMENT, setDropsForDepth } from '../js/data/equipment3Sets.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';
import '../js/patches/equipment3GearFoundation.js';
import '../js/patches/equipment3UniqueGearSafety.js';
import '../js/patches/equipment3SetBonuses.js';

test('Phase 1 five fixed three-piece Sets remain intact while later Sets can extend the registry', () => {
  const phase1Ids = ['blood_king', 'ancient_dragon', 'star_weaver', 'abyss_walker', 'executioner'];
  assert.ok(Object.keys(EQUIPMENT3_SETS).length >= phase1Ids.length);
  for (const setId of phase1Ids) {
    assert.ok(EQUIPMENT3_SETS[setId]);
    const pieces = SET_EQUIPMENT.filter((item) => item.setId === setId);
    assert.equal(pieces.length, 3);
    assert.ok(pieces.every((item) => item.fixedSet && item.rarity === 'mythic'));
    assert.ok(pieces.every((item) => getItem(item.id)?.setId === setId));
  }
  for (const setId of Object.keys(EQUIPMENT3_SETS)) {
    assert.equal(SET_EQUIPMENT.filter((item) => item.setId === setId).length, 3);
  }
});

test('fixed Set gear stays canonical instead of becoming random gear instances', () => {
  state.resetAll();
  state.data.gearInstances = {};
  const seq = state.data.nextInstanceSeq;
  state.addItem('set_blood_head', 1, { itemPowerTarget: 9000, boss: true });
  assert.equal(state.data.inventory.set_blood_head, 1);
  assert.equal(Object.keys(state.data.gearInstances).length, 0);
  assert.equal(state.data.nextInstanceSeq, seq);
});

test('Set thresholds count distinct piece IDs, not duplicate accessories', () => {
  state.resetAll();
  state.data.equipped = {
    weapon: 'wp_sword_n', shield: null, head: 'set_blood_head', body: null,
    accessory1: 'set_blood_accessory', accessory2: 'set_blood_accessory',
  };
  assert.equal(state.equipmentSetCounts().blood_king, 2);
  let active = state.activeEquipmentSetBonuses().filter((b) => b.setId === 'blood_king');
  assert.deepEqual(active.map((b) => b.threshold), [2]);

  state.data.equipped.body = 'set_blood_body';
  active = state.activeEquipmentSetBonuses().filter((b) => b.setId === 'blood_king');
  assert.deepEqual(active.map((b) => b.threshold), [2, 3]);
  const effects = state.getEquippedEffects().filter((e) => e.__equipment3Set === 'blood_king');
  assert.ok(effects.some((e) => e.kind === 'dmgBonusAdd' && e.__setThreshold === 3));
});

test('Abyss Set loot unlocks at milestones and keeps older sets obtainable', () => {
  assert.equal(setDropsForDepth(249).length, 0);
  assert.ok(setDropsForDepth(250).some((d) => d.itemId === 'set_blood_head'));
  assert.ok(!setDropsForDepth(899).some((d) => d.itemId === 'set_star_head'));
  assert.ok(setDropsForDepth(900).some((d) => d.itemId === 'set_star_head'));
  const deep = setDropsForDepth(2200, true);
  assert.ok(deep.some((d) => d.itemId === 'set_executioner_head'));
  assert.ok(deep.some((d) => d.itemId === 'set_blood_head'));
});

test('Abyss stage table exposes milestone Set drops', () => {
  const before = buildAbyssStage(249);
  const unlocked = buildAbyssStage(250);
  assert.ok(!before.dropTable.some((d) => d.itemId.startsWith('set_')));
  assert.ok(unlocked.dropTable.some((d) => d.itemId === 'set_blood_head'));
});

test('Set runtime loads after fixed-gear safety and before Smart Loot', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const safety = main.indexOf('./patches/equipment3UniqueGearSafety.js');
  const sets = main.indexOf('./patches/equipment3SetBonuses.js');
  const smart = main.indexOf('./patches/equipment3SmartLoot.js');
  assert.ok(safety > 0 && safety < sets && sets < smart);
});
