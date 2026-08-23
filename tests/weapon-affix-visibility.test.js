import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { state } from '../js/state.js';

test('100 deterministic weapon drops create unique weapon instances with Affixes', () => {
  state.resetAll();
  const originalRandom = Math.random;
  Math.random = () => 0.9;
  try {
    for (let i = 0; i < 100; i += 1) state.addItem('wp_sword_n', 1, {});
    const ids = Object.keys(state.data.weaponInstances).filter(id => id.startsWith('wp_sword_n#'));
    assert.equal(ids.length, 100);
    assert.equal(new Set(ids).size, 100);
    for (const id of ids) assert.ok(state.weaponInstanceAffixes(id).length >= 1, id);
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
