import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/patches/progression3OuterStory.js';
import { state } from '../js/state.js';
import { CHAPTERS, finalStageOf, isChapterUnlocked } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { STORY_EXPANSION_II_CH34, storyExpansionIICh34BeatForStage } from '../js/data/storyChapters34.js';
import { attachJourneyStory } from '../js/patches/story11CoreJourney.js';
import { OUTER_STORY_LEVEL_ROADMAP } from '../js/patches/progression3OuterStory.js';

const ch34=()=>CHAPTERS.find(ch=>ch.num===34);

test('Ch34 registers through the canonical expanded chapter pipeline',()=>{
  const chapter=ch34();
  assert.ok(chapter);
  assert.equal(chapter.name,'第34章 共通参照窓');
  assert.equal(chapter.stages.length,9);
  assert.equal(finalStageOf(chapter).id,'34-8');
  assert.deepEqual([chapter.stages.find(s=>s.id==='34-1').recLevel,finalStageOf(chapter).recLevel],[9400,10000]);
  assert.equal(ENEMY_TYPES.ch34_boss?.name,'共通参照拒絶機構アラインメント');
  assert.ok(ENEMY_TYPES.ch34_midboss);
  assert.ok(ENEMY_TYPES.ch34_branchboss);
  for(const id of ['ch34_weapon','ch34_weapon_epic','ch34_named_weapon','ch34_named2_body','ch34_branch'])assert.ok(getItem(id),id);
  assert.equal(PHASE9_REGION_PROFILES.ch34?.id,'common_reference_window');
});

test('Ch34 remains inside the authored shared-observation Region as later Arc V chapters append',()=>{
  const region=WORLD3_REGIONS.find(r=>r.id==='shared-observation');
  assert.deepEqual(region?.chapters.slice(0,4),[31,32,33,34]);
  assert.ok(region?.chapters.includes(34));
  assert.equal(region?.name,'共観測域');
});

test('Ch34 establishes a non-linguistic common reference frame without identifying the external world or multiverse',()=>{
  const story=STORY_EXPANSION_II_CH34[34];
  const all=JSON.stringify(story);
  assert.match(story.opening,/文字でも音声でもない/);
  assert.match(story.discovery,/境界地図/);
  assert.match(story.commonFrame,/共通尺度/);
  assert.match(story.commonFrame,/同じ不安定点/);
  assert.match(story.clear,/共通の基準/);
  assert.doesNotMatch(all,/日本|東京|Japan|Tokyo|Earth|マルチバース|multiverse|観測分岐世界|Observed Branch|分岐視|Branch Sight|視差核|Parallax Core|超観測者|Transcendent|アステリオン/i);
});

test('Ch34 mandatory Story stays on main stages while the branch remains optional',()=>{
  const chapter=ch34(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty),branch=chapter.stages.find(s=>s.branch);
  const first=storyExpansionIICh34BeatForStage(34,main[0],0,main.length);
  const discovery=storyExpansionIICh34BeatForStage(34,main[2],2,main.length);
  const mid=storyExpansionIICh34BeatForStage(34,main[3],3,main.length);
  const common=storyExpansionIICh34BeatForStage(34,main[5],5,main.length);
  const boss=storyExpansionIICh34BeatForStage(34,main.at(-1),main.length-1,main.length);
  assert.ok(first?.opening);
  assert.match(discovery?.discovery||'',/位置関係/);
  assert.match(mid?.discovery||'',/同じ一点/);
  assert.match(common?.discovery||'',/参照枠/);
  assert.ok(boss?.bossIntro&&boss?.clear);
  assert.equal(storyExpansionIICh34BeatForStage(34,branch,-1,main.length),null);
  for(const value of Object.values(STORY_EXPANSION_II_CH34[34]).filter(v=>typeof v==='string'))assert.ok(value.length<190);
});

test('journey dispatcher attaches Ch34 and sequential Story unlock derives from Ch33 finale',()=>{
  attachJourneyStory();
  const chapter=ch34(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
  assert.ok(main[0].story11?.opening);
  assert.ok(main.at(-1).story11?.clear);
  assert.equal(chapter.stages.find(s=>s.branch).story11,undefined);
  const index=CHAPTERS.findIndex(ch=>ch.num===34);
  assert.equal(isChapterUnlocked(index,id=>id==='33-8'),true);
  assert.equal(isChapterUnlocked(index,()=>false),false);
});

test('live progression keeps Ch34 at 9400-10000 without moving the Ch20 Abyss fork when later chapters append',()=>{
  const ch33=CHAPTERS.find(ch=>ch.num===33),chapter=ch34();
  assert.equal(finalStageOf(ch33).recLevel,9400);
  assert.equal(chapter.stages.find(s=>s.id==='34-1').recLevel,9400);
  assert.equal(finalStageOf(chapter).recLevel,10000);
  assert.deepEqual(OUTER_STORY_LEVEL_ROADMAP.find(x=>x.chapter===34),{chapter:34,min:9400,max:10000,oldMin:9400,oldMax:10000});
  assert.ok((state.progression3OuterStory?.max||0)>=10000);
  const original=state.isStageCleared;
  try{
    state.isStageCleared=id=>id!=='20-8';
    assert.equal(state.isAbyssUnlocked(),false);
    state.isStageCleared=id=>!String(id).startsWith('21-')&&!String(id).startsWith('34-');
    assert.equal(state.isAbyssUnlocked(),true,'Ch21+ and Ch34 must not become Abyss prerequisites');
  }finally{state.isStageCleared=original;}
});

test('Ch34 final encounter preserves the bounded mobile battle density contract',()=>{
  const boss=finalStageOf(ch34());
  assert.equal(boss.waves.reduce((sum,w)=>sum+(Number(w.count)||0),0),5);
  assert.equal(boss.waves.at(-1).count,1);
});
