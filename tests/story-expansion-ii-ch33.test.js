import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/patches/progression3OuterStory.js';
import { state } from '../js/state.js';
import { CHAPTERS, finalStageOf, isChapterUnlocked } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { STORY_EXPANSION_II_CH33, storyExpansionIICh33BeatForStage } from '../js/data/storyChapters33.js';
import { attachJourneyStory } from '../js/patches/story11CoreJourney.js';
import { OUTER_STORY_LEVEL_ROADMAP } from '../js/patches/progression3OuterStory.js';

const ch33=()=>CHAPTERS.find(ch=>ch.num===33);

test('Ch33 registers through the canonical expanded chapter pipeline',()=>{
  const chapter=ch33();
  assert.ok(chapter);
  assert.equal(chapter.name,'第33章 欠落観測層');
  assert.equal(chapter.stages.length,9);
  assert.equal(finalStageOf(chapter).id,'33-8');
  assert.deepEqual([chapter.stages.find(s=>s.id==='33-1').recLevel,finalStageOf(chapter).recLevel],[8800,9400]);
  assert.equal(ENEMY_TYPES.ch33_boss?.name,'欠落補正機構ブラインドスポット');
  assert.ok(ENEMY_TYPES.ch33_midboss);
  assert.ok(ENEMY_TYPES.ch33_branchboss);
  for(const id of ['ch33_weapon','ch33_weapon_epic','ch33_named_weapon','ch33_named2_body','ch33_branch'])assert.ok(getItem(id),id);
  assert.equal(PHASE9_REGION_PROFILES.ch33?.id,'missing_interval_layer');
});

test('Ch33 extends the authored shared-observation Region without creating a parallel Region',()=>{
  const region=WORLD3_REGIONS.find(r=>r.id==='shared-observation');
  assert.deepEqual(region?.chapters,[31,32,33]);
  assert.equal(region?.name,'共観測域');
});

test('Ch33 establishes a systemic missing interval while preserving both live hypotheses',()=>{
  const story=STORY_EXPANSION_II_CH33[33];
  const all=JSON.stringify(story);
  assert.match(story.discovery,/同じ位置の一拍/);
  assert.match(story.livingMemory,/機械側の記録/);
  assert.match(story.hypothesis,/消した/);
  assert.match(story.hypothesis,/保存できず/);
  assert.match(story.clear,/系統的な盲点/);
  assert.doesNotMatch(story.clear,/消されたのだ|削除されたのだ|犯人|設計者は/);
  assert.doesNotMatch(all,/日本|東京|Japan|Tokyo|Earth|マルチバース|multiverse|観測分岐世界|Observed Branch|分岐視|Branch Sight|視差核|Parallax Core|超観測者|Transcendent|アステリオン/i);
});

test('Ch33 mandatory Story stays on main stages while the branch remains optional',()=>{
  const chapter=ch33(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty),branch=chapter.stages.find(s=>s.branch);
  const first=storyExpansionIICh33BeatForStage(33,main[0],0,main.length);
  const discovery=storyExpansionIICh33BeatForStage(33,main[2],2,main.length);
  const mid=storyExpansionIICh33BeatForStage(33,main[3],3,main.length);
  const living=storyExpansionIICh33BeatForStage(33,main[4],4,main.length);
  const hypothesis=storyExpansionIICh33BeatForStage(33,main[5],5,main.length);
  const boss=storyExpansionIICh33BeatForStage(33,main.at(-1),main.length-1,main.length);
  assert.ok(first?.opening);
  assert.match(discovery?.discovery||'',/欠落/);
  assert.match(mid?.discovery||'',/補間/);
  assert.match(living?.discovery||'',/根脈/);
  assert.match(hypothesis?.discovery||'',/二つ/);
  assert.ok(boss?.bossIntro&&boss?.clear);
  assert.equal(storyExpansionIICh33BeatForStage(33,branch,-1,main.length),null);
  for(const value of Object.values(STORY_EXPANSION_II_CH33[33]).filter(v=>typeof v==='string'))assert.ok(value.length<190);
});

test('journey dispatcher attaches Ch33 and sequential Story unlock derives from Ch32 finale',()=>{
  attachJourneyStory();
  const chapter=ch33(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
  assert.ok(main[0].story11?.opening);
  assert.ok(main.at(-1).story11?.clear);
  assert.equal(chapter.stages.find(s=>s.branch).story11,undefined);
  const index=CHAPTERS.findIndex(ch=>ch.num===33);
  assert.equal(isChapterUnlocked(index,id=>id==='32-8'),true);
  assert.equal(isChapterUnlocked(index,()=>false),false);
});

test('live progression extends Ch32 8800 into Ch33 8800-9400 without moving the Ch20 Abyss fork',()=>{
  const ch32=CHAPTERS.find(ch=>ch.num===32),chapter=ch33();
  assert.equal(finalStageOf(ch32).recLevel,8800);
  assert.equal(chapter.stages.find(s=>s.id==='33-1').recLevel,8800);
  assert.equal(finalStageOf(chapter).recLevel,9400);
  assert.deepEqual(OUTER_STORY_LEVEL_ROADMAP.at(-1),{chapter:33,min:8800,max:9400,oldMin:8800,oldMax:9400});
  assert.equal(state.progression3OuterStory?.max,9400);
  const original=state.isStageCleared;
  try{
    state.isStageCleared=id=>id!=='20-8';
    assert.equal(state.isAbyssUnlocked(),false);
    state.isStageCleared=id=>!String(id).startsWith('21-')&&!String(id).startsWith('33-');
    assert.equal(state.isAbyssUnlocked(),true,'Ch21+ and Ch33 must not become Abyss prerequisites');
  }finally{state.isStageCleared=original;}
});

test('Ch33 final encounter preserves the bounded mobile battle density contract',()=>{
  const boss=finalStageOf(ch33());
  assert.equal(boss.waves.reduce((sum,w)=>sum+(Number(w.count)||0),0),5);
  assert.equal(boss.waves.at(-1).count,1);
});
