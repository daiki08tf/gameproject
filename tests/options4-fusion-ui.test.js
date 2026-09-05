import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync(new URL('../js/screens/equipmentFusion.js', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');

test('Option Fusion UI stays inside the existing Equipment screen', () => {
  assert.match(ui, /renderBaseEquipment/);
  assert.match(ui, /OPTION FUSION/);
  assert.match(ui, /optionFusionMaterials/);
  assert.match(ui, /fuseEquipmentOption/);
  assert.doesNotMatch(ui, /goHomeBtn|new Home|homeScreen/);
  assert.match(main, /\.\/screens\/equipmentFusion\.js/);
});

test('Fusion UI keeps destructive material use explicit without relying on native confirm dialogs', () => {
  assert.doesNotMatch(ui, /globalThis\.confirm|window\.confirm/);
  assert.match(ui, /fusionPendingMaterialKey/);
  assert.match(ui, /確定して融合/);
  assert.match(ui, /素材として消費/);
  assert.match(ui, /未ロック・未お気に入り・未装備/);
});

test('Expanded Fusion rows reserve full width for equipment details and the Fusion panel', () => {
  assert.match(ui, /option-fusion-expanded/);
  assert.match(ui, /main\.style\.flex = '1 0 100%'/);
  assert.match(ui, /main\.style\.width = '100%'/);
  assert.match(ui, /flex:1 0 100%;min-width:0/);
  assert.match(ui, /flex-wrap:wrap/);
});

test('Fusion UI remains compact and bounded instead of rendering the whole inventory', () => {
  assert.match(ui, /materials\.slice\(0, 8\)/);
  assert.match(ui, /ほか \$\{materials\.length - 8\} 件/);
  assert.match(ui, /MutationObserver/);
});
