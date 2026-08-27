import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('polish IV: readability layer covers equipment, jobs, companions and Unique branches',()=>{
  const ui=read('js/patches/buildReadabilityUi.js');
  assert.match(ui,/function decorateEquipment\(\)/);
  assert.match(ui,/function decorateJobs\(\)/);
  assert.match(ui,/function decorateCompanions\(\)/);
  assert.match(ui,/function decorateUniqueBranches\(\)/);
  assert.match(ui,/向いているビルド/);
  assert.match(ui,/噛み合い/);
  assert.match(ui,/得意役割/);
  assert.match(ui,/戦い方/);
});

test('polish IV: readability remains presentation-only and save-compatible',()=>{
  const ui=read('js/patches/buildReadabilityUi.js');
  assert.doesNotMatch(ui,/state\.save\s*\(/);
  assert.doesNotMatch(ui,/state\.data\.[A-Za-z0-9_]+\s*=/);
  assert.doesNotMatch(ui,/createElement\(['"]section['"]\)/);
  assert.doesNotMatch(ui,/home-menu/);
});

test('polish IV: Unique branch rows expose stable item and branch ids',()=>{
  const uniqueUi=read('js/patches/uniqueTrialUi.js');
  assert.match(uniqueUi,/import '\.\/buildReadabilityUi\.js'/);
  assert.match(uniqueUi,/row\.dataset\.uniqueBranchItem=id/);
  assert.match(uniqueUi,/row\.dataset\.uniqueBranchId=br\.id/);
});

test('polish IV: branch copy distinguishes major combat loops',()=>{
  const ui=read('js/patches/buildReadabilityUi.js');
  assert.match(ui,/HPをあえて削った状態で最大火力/);
  assert.match(ui,/ガードを軸に受け切りながら反撃/);
  assert.match(ui,/強敵・終盤の削り切り/);
  assert.match(ui,/行動順を組み立てて火力/);
});
