import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync(new URL('../js/screens/equipment4.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/equipment4.css', import.meta.url), 'utf8');

test('equipment list rows expose only compact scan signals', () => {
  assert.match(ui, /equipment4-row-summary/);
  assert.match(ui, /IP\$\{p\.itemPower\}/);
  assert.match(ui, /OP\$\{Math\.min\(3, p\.affixes\.length\)\}\/3/);
  assert.match(ui, /FIXED\$\{p\.fixedIdentities\.length\}/);
});

test('long Option/special/compare blocks are hidden only in compact list rows', () => {
  assert.match(css, /equipment4-compact-row \.affix-block/);
  assert.match(css, /equipment4-compact-row \.eq3-special-line/);
  assert.match(css, /equipment4-compact-row \.compare-line/);
  assert.match(css, /display: none/);
  assert.match(css, /equipment4-detail/);
});

test('long item names are ellipsized instead of growing list height', () => {
  assert.match(css, /text-overflow: ellipsis/);
  assert.match(css, /white-space: nowrap/);
});

test('favorite and lock actions become icon-scale while preserving accessible labels', () => {
  assert.match(ui, /setAttribute\('aria-label'/);
  assert.match(ui, /お気に入り登録/);
  assert.match(ui, /ロックする/);
  assert.match(ui, /OP育成/);
});

test('disabled equipment rows retain a compact lock reason', () => {
  assert.match(ui, /equipment4-keep-lock-reason/);
  assert.match(css, /max-height: 2\.5em/);
});
