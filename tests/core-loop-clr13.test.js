import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const homeNavigation=fs.readFileSync('js/patches/homeNavigation.js','utf8');
const stageFirst=fs.readFileSync('js/patches/stageFirstNavigationUi.js','utf8');
const main=fs.readFileSync('js/main.js','utf8');

test('CLR-13 restores the canonical Home Adventure click path while preserving World 4 UI modules',()=>{
  assert.match(homeNavigation,/import '\.\/adventureWorld4Ui\.js'/);
  assert.match(homeNavigation,/import '\.\/adventureWorld4HiddenRouteUi\.js'/);
  assert.match(homeNavigation,/import '\.\/stageFirstNavigationUi\.js'/);
  assert.match(stageFirst,/function restoreCanonicalAdventureEntry\(\)/);
  assert.match(stageFirst,/cloneNode\(true\)/);
  assert.match(stageFirst,/button\.replaceWith\(replacement\)/);
  assert.match(main,/goStageBtn'\)\.addEventListener\('click',\(\)=>\{Audio_\.tap\(\);goChapterSelect\(\);\}\)/);
});

test('CLR-13 World 4 entry install does not re-hijack the button after Stage-first restoration',()=>{
  // adventureWorld4Ui installs its capture listener once at module-eval time
  // and again on DOMContentLoaded (to cover a button that didn't exist yet).
  // stageFirstNavigationUi's restoreCanonicalAdventureEntry() clones/replaces
  // the button between those two calls to hand '#goStageBtn' back to
  // main.js's canonical Chapter handler. Without also checking the
  // stageFirstEntry marker, the DOMContentLoaded re-install silently
  // re-hijacks the already-restored button on every load, since a fresh
  // clone always passes the adventure4Entry==='true' check.
  const adventure4 = fs.readFileSync('js/patches/adventureWorld4Ui.js', 'utf8');
  const installMatch = adventure4.match(/function installEntry\(\)\{[^}]*\}/);
  assert.ok(installMatch, 'installEntry() must exist');
  assert.match(installMatch[0], /stageFirstEntry===['"]true['"]/);
});

test('CLR-13 keeps World 4 runtime support behind the Stage-first Story spine',()=>{
  assert.match(stageFirst,/import '\.\/adventureWorld4RouteEngine\.js'/);
  assert.match(stageFirst,/import '\.\/adventureWorld4SceneRuntime\.js'/);
  assert.match(stageFirst,/import '\.\/adventureWorld4ContentPackI\.js'/);
  assert.match(stageFirst,/import '\.\/adventureWorld4HighLevelRuntime\.js'/);
  assert.doesNotMatch(stageFirst,/stopImmediatePropagation/);
});

test('CLR-13 makes canonical Stage identity and state visible',()=>{
  assert.match(stageFirst,/name\.textContent=`\$\{stage\.id\} \$\{name\.textContent\}`/);
  assert.match(stageFirst,/return 'CLEAR'/);
  assert.match(stageFirst,/return 'NEXT'/);
  assert.match(stageFirst,/return 'OPEN'/);
  assert.match(stageFirst,/\$\{stage\.id\} \?\?\?/);
  assert.doesNotMatch(stageFirst,/\p{Extended_Pictographic}/u);
  assert.match(stageFirst,/LOCKED/);
});

test('CLR-13 keeps locked optional content secret while exposing only canonical main-stage placeholders',()=>{
  assert.match(stageFirst,/!stage\.branch&&!stage\.bounty/);
  assert.match(stageFirst,/isStageDiscovered\(chapter,stage,index\)/);
});

test('CLR-13 keeps the existing canonical Chapter and Stage screens as navigation authority',()=>{
  assert.match(main,/renderChapterSelect\(chapterIndex=>goStageSelect\(chapterIndex\)\)/);
  assert.match(main,/renderStageSelect\(chapterIndex,stage=>/);
  assert.match(main,/renderStageConfirm\(stage\)/);
  assert.match(main,/startBattle\(pendingStage,getSelectedBlessingId\(\)\)/);
});
