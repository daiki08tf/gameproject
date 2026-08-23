import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { state } from '../js/state.js';
import { generateWeaponAffixes } from '../js/data/affixes.js';

test('100 weapon drops create 100 unique weapon instances', () => {
  state.resetAll();
  for (let i = 0; i < 100; i += 1) state.addItem('wp_sword_n', 1, {});
  const ids = Object.keys(state.data.weaponInstances).filter(id => id.startsWith('wp_sword_n#'));
  assert.equal(ids.length, 100);
  assert.equal(new Set(ids).size, 100);
});

test('100 deterministic Rare weapon rolls all generate Affixes', () => {
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  try {
    const fakeRareSword = { slot: 'weapon', rarity: 'rare', weaponType: 'sword' };
    for (let i = 0; i < 100; i += 1) {
      const affixes = generateWeaponAffixes(fakeRareSword, {});
      assert.ok(affixes.length >= 1 && affixes.length <= 2);
    }
  } finally {
    Math.random = originalRandom;
  }
});

test('battle result patch replaces legacy base weapon id with the exact instance id', () => {
  const src = fs.readFileSync(new URL('../js/patches/weaponAffixResultVisibility.js', import.meta.url), 'utf8');
  assert.match(src, /_rollWeaponDrop/);
  assert.match(src, /_rollBossWeaponDrop/);
  assert.match(src, /this\.runItems\[last\] = info\.instanceId/);
});

test('result screen exposes Affix names and descriptions for dropped weapon instances', () => {
  const src = fs.readFileSync(new URL('../js/screens/result.js', import.meta.url), 'utf8');
  assert.match(src, /state\.isWeaponInstance\(itemId\)/);
  assert.match(src, /state\.weaponInstanceAffixes\(itemId\)/);
  assert.match(src, /describeAffix/);
  assert.match(src, /オプションなし/);
});
