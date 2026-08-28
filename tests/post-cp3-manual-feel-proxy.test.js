import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('post-CP3 feel proxy: short portrait battle keeps commands reachable',()=>{
  const combat=read('js/patches/postCp3ConvergenceApexCombat.js');
  assert.match(combat,/@media \(max-height: 720px\) and \(orientation: portrait\)/);
  assert.match(combat,/\.tb-enemy-list \{ max-height: 32vh; overflow-y: auto/);
  assert.match(combat,/\.tb-log \{ min-height: 96px/);
  assert.match(combat,/\.tb-cmd-btn \{ min-height: 44px/);
  assert.match(combat,/\.tb-tech-menu \{ max-height: 42vh/);
});

test('post-CP3 feel proxy: Apex phase changes are readable without external docs',()=>{
  const combat=read('js/patches/postCp3ConvergenceApexCombat.js');
  for(const text of ['Phase I · ASH','Phase II · NINTH','Phase III · ROOT','FINAL · CONVERGENCE']){
    assert.match(combat,new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
  assert.match(combat,/FINAL位相：ASH/);
  assert.match(combat,/FINAL位相：NINTH/);
  assert.match(combat,/FINAL位相：ROOT/);
  assert.match(combat,/_apexLastAnnouncedPhase/);
  assert.match(combat,/_apexLastCycleCue/);
});

test('post-CP3 feel proxy: polish remains presentation-only',()=>{
  const combat=read('js/patches/postCp3ConvergenceApexCombat.js');
  assert.doesNotMatch(combat,/state\.data\.|\.save\(\)/);
  assert.doesNotMatch(combat,/currency|daily|weekly|battlePass/i);
});
