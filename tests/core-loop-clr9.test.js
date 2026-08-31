import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { adventure4AvailableNext } from '../js/data/adventureWorld4Routes.js';
import { buildAdventure4PilotRoute } from '../js/data/adventureWorld4Pilot.js';
import { buildAdventure4PilotSceneCatalog,resolveAdventure4SceneChoice } from '../js/data/adventureWorld4Scenes.js';
import { adventure4Clr1BattleClearFlag } from '../js/data/coreLoopClr1.js';
import { adventure4Clr2AftermathNodeId,CLR2_BRANCH_NODE_IDS } from '../js/data/coreLoopClr2.js';
import {
  CLR9_MIDRUN_INVESTIGATION_SCENE_ID,
  CLR9_MIDRUN_INVESTIGATION_TRACE_ID,
  CLR9_MIDRUN_INVESTIGATION_TAG,
} from '../js/data/coreLoopClr9.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import '../js/patches/adventureWorld4InvestigationRuntime.js';
import '../js/patches/adventureWorld4SceneRuntime.js';

function frontierRoute(){
  const region=buildWorld4RegionCatalog(CHAPTERS).find(item=>item.id==='frontier');
  const route=buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null});
  return {region,route};
}

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.world2={discoveries:{},flags:{},eventsSeen:{},eventChains:{},investigation:{traces:{},clues:{}}};
  state.data.stageProgress={};
}

test('CLR-9 hides the mid-run Investigation beat until the third combat victory milestone',()=>{
  const {route}=frontierRoute();
  const battle3=route.nodes.find(node=>node.id==='clr1-battle-3');
  const aftermathId=adventure4Clr2AftermathNodeId(battle3.id);
  const aftermath=route.nodes.find(node=>node.id===aftermathId);
  assert.equal(aftermath.sceneId,CLR9_MIDRUN_INVESTIGATION_SCENE_ID);
  assert.ok(aftermath.tags.includes(CLR9_MIDRUN_INVESTIGATION_TAG));

  const twoWins={flags:{
    [adventure4Clr1BattleClearFlag('clr1-battle-1')]:true,
    [adventure4Clr1BattleClearFlag('clr1-battle-2')]:true,
  }};
  assert.equal(adventure4AvailableNext(route,'clr1-battle-3',twoWins).some(node=>node.id===aftermathId),false);

  const thirdWin={flags:{...twoWins.flags,[adventure4Clr1BattleClearFlag('clr1-battle-3')]:true}};
  assert.equal(adventure4AvailableNext(route,'clr1-battle-3',thirdWin).some(node=>node.id===aftermathId),true);
});

test('CLR-9 records the existing broken-marker Trace from the combat aftermath and derives the existing Clue',()=>{
  reset();
  const {region,route}=frontierRoute();
  state.startAdventure4({regionId:'frontier'});
  state.recordAdventure4TraceById('frontier-pilot-fresh-tracks',{source:'test:prior-story-victory'});

  const scene=buildAdventure4PilotSceneCatalog(region,route).find(item=>item.id===CLR9_MIDRUN_INVESTIGATION_SCENE_ID);
  assert.ok(scene);
  const inspect=resolveAdventure4SceneChoice(scene,'observe','inspect',{});
  assert.equal(inspect.ok,true);
  assert.equal(inspect.consequences.length,0);
  const resolution=resolveAdventure4SceneChoice(scene,'resolve','steady',{});
  const applied=state.applyAdventure4SceneResolution(resolution);

  assert.equal(applied.ok,true);
  assert.ok(state.data.world2.investigation.traces[CLR9_MIDRUN_INVESTIGATION_TRACE_ID]);
  assert.ok(state.data.world2.investigation.clues['frontier-pilot-someone-ahead']);
  assert.equal(applied.immediate.find(effect=>effect.type==='routeTarget')?.targetId,CLR2_BRANCH_NODE_IDS.steady);
});

test('CLR-9 Trace recording is idempotent and does not create a parallel progression or reward authority',()=>{
  reset();
  const {region,route}=frontierRoute();
  state.startAdventure4({regionId:'frontier'});
  const scene=buildAdventure4PilotSceneCatalog(region,route).find(item=>item.id===CLR9_MIDRUN_INVESTIGATION_SCENE_ID);
  const resolution=resolveAdventure4SceneChoice(scene,'resolve','return',{});
  const first=state.applyAdventure4SceneResolution(resolution);
  const recordedAt=state.data.world2.investigation.traces[CLR9_MIDRUN_INVESTIGATION_TRACE_ID]?.at;
  const second=state.applyAdventure4SceneResolution(resolution);
  assert.equal(first.ok,true);
  assert.equal(second.ok,true);
  assert.equal(state.data.world2.investigation.traces[CLR9_MIDRUN_INVESTIGATION_TRACE_ID]?.at,recordedAt);
  assert.equal('clr9' in state.data,false);
  assert.equal('currency' in state.data,false);
});

test('CLR-9 is authored only for frontier in this vertical slice',()=>{
  const regions=buildWorld4RegionCatalog(CHAPTERS);
  const elemental=regions.find(item=>item.id==='elemental');
  const route=buildAdventure4PilotRoute(elemental,{status:'completed',routeEntry:null});
  assert.equal(route.nodes.some(node=>node.sceneId===CLR9_MIDRUN_INVESTIGATION_SCENE_ID),false);
  assert.equal(buildAdventure4PilotSceneCatalog(elemental,route).some(scene=>scene.id===CLR9_MIDRUN_INVESTIGATION_SCENE_ID),false);
});
