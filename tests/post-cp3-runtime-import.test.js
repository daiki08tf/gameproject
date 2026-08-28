import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('post-CP3 Apex combat bridge is reachable from the production startup chain',()=>{
  const main=read('js/main.js');
  const exploration=read('js/patches/exploration1Core.js');
  const ui=read('js/patches/postCp3DeepSurveyUi.js');
  assert.match(main,/import '\.\/patches\/exploration1Core\.js';/);
  assert.match(exploration,/import '\.\/postCp3DeepSurveyUi\.js';/);
  assert.match(ui,/import '\.\/postCp3ConvergenceApexCombat\.js';/);
});

test('post-CP3 Apex runtime bridge still owns combat/readability hooks',()=>{
  const combat=read('js/patches/postCp3ConvergenceApexCombat.js');
  assert.match(combat,/BattleEngine/);
  assert.match(combat,/TextBattleScreen/);
  assert.match(combat,/convergenceApex/);
  assert.match(combat,/FINAL位相：ASH/);
});
