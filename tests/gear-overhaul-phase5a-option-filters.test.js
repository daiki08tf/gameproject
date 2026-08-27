import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeLootFilter3,
  equipment3FilterMatches,
  optionFilterMatches,
} from '../js/data/equipment3SmartLoot.js';

function option(id, rarity, level, descName = id) {
  return { id, familyId: id, rarity, level, roll: 1, name: descName };
}

const armor = { id: 'armor_test', slot: 'body', rarity: 'mythic' };
const accessory = { id: 'acc_test', slot: 'accessory', rarity: 'mythic' };
const weapon = { id: 'weapon_test', slot: 'weapon', rarity: 'mythic', weaponType: 'sword' };
const inst = {
  itemPower: 9000,
  greaterAffixCount: 1,
  affixes: [
    option('atk_pct', 'legendary', 72),
    option('hp_pct', 'ancient', 84),
  ],
};

test('legacy affixQuery migrates into player-facing optionQuery without losing compatibility', () => {
  const filter = normalizeLootFilter3({ affixQuery: 'atk_pct' });
  assert.equal(filter.optionQuery, 'atk_pct');
  assert.equal(filter.affixQuery, 'atk_pct');
});

test('minimum Option rarity and Lv must be satisfied by the same Option', () => {
  assert.equal(optionFilterMatches(inst, { minOptionRarity: 'ancient', minOptionLevel: 80 }), true);
  assert.equal(optionFilterMatches(inst, { optionQuery: 'atk_pct', minOptionRarity: 'ancient', minOptionLevel: 70 }), false);
  assert.equal(optionFilterMatches(inst, { optionQuery: 'hp_pct', minOptionRarity: 'ancient', minOptionLevel: 80 }), true);
});

test('Option-aware detailed filters apply to armor and accessories, not only weapons', () => {
  const pass = { minItemPower: 8000, minGreater: 1, minOptionRarity: 'ancient', minOptionLevel: 80 };
  assert.equal(equipment3FilterMatches(armor, inst, pass), true);
  assert.equal(equipment3FilterMatches(accessory, inst, pass), true);
  assert.equal(equipment3FilterMatches(armor, inst, { ...pass, minOptionLevel: 90 }), false);
  assert.equal(equipment3FilterMatches(accessory, inst, { ...pass, minGreater: 2 }), false);
});

test('weaponType filter remains weapon-only while other Option conditions remain all-slot', () => {
  assert.equal(equipment3FilterMatches(weapon, inst, { weaponType: 'sword', minOptionLevel: 80 }), true);
  assert.equal(equipment3FilterMatches(weapon, inst, { weaponType: 'axe', minOptionLevel: 80 }), false);
  assert.equal(equipment3FilterMatches(armor, inst, { weaponType: 'axe', minOptionLevel: 80 }), true);
});

test('default Option filters remain off for save compatibility', () => {
  const filter = normalizeLootFilter3({});
  assert.equal(filter.minOptionRarity, 'any');
  assert.equal(filter.minOptionLevel, 0);
  assert.equal(filter.optionQuery, '');
});
