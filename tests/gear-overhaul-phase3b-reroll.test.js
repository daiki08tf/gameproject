import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import '../js/patches/weaponInstanceFoundation.js';
import '../js/patches/equipment3Foundation.js';
import '../js/patches/equipment3Blacksmith.js';
import { normalizeRerolledOption } from '../js/patches/gearOverhaulCraftingConsolidation.js';
import { optionValueAtLevel } from '../js/data/options4.js';

test('rerolled Option starts fresh at Lv1 EXP0 and cannot inherit Greater', () => {
  state.resetAll();
  const id = 'wp_sword_n#3000';
  state.data.weaponInstances[id] = { itemId: 'wp_sword_n', itemPower: 6500, affixes: [] };
  const raw = {
    id: 'atk_pct', familyId: 'atk_pct', rarity: 'legendary', level: 88, xp: 999,
    roll: 99, greater: true, baseRoll: 66, forgedGreater: true, optionSchemaVersion: 1,
  };
  const next = normalizeRerolledOption(id, 0, raw);
  assert.equal(next.level, 1);
  assert.equal(next.xp, 0);
  assert.equal(next.greater, false);
  assert.equal(next.baseRoll, undefined);
  assert.equal(next.forgedGreater, undefined);
  assert.equal(next.optionSchemaVersion, 1);
  assert.equal(next.roll, optionValueAtLevel('atk_pct', 'legendary', 1, 0));
});

test('reroll UI explicitly communicates family replacement and fresh growth', async () => {
  const fs = await import('node:fs');
  const source = fs.readFileSync(new URL('../js/patches/gearOverhaulCraftingConsolidation.js', import.meta.url), 'utf8');
  assert.match(source, /Option再抽選/);
  assert.match(source, /Lv1・EXP0/);
  assert.match(source, /greater = false/);
});
