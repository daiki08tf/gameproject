import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import { nextAdventure4EventMemory,adventure4EventMemoryFlags,normalizeAdventure4EventMemory } from '../js/data/adventureWorld4EventMemory.js';
import { ADVENTURE4_EVENT_CHAIN_I_EVENTS,adventure4EventChainIScene } from '../js/data/adventureWorld4EventChainsI.js';
import { resolveAdventure4SceneChoice,validateAdventure4Scene } from '../js/data/adventureWorld4Scenes.js';
import '../js/patches/adventureWorld4ContentPackI.js';
import '../js/patches/adventureWorld4EventMemoryRuntime.js';
import '../js/patches/adventureWorld4SceneRuntime.js';
import '../js/patches/adventureWorld4EventChainRuntime.js';

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.world2={discoveries:{},flags:{},eventsSeen:{},eventChains:{},adventureEventMeta:{adventureIndex:0,lastSeenAdventure:{},recentEventIds:[]},eventMemory:{}};
  state.data.stageProgress={};
}

test('W10 memory preserves outcome visits and flags without a new save root',()=>{
  let store=nextAdventure4EventMemory({},'x',{status:'recorded',outcome:'studied',flags:{diagram:true}},3);
  store=nextAdventure4EventMemory(store,'x',{visit:false,status:'resolved',outcome:'solved'},5);
  assert.equal(store.x.visits,1);
  assert.equal(store.x.firstAdventure,3);
  assert.equal(store.x.lastAdventure,5);
  assert.equal(store.x.flags.diagram,true);
  assert.equal(adventure4EventMemoryFlags(store)['memory:x:status:resolved'],true);
});

test('W10 safely normalizes legacy or malformed eventMemory',()=>{
  assert.deepEqual(normalizeAdventure4EventMemory(null),{});
  const memory=normalizeAdventure4EventMemory({x:{visits:'bad',status:'wat',flags:null}});
  assert.equal(memory.x.visits,0);
  assert.equal(memory.x.status,null);
  assert.deepEqual(memory.x.flags,{});
});

test('W10 authored chain has valid first and revisit Scenes',()=>{
  assert.equal(ADVENTURE4_EVENT_CHAIN_I_EVENTS.length,2);
  const first=adventure4EventChainIScene(ADVENTURE4_EVENT_CHAIN_I_EVENTS[0],null);
  const revisit=adventure4EventChainIScene(ADVENTURE4_EVENT_CHAIN_I_EVENTS[1],{outcome:'studied',flags:{diagram:true}});
  assert.deepEqual(validateAdventure4Scene(first),{ok:true,errors:[]});
  assert.deepEqual(validateAdventure4Scene(revisit),{ok:true,errors:[]});
  assert.match(revisit.steps[0].text,/記録して帰った意味/);
});

test('W10 failure branch changes revisit prose but remains recoverable',()=>{
  const event=ADVENTURE4_EVENT_CHAIN_I_EVENTS[1];
  const revisit=adventure4EventChainIScene(event,{status:'failed',outcome:'forced',flags:{handleBroken:true}});
  assert.match(revisit.steps[0].text,/折った把手/);
  const solved=resolveAdventure4SceneChoice(revisit,'solved','finish',{});
  assert.equal(solved.ok,true);
  assert.equal(solved.consequences[0].value.status,'resolved');
  assert.equal(solved.consequences[0].value.outcome,'recovered-after-failure');
});

test('W10 chain selection does not advance persistent chain until Scene completion',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  const scene=state.adventure4ContentPackIScene();
  assert.equal(scene.id,'frontier-sluice-first');
  assert.equal(state.data.world2.eventChains['frontier-old-sluice'],undefined);
  assert.equal(state.data.world2.eventsSeen['frontier-sluice-first'],undefined);

  const resolution=resolveAdventure4SceneChoice(scene,'recorded','finish',{});
  state.applyAdventure4SceneResolution(resolution);
  assert.equal(state.adventure4EventMemory('frontier-old-sluice').status,'recorded');
  const complete=state.completeAdventure4ContentPackIScene();
  assert.equal(complete.ok,true);
  assert.equal(state.data.world2.eventChains['frontier-old-sluice'].step,1);
  assert.equal(state.data.world2.eventsSeen['frontier-sluice-first'],1);
});

test('W10 follow-up cannot fire in the same Adventure and returns on the next one',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  const first=state.adventure4ContentPackIScene();
  const resolution=resolveAdventure4SceneChoice(first,'recorded','finish',{});
  state.applyAdventure4SceneResolution(resolution);state.completeAdventure4ContentPackIScene();
  const sameAdventure=state.adventure4ContentPackIScene();
  assert.equal(sameAdventure,null);

  state.returnFromAdventure4();state.startAdventure4({regionId:'frontier'});
  const revisit=state.adventure4ContentPackIScene();
  assert.equal(revisit.id,'frontier-sluice-return');
  assert.match(revisit.steps[0].text,/記録して帰った意味/);
});

test('W10 persistent memory effect is delegated by Scene runtime and world2 remains authority',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  const scene=adventure4EventChainIScene(ADVENTURE4_EVENT_CHAIN_I_EVENTS[0],null);
  const resolution=resolveAdventure4SceneChoice(scene,'failed','finish',{});
  const applied=state.applyAdventure4SceneResolution(resolution);
  assert.equal(applied.memory.length,1);
  assert.equal(state.data.world2.eventMemory['frontier-old-sluice'].status,'failed');
  assert.equal('eventMemory' in state.data,false);
  assert.equal(state.data.eventMemory,undefined);
});

test('W10 runtime loads after W9 and does not add another Home entrance',()=>{
  const nav=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  const runtime=fs.readFileSync(new URL('../js/patches/adventureWorld4EventChainRuntime.js',import.meta.url),'utf8');
  assert.match(nav,/adventureWorld4Ui\.js'[\s\S]*adventureWorld4EventChainRuntime\.js'/);
  assert.doesNotMatch(nav,/goEventChainBtn|goMemoryBtn/);
  assert.match(runtime,/recordAdventure4Event/);
  assert.match(runtime,/previousComplete/);
});
