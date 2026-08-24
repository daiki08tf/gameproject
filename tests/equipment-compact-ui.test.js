import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('equipment compact UI uses progressive disclosure and preserves visible comparison deltas', async () => {
  const text = await source('js/patches/equipmentCompactUi.js');
  assert.match(text, /ui-detail-disclosure/);
  assert.match(text, /性能・Affix・固有効果/);
  assert.match(text, /\.compare-line/);
  assert.match(text, /equip-compact-compare/);
  assert.match(text, /data-action/);
});

test('equipment compaction is loaded through the UI foundation chain', async () => {
  const home = await source('js/patches/homeNavigation.js');
  assert.match(home, /import '\.\/equipmentCompactUi\.js';/);
});

test('equipment compact CSS keeps inventory and paperdoll dense on mobile', async () => {
  const css = await source('css/equipmentCompact.css');
  assert.match(css, /equip-compact-card/);
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
