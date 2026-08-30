import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/patches/progression3OuterStory.js';
import { state } from '../js/state.js';
import { CHAPTERS, finalStageOf, isChapterUnlocked } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { STORY_EXPANSION_II_CH31, storyExpansionIICh31BeatForStage } from '../js/data/storyChapters31.js';
import { attachJourneyStory } from '../js/patches/story11CoreJourney.js';
import { OUTER_STORY_LEVEL_ROADMAP } from '../js/patches/progression3OuterStory.js';

const ch31=()=>CHAPTERS.find(ch=>ch.num===31);

test('Ch31 registers through the canonical expanded chapter pipeline',()=>{
  const chapter=ch31();
  assert.ok(chapter);
  assert.equal(chapter.name,'第31章 応答文法層');
  assert.equal(chapter.stages.length,9);
  assert.equal(finalStageOf(chapter).id,'31-8');
  assert.deepEqual([chapter.stages.find(s=>s.id==='31-1').recLevel,finalStageOf(chapter).recLevel],[7600,8200]);
  assert.equal(ENEMY_TYPES.ch31_boss?.name,'未完了同期機構グラマ');
  assert.ok(ENEMY_TYPES.ch31_midboss);
  assert.ok(ENEMY_TYPES.ch31_branchboss);
  for(const id of ['ch31_weapon','ch31_weapon_epic','ch31_named_weapon','ch31_named2_body','ch31_branch'])assert.ok(getItem(id),id);
  assert.equal(PHASE9_REGION_PROFILES.ch31?.id,'response_grammar_layer');
});

test('Ch31 starts Arc V inside the authored shared-observation Region',()=>{
  const region=WORLD3_REGIONS.find(r=>r.id==='shared-observation');
  assert.deepEqual(region?.chapters,[31]);
  assert.equal(region?.name,'共観測域');
});

test('Ch31 proves procedural response grammar without explicitly revealing Observed Branches',()=>{
  const story=STORY_EXPANSION_II_CH31[31];
  const all=JSON.stringify(story);
  assert.match(story.discovery,/受理/);
  assert.match(story.discovery,/再試行/);
  assert.match(story.discovery,/確認/);
  assert.match(story.clear,/文法/);
  assert.match(story.contradiction,/送信元座標そのものが存在しない/);
  assert.doesNotMatch(all,/日本|東京|Japan|Tokyo|Earth|マルチバース|multiverse|観測分岐世界|Observed Branch|分岐視|Branch Sight|視差核|Parallax Core|超観測者|Transcendent|アステリオン/i);
});

test('Ch31 mandatory Story remains on main stages and the secret branch stays optional',()=>{
  const chapter=ch31(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty),branch=chapter.stages.find(s=>s.branch);
  const first=storyExpansionIICh31BeatForStage(31,main[0],0,main.length);
  const discovery=storyExpansionIICh31BeatForStage(31,main[2],2,main.length);
  const mid=storyExpansionIICh31BeatForStage(31,main[3],3,main.length);
  const contradiction=storyExpansionIICh31BeatForStage(31,main[5],5,main.length);
  const boss=storyExpansionIICh31BeatForStage(31,main.at(-1),main.length-1,main.length);
  assert.ok(first?.opening);
  assert.match(discovery?.discovery||'',/受理/);
  assert.match(mid?.discovery||'',/リトライ/);
  assert.match(contradiction?.discovery||'',/送信元座標/);
  assert.ok(boss?.bossIntro&&boss?.clear);
  assert.equal(storyExpansionIICh31BeatForStage(31,branch,-1,main.length),null);
  for(const value of Object.values(STORY_EXPANSION_II_CH31[31]).filter(v=>typeof v==='string'))assert.ok(value.length<190);
});

test('journey dispatcher attaches Ch31 and sequential Story unlock still derives from Ch30 finale',()=>{
  attachJourneyStory();
  const chapter=ch31(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
  assert.ok(main[0].story11?.opening);
  assert.ok(main.at(-1).story11?.clear);
  assert.equal(chapter.stages.find(s=>s.branch).story11,undefined);
  const index=CHAPTERS.findIndex(ch=>ch.num===31);
  assert.equal(isChapterUnlocked(index,id=>id==='30-8'),true);
  assert.equal(isChapterUnlocked(index,()=>false),false);
});

test('live progression extends Ch30 7600 into Ch31 7600-8200 without moving the Ch20 Abyss fork',()=>{
  const ch30=CHAPTERS.find(ch=>ch.num===30),chapter=ch31();
  assert.equal(finalStageOf(ch30).recLevel,7600);
  assert.equal(chapter.stages.find(s=>s.id==='31-1').recLevel,7600);
  assert.equal(finalStageOf(chapter).recLevel,8200);
  assert.deepEqual(OUTER_STORY_LEVEL_ROADMAP.at(-1),{chapter:31,min:7600,max:8200,oldMin:7600,oldMax:8200});
  assert.equal(state.progression3OuterStory?.max,8200);
  const original=state.isStageCleared;
  try{
    state.isStageCleared=id=>id!=='20-8';
    assert.equal(state.isAbyssUnlocked(),false);
    state.isStageCleared=id=>!String(id).startsWith('21-')&&!String(id).startsWith('31-');
    assert.equal(state.isAbyssUnlocked(),true,'Ch21+ and Ch31 must not become Abyss prerequisites');
  }finally{state.isStageCleared=original;}
});

test('Ch31 final encounter preserves the bounded mobile battle density contract',()=>{
  const boss=finalStageOf(ch31());
  assert.equal(boss.waves.reduce((sum,w)=>sum+(Number(w.count)||0),0),5);
  assert.equal(boss.waves.at(-1).count,1);
});
