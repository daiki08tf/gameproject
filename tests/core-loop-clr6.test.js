import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import {
  buildAdventure4PilotRoute,
  CLR6_STORY_AFTERMATH_NODE_ID,
  CLR6_STORY_AFTERMATH_SCENE_ID,
} from '../js/data/adventureWorld4Pilot.js';
import { adventure4AvailableNext } from '../js/data/adventureWorld4Routes.js';
import { buildAdventure4PilotSceneCatalog,adventure4SceneById } from '../js/data/adventureWorld4Scenes.js';

function region(){return buildWorld4RegionCatalog(CHAPTERS).find(r=>r.id==='frontier');}
function storyRoute(){return buildAdventure4PilotRoute(region(),{status:'available',routeEntry:{stageId:'1-1',stageName:'最初の戦い'}});}
function ctx(stageCleared=false){return{flags:{},visitedNodeIds:[],hasDiscovery:()=>false,isStageCleared:id=>stageCleared&&id==='1-1'};}

test('CLR-6 new Story sessions start directly on the canonical Story battle',()=>{
  const route=storyRoute();
  assert.equal(route.entryNodeId,'story');
  const story=route.nodes.find(n=>n.id==='story');
  assert.equal(story.type,'battle');
  assert.equal(story.stageId,'1-1');
  assert.ok(story.tags.includes('clr6-combat-first-story'));
  assert.ok(route.tags.includes('clr6-story-after-combat'));
});

test('CLR-6 keeps pre-existing entry/fork nodes only for suspended-session compatibility',()=>{
  const route=storyRoute();
  const entry=route.nodes.find(n=>n.id==='entry');
  const fork=route.nodes.find(n=>n.id==='fork');
  assert.ok(entry&&fork);
  assert.deepEqual(entry.next,['fork']);
  assert.ok(entry.tags.includes('legacy-entry'));
  assert.ok(fork.tags.includes('legacy-entry'));
  assert.equal(fork.sceneId,'pilot-fork');
});

test('Story aftermath is invisible until the canonical Story stage is cleared',()=>{
  const route=storyRoute();
  const before=adventure4AvailableNext(route,'story',ctx(false));
  assert.deepEqual(before.map(n=>n.id),['return']);
  const after=adventure4AvailableNext(route,'story',ctx(true));
  assert.deepEqual(after.map(n=>n.id),[CLR6_STORY_AFTERMATH_NODE_ID,'return']);
});

test('CLR-6 direct Story battle entry exposes a playable current-node battle action',()=>{
  const ui=fs.readFileSync('js/patches/adventureWorld4Ui.js','utf8');
  assert.match(ui,/const currentCombat=\['battle','elite','boss'\]\.includes\(current\.type\)/);
  assert.match(ui,/currentCombat&&!pendingCurrent/);
  assert.match(ui,/戦闘開始/);
  assert.match(ui,/launchAdventureBattle\(current\)/);
});

test('CLR-6 aftermath uses a short post-combat scene and returns through existing route authority',()=>{
  const route=storyRoute();
  const node=route.nodes.find(n=>n.id===CLR6_STORY_AFTERMATH_NODE_ID);
  assert.equal(node.sceneId,CLR6_STORY_AFTERMATH_SCENE_ID);
  assert.deepEqual(node.condition,{stageCleared:'1-1'});
  const scenes=buildAdventure4PilotSceneCatalog(region(),route);
  const scene=adventure4SceneById(scenes,CLR6_STORY_AFTERMATH_SCENE_ID);
  assert.ok(scene);
  assert.ok(scene.tags.includes('combat-aftermath'));
  assert.equal(scene.entryStepId,'observe');
  assert.equal(scene.steps.length,2);
  const finalChoice=scene.steps.at(-1).choices.at(-1);
  assert.ok(finalChoice.consequences.some(c=>c.type==='routeTarget'&&c.targetId==='return'));
});

test('CLR-6 adds no new permanent Story, Discovery, reward, inventory, or save authority',()=>{
  const pilot=fs.readFileSync('js/data/adventureWorld4Pilot.js','utf8');
  const scenes=fs.readFileSync('js/data/adventureWorld4Scenes.js','utf8');
  assert.doesNotMatch(pilot,/state\.data|\.save\(|addItem\(/);
  assert.doesNotMatch(scenes,/state\.data|\.save\(|addItem\(/);
  assert.match(pilot,/stageCleared:story\.stageId/);
});
