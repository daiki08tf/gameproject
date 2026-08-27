import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeLootFilter3 } from '../js/data/equipment3SmartLoot.js';

const equipmentScreen = fs.readFileSync(new URL('../js/screens/equipment.js', import.meta.url), 'utf8');
const ui = fs.readFileSync(new URL('../js/patches/smartLoot4EquipmentUi.js', import.meta.url), 'utf8');

test('Phase 5D removes the legacy Legendary/Curse/Greater/Affix auto-lock fields the Smart Loot PROTECT panel replaced', () => {
  // Only ON and IP remain as plain fields in the Smart Loot (autoLock) section
  // of equipment.js; Legendary/Curse/Greater/Affix moved into the compact
  // PROTECT panel added by decorateProtectionControls in Phase 5B. The
  // top-level visible filter keeps its own unrelated Greater/Legendaryのみ/
  // Curseのみ fields (filter.minGreater / filter.legendaryOnly / filter.cursedOnly),
  // so assert against the autoLock-bound versions specifically.
  assert.doesNotMatch(equipmentScreen, /autoLock: { legendary: value }/);
  assert.doesNotMatch(equipmentScreen, /autoLock: { cursed: value }/);
  assert.doesNotMatch(equipmentScreen, /autoLock: { minGreater: Number\(value\) }/);
  assert.doesNotMatch(equipmentScreen, /autoLock: { affixQuery: value }/);
  assert.match(equipmentScreen, /makeFilterField\('ON',/);
  assert.match(equipmentScreen, /autoLock: { minItemPower: value }/);
});

test('Phase 5D removes the now-unused runtime hide functions along with their source fields', () => {
  assert.doesNotMatch(ui, /hideLegacyVisibleAffixField/);
  assert.doesNotMatch(ui, /hideLegacyProtectionFields/);
});

test('Phase 5 Smart Loot 4.0 defaults remain stable after Phase 5D cleanup', () => {
  const filter = normalizeLootFilter3({});
  assert.equal(filter.autoLock.protectAncientOption, true);
  assert.equal(filter.autoLock.protectHighLevelOption, true);
  assert.equal(filter.autoLock.minOptionRarity, 'ancient');
  assert.equal(filter.autoLock.minOptionLevel, 80);
  assert.equal(filter.autoLock.minGreater, 2);
});

test('old lootFilter3 saves with legacy Affix-only fields still normalize without throwing', () => {
  // A save from before Phase 5A/5D only ever wrote affixQuery, never
  // optionQuery or the split protection flags. Cleanup must not break this.
  const legacySave = {
    minRarity: 'rare',
    affixQuery: 'crit',
    autoLock: { affixQuery: 'crit', protectFusionMaterials: false },
  };
  const filter = normalizeLootFilter3(legacySave);
  assert.equal(filter.optionQuery, 'crit');
  assert.equal(filter.autoLock.optionQuery, 'crit');
  assert.equal(filter.autoLock.protectAncientOption, false);
  assert.equal(filter.autoLock.protectHighLevelOption, false);
});
