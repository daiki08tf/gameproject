import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import { CH1_STORY_AFTERMATH,clr18StoryAftermath,clr18ShouldShowAftermath } from '../js/data/coreLoopClr18.js';

test('CLR-18 Chapter 1 keeps the canonical 1-1 -> 1-5 Stage spine',()=>{
  const ch1=CHAPTERS.find(ch=>Number(ch.num)===1);
  const main=ch1.stages.filter(stage=>!stage.branch&&!stage.bounty).map(stage=>stage.id);
  assert.deepEqual(main,['1-1','1-2','1-3','1-4','1-5']);
  assert.deepEqual(Object.keys(CH1_STORY_AFTERMATH),main);
});

test('CLR-18 aftermath is concise and tied to the exact canonical Stage',()=>{
  for(const id of ['1-1','1-2','1-3','1-4','1-5']){
    const beat=clr18StoryAftermath(id);
    assert.equal(beat.stageId,id);
    assert.ok(beat.title.length>0);
    assert.ok(beat.text.length>0&&beat.text.length<120);
  }
  assert.equal(clr18StoryAftermath('1-B'),null);
  assert.equal(clr18StoryAftermath('2-1'),null);
});

test('CLR-18 Story beat appears only after first victory, never on replay/retreat/loss',()=>{
  assert.equal(clr18ShouldShowAftermath({stageId:'1-1',cleared:true,wasCleared:false}),true);
  assert.equal(clr18ShouldShowAftermath({stageId:'1-1',cleared:true,wasCleared:true}),false);
  assert.equal(clr18ShouldShowAftermath({stageId:'1-1',cleared:false,wasCleared:false}),false);
  assert.equal(clr18ShouldShowAftermath({stageId:'1-1',cleared:true,wasCleared:false,retreated:true}),false);
});

test('CLR-18 UI bridges Stage-first result without adding progression/save/reward authority',()=>{
  const ui=fs.readFileSync('js/patches/coreLoopClr18StoryDensityUi.js','utf8');
  const data=fs.readFileSync('js/data/coreLoopClr18.js','utf8');
  assert.match(ui,/confirmStartBtn/);
  assert.match(ui,/resultNextBtn/);
  assert.match(ui,/resultScreen/);
  assert.match(ui,/state\.isStageCleared/);
  assert.doesNotMatch(ui,/state\.data|\.save\(|addItem\(|stageProgress\s*=/);
  assert.doesNotMatch(data,/state\.data|\.save\(|addItem\(|Math\.random/);
});

test('CLR-18 bridge is loaded through the existing CLR mobile/navigation chain',()=>{
  const loader=fs.readFileSync('js/patches/coreLoopClr16MobileUi.js','utf8');
  assert.match(loader,/coreLoopClr18StoryDensityUi\.js/);
});
