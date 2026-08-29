import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import '../js/patches/adventureWorld4EventRuntime.js';
import { normalizeAdventure4EventCatalog,adventure4EventPool,rollAdventure4Event,nextAdventure4EventHistory } from '../js/data/adventureWorld4Events.js';

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.world2={eventsSeen:{},eventChains:{},discoveries:{},flags:{},adventureEventMeta:{adventureIndex:0,lastSeenAdventure:{},recentEventIds:[]}};
  state.data.stageProgress={};
}

const catalog=normalizeAdventure4EventCatalog([
  {id:'ambient-road',sceneId:'road',weight:60,repeatable:true,cooldownAdventures:1,tags:['ambient']},
  {id:'old-shrine',sceneId:'shrine',weight:30,oneShot:true,condition:{flag:'saw-shrine'},tags:['investigation']},
  {id:'rare-rift',sceneId:'rift',weight:10,rare:true,repeatable:true,tags:['rare']},
  {id:'chain-0',sceneId:'chain-start',weight:20,chain:{id:'w4:test-chain',step:0}},
  {id:'chain-1',sceneId:'chain-finish',weight:20,chain:{id:'w4:test-chain',step:1,terminal:true}},
]);

test('W6 filters events by conditions, oneShot, cooldown, rare mode, and chain step',()=>{
  const base={flags:{},eventsSeen:{},eventChains:{},adventureIndex:5,lastSeenAdventure:{},recentEventIds:[],allowRare:false};
  assert.deepEqual(adventure4EventPool(catalog,base).map(e=>e.id),['ambient-road','chain-0']);

  const unlocked={...base,flags:{'saw-shrine':true},allowRare:true};
  assert.deepEqual(adventure4EventPool(catalog,unlocked).map(e=>e.id),['ambient-road','old-shrine','rare-rift','chain-0']);

  const seen={...unlocked,eventsSeen:{'old-shrine':1},lastSeenAdventure:{'ambient-road':4}};
  assert.deepEqual(adventure4EventPool(catalog,seen).map(e=>e.id),['rare-rift','chain-0']);

  const chain={...unlocked,eventChains:{'w4:test-chain':{started:true,step:1,completed:false}}};
  assert.equal(adventure4EventPool(catalog,chain).some(e=>e.id==='chain-0'),false);
  assert.equal(adventure4EventPool(catalog,chain).some(e=>e.id==='chain-1'),true);
});

test('W6 weighted selection is deterministic with injected rng and rare weighting',()=>{
  const pool=normalizeAdventure4EventCatalog([
    {id:'a',sceneId:'a',weight:75},
    {id:'b',sceneId:'b',weight:25},
  ]);
  assert.equal(rollAdventure4Event(pool,{rng:()=>0}).id,'a');
  assert.equal(rollAdventure4Event(pool,{rng:()=>0.99}).id,'b');

  const rare=normalizeAdventure4EventCatalog([
    {id:'common',sceneId:'c',weight:10},
    {id:'rare',sceneId:'r',weight:10,rare:true},
  ]);
  assert.equal(rollAdventure4Event(rare,{rng:()=>0.6,rareWeightMultiplier:1}).id,'rare');
  assert.equal(rollAdventure4Event(rare,{rng:()=>0.6,rareWeightMultiplier:.1}).id,'common');
});

test('W6 recent-event suppression avoids immediate repeats without deadlocking a small pool',()=>{
  const tiny=normalizeAdventure4EventCatalog([{id:'only',sceneId:'only',weight:1,repeatable:true}]);
  const selected=rollAdventure4Event(tiny,{context:{recentEventIds:['only'],eventsSeen:{only:1},adventureIndex:10,lastSeenAdventure:{only:1}}});
  assert.equal(selected.id,'only');
});

test('W6 history advances chains and preserves existing chain metadata',()=>{
  const start=catalog.find(e=>e.id==='chain-0');
  const h1=nextAdventure4EventHistory({eventsSeen:{legacy:2},eventChains:{legacy:{step:4,wait:2}},lastSeenAdventure:{},recentEventIds:[]},start,3);
  assert.equal(h1.eventsSeen.legacy,2);
  assert.equal(h1.eventsSeen['chain-0'],1);
  assert.equal(h1.eventChains.legacy.wait,2);
  assert.equal(h1.eventChains['w4:test-chain'].step,1);

  const finish=catalog.find(e=>e.id==='chain-1');
  const h2=nextAdventure4EventHistory(h1,finish,5);
  assert.equal(h2.eventChains['w4:test-chain'].completed,true);
  assert.equal(h2.eventChains['w4:test-chain'].step,1);
});

test('W6 runtime reuses world2 eventsSeen/eventChains and advances adventure-count clock only on successful departures',()=>{
  reset();
  const failed=state.startAdventure4({});
  assert.equal(failed.ok,false);
  assert.equal(state.data.world2.adventureEventMeta.adventureIndex,0);

  const started=state.startAdventure4({regionId:'frontier'});
  assert.equal(started.ok,true);
  assert.equal(state.data.world2.adventureEventMeta.adventureIndex,1);

  state.data.adventure4.temporaryFlags['saw-shrine']=true;
  const event=state.rollAdventure4Event(catalog,{rng:()=>0.7,allowRare:false});
  assert.ok(event);
  const recorded=state.recordAdventure4Event(event);
  assert.equal(recorded.ok,true);
  assert.equal(state.data.world2.eventsSeen[event.id],1);
  assert.equal(state.data.world2.adventureEventMeta.lastSeenAdventure[event.id],1);
  assert.equal('eventsSeen' in state.adventure4Session(),false);
});
