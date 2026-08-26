import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, finalStageOf, isAbyssUnlocked } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { REVERSE_OBSERVATION_STORY, reverseObservationStoryBeatForStage } from '../js/data/storyChapters26to29.js';

const expected=[
  [26,'零外接続域','例外管理者エクシオン'],
  [27,'遠信残響帯','遠信王レゾナード'],
  [28,'機界監査層','上位監査体オーディタ'],
  [29,'逆観測門','接続監守パラドクス'],
];

test('Story Expansion I front registers Ch26-29 through the canonical chapter pipeline',()=>{
  for(const [num,name,bossName] of expected){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    assert.ok(chapter,`missing Ch${num}`);
    assert.equal(chapter.name,`第${num}章 ${name}`);
    assert.equal(chapter.stages.length,9,`Ch${num} should have 8 main stages plus one optional branch`);
    assert.equal(finalStageOf(chapter).id,`${num}-8`);
    assert.equal(ENEMY_TYPES[`ch${num}_boss`]?.name,bossName);
    assert.ok(ENEMY_TYPES[`ch${num}_midboss`]);
    assert.ok(ENEMY_TYPES[`ch${num}_branchboss`]);
    assert.ok(getItem(`ch${num}_weapon`));
    assert.ok(getItem(`ch${num}_weapon_epic`));
    assert.ok(getItem(`ch${num}_branch`));
    assert.ok(PHASE9_REGION_PROFILES[`ch${num}`]);
  }
});

test('Story Expansion I front remains the first four chapters of the reverse-observation region',()=>{
  const outer=WORLD3_REGIONS.find(r=>r.id==='outer-world');
  const reverse=WORLD3_REGIONS.find(r=>r.id==='reverse-observation');
  assert.deepEqual(outer?.chapters,[21,22,23,24,25]);
  assert.deepEqual(reverse?.chapters.slice(0,4),[26,27,28,29]);
});

test('Ch26-29 story escalates the Eighth Key mystery without naming Japan or Tokyo',()=>{
  assert.deepEqual(Object.keys(REVERSE_OBSERVATION_STORY),['26','27','28','29']);
  const allText=JSON.stringify(REVERSE_OBSERVATION_STORY);
  assert.doesNotMatch(allText,/日本|東京/);
  assert.match(REVERSE_OBSERVATION_STORY[26].discovery,/例外接続/);
  assert.match(REVERSE_OBSERVATION_STORY[27].discovery,/規則正しい光|金属/);
  assert.match(REVERSE_OBSERVATION_STORY[28].discovery,/MOTHER/);
  assert.match(REVERSE_OBSERVATION_STORY[28].mid,/見られていた|観測/);
  assert.match(REVERSE_OBSERVATION_STORY[29].discovery,/外部接続点/);
  assert.match(REVERSE_OBSERVATION_STORY[29].clear,/応答/);
});

test('mandatory story stays on main stages and branches remain optional',()=>{
  for(const [num] of expected){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    const main=chapter.stages.filter(stage=>!stage.branch&&!stage.bounty);
    const first=reverseObservationStoryBeatForStage(num,main[0],0,main.length);
    const boss=reverseObservationStoryBeatForStage(num,main.at(-1),main.length-1,main.length);
    const branch=chapter.stages.find(stage=>stage.branch);
    assert.ok(first?.opening);
    assert.ok(boss?.bossIntro);
    assert.ok(boss?.clear);
    assert.equal(reverseObservationStoryBeatForStage(num,branch,-1,main.length),null);
  }
});

test('adding later story chapters does not silently move the existing Abyss unlock gate',()=>{
  const clearedThrough25=new Set(CHAPTERS.filter(ch=>ch.num<=25).map(ch=>finalStageOf(ch).id));
  assert.equal(isAbyssUnlocked(id=>clearedThrough25.has(id)),true);
  const missingCh25=new Set([...clearedThrough25].filter(id=>id!=='25-8'));
  assert.equal(isAbyssUnlocked(id=>missingCh25.has(id)),false);
});

test('new expanded boss waves keep the established bounded encounter density',()=>{
  for(const [num] of expected){
    const boss=finalStageOf(CHAPTERS.find(ch=>ch.num===num));
    const total=boss.waves.reduce((sum,w)=>sum+(Number(w.count)||0),0);
    assert.equal(total,5);
    assert.equal(boss.waves.at(-1).count,1);
  }
});
