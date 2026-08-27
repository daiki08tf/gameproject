import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../js/patches/smartLoot4EquipmentUi.js', import.meta.url), 'utf8');
const fusion = readFileSync(new URL('../js/screens/equipmentFusion.js', import.meta.url), 'utf8');
const equipmentScreen = readFileSync(new URL('../js/screens/equipment.js', import.meta.url), 'utf8');

test('Smart Loot 4 UI exposes compact Option query / rarity / level controls', () => {
  assert.match(ui, /Option検索/);
  assert.match(ui, /最低Optionレア/);
  assert.match(ui, /最低Option Lv/);
  assert.match(ui, /minOptionRarity/);
  assert.match(ui, /minOptionLevel/);
  assert.match(ui, /optionQuery/);
});

test('Phase 5D removed the legacy visible Affix search field at the source instead of hiding it at runtime', () => {
  // The field used to live in equipment.js and get hidden via a runtime patch
  // (hideLegacyVisibleAffixField). Phase 5D deletes it outright now that
  // Option検索 fully covers the same query, so there is nothing left to hide.
  assert.doesNotMatch(equipmentScreen, /makeFilterField\('Affix'/);
  assert.doesNotMatch(ui, /hideLegacyVisibleAffixField/);
});

test('Option filters contribute to the existing advanced-filter badge', () => {
  assert.match(ui, /activeOptionFilterCount/);
  assert.match(ui, /syncAdvancedBadge/);
  assert.match(ui, /⚙ 詳細/);
});

test('Equipment Fusion wrapper installs Smart Loot 4 controls without a new route', () => {
  assert.match(fusion, /decorateSmartLoot4Filters/);
  assert.match(fusion, /lootFilterRow/);
  assert.doesNotMatch(fusion, /showScreen\(['"]smartLoot/);
});
