import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { equipment3Presentation, equipment3MetaText, equipment3SpecialLines } from '../js/data/equipment3Presentation.js';
import { getItem } from '../js/data/equipment.js';

test('shared presentation renders armor IP, Greater, Legendary and Curse metadata', () => {
  const item = getItem('ac_relic_l');
  const p = equipment3Presentation(item, {
    itemId: item.id,
    itemPower: 8123,
    affixTier: 9,
    greaterAffixCount: 2,
    displayName: '★★ 必殺の古の秘宝・会心 《雷神の心臓》 【呪:血の契約】',
    legendaryEffectId: 'thunderheart',
    curseId: 'blood_contract',
    affixes: [{ id: 'crit_pct', rarity: 'mythic', roll: 11, greater: true }],
  });
  assert.equal(p.itemPower, 8123);
  assert.equal(p.greaterCount, 2);
  assert.equal(p.legendary.name, '雷神の心臓');
  assert.equal(p.curse.name, '血の契約');
  assert.match(equipment3MetaText(p), /IP 8123/);
  const special=equipment3SpecialLines(p);
  assert.equal(special.length, 3);
  assert.match(special[0], /LOOT/);
  assert.ok(special.some(line=>line.includes('雷神の心臓')));
  assert.ok(special.some(line=>line.includes('血の契約')));
});

test('equipment screen resolves generic equipment instances and sorts by instance-aware score', () => {
  const src = fs.readFileSync(new URL('../js/screens/equipment.js', import.meta.url), 'utf8');
  assert.match(src, /state\.equipmentInstance\?\.\(id\)/);
  assert.match(src, /state\.data\.gearInstances\?\.\[id\]/);
  assert.match(src, /state\.equipmentPowerScore/);
  assert.match(src, /compareLine\(item, currentItemForCompare, c\.id, currentId\)/);
});

test('result screen accepts both weapon and gear instance metadata', () => {
  const src = fs.readFileSync(new URL('../js/screens/result.js', import.meta.url), 'utf8');
  assert.match(src, /state\.isGearInstance\?\.\(itemId\)/);
  assert.match(src, /state\.equipmentInstance\?\.\(itemId\)/);
  assert.match(src, /state\.data\.gearInstances\?\.\[itemId\]/);
});
