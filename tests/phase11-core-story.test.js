import test from 'node:test';
import assert from 'node:assert/strict';
import { CORE_STORY_CHAPTERS, coreStoryChapter, coreStoryBeatForStage } from '../js/data/storyChapters1to15.js';
import { CHAPTERS } from '../js/data/stages.js';
import { attachCoreStory, storyStartLines, storyClearLines } from '../js/patches/story11CoreJourney.js';

test('Ch1-15 each have a compact complete story spine',()=>{
  assert.equal(CORE_STORY_CHAPTERS.length,15);
  assert.deepEqual(CORE_STORY_CHAPTERS.map(x=>x.chapter),Array.from({length:15},(_,i)=>i+1));
  for(const entry of CORE_STORY_CHAPTERS){
    for(const key of ['objective','opening','discovery','bossIntro','clear']){
      assert.ok(typeof entry[key]==='string'&&entry[key].length>=8,`chapter ${entry.chapter} missing ${key}`);
    }
  }
});

test('core journey does not name The Veil before the canonical Ch19 reveal',()=>{
  const text=CORE_STORY_CHAPTERS.map(x=>Object.values(x).filter(v=>typeof v==='string').join(' ')).join(' ');
  assert.equal(text.includes('The Veil'),false);
});

test('story beats use opening, midpoint discovery and boss closure only',()=>{
  const chapter=coreStoryChapter(10);
  const stages=[{id:'10-1'},{id:'10-2'},{id:'10-3'},{id:'10-4'},{id:'10-5',boss:true}];
  const first=coreStoryBeatForStage(10,stages[0],0,5);
  const mid=coreStoryBeatForStage(10,stages[2],2,5);
  const boss=coreStoryBeatForStage(10,stages[4],4,5);
  assert.equal(first.opening,chapter.opening);
  assert.equal(first.discovery,null);
  assert.equal(mid.discovery,chapter.discovery);
  assert.equal(boss.bossIntro,chapter.bossIntro);
  assert.equal(boss.clear,chapter.clear);
});

test('runtime attaches journey story to Ch1-20 main stages and keeps branches/future chapters clean',()=>{
  attachCoreStory();
  for(const chapter of CHAPTERS.filter(ch=>ch.num<=20)){
    const main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
    assert.ok(main[0].story11?.opening,`chapter ${chapter.num} opening not attached`);
    assert.ok(main.find(s=>s.boss)?.story11?.bossIntro,`chapter ${chapter.num} boss intro not attached`);
    assert.ok(main.find(s=>s.boss)?.story11?.clear,`chapter ${chapter.num} clear not attached`);
    for(const branch of chapter.stages.filter(s=>s.branch||s.bounty))assert.equal(branch.story11,undefined);
  }
  for(const chapter of CHAPTERS.filter(ch=>ch.num>20))for(const stage of chapter.stages)assert.equal(stage.story11,undefined);
});

test('battle story helpers are compact and clear text appears only on victory',()=>{
  attachCoreStory();
  const ch15=CHAPTERS.find(ch=>ch.num===15);
  const first=ch15.stages.find(s=>s.id==='15-1');
  const boss=ch15.stages.find(s=>s.boss);
  assert.ok(storyStartLines(first).some(line=>line.includes('旅の目的')));
  assert.ok(storyStartLines(boss).some(line=>line.includes('対峙')));
  assert.equal(storyClearLines(boss,{cleared:false}).length,0);
  assert.equal(storyClearLines(boss,{cleared:true}).length,1);
  assert.ok(storyClearLines(boss,{cleared:true})[0].includes('境界'));
});
