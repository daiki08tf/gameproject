import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/patches/progression3OuterStory.js';
import { state } from '../js/state.js';
import { CHAPTERS, finalStageOf, isChapterUnlocked } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { STORY_EXPANSION_II_CH35, storyExpansionIICh35BeatForStage } from '../js/data/storyChapters35.js';
import { attachJourneyStory } from '../js/patches/story11CoreJourney.js';
import { OUTER_STORY_LEVEL_ROADMAP } from '../js/patches/progression3OuterStory.js';

const ch35=()=>CHAPTERS.find(ch=>ch.num===35);

test('Ch35 registers through the canonical expanded chapter pipeline',()=>{
  const chapter=ch35();
  assert.ok(chapter);
  assert.equal(chapter.name,'第35章 共観測点');
  assert.equal(chapter.stages.length,9);
  assert.equal(finalStageOf(chapter).id,'35-8');
  assert.deepEqual([chapter.stages.find(s=>s.id==='35-1').recLevel,finalStageOf(chapter).recLevel],[10000,10600]);
  assert.equal(ENEMY_TYPES.ch35_boss?.name,'同期破綻機構ディソナンス');
  assert.ok(ENEMY_TYPES.ch35_midboss);
  assert.ok(ENEMY_TYPES.ch35_branchboss);
  for(const id of ['ch35_weapon','ch35_weapon_epic','ch35_named_weapon','ch35_named2_body','ch35_branch'])assert.ok(getItem(id),id);
  assert.equal(PHASE9_REGION_PROFILES.ch35?.id,'shared_observation_point');
});

test('Ch35 completes the authored shared-observation Region without creating a new Region',()=>{
  const region=WORLD3_REGIONS.find(r=>r.id==='shared-observation');
  assert.deepEqual(region?.chapters,[31,32,33,34,35]);
  assert.equal(region?.name,'共観測域');
});

test('Ch35 proves coordinated observation and leaves one bounded impossible contour as a future mystery seed',()=>{
  const story=STORY_EXPANSION_II_CH35[35];
  const all=JSON.stringify(story);
  assert.match(story.opening,/双方が自分の側から同じ異常/);
  assert.match(story.discovery,/一つの焦点/);
  assert.match(story.stabilization,/同時に観測/);
  assert.match(story.contradiction,/深緑の森/);
  assert.match(story.contradiction,/巨大な樹冠/);
  assert.match(story.contradiction,/森林反応そのものが存在しない/);
  assert.match(story.bossIntro,/敵対文明の攻撃ではない/);
  assert.match(story.clear,/協調観測/);
  assert.doesNotMatch(all,/日本|東京|Japan|Tokyo|Earth|マルチバース|multiverse|観測分岐世界|Observed Branch|分岐視|Branch Sight|視差核|Parallax Core|超観測者|Transcendent|アステリオン|王樹領|深緑消失域/i);
});

test('Ch35 mandatory Story stays on main stages while the branch remains optional',()=>{
  const chapter=ch35(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty),branch=chapter.stages.find(s=>s.branch);
  const first=storyExpansionIICh35BeatForStage(35,main[0],0,main.length);
  const discovery=storyExpansionIICh35BeatForStage(35,main[2],2,main.length);
  const mid=storyExpansionIICh35BeatForStage(35,main[3],3,main.length);
  const stable=storyExpansionIICh35BeatForStage(35,main[5],5,main.length);
  const contradiction=storyExpansionIICh35BeatForStage(35,main[6],6,main.length);
  const boss=storyExpansionIICh35BeatForStage(35,main.at(-1),main.length-1,main.length);
  assert.ok(first?.opening);
  assert.match(discovery?.discovery||'',/第八鍵/);
  assert.match(mid?.discovery||'',/同じ異常点/);
  assert.match(stable?.discovery||'',/二つの観測列/);
  assert.match(contradiction?.discovery||'',/二重輪郭/);
  assert.ok(boss?.bossIntro&&boss?.clear);
  assert.equal(storyExpansionIICh35BeatForStage(35,branch,-1,main.length),null);
  for(const value of Object.values(STORY_EXPANSION_II_CH35[35]).filter(v=>typeof v==='string'))assert.ok(value.length<190);
});

test('journey dispatcher attaches Ch35 and sequential Story unlock derives from Ch34 finale',()=>{
  attachJourneyStory();
  const chapter=ch35(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
  assert.ok(main[0].story11?.opening);
  assert.ok(main.at(-1).story11?.clear);
  assert.equal(chapter.stages.find(s=>s.branch).story11,undefined);
  const index=CHAPTERS.findIndex(ch=>ch.num===35);
  assert.equal(isChapterUnlocked(index,id=>id==='34-8'),true);
  assert.equal(isChapterUnlocked(index,()=>false),false);
});

test('live progression extends Ch34 10000 into Ch35 10000-10600 without moving the Ch20 Abyss fork',()=>{
  const ch34=CHAPTERS.find(ch=>ch.num===34),chapter=ch35();
  assert.equal(finalStageOf(ch34).recLevel,10000);
  assert.equal(chapter.stages.find(s=>s.id==='35-1').recLevel,10000);
  assert.equal(finalStageOf(chapter).recLevel,10600);
  assert.deepEqual(OUTER_STORY_LEVEL_ROADMAP.at(-1),{chapter:35,min:10000,max:10600,oldMin:10000,oldMax:10600});
  assert.equal(state.progression3OuterStory?.max,10600);
  const original=state.isStageCleared;
  try{
    state.isStageCleared=id=>id!=='20-8';
    assert.equal(state.isAbyssUnlocked(),false);
    state.isStageCleared=id=>!String(id).startsWith('21-')&&!String(id).startsWith('35-');
    assert.equal(state.isAbyssUnlocked(),true,'Ch21+ and Ch35 must not become Abyss prerequisites');
  }finally{state.isStageCleared=original;}
});

test('Ch35 final encounter preserves the bounded mobile battle density contract',()=>{
  const boss=finalStageOf(ch35());
  assert.equal(boss.waves.reduce((sum,w)=>sum+(Number(w.count)||0),0),5);
  assert.equal(boss.waves.at(-1).count,1);
});
