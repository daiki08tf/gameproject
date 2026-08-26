import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, finalStageOf, isAbyssUnlocked } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { PHASE9_REGION_PROFILES } from '../js/data/regionsPhase9.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { STORY_EXPANSION_I_FINALE, storyExpansionIFinaleBeatForStage } from '../js/data/storyChapters30.js';
import { attachJourneyStory } from '../js/patches/story11CoreJourney.js';

const ch30=()=>CHAPTERS.find(ch=>ch.num===30);

test('Ch30 completes Story Expansion I through the established expanded chapter pipeline',()=>{
  const chapter=ch30();
  assert.ok(chapter);
  assert.equal(chapter.name,'第30章 外部観測核');
  assert.equal(chapter.stages.length,9);
  assert.equal(finalStageOf(chapter).id,'30-8');
  assert.deepEqual([chapter.stages.filter(s=>!s.branch)[0].recLevel,finalStageOf(chapter).recLevel],[6200,7600]);
  assert.equal(ENEMY_TYPES.ch30_boss?.name,'外界照合者オブザーバ');
  assert.ok(ENEMY_TYPES.ch30_midboss);
  assert.ok(ENEMY_TYPES.ch30_branchboss);
  for(const id of ['ch30_weapon','ch30_weapon_epic','ch30_named_weapon','ch30_named2_body','ch30_branch'])assert.ok(getItem(id),id);
  assert.equal(PHASE9_REGION_PROFILES.ch30?.id,'external_observation_core');
});

test('Ch30 remains in the existing reverse-observation regional surface',()=>{
  const reverse=WORLD3_REGIONS.find(r=>r.id==='reverse-observation');
  assert.deepEqual(reverse?.chapters,[26,27,28,29,30]);
});

test('Ch30 confirms bidirectional recognition while keeping the external world unnamed',()=>{
  const story=STORY_EXPANSION_I_FINALE[30];
  const all=JSON.stringify(story);
  assert.doesNotMatch(all,/日本|東京|Japan|Tokyo/);
  assert.match(story.discovery,/文明圏/);
  assert.match(story.mid,/MOTHER|ARCHITECT/);
  assert.match(story.clear,/こちらを認識/);
  assert.match(story.clear,/まだ分からない/);
});

test('Ch30 mandatory beats attach only to main stages and remain compact',()=>{
  const chapter=ch30(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty),branch=chapter.stages.find(s=>s.branch);
  const first=storyExpansionIFinaleBeatForStage(30,main[0],0,main.length);
  const mid=storyExpansionIFinaleBeatForStage(30,main.find(s=>s.midBoss),3,main.length);
  const boss=storyExpansionIFinaleBeatForStage(30,main.at(-1),main.length-1,main.length);
  assert.ok(first?.opening);
  assert.ok(mid?.discovery);
  assert.ok(boss?.bossIntro&&boss?.clear);
  assert.equal(storyExpansionIFinaleBeatForStage(30,branch,-1,main.length),null);
  for(const value of Object.values(STORY_EXPANSION_I_FINALE[30]).filter(v=>typeof v==='string'))assert.ok(value.length<180);
});

test('journey runtime attaches Ch30 without creating a new progression gate',()=>{
  attachJourneyStory();
  const chapter=ch30(),main=chapter.stages.filter(s=>!s.branch&&!s.bounty);
  assert.ok(main[0].story11?.opening);
  assert.ok(main.at(-1).story11?.clear);
  assert.equal(chapter.stages.find(s=>s.branch).story11,undefined);
  const clearedThrough25=new Set(CHAPTERS.filter(ch=>ch.num<=25).map(ch=>finalStageOf(ch).id));
  assert.equal(isAbyssUnlocked(id=>clearedThrough25.has(id)),true);
});

test('Ch30 boss encounter density preserves the mobile battle safety envelope',()=>{
  const boss=finalStageOf(ch30());
  assert.equal(boss.waves.reduce((sum,w)=>sum+w.count,0),5);
  assert.equal(boss.waves.at(-1).count,1);
});
