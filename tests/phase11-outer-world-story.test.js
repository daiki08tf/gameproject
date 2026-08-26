import test from 'node:test';
import assert from 'node:assert/strict';
import { OUTER_WORLD_STORY, outerWorldStoryBeatForStage } from '../js/data/storyChapters21to25.js';
import { CHAPTER_EXPANSION_21_25 } from '../js/data/chapters21to25.js';

test('outer-world arc covers exactly chapters 21 through 25',()=>{
  assert.deepEqual(Object.keys(OUTER_WORLD_STORY).map(Number),[21,22,23,24,25]);
  assert.equal(Object.keys(OUTER_WORLD_STORY).length,CHAPTER_EXPANSION_21_25.length);
});

test('story escalation reaches the Eighth Key and Machine World without revealing the Modern World',()=>{
  const all=Object.values(OUTER_WORLD_STORY).map(x=>[x.objective,x.opening,x.discovery,x.mid,x.bossIntro,x.clear].join(' ')).join(' ');
  assert.match(all,/第八/);
  assert.match(all,/機界/);
  assert.equal(/東京|日本|現代世界|スマートフォン|携帯電話/.test(all),false);
});

test('chapter 25 establishes node and management-system mystery',()=>{
  const ch25=OUTER_WORLD_STORY[25];
  assert.match(ch25.discovery,/一ノード/);
  assert.match(ch25.bossIntro,/管理系の外/);
  assert.match(ch25.clear,/機界/);
});

test('main story beats stay compact and optional branch remains optional',()=>{
  const opening=outerWorldStoryBeatForStage(21,{id:'21-1'},0,8);
  const mid=outerWorldStoryBeatForStage(21,{id:'21-4',midBoss:true},3,8);
  const boss=outerWorldStoryBeatForStage(25,{id:'25-8',boss:true},7,8);
  const branch=outerWorldStoryBeatForStage(25,{id:'25-B',branch:true},8,8);
  assert.match(opening.act,/外縁世界/);
  assert.ok(opening.opening);
  assert.ok(mid.discovery);
  assert.ok(boss.bossIntro);
  assert.ok(boss.clear);
  assert.equal(branch,null);
});

test('narrative source does not alter existing chapter progression data',()=>{
  assert.deepEqual(CHAPTER_EXPANSION_21_25.map(ch=>ch.recLevel),[
    [700,950],[950,1250],[1250,1600],[1600,2000],[2000,2500],
  ]);
});
