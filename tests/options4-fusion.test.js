import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import {
  optionMaterialEfficiency,
  optionValueAtLevel,
} from '../js/data/options4.js';
import {
  optionXpToNext,
  optionMaterialXp,
  applyOptionFusionXp,
  optionFusionPreview,
} from '../js/data/options4Fusion.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';
import '../js/patches/equipment3GearFoundation.js';
import '../js/patches/options4Fusion.js';

function option(id, rarity = 'rare', level = 1, xp = 0, extra = {}) {
  return { id, familyId: id, rarity, level, xp, roll: 1, optionSchemaVersion: 1, ...extra };
}

function resetFusionState() {
  state.resetAll();
  state.data.gearInstances = {};
  state.data.weaponInstances = {};
  state.data.inventory = {};
  state.data.itemLocked = {};
  state.data.itemFavorite = {};
  state.data.equipped = { weapon: null, shield: null, head: null, body: null, accessory1: null, accessory2: null };
}

test('Option Fusion keeps the approved rarity-gap efficiencies', () => {
  assert.equal(optionMaterialEfficiency('rare', 'rare'), 1);
  assert.equal(optionMaterialEfficiency('rare', 'epic'), 1);
  assert.equal(optionMaterialEfficiency('ancient', 'mythic'), 0.8);
  assert.equal(optionMaterialEfficiency('ancient', 'legendary'), 0.6);
  assert.equal(optionMaterialEfficiency('ancient', 'epic'), 0.4);
  assert.equal(optionMaterialEfficiency('ancient', 'rare'), 0.2);
});

test('same-family low-rarity materials grant deterministic EXP while unrelated families grant none', () => {
  const target = option('atk_pct', 'legendary', 40);
  const low = option('atk_pct', 'common', 40);
  const wrong = option('def_pct', 'ancient', 90);
  const a = optionMaterialXp(target, low);
  const b = optionMaterialXp(target, low);
  assert.equal(a, b);
  assert.ok(a > 0);
  assert.equal(optionMaterialXp(target, wrong), 0);
  assert.equal(optionFusionPreview(target, wrong).reason, 'family_mismatch');
});

test('canonical aliases can feed their merged Option family', () => {
  const target = option('dmg_execution', 'legendary', 10);
  const legacyMaterial = { ...option('build_executioner', 'rare', 50), familyId: 'build_executioner' };
  assert.ok(optionMaterialXp(target, legacyMaterial) > 0);
});

test('fusion levels the target deterministically, recalculates roll, and never promotes rarity', () => {
  const needed = optionXpToNext(25);
  const target = option('atk_pct', 'legendary', 25, needed - 1);
  const next = applyOptionFusionXp(target, 2);
  assert.equal(next.level, 26);
  assert.equal(next.xp, 1);
  assert.equal(next.rarity, 'legendary');
  assert.equal(next.roll, optionValueAtLevel('atk_pct', 'legendary', 26, 1));
});

test('Option Lv hard-caps at 100 and discards overflow EXP', () => {
  const maxed = applyOptionFusionXp(option('hp_pct', 'mythic', 99, optionXpToNext(99) - 1), 999999);
  assert.equal(maxed.level, 100);
  assert.equal(maxed.xp, 0);
  assert.equal(maxed.rarity, 'mythic');
});

test('runtime consumes one matching material instance and upgrades the selected target Option', () => {
  resetFusionState();
  const targetId = 'target_gear#1';
  const materialId = 'material_gear#2';
  state.data.gearInstances[targetId] = {
    itemId: 'target_gear',
    affixes: [option('atk_pct', 'rare', 1, optionXpToNext(1) - 1)],
  };
  state.data.gearInstances[materialId] = {
    itemId: 'material_gear',
    affixes: [option('atk_pct', 'common', 80)],
  };
  state.data.inventory[targetId] = 1;
  state.data.inventory[materialId] = 1;

  const preview = state.optionFusionPreview(targetId, 0, materialId, 0);
  assert.equal(preview.ok, true);
  assert.ok(preview.xp > 0);
  const result = state.fuseEquipmentOption(targetId, 0, materialId, 0);
  assert.equal(result.ok, true);
  assert.ok(result.level >= 2);
  assert.equal(state.data.inventory[materialId], undefined);
  assert.equal(state.data.gearInstances[materialId], undefined);
  assert.equal(state.data.inventory[targetId], 1);
});

test('fusion material protection blocks locked favorite equipped and same-item consumption', () => {
  resetFusionState();
  const targetId = 'target_gear#10';
  const materialId = 'material_gear#11';
  state.data.gearInstances[targetId] = { itemId: 'target_gear', affixes: [option('def_pct', 'rare', 10)] };
  state.data.gearInstances[materialId] = { itemId: 'material_gear', affixes: [option('def_pct', 'rare', 10)] };
  state.data.inventory[targetId] = 1;
  state.data.inventory[materialId] = 1;

  assert.equal(state.optionFusionPreview(targetId, 0, targetId, 0).reason, 'same_item');

  state.data.itemLocked[materialId] = true;
  assert.equal(state.optionFusionPreview(targetId, 0, materialId, 0).reason, 'material_locked');
  delete state.data.itemLocked[materialId];

  state.data.itemFavorite[materialId] = true;
  assert.equal(state.optionFusionPreview(targetId, 0, materialId, 0).reason, 'material_favorite');
  delete state.data.itemFavorite[materialId];

  state.data.equipped.body = materialId;
  assert.equal(state.optionFusionPreview(targetId, 0, materialId, 0).reason, 'material_equipped');
  state.data.equipped.body = null;

  state.data.gearInstances[materialId].affixes[0] = option('hp_pct', 'ancient', 90);
  assert.equal(state.optionFusionPreview(targetId, 0, materialId, 0).reason, 'family_mismatch');
  assert.equal(state.data.inventory[materialId], 1);
});

test('main loads Option Fusion after generic gear instances exist', async () => {
  const fs = await import('node:fs');
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const gear = main.indexOf("./patches/equipment3GearFoundation.js");
  const fusion = main.indexOf("./patches/options4Fusion.js");
  assert.ok(gear > 0 && fusion > gear);
});
