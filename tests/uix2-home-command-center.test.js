import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const runtime = readFileSync(new URL('../js/patches/finalIntegrationUi.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('../js/patches/homeNavigation.js', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../js/ui/uiFoundation.js', import.meta.url), 'utf8');
const bootstrap = readFileSync(new URL('../js/patches/uiFoundationBootstrap.js', import.meta.url), 'utf8');
const homeCss = readFileSync(new URL('../css/home3.css', import.meta.url), 'utf8');
const integrationCss = readFileSync(new URL('../css/finalIntegration.css', import.meta.url), 'utf8');

test('UIX-2 derives current context from canonical Stage and Adventure session authorities', () => {
  assert.match(runtime, /state\.adventure4Session/);
  assert.match(runtime, /buildWorld4RegionCatalog\(CHAPTERS\)/);
  assert.match(runtime, /state\.isStageCleared\(stage\.id\)/);
  assert.match(runtime, /SUSPENDED EXPEDITION/);
  assert.match(runtime, /NEXT STORY/);
  assert.doesNotMatch(runtime, /state\.data\.uix2|state\.data\.homeCommand/);
});

test('UIX-2 keeps context informational and one existing Adventure button primary', () => {
  assert.match(runtime, /goal\.setAttribute\('aria-live','polite'\)/);
  assert.match(runtime, /goal\.removeAttribute\('role'\)/);
  assert.match(runtime, /goal\.removeAttribute\('tabindex'\)/);
  assert.match(runtime, /goal\.onclick=null/);
  assert.match(runtime, /document\.getElementById\('goStageBtn'\)/);
  for (const label of ['冒険を確認', '続ける', '冒険を選ぶ']) assert.match(runtime, new RegExp(label));
  assert.match(home, /adventure\.classList\.add\('home-adventure-primary'\)/);
});

test('UIX-2 exposes compact build, story and Abyss signals without new progression', () => {
  assert.match(runtime, /state\.data\.weaponInstances/);
  assert.match(runtime, /getItem\(baseItemId\)/);
  assert.match(runtime, /storyStages\.filter\(stage=>state\.isStageCleared\(stage\.id\)\)/);
  for (const label of ['BUILD', 'STORY', 'ABYSS']) assert.match(runtime, new RegExp(label));
});

test('UIX-2 gives Home and persistent navigation the same stable ownership model', () => {
  for (const id of ['character', 'equipment', 'records']) assert.match(home, new RegExp(`id: '${id}'`));
  for (const label of ['ホーム', '冒険', 'キャラクター', '装備', '記録']) assert.match(navigation, new RegExp(label));
  assert.match(navigation, /abyssScreen: 'records'/);
  assert.match(bootstrap, /character: \(\) => clickRoute\('goStatusBtn'\)/);
  assert.match(bootstrap, /equipment: \(\) => clickRoute\('goEquipBtn'\)/);
  assert.match(bootstrap, /records: \(\) => openHomeHub\('records'\)/);
});

test('UIX-2 refreshes Home context on activation without observing its rewritten subtree', () => {
  assert.match(home, /dataset\.uix2Refresh !== 'true'/);
  assert.match(home, /homeScreen\.classList\.contains\('active'\)/);
  assert.match(home, /observe\(homeScreen, \{ attributes: true, attributeFilter: \['class'\] \}\)/);
  assert.doesNotMatch(home, /observe\(homeScreen,\s*\{[^}]*childList/s);
});

test('UIX-2 uses a ledger context, sharp geometry and restrained destination states', () => {
  assert.match(integrationCss, /\.phase14-next-goal\{[^}]*border-left:2px solid var\(--dc-observe-400/s);
  assert.match(integrationCss, /\.phase14-next-record/);
  assert.match(integrationCss, /\.phase14-home-summary/);
  assert.match(homeCss, /\.home-adventure-primary\{[^}]*var\(--dc-brass-300/s);
  assert.match(homeCss, /\.home-hub-toggle\.active\{[^}]*var\(--dc-observe-400/s);
});
