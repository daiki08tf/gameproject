import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../js/patches/smartLoot4EquipmentUi.js', import.meta.url), 'utf8');
const fusion = readFileSync(new URL('../js/screens/equipmentFusion.js', import.meta.url), 'utf8');

test('Smart Loot 4 UI exposes compact Option query / rarity / level controls', () => {
  assert.match(ui, /Option検索/);
  assert.match(ui, /最低Optionレア/);
  assert.match(ui, /最低Option Lv/);
  assert.match(ui, /minOptionRarity/);
  assert.match(ui, /minOptionLevel/);
  assert.match(ui, /optionQuery/);
});

test('legacy visible Affix search is hidden rather than duplicated next to Option search', () => {
  assert.match(ui, /hideLegacyVisibleAffixField/);
  assert.match(ui, /first === 'Affix'/);
  assert.match(ui, /label\.hidden = true/);
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
