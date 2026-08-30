import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { state } from '../js/state.js';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import {
  ADVENTURE4_HIGHLEVEL_STATES,
  ADVENTURE4_HIGHLEVEL_STATE_ORDER,
  adventure4HighLevelState,
} from '../js/data/adventureWorld4HighLevel.js';
import '../js/patches/progressionCore.js';
import '../js/patches/adventureWorld4HighLevelRuntime.js';

const REGION_ID='frontier';

function finalStageOf(chapter){return chapter.stages.find(s=>s.boss)||chapter.stages.at(-1);}
function clearRegion(regionId){
  const region=buildWorld4RegionCatalog(CHAPTERS).find(r=>r.id===regionId);
  for(const num of region.chapterNumbers){
    const chapter=CHAPTERS.find(ch=>Number(ch.num)===num);
    state.data.stageProgress[finalStageOf(chapter).id]={cleared:true};
  }
}

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.stageProgress={};
  state.data.world2={keyFragments:0,keys:{},discoveries:{},flags:{},eventsSeen:{},eventChains:{},keyDungeonClears:{},adventureEventMeta:{adventureIndex:0,lastSeenAdventure:{},recentEventIds:[]},lastEvent:null};
  state.data.riftKeys=[];state.data.riftKeySeq=1;
  state.data.settlementBuildings={hall:0,inn:0,market:0,watch:0,ranch:0};
  state.data.worldTierId='normal';state.data.bountyNemesis={};state.data.bounty2Wins={};state.data.bountyMarks=0;
  state.data.characterLevel=99999; // unlock every World Tier rank so setWorldTierId below isn't clamped back down
}

test('W29 pure state ladder reuses the existing W22 elite/anomaly/endgame thresholds (rank 1/2/4)',()=>{
  assert.equal(adventure4HighLevelState({rank:0,regionCompleted:true}).id,'normal');
  assert.equal(adventure4HighLevelState({rank:1,regionCompleted:true}).id,'corrupted');
  assert.equal(adventure4HighLevelState({rank:2,regionCompleted:true}).id,'nemesisTerritory');
  assert.equal(adventure4HighLevelState({rank:3,regionCompleted:true}).id,'nemesisTerritory');
  assert.equal(adventure4HighLevelState({rank:4,regionCompleted:true}).id,'riftOverrun');
  assert.equal(adventure4HighLevelState({rank:6,regionCompleted:true}).id,'riftOverrun');
});

test('W29 never overlays a Region whose Story is not yet completed, no matter the World Tier rank',()=>{
  const state6=adventure4HighLevelState({rank:6,regionCompleted:false});
  assert.equal(state6.id,'normal');
  assert.equal(state6.regionCompleted,false);
});

test('W29 an active Nemesis Hunt in the Region raises at least "corrupted" even at rank 0',()=>{
  assert.equal(adventure4HighLevelState({rank:0,nemesisHere:true,regionCompleted:true}).id,'corrupted');
  // but never past what the rank itself would already justify
  assert.equal(adventure4HighLevelState({rank:2,nemesisHere:true,regionCompleted:true}).id,'nemesisTerritory');
});

test('W29 exposes exactly the roadmap-named 4-state ladder and nothing else',()=>{
  assert.deepEqual(ADVENTURE4_HIGHLEVEL_STATE_ORDER,['normal','corrupted','nemesisTerritory','riftOverrun']);
  assert.equal(Object.keys(ADVENTURE4_HIGHLEVEL_STATES).length,4);
});

test('W29 runtime derives the state from existing World Tier + Region completion authorities only, with no new save root',()=>{
  reset();
  const before=JSON.stringify(state.data.adventure4);
  const normal=state.adventure4HighLevelStateForRegion(REGION_ID);
  assert.equal(normal.id,'normal');
  assert.equal(normal.regionCompleted,false);
  clearRegion(REGION_ID);
  state.data.worldTierId='transcendent'; // rank 2
  const escalated=state.adventure4HighLevelStateForRegion(REGION_ID);
  assert.equal(escalated.regionCompleted,true);
  assert.equal(escalated.worldTierRank,2);
  assert.equal(escalated.id,'nemesisTerritory');
  // purely derived: calling it never mutates adventure4 session/save state
  assert.equal(JSON.stringify(state.data.adventure4),before);
});

test('W29 an unknown region id degrades to normal instead of throwing',()=>{
  reset();
  const result=state.adventure4HighLevelStateForRegion('does-not-exist');
  assert.equal(result.id,'normal');
  assert.equal(result.regionCompleted,false);
});

test('W29 adventure4EventContext carries the High-Level state for the active session Region without dropping earlier phases\' keys',()=>{
  reset();
  clearRegion(REGION_ID);
  state.data.worldTierId='cataclysm'; // rank 4
  state.startAdventure4({regionId:REGION_ID});
  const ctx=state.adventure4EventContext();
  assert.ok(ctx.flags,'earlier W18-22 flags key must survive the context chain');
  assert.ok('realmSignals' in ctx,'W23 realmSignals key must survive the context chain');
  assert.equal(ctx.highLevel.id,'riftOverrun');
});

test('W29 High-Level runtime module never introduces a new save root or currency',()=>{
  const src=fs.readFileSync('js/patches/adventureWorld4HighLevelRuntime.js','utf8');
  assert.doesNotMatch(src,/state\.data\.\w+\s*=(?!=)/);
  assert.doesNotMatch(src,/\.save\(\)/);
});
