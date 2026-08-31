import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mobile=fs.readFileSync('js/patches/coreLoopClr16MobileUi.js','utf8');
const css=fs.readFileSync('css/coreLoopClr16Mobile.css','utf8');
const home=fs.readFileSync('js/patches/homeNavigation.js','utf8');
const stageFirst=fs.readFileSync('js/patches/stageFirstNavigationUi.js','utf8');
const main=fs.readFileSync('js/main.js','utf8');

test('CLR-16 mobile bridge is loaded from the normal Home navigation chain',()=>{
  assert.match(home,/import '\.\/coreLoopClr16MobileUi\.js'/);
  assert.match(mobile,/css\/coreLoopClr16Mobile\.css/);
});

test('CLR-16 keeps Stage actions reachable and ordered on narrow screens',()=>{
  assert.match(css,/#stageConfirmScreen \.confirm-actions[\s\S]*position:sticky/);
  assert.match(css,/#stageConfirmScreen #confirmStartBtn[\s\S]*order:1/);
  assert.match(css,/#stageConfirmScreen #stageFirstHuntBtn[\s\S]*order:2/);
  assert.match(css,/@media\(max-width:480px\)/);
  assert.match(css,/min-height:46px/);
});

test('CLR-16 keeps result progression actions reachable on mobile',()=>{
  assert.match(css,/#resultScreen \.confirm-actions[\s\S]*position:sticky/);
  assert.match(css,/#resultScreen #resultNextBtn[\s\S]*order:1/);
  assert.match(css,/#resultScreen #stageFirstResultStagesBtn[\s\S]*order:2/);
});

test('CLR-16 makes suspend and safe return semantics explicit',()=>{
  assert.match(mobile,/back\.textContent='← 中断'/);
  assert.match(mobile,/冒険を中断して拠点へ戻る/);
  assert.match(mobile,/strong\?\.textContent\?\.trim\(\)==='帰還路'/);
  assert.match(mobile,/strong\.textContent='安全に帰還する'/);
  assert.match(mobile,/dataset\.clr16Action='suspend'/);
  assert.match(mobile,/dataset\.clr16Action='return'/);
});

test('CLR-16 observer watches only screen activation and does not mutate the observed class',()=>{
  assert.match(mobile,/observer\.observe\(screen,\{attributes:true,attributeFilter:\['class'\]\}\)/);
  assert.doesNotMatch(mobile,/classList\.(?:add|remove|toggle)/);
});

test('CLR-16 preserves Story and Hunt smoke-path authorities',()=>{
  assert.match(main,/goStageBtn'\)\.addEventListener\('click',\(\)=>\{Audio_\.tap\(\);goChapterSelect\(\);\}\)/);
  assert.match(main,/startBattle\(pendingStage,getSelectedBlessingId\(\)\)/);
  assert.match(stageFirst,/stageFirstHuntContext/);
  assert.match(stageFirst,/launchStageFirstHunt/);
  assert.match(stageFirst,/state\.startAdventure4\?\.\(\{regionId:context\.region\.id,returnTarget:'home'\}\)/);
  assert.match(stageFirst,/renderAdventureRoute\(\)/);
});
