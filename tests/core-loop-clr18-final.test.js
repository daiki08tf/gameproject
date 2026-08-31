import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import { clr18StoryAftermath,clr18ShouldShowAftermath,clr18CoveredMainStageIds } from '../js/data/coreLoopClr18Final.js';

function mainStages(){return CHAPTERS.flatMap(chapter=>(chapter.stages||[]).filter(stage=>!stage.branch&&!stage.bounty).map(stage=>({chapter,stage})));}
function branchStages(){return CHAPTERS.flatMap(chapter=>(chapter.stages||[]).filter(stage=>stage.branch));}

test('CLR-18 final bulk covers every canonical Chapter 1-35 main Story Stage',()=>{
  const stages=mainStages();
  const covered=new Set(clr18CoveredMainStageIds());
  assert.equal(CHAPTERS.length,35);
  assert.equal(covered.size,stages.length);
  for(const {stage} of stages){
    assert.ok(covered.has(String(stage.id)),`missing coverage for ${stage.id}`);
    const beat=clr18StoryAftermath(stage.id);
    assert.ok(beat,`missing aftermath for ${stage.id}`);
    assert.equal(beat.stageId,String(stage.id));
    assert.ok(beat.title.length>0);
    assert.ok(beat.text.length>0&&beat.text.length<140,`aftermath too long for ${stage.id}`);
  }
});

test('CLR-18 final bulk never turns Branch stages into mandatory Story aftermath',()=>{
  for(const stage of branchStages())assert.equal(clr18StoryAftermath(stage.id),null,`branch should stay excluded: ${stage.id}`);
});

test('CLR-18 final bulk preserves authored representative/bulk beats before generic fallback',()=>{
  for(const id of ['1-1','2-5','3-5','4-5','5-5','18-8','35-8']){
    const beat=clr18StoryAftermath(id);
    assert.ok(beat);
    assert.notEqual(beat.generated,true,`authored beat replaced by generic fallback: ${id}`);
  }
  for(const id of ['6-1','10-5','16-1','17-8','19-1','34-8']){
    const beat=clr18StoryAftermath(id);
    assert.ok(beat,`generic beat missing: ${id}`);
    assert.equal(beat.generated,true,`expected generic fallback: ${id}`);
  }
});

test('CLR-18 final bulk keeps first-clear-only behavior across early/mid/late generated stages',()=>{
  for(const id of ['6-1','10-5','16-4','24-8','34-8']){
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:true,wasCleared:false}),true);
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:true,wasCleared:true}),false);
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:false,wasCleared:false}),false);
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:true,wasCleared:false,retreated:true}),false);
  }
});

test('CLR-18 generic fallback derives only from canonical Chapter/Stage metadata and adds no authority',()=>{
  const finalData=fs.readFileSync('js/data/coreLoopClr18Final.js','utf8');
  const ui=fs.readFileSync('js/patches/coreLoopClr18StoryDensityUi.js','utf8');
  assert.match(finalData,/CHAPTERS/);
  assert.match(finalData,/stage\.name/);
  assert.match(finalData,/chapter\.name/);
  assert.doesNotMatch(finalData,/state\.data|\.save\(|addItem\(|Math\.random|stageProgress\s*=/);
  assert.match(ui,/coreLoopClr18Final\.js/);
  assert.match(ui,/state\.isStageCleared/);
});
