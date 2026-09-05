import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { nextStageAfter } from '../js/data/resultNextStage.js';
import { CHAPTERS } from '../js/data/stages.js';
import { buildAbyssStage } from '../js/data/abyss.js';

test('normal clear advances along main stage path',()=>{
  assert.equal(nextStageAfter(CHAPTERS[0].stages.find(s=>s.id==='1-1')).id,'1-2');
  assert.equal(nextStageAfter(CHAPTERS[0].stages.find(s=>s.id==='1-3')).id,'1-4');
});

test('chapter boss advances to next chapter and skips branch stages',()=>{
  const next=nextStageAfter(CHAPTERS[0].stages.find(s=>s.id==='1-5'));
  assert.ok(next);assert.equal(next.id,'2-1');
});

test('branch and standalone endgame content have no automatic next stage',()=>{
  assert.equal(nextStageAfter(CHAPTERS[0].stages.find(s=>s.id==='1-B')),null);
  assert.equal(nextStageAfter({id:'secret-test',secretRealm:true}),null);
  assert.equal(nextStageAfter({id:'rift-test',isRift:true}),null);
});

test('Abyss clear advances exactly one floor',()=>{
  const current=buildAbyssStage(123,[]),next=nextStageAfter(current,[]);
  assert.ok(next);assert.equal(next.abyssDepth,124);assert.equal(next.id,'abyss-124');
});

test('final main-story boss has no phantom next stage when optional pseudo chapters are appended',()=>{
  const storyLast=CHAPTERS.find(ch=>ch.id==='ch35');
  const boss=storyLast.stages.find(s=>s.boss);
  const pseudo={id:'machine_world',num:26,stages:[{id:'machine-world-debug',name:'debug',secretRealm:true}]};
  CHAPTERS.push(pseudo);
  try{
    assert.equal(nextStageAfter(boss),null);
  }finally{
    CHAPTERS.splice(CHAPTERS.indexOf(pseudo),1);
  }
});

test('Home Story context filters pseudo chapters instead of treating Machine World as NEXT STORY',()=>{
  const src=fs.readFileSync(new URL('../js/patches/finalIntegrationUi.js',import.meta.url),'utf8');
  assert.match(src,/function storyChapters\(\)\{return CHAPTERS\.filter/);
  assert.match(src,/for\(const chapter of storyChapters\(\)\)/);
  assert.match(src,/const storyStages=storyChapters\(\)\.flatMap/);
});
