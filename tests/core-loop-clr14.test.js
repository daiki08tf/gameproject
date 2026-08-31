import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const stageFirst=fs.readFileSync('js/patches/stageFirstNavigationUi.js','utf8');
const main=fs.readFileSync('js/main.js','utf8');

test('CLR-14 Stage detail keeps canonical Stage ID visible',()=>{
  assert.match(stageFirst,/name\.textContent=`\$\{stage\.id\} \$\{stage\.name\}`/);
  assert.match(stageFirst,/name\.dataset\.stageId=stage\.id/);
});

test('CLR-14 distinguishes first-clear Story launch from replay',()=>{
  assert.match(stageFirst,/cleared\?'再戦する':'物語を進める'/);
  assert.match(stageFirst,/cleared\?'もう一度挑む':'挑戦する'/);
  assert.match(stageFirst,/start\.dataset\.stageId=stage\.id/);
});

test('CLR-14 preserves the exact canonical Stage battle launch authority',()=>{
  assert.match(main,/renderStageConfirm\(stage\)/);
  assert.match(main,/confirmStartBtn'\)\.addEventListener\('click',\(\)=>\{Audio_\.tap\(\);startBattle\(pendingStage,getSelectedBlessingId\(\)\);\}\)/);
  assert.match(main,/battle\.start\(stage\.id,result=>/);
});

test('CLR-14 result offers a Stage-context return and explicit next Stage identity',()=>{
  assert.match(stageFirst,/stageFirstResultStagesBtn/);
  assert.match(stageFirst,/ステージ一覧へ/);
  assert.match(stageFirst,/nextButton\.textContent=`次へ：\$\{next\.id\} \$\{next\.name\}`/);
  assert.match(stageFirst,/showExistingStageList\(\)/);
});

test('CLR-14 result observer cannot self-loop on its own child mutation',()=>{
  assert.match(stageFirst,/observer\.observe\(resultScreen,\{attributes:true,attributeFilter:\['class'\]\}\)/);
  assert.doesNotMatch(stageFirst,/observer\.observe\(resultScreen,\{[^}]*childList:true/);
});

test('CLR-14 hides Stage-only result navigation for non-Stage battle results',()=>{
  assert.match(stageFirst,/if\(!stageBattleArmed\|\|!selectedStageId\)\{existing\?\.classList\.add\('hidden'\)/);
  assert.match(stageFirst,/goAbyssBtn/);
});
