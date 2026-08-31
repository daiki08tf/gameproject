import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute,CLR6_STORY_AFTERMATH_SCENE_ID } from '../js/data/adventureWorld4Pilot.js';
import { buildAdventure4PilotSceneCatalog,adventure4SceneById,resolveAdventure4SceneChoice } from '../js/data/adventureWorld4Scenes.js';
import { ADVENTURE4_INVESTIGATION_CATALOG,adventure4TraceById } from '../js/data/adventureWorld4Investigation.js';

function region(id){return buildWorld4RegionCatalog(CHAPTERS).find(r=>r.id===id);}
function storyRoute(id,stageId){return buildAdventure4PilotRoute(region(id),{status:'available',routeEntry:{stageId,stageName:'Story Battle'}});}

function finalResolution(id,stageId){
  const r=storyRoute(id,stageId);
  const scene=adventure4SceneById(buildAdventure4PilotSceneCatalog(region(id),r),CLR6_STORY_AFTERMATH_SCENE_ID);
  return resolveAdventure4SceneChoice(scene,'resolve','record-and-return',{});
}

test('CLR-7 frontier post-combat Story outcome records the existing investigation trace',()=>{
  const resolution=finalResolution('frontier','1-1');
  assert.equal(resolution.ok,true);
  assert.ok(resolution.consequences.some(effect=>
    effect.scope==='adventure'&&effect.type==='trace'&&effect.key==='frontier-pilot-fresh-tracks'
  ));
});

test('CLR-7 reuses the canonical Adventure investigation definition instead of creating a parallel clue',()=>{
  const trace=adventure4TraceById(ADVENTURE4_INVESTIGATION_CATALOG,'frontier-pilot-fresh-tracks');
  assert.ok(trace);
  assert.equal(trace.regionId,'frontier');
  assert.equal(trace.type,'human');
});

test('CLR-7 does not inject the frontier trace into unrelated Regions',()=>{
  const elemental=region('elemental');
  if(!elemental)return;
  const stageId=elemental.routeEntries?.[0]?.stageId;
  if(!stageId)return;
  const resolution=finalResolution('elemental',stageId);
  assert.equal(resolution.ok,true);
  assert.ok(!resolution.consequences.some(effect=>effect.type==='trace'&&effect.key==='frontier-pilot-fresh-tracks'));
});

test('CLR-7 Story outcome still returns through existing route targeting rather than a new progression path',()=>{
  const resolution=finalResolution('frontier','1-1');
  assert.ok(resolution.consequences.some(effect=>effect.scope==='immediate'&&effect.type==='routeTarget'&&effect.targetId==='return'));
});
