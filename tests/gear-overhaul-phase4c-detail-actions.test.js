import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync(new URL('../js/screens/equipment4.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/equipment4.css', import.meta.url), 'utf8');

test('detail actions relay to existing row controls instead of duplicating state mutations', () => {
  assert.match(ui, /function relayDetailAction/);
  assert.match(ui, /source\.click\(\)/);
  assert.doesNotMatch(ui, /state\.equipItem\(/);
  assert.doesNotMatch(ui, /state\.toggleItemFavorite\(/);
  assert.doesNotMatch(ui, /state\.toggleItemLocked\(/);
  assert.doesNotMatch(ui, /state\.fuseEquipmentOption\(/);
});

test('detail exposes equip keep lock and Option Fusion actions', () => {
  assert.match(ui, /data-e4act="equip"/);
  assert.match(ui, /data-e4act="favorite"/);
  assert.match(ui, /data-e4act="lock"/);
  assert.match(ui, /data-e4act="fusion"/);
  assert.match(ui, /OP育成/);
});

test('detail mirrors disabled state from authoritative row actions', () => {
  assert.match(ui, /button\.disabled = !source \|\| !!source\.disabled/);
  assert.match(ui, /!equipSource \|\| equipSource\.disabled/);
  assert.match(ui, /!fusionSource/);
});

test('detail action layout remains compact on mobile', () => {
  assert.match(css, /equipment4-detail-actions/);
  assert.match(css, /repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width: 420px\)/);
  assert.match(css, /repeat\(2,minmax\(0,1fr\)\)/);
});
