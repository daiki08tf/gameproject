import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { state } from '../js/state.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';
import '../js/patches/equipment3GearFoundation.js';
import '../js/patches/equipment3UniqueGearSafety.js';

test('fixed Unique shield remains a canonical item instead of a random gear instance', () => {
  state.resetAll();
  state.data.gearInstances = {};
  const seq = state.data.nextInstanceSeq;
  state.addItem('uq_ash_knight_shield', 1, { itemPowerTarget: 8000, boss: true });
  assert.equal(state.data.inventory.uq_ash_knight_shield, 1);
  assert.equal(Object.keys(state.data.gearInstances).length, 0);
  assert.equal(state.data.nextInstanceSeq, seq);
});

test('fixed Unique accessory remains canonical and stack-safe', () => {
  state.resetAll();
  state.data.gearInstances = {};
  state.addItem('uq_omega_core', 2, { itemPowerTarget: 10000, nemesis: true });
  assert.equal(state.data.inventory.uq_omega_core, 2);
  assert.equal(Object.keys(state.data.gearInstances).length, 0);
});

test('ordinary armor still enters Equipment 3.0 random instance generation', () => {
  state.resetAll();
  state.data.gearInstances = {};
  state.addItem('sh_iron_r', 1, { itemPowerTarget: 3000 });
  assert.equal(Object.keys(state.data.gearInstances).length, 1);
  assert.equal(state.data.inventory.sh_iron_r, undefined);
});

test('Unique safety loads directly after gear foundation and before Smart Loot', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const gear = main.indexOf("./patches/equipment3GearFoundation.js");
  const unique = main.indexOf("./patches/equipment3UniqueGearSafety.js");
  const smart = main.indexOf("./patches/equipment3SmartLoot.js");
  assert.ok(gear > 0 && gear < unique && unique < smart);
});
