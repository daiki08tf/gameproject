import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../js/ui/uiFoundation.js', import.meta.url), 'utf8');
const bootstrap = readFileSync(new URL('../js/patches/uiFoundationBootstrap.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('../js/patches/homeNavigation.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/uiFoundation.css', import.meta.url), 'utf8');

test('UI Foundation exposes five persistent primary destinations', () => {
  for (const label of ['ホーム', '冒険', 'キャラクター', '装備', '記録']) assert.match(ui, new RegExp(label));
  assert.match(ui, /ui-primary-nav/);
  assert.match(ui, /NAV_HIDDEN_SCREENS/);
  for (const id of ['titleScreen', 'textBattleScreen', 'stageConfirmScreen', 'resultScreen']) assert.match(ui, new RegExp(id));
});

test('shared navigation reuses existing routes and can return home directly', () => {
  assert.match(bootstrap, /goStageBtn/);
  assert.match(bootstrap, /goStatusBtn/);
  assert.match(bootstrap, /goEquipBtn/);
  assert.match(bootstrap, /openHomeHub\('records'\)/);
  assert.match(bootstrap, /state\.abyssRunEnd/);
  assert.match(bootstrap, /renderHome/);
  assert.match(bootstrap, /MutationObserver/);
  assert.match(home, /uiFoundationBootstrap\.js/);
});

test('UI Foundation provides compact card, tabs, detail disclosure and filter primitives', () => {
  for (const name of ['createCompactCard', 'createTabs', 'createDetailDisclosure', 'createFilterBar']) assert.match(ui, new RegExp(name));
  assert.match(css, /\.ui-compact-card/);
  assert.match(css, /\.ui-tabs/);
  assert.match(css, /\.ui-detail-disclosure/);
  assert.match(css, /\.ui-filter-bar/);
});

test('shared UI remains mobile-first and reserves space for fixed navigation', () => {
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /ui-primary-nav-visible \.screen\.active/);
  assert.match(css, /@media\(max-width:390px\)/);
});
