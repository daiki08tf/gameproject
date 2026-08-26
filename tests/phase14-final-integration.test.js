import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync(new URL('../js/patches/finalIntegrationUi.js',import.meta.url),'utf8');
const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../css/finalIntegration.css',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');

test('Phase 14 keeps final integration inside existing navigation surfaces',()=>{
  assert.match(home,/enhanceHome/);
  assert.match(runtime,/NEXT GOAL/);
  assert.match(runtime,/favoriteStageIds/);
  assert.match(runtime,/recentStageIds/);
  assert.match(runtime,/未攻略/);
  assert.match(runtime,/★お気に入り/);
  assert.doesNotMatch(main,/phase14Screen|goPhase14/);
});

test('Phase 14 navigation history is lazy and save-compatible',()=>{
  assert.match(runtime,/if\(!state\.data\.ui14\)/);
  assert.match(runtime,/previousRecordStageResult/);
  assert.match(runtime,/previousRecordStageResult\(stageId,cleared\)/);
});

test('Phase 14 visual integration remains mobile-first and compact',()=>{
  assert.match(css,/@media \(max-height:700px\)/);
  assert.match(css,/#homeScreen \.home-menu\{[^}]*overflow-y:auto/s);
  assert.match(css,/\.phase14-adventure-strip\{[^}]*overflow-x:auto/s);
  assert.match(css,/--tap-min:44px/);
});
