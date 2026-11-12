import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// These guarantees used to be asserted against js/patches/fusionBattleUi.js,
// a module the C1 job rework stopped importing — so the test was guarding
// styles the game never loaded. The live rules are in css/finalIntegration.css
// (injected by js/patches/finalIntegrationUi.js); assert against those.
const source = fs.readFileSync(new URL('../css/finalIntegration.css', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../js/patches/finalIntegrationUi.js', import.meta.url), 'utf8');

test('the stylesheet carrying the battle layout guards is actually loaded', () => {
  assert.match(loader, /link\.href='css\/finalIntegration\.css'/);
});

test('battle enemy roster is a bounded vertical scroll region', () => {
  assert.match(source, /\.tb-enemy-list\{[^}]*max-height:min\(31vh,220px\)[^}]*overflow-y:auto/);
  assert.match(source, /\.tb-enemy-list\{[^}]*overscroll-behavior:contain/);
});

test('battle command controls are protected from shrinking off-screen', () => {
  assert.match(source, /\.tb-command-grid\{[^}]*position:sticky;bottom:0[^}]*flex:0 0 auto/);
  assert.match(source, /\.tb-tech-menu\{[^}]*position:sticky;bottom:0/);
  assert.match(source, /#textBattleScreen\{[^}]*overflow:hidden/);
});

test('short mobile viewports reduce enemy-list height further', () => {
  assert.match(source, /@media \(max-height:700px\)\{[\s\S]*?\.tb-enemy-list\{max-height:25vh/);
});
