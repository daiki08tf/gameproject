import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/patches/progression3OuterStory.js';
import { state } from '../js/state.js';
import { CHAPTERS, finalStageOf, isChapterUnlocked } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { STORY_EXPANSION_II_CH32, storyExpansionIICh32BeatForStage } from '../js/data/storyChapters32.js';
import { attachJourneyStory } from '../js/patches/story11CoreJourney.js';
import { OUTER_STORY_LEVEL_ROADMAP } from '../js/patches/progression3OuterStory.js';

const ch32=()=>CHAPTERS.find(ch=>ch.num===32);

test('Ch32 registers through the canonical expanded chapter pipeline',()=>{
  const chapter=ch32();
  assert.ok(chapter);
  assert.equal(chapter.name,'第32章 第八鍵裏面層');
  assert.equal(chapter.stages.length,9);
  assert.equal(finalStageOf(chapter).id,'32-8');
  assert.deepEqual([chapter.stages.find(s=>s.id==='32-1').recLevel,finalStageOf(chapter).recLevel],[8200,8800]);
  assert.equal(ENEMY_TYPES.ch32_boss?.name,'対向同期機構デュプレクス');
  assert.ok(ENEMY_TYPES.ch32_midboss);
  assert.ok(ENEMY_TYPES.ch32_branchboss);
  for(const id of ['ch32_weapon','ch32_weapon_epic','ch32_named_weapon','ch32_named2_body','ch32_branch'])assert.ok(getItem(id),id);
  assert.equal(PHASE9_REGION_PROFILES.ch32?.id,'eighth_key_reverse_layer');
});

test('Ch32 remains inside the authored shared-observation Region',()=>{
  const region=WORLD3_REGIONS.find(r=>r.id==='shared-observation');
  assert.deepEqual(region?.chapters,[31,32]);
  assert.equal(region?.name,'共観測域');
});

test('Ch32 reframes the Eighth Key as an exception endpoint with a counterpart without revealing the multiverse',()=>{
  const story=STORY_EXPANSION_II_CH32[32];
  const all=JSON.stringify(story);
  assert.match(story.discovery,/七鍵/);
  assert.match(story.discovery,/外側/);
  assert.match(story.counterpart,/対向/);
  assert.match(story.clear,/八本目の鍵.*ではない/);
  assert.match(story.clear,/例外接続/);
  assert.doesNotMatch(all,/日本|東京|Japan|Tokyo|Earth|マルチバース|multiverse|観測分岐世界|Observed Branch|分岐視|Branch Sight|視差核|Parallax Core|超観測者|Transcendent|アステリオン/i);
});

test('Ch32 mandatory Story stays on main stages while the branch remains optional',()=>{
  const chapter=ch32(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty),branch=chapter.stages.find(s=>s.branch);
  const first=storyExpansionIICh32BeatForStage(32,main[0],0,main.length);
  const discovery=storyExpansionIICh32BeatForStage(32,main[2],2,main.length);
  const mid=storyExpansionIICh32BeatForStage(32,main[3],3,main.length);
  const counterpart=storyExpansionIICh32BeatForStage(32,main[5],5,main.length);
  const boss=storyExpansionIICh32BeatForStage(32,main.at(-1),main.length-1,main.length);
  assert.ok(first?.opening);
  assert.match(discovery?.discovery||'',/権限木/);
  assert.match(mid?.discovery||'',/第二署名/);
  assert.match(counterpart?.discovery||'',/対向/);
  assert.ok(boss?.bossIntro&&boss?.clear);
  assert.equal(storyExpansionIICh32BeatForStage(32,branch,-1,main.length),null);
  for(const value of Object.values(STORY_EXPANSION_II_CH32[32]).filter(v=>typeof v==='string'))assert.ok(value.length<190);
});

test('journey dispatcher attaches Ch32 and sequential Story unlock derives from Ch31 finale',()=>{
  attachJourneyStory();
  const chapter=ch32(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
  assert.ok(main[0].story11?.opening);
  assert.ok(main.at(-1).story11?.clear);
  assert.equal(chapter.stages.find(s=>s.branch).story11,undefined);
  const index=CHAPTERS.findIndex(ch=>ch.num===32);
  assert.equal(isChapterUnlocked(index,id=>id==='31-8'),true);
  assert.equal(isChapterUnlocked(index,()=>false),false);
});

test('live progression extends Ch31 8200 into Ch32 8200-8800 without moving the Ch20 Abyss fork',()=>{
  const ch31=CHAPTERS.find(ch=>ch.num===31),chapter=ch32();
  assert.equal(finalStageOf(ch31).recLevel,8200);
  assert.equal(chapter.stages.find(s=>s.id==='32-1').recLevel,8200);
  assert.equal(finalStageOf(chapter).recLevel,8800);
  assert.deepEqual(OUTER_STORY_LEVEL_ROADMAP.at(-1),{chapter:32,min:8200,max:8800,oldMin:8200,oldMax:8800});
  assert.equal(state.progression3OuterStory?.max,8800);
  const original=state.isStageCleared;
  try{
    state.isStageCleared=id=>id!=='20-8';
    assert.equal(state.isAbyssUnlocked(),false);
    state.isStageCleared=id=>!String(id).startsWith('21-')&&!String(id).startsWith('32-');
    assert.equal(state.isAbyssUnlocked(),true,'Ch21+ and Ch32 must not become Abyss prerequisites');
  }finally{state.isStageCleared=original;}
});

test('Ch32 final encounter preserves the bounded mobile battle density contract',()=>{
  const boss=finalStageOf(ch32());
  assert.equal(boss.waves.reduce((sum,w)=>sum+(Number(w.count)||0),0),5);
  assert.equal(boss.waves.at(-1).count,1);
});
