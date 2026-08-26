import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../js/patches/fusionBattleUi.js', import.meta.url), 'utf8');

test('battle enemy roster is a bounded vertical scroll region', () => {
  assert.match(source, /\.tb-enemy-list\s*\{/);
  assert.match(source, /max-height:min\(34vh,260px\)/);
  assert.match(source, /overflow-y:auto/);
  assert.match(source, /-webkit-overflow-scrolling:touch/);
});

test('battle command controls are protected from shrinking off-screen', () => {
  assert.match(source, /\.tb-fusion-panel,[\s\S]*\.tb-command-grid,[\s\S]*\.tb-tech-menu/);
  assert.match(source, /flex-shrink:0/);
});

test('short mobile viewports reduce enemy-list height further', () => {
  assert.match(source, /@media \(max-height:700px\)/);
  assert.match(source, /max-height:28vh/);
  assert.match(source, /@media \(max-height:560px\)/);
  assert.match(source, /max-height:22vh/);
});
