import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync(new URL('../js/screens/equipment4.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/equipment4.css', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../js/patches/gearOverhaulCraftingConsolidation.js', import.meta.url), 'utf8');

test('Phase 4A detail layer is loaded without replacing the existing Equipment renderer', () => {
  assert.match(bridge, /\.\.\/screens\/equipment4\.js/);
  assert.doesNotMatch(ui, /renderFusionEquipment/);
  assert.match(ui, /MutationObserver/);
});

test('selected detail presents fixed identity and at most three random Options', () => {
  assert.match(ui, /FIXED IDENTITY/);
  assert.match(ui, /\.slice\(0, 3\)/);
  assert.match(ui, /OPTION <small>/);
  assert.match(ui, /fixedIdentities/);
});

test('Option detail includes Lv, EXP progress and MASTER state', () => {
  assert.match(ui, /optionXpToNext/);
  assert.match(ui, /EXP \$\{xp\}\/\$\{needed\}/);
  assert.match(ui, /MASTER/);
  assert.match(ui, /equipment4-xp/);
});

test('detail contains current-equipment comparison, build tags and job compatibility', () => {
  assert.match(ui, /現在装備との差/);
  assert.match(ui, /現在職との武器適性/);
  assert.match(ui, /CATEGORY_LABEL/);
  assert.match(ui, /equipment4-tags/);
});

test('layout is mobile-first and becomes two-column on wider screens', () => {
  assert.match(css, /equipment4-detail/);
  assert.match(css, /@media \(min-width: 760px\)/);
  assert.match(css, /grid-template-areas/);
  assert.match(css, /position:sticky/);
});
