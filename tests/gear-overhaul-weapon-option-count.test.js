import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';

test('new mythic weapon drops are normalized to at most three random Options', () => {
  state.resetAll();
  state.data.nextInstanceSeq = 700;
  state.addItem('ch30_weapon', 20, { depth: 5000, elite: true, boss: true, itemPowerTarget: 10000 });
  const ids = Object.keys(state.data.weaponInstances).filter(id => id.startsWith('ch30_weapon#'));
  assert.equal(ids.length, 20);
  for (const id of ids) {
    const inst = state.data.weaponInstances[id];
    assert.ok(inst.affixes.length <= 3, `${id}: ${inst.affixes.length}`);
  }
});

test('legacy saved weapon instances are not destructively trimmed during backfill', async () => {
  // The compatibility foundation deliberately caps only newly allocated drops.
  // This source-level guard protects the save-compatibility decision from an
  // accidental future `slice(0, 3)` inside backfillEquipment3Instances().
  const fs = await import('node:fs/promises');
  const src = await fs.readFile(new URL('../js/patches/equipment3Foundation.js', import.meta.url), 'utf8');
  const backfill = src.slice(src.indexOf('function backfillEquipment3Instances'), src.indexOf('const previousAddItem'));
  assert.doesNotMatch(backfill, /capNewWeaponOptions/);
});
