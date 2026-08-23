import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { equipment3Presentation, equipment3MetaText, equipment3DropHeadline } from '../js/data/equipment3Presentation.js';

const item = {
  id: 'test_weapon', name: '試作刀', slot: 'weapon', rarity: 'legendary',
  weaponArchetypeName: '刀', weaponArchetypeIdentity: '会心・反撃',
};

test('Equipment 3.0 presentation exposes IP, tier, archetype and Greater count', () => {
  const p = equipment3Presentation(item, {
    itemPower: 4321, affixTier: 5, greaterAffixCount: 2,
    displayName: '★★ 必殺の試作刀・吸命',
    affixes: [],
  });
  assert.equal(p.itemPower, 4321);
  assert.equal(p.tier, 5);
  assert.equal(p.archetype, '刀');
  assert.equal(p.greaterCount, 2);
  assert.match(equipment3MetaText(p), /IP 4321/);
  assert.match(equipment3MetaText(p), /T5/);
  assert.equal(p.quality, 'jackpot');
  assert.ok(equipment3DropHeadline(p));
});

test('ordinary Equipment 3.0 drops do not get jackpot presentation', () => {
  const p = equipment3Presentation(item, {
    itemPower: 450, affixTier: 1, greaterAffixCount: 0,
    affixes: [], displayName: '試作刀',
  });
  assert.equal(p.quality, 'standard');
  assert.equal(equipment3DropHeadline(p), null);
});

test('equipment and result screens share Equipment 3.0 presentation model', () => {
  const equipment = fs.readFileSync(new URL('../js/screens/equipment.js', import.meta.url), 'utf8');
  const result = fs.readFileSync(new URL('../js/screens/result.js', import.meta.url), 'utf8');
  assert.match(equipment, /equipment3Presentation/);
  assert.match(equipment, /equipment3MetaText/);
  assert.match(result, /equipment3Presentation/);
  assert.match(result, /equipment3DropHeadline/);
  assert.match(result, /result-loot-headline/);
});
