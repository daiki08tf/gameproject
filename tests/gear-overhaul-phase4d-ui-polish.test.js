import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../css/equipment4.css', import.meta.url), 'utf8');

test('equipped slots are compact three-column category tabs', () => {
  assert.match(css, /#equipmentScreen \.paperdoll/);
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /\.equip-slot \.slot-item/);
  assert.match(css, /text-overflow:ellipsis/);
});

test('normal loot filters stay in a single horizontal strip', () => {
  assert.match(css, /#equipmentScreen #lootFilterRow/);
  assert.match(css, /flex-wrap:nowrap/);
  assert.match(css, /overflow-x:auto/);
  assert.match(css, /scrollbar-width:none/);
});

test('advanced filters retain a full-width explicit expanded panel', () => {
  assert.match(css, /\.loot-filter-advanced/);
  assert.match(css, /flex:0 0 100%/);
  assert.match(css, /min-width:100%/);
});

test('equipment header controls are compact on mobile', () => {
  assert.match(css, /#equipmentScreen #weaponCodexBtn/);
  assert.match(css, /#equipmentScreen #autoEquipBtn/);
  assert.match(css, /font-size:10px/);
});
