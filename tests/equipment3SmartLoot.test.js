import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  normalizeLootFilter3,
  equipment3FilterMatches,
  smartLootReasons,
  shouldAutoLockEquipment,
} from '../js/data/equipment3SmartLoot.js';

const weapon = { id: 'wp_test', slot: 'weapon', rarity: 'legendary', weaponType: 'sword' };
const armor = { id: 'armor_test', slot: 'body', rarity: 'epic' };
const jackpot = {
  itemPower: 4321,
  greaterAffixCount: 2,
  legendaryEffectId: 'legend_test',
  curseId: null,
  affixes: [{ id: 'atk_pct', familyId: 'atk_pct', rarity: 'legendary', level: 40, roll: 0.2 }],
};

test('Loot Filter 3.0 normalizes legacy rarity-only saves', () => {
  const filter = normalizeLootFilter3({ minRarity: 'rare' });
  assert.equal(filter.minRarity, 'rare');
  assert.equal(filter.minItemPower, 0);
  assert.equal(filter.minGreater, 0);
  assert.equal(filter.weaponType, 'all');
  assert.equal(filter.optionQuery, '');
  assert.equal(filter.minOptionRarity, 'any');
  assert.equal(filter.minOptionLevel, 0);
  assert.equal(filter.autoLock.enabled, true);
  assert.equal(filter.autoLock.legendary, true);
  assert.equal(filter.autoLock.cursed, true);
  assert.equal(filter.autoLock.minGreater, 2);
});

test('advanced weapon filters can combine IP, Greater, Legendary and weapon type', () => {
  const filter = normalizeLootFilter3({
    minRarity: 'rare',
    minItemPower: 4000,
    minGreater: 2,
    legendaryOnly: true,
    weaponType: 'sword',
  });
  assert.equal(equipment3FilterMatches(weapon, jackpot, filter), true);
  assert.equal(equipment3FilterMatches(weapon, { ...jackpot, itemPower: 3999 }, filter), false);
  assert.equal(equipment3FilterMatches({ ...weapon, weaponType: 'axe' }, jackpot, filter), false);
  assert.equal(equipment3FilterMatches(weapon, { ...jackpot, legendaryEffectId: null }, filter), false);
});

test('Phase 5 Smart Loot detailed filters apply to armor/accessories too while weapon type remains weapon-only', () => {
  const filter = normalizeLootFilter3({ minRarity: 'rare', minItemPower: 4000, legendaryOnly: true });
  assert.equal(equipment3FilterMatches(armor, jackpot, filter), true);
  assert.equal(equipment3FilterMatches(armor, { ...jackpot, itemPower: 3999 }, filter), false);
  assert.equal(equipment3FilterMatches(armor, null, filter), false);

  const weaponTypeFilter = normalizeLootFilter3({ minRarity: 'rare', weaponType: 'sword' });
  assert.equal(equipment3FilterMatches(armor, jackpot, weaponTypeFilter), true);
});

test('Smart Loot defaults protect build-defining or rare-risk weapon rolls', () => {
  const filter = normalizeLootFilter3({ minRarity: 'normal' });
  const reasons = smartLootReasons(weapon, jackpot, filter);
  assert.ok(reasons.includes('Legendary Power'));
  assert.ok(reasons.some((r) => r.startsWith('Greater×')));
  assert.equal(shouldAutoLockEquipment(weapon, jackpot, filter), true);

  const cursed = { ...jackpot, legendaryEffectId: null, greaterAffixCount: 0, curseId: 'curse_test' };
  assert.ok(smartLootReasons(weapon, cursed, filter).includes('Curse'));
  assert.equal(shouldAutoLockEquipment(weapon, cursed, filter), true);

  const ordinary = { ...jackpot, legendaryEffectId: null, greaterAffixCount: 0, curseId: null };
  assert.equal(shouldAutoLockEquipment(weapon, ordinary, filter), false);
});

test('Smart Loot supports optional IP threshold and can be disabled', () => {
  const ipFilter = normalizeLootFilter3({ autoLock: { legendary: false, cursed: false, minGreater: 0, minItemPower: 3000 } });
  assert.equal(shouldAutoLockEquipment(weapon, { ...jackpot, legendaryEffectId: null, greaterAffixCount: 0, itemPower: 3500 }, ipFilter), true);

  const off = normalizeLootFilter3({ autoLock: { enabled: false } });
  assert.equal(shouldAutoLockEquipment(weapon, jackpot, off), false);
});

test('E8 runtime loads after Equipment 3.0 roll packages and equipment UI uses instance-aware filtering', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const equipment = fs.readFileSync(new URL('../js/screens/equipment.js', import.meta.url), 'utf8');
  const legendary = main.indexOf("./patches/equipment3Legendary.js");
  const blacksmith = main.indexOf("./patches/equipment3Blacksmith.js");
  const smart = main.indexOf("./patches/equipment3SmartLoot.js");
  assert.ok(legendary >= 0 && blacksmith > legendary && smart > blacksmith);
  assert.match(equipment, /state\.passesLootFilter\(c\.id, getItem\(c\.id\)\)/);
  assert.match(equipment, /Smart Loot 自動保護/);
  assert.match(equipment, /applySmartLootLocks/);
});
