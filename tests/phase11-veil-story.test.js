import test from 'node:test';
import assert from 'node:assert/strict';
import { VEIL_STORY_CHAPTERS, veilStoryBeatForStage } from '../js/data/storyChapters16to20.js';
import { CHAPTER_EXPANSION_16_20 } from '../js/data/chapters16to20.js';

test('The Veil arc covers exactly chapters 16 through 20',()=>{
  assert.deepEqual(VEIL_STORY_CHAPTERS.map(x=>x.chapter),[16,17,18,19,20]);
  assert.equal(VEIL_STORY_CHAPTERS.length,CHAPTER_EXPANSION_16_20.length);
});

test('The Veil name is not disclosed before chapter 19',()=>{
  for(const chapter of VEIL_STORY_CHAPTERS.filter(x=>x.chapter<19)){
    assert.equal([chapter.objective,chapter.opening,chapter.discovery,chapter.bossIntro,chapter.clear].join(' ').includes('The Veil'),false);
  }
  assert.match(VEIL_STORY_CHAPTERS.find(x=>x.chapter===19).opening,/The Veil/);
});

test('chapter 20 reveals Abyss as the final guardian rather than the invader',()=>{
  const ch20=VEIL_STORY_CHAPTERS.find(x=>x.chapter===20);
  assert.match(ch20.discovery,/最後の門番/);
  assert.match(ch20.clear,/門番を失った/);
});

test('expanded story beat stays compact and ignores branch stages',()=>{
  const normal={id:'16-1',boss:false};
  const boss={id:'16-8',boss:true};
  const branch={id:'16-B',branch:true,boss:true};
  const opening=veilStoryBeatForStage(16,normal,0,8);
  const ending=veilStoryBeatForStage(16,boss,7,8);
  assert.ok(opening.opening);
  assert.ok(ending.bossIntro);
  assert.ok(ending.clear);
  assert.equal(veilStoryBeatForStage(16,branch,8,8),null);
});
