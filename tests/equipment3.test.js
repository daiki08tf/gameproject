import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ITEM_POWER_MAX,
  CHAPTER_ITEM_POWER,
  ITEM_POWER_BANDS,
  itemPowerForDrop,
  itemPowerBand,
  affixTierForItemPower,
  generatedEquipmentName,
} from '../js/data/equipment3.js';

test('Equipment 3.0 reserves story IP below endgame IP', () => {
  assert.equal(ITEM_POWER_MAX, 10000);
  assert.deepEqual(CHAPTER_ITEM_POWER[15], [930, 1000]);
  assert.equal(ITEM_POWER_BANDS[0].max, 999);
  assert.equal(ITEM_POWER_BANDS.at(-1).max, ITEM_POWER_MAX);
});

test('chapter drops stay in story Item Power while Abyss can scale beyond 1000', () => {
  const item = { id: 'ch15_weapon', name: '零式破城甲', slot: 'weapon' };
  const storyIp = itemPowerForDrop(item, { chapter: 15, boss: true }, 'ch15_weapon#1');
  const abyssIp = itemPowerForDrop(item, { depth: 100, boss: true }, 'ch15_weapon#2');
  assert.ok(storyIp >= 930 && storyIp <= 1000);
  assert.ok(abyssIp > 1000);
  assert.ok(abyssIp <= ITEM_POWER_MAX);
});

test('Item Power maps to ten Affix tiers without exceeding T10', () => {
  assert.equal(affixTierForItemPower(1), 1);
  assert.equal(affixTierForItemPower(1000), 1);
  assert.equal(affixTierForItemPower(1001), 2);
  assert.equal(affixTierForItemPower(9999), 10);
  assert.equal(affixTierForItemPower(10000), 10);
  assert.equal(itemPowerBand(8000).id, 'terminal');
});

test('existing Affix categories generate readable prefix and suffix combinations', () => {
  const name = generatedEquipmentName('打刀', [
    { category: 'CRIT' },
    { category: 'SUSTAIN' },
  ]);
  assert.equal(name, '必殺の打刀・吸命');
  assert.equal(generatedEquipmentName('鉄の剣', []), '鉄の剣');
});

test('Equipment 3.0 foundation is loaded directly after weapon instance compatibility', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const weapon = main.indexOf("./patches/weaponInstanceFoundation.js");
  const equipment3 = main.indexOf("./patches/equipment3Foundation.js");
  const resultVisibility = main.indexOf("./patches/weaponAffixResultVisibility.js");
  assert.ok(weapon >= 0 && equipment3 > weapon && resultVisibility > equipment3);
});
