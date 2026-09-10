import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { CHAPTERS, finalStageOf, isChapterUnlocked } from '../js/data/stages.js';
import { nextStageAfter } from '../js/data/resultNextStage.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { EFFECTS } from '../js/data/chapters.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { REGIONAL_ENEMY_EXPANSION } from '../js/data/regionalEnemies2.js';
import { STORY_EXPANSION_II_CH36, storyExpansionIICh36BeatForStage } from '../js/data/storyChapters36.js';
import { attachJourneyStory } from '../js/patches/story11CoreJourney.js';
import { OUTER_STORY_LEVEL_ROADMAP } from '../js/patches/progression3OuterStory.js';

const ch36=()=>CHAPTERS.find(ch=>ch.num===36);

test('Ch36 registers through the canonical expanded chapter pipeline',()=>{
  const chapter=ch36();
  assert.ok(chapter);
  assert.equal(chapter.name,'第36章 分岐記録');
  assert.equal(chapter.stages.length,9);
  assert.equal(finalStageOf(chapter).id,'36-8');
  assert.deepEqual([chapter.stages.find(s=>s.id==='36-1').recLevel,finalStageOf(chapter).recLevel],[10600,11200]);
  assert.equal(ENEMY_TYPES.ch36_boss?.name,'淘汰選別機構アービトレータ');
  assert.ok(ENEMY_TYPES.ch36_midboss);
  assert.ok(ENEMY_TYPES.ch36_branchboss);
  for(const id of ['ch36_weapon','ch36_weapon_epic','ch36_named_weapon','ch36_named2_body','ch36_branch'])assert.ok(getItem(id),id);
  assert.equal(PHASE9_REGION_PROFILES.ch36?.id,'branch_record_layer');
  assert.ok(REGIONAL_ENEMY_EXPANSION.ch36);
});

test('Ch36 named items resolve through the existing EFFECTS table, not an undefined effect slot',()=>{
  // A named item's `effect` key must exist in the shared EFFECTS table, or
  // equipment.js's buildNamed() silently produces effects:[undefined].
  const weapon=getItem('ch36_named_weapon');
  const body=getItem('ch36_named2_body');
  assert.ok(weapon.effects?.[0],'ch36_named_weapon must not have an undefined effect');
  assert.ok(body.effects?.[0],'ch36_named2_body must not have an undefined effect');
  assert.ok(Object.values(EFFECTS).includes(weapon.effects[0]));
  assert.ok(Object.values(EFFECTS).includes(body.effects[0]));
});

test('Ch36 opens Arc VI as its own single-Chapter World3 Region',()=>{
  const region=WORLD3_REGIONS.find(r=>r.id==='branch-record');
  assert.deepEqual(region?.chapters,[36]);
  assert.equal(region?.name,'分岐観測域');
  const shared=WORLD3_REGIONS.find(r=>r.id==='shared-observation');
  assert.ok(WORLD3_REGIONS.indexOf(shared)<WORLD3_REGIONS.indexOf(region));
});

test('Ch36 reframes the missing observation interval as a genuine branch point without resolving who/why Blade Vale is observed',()=>{
  const story=STORY_EXPANSION_II_CH36[36];
  const all=JSON.stringify(story);
  assert.match(story.opening,/深緑の森の二重輪郭/);
  assert.match(story.discovery,/整合した記録が二つ同時に存在/);
  assert.match(story.mid,/二つの系統が並び立つこと自体を認めない/);
  assert.match(story.stabilization,/Ch33/);
  assert.match(story.stabilization,/生体残響側の記録にだけ/);
  assert.match(story.contradiction,/分岐点そのものだった/);
  assert.match(story.bossIntro,/二つの歴史が同時に存在してはならない/);
  assert.match(story.clear,/誰が・なぜBlade Valeを観測しているのかは、依然として何一つ分かっていない/);
  // Open Mysteries #1/#2 (connector identity / observation reason) must stay
  // untouched, and mandatory Story text must not require optional Observed
  // Branch content or name its terminology.
  assert.doesNotMatch(all,/日本|東京|Japan|Tokyo|Earth|観測分岐世界|Observed Branch|分岐視|Branch Sight|視差核|Parallax Core|王樹領|深緑消失域|炎帝領/i);
});

test('Ch36 mandatory Story stays on main stages while the branch remains optional',()=>{
  const chapter=ch36(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty),branch=chapter.stages.find(s=>s.branch);
  const first=storyExpansionIICh36BeatForStage(36,main[0],0,main.length);
  const discovery=storyExpansionIICh36BeatForStage(36,main[2],2,main.length);
  const mid=storyExpansionIICh36BeatForStage(36,main[3],3,main.length);
  const stable=storyExpansionIICh36BeatForStage(36,main[5],5,main.length);
  const contradiction=storyExpansionIICh36BeatForStage(36,main[6],6,main.length);
  const boss=storyExpansionIICh36BeatForStage(36,main.at(-1),main.length-1,main.length);
  assert.ok(first?.opening);
  assert.match(discovery?.discovery||'',/整合した記録が二つ/);
  assert.match(mid?.discovery||'',/単一化官モノリス/);
  assert.match(stable?.discovery||'',/生体残響側の記録にだけ/);
  assert.match(contradiction?.discovery||'',/分岐点そのものだった/);
  assert.ok(boss?.bossIntro&&boss?.clear);
  assert.equal(storyExpansionIICh36BeatForStage(36,branch,-1,main.length),null);
  for(const value of Object.values(STORY_EXPANSION_II_CH36[36]).filter(v=>typeof v==='string'))assert.ok(value.length<190);
});

test('journey dispatcher attaches Ch36 and sequential Story unlock derives from Ch35 finale',()=>{
  attachJourneyStory();
  const chapter=ch36(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
  assert.ok(main[0].story11?.opening);
  assert.ok(main.at(-1).story11?.clear);
  assert.equal(chapter.stages.find(s=>s.branch).story11,undefined);
  const index=CHAPTERS.findIndex(ch=>ch.num===36);
  assert.equal(isChapterUnlocked(index,id=>id==='35-8'),true);
  assert.equal(isChapterUnlocked(index,()=>false),false);
});

test('Ch35 boss now correctly advances into Ch36 instead of ending the main Story path',()=>{
  const ch35boss=CHAPTERS.find(ch=>ch.num===35).stages.find(s=>s.boss);
  const next=nextStageAfter(ch35boss);
  assert.ok(next);
  assert.equal(next.id,'36-1');
});

test('live progression extends Ch35 10600 into Ch36 10600-11200, and Ch36 is now the outer-story roadmap end',()=>{
  const ch35=CHAPTERS.find(ch=>ch.num===35),chapter=ch36();
  assert.equal(finalStageOf(ch35).recLevel,10600);
  assert.equal(chapter.stages.find(s=>s.id==='36-1').recLevel,10600);
  assert.equal(finalStageOf(chapter).recLevel,11200);
  assert.deepEqual(OUTER_STORY_LEVEL_ROADMAP.at(-1),{chapter:36,min:10600,max:11200,oldMin:10600,oldMax:11200});
  assert.equal(state.progression3OuterStory?.max,11200);
});

test('Ch36 final encounter preserves the bounded mobile battle density contract',()=>{
  const boss=finalStageOf(ch36());
  assert.equal(boss.waves.reduce((sum,w)=>sum+(Number(w.count)||0),0),5);
  assert.equal(boss.waves.at(-1).count,1);
});
