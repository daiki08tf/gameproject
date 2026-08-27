import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';
import '../js/patches/equipment3Blacksmith.js';
import { isOption4CraftingOption } from '../js/patches/gearOverhaulCraftingConsolidation.js';

function reset() {
  state.resetAll();
  state.data.weaponInstances = {};
  state.data.inventory = {};
  state.data.gold = 999999;
  state.data.weaponEssence = 999;
  state.data.manastone = 999;
}

function option(extra = {}) {
  return {
    id: 'atk_pct', familyId: 'atk_pct', rarity: 'legendary', level: 60, xp: 123,
    roll: 18, optionSchemaVersion: 1, optionValueVersion: 2, greater: false,
    ...extra,
  };
}

test('Option 4.0 retires numeric Temper and crafted Greater without altering the Option', () => {
  reset();
  const id = 'wp_sword_n#999';
  state.data.weaponInstances[id] = { itemId: 'wp_sword_n', affixes: [option()] };
  state.data.inventory[id] = 1;
  const before = structuredClone(state.data.weaponInstances[id].affixes[0]);

  assert.equal(isOption4CraftingOption(before), true);
  assert.equal(state.equipment3TemperAffix(id, 0), false);
  assert.equal(state.equipment3AscendAffix(id, 0), false);
  assert.deepEqual(state.data.weaponInstances[id].affixes[0], before);
});

test('existing drop Greater identity is preserved rather than stripped', () => {
  reset();
  const id = 'wp_sword_n#1000';
  state.data.weaponInstances[id] = { itemId: 'wp_sword_n', affixes: [option({ greater: true, baseRoll: 12, roll: 18 })] };
  state.data.inventory[id] = 1;
  assert.equal(state.data.weaponInstances[id].affixes[0].greater, true);
  assert.equal(state.equipment3TemperAffix(id, 0), false);
  assert.equal(state.equipment3AscendAffix(id, 0), false);
  assert.equal(state.data.weaponInstances[id].affixes[0].greater, true);
});

test('Phase 3A patch is loaded after the legacy blacksmith through Option Fusion runtime', async () => {
  const fs = await import('node:fs');
  const source = fs.readFileSync(new URL('../js/patches/options4Fusion.js', import.meta.url), 'utf8');
  assert.match(source, /gearOverhaulCraftingConsolidation\.js/);
  const consolidation = fs.readFileSync(new URL('../js/patches/gearOverhaulCraftingConsolidation.js', import.meta.url), 'utf8');
  assert.match(consolidation, /値＝Option Lv/);
  assert.match(consolidation, /★ドロップ限定/);
});
