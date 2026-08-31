import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute,adventure4RegionBossEndpoint,adventure4PilotPreview } from '../js/data/adventureWorld4Pilot.js';
import { adventure4AvailableNext } from '../js/data/adventureWorld4Routes.js';
import {
  CLR1_COMBAT_CHAIN_TAG,
  adventure4Clr1BattleClearFlag,
  adventure4Clr1BattleResultPatch,
} from '../js/data/coreLoopClr1.js';
import { CLR2_AFTERMATH_TAG,adventure4Clr2AftermathNodeId } from '../js/data/coreLoopClr2.js';

function frontier(){
  return buildWorld4RegionCatalog(CHAPTERS).find(region=>region.id==='frontier');
}
function completedFrontierRoute(){
  const region=frontier();
  return {region,route:buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null})};
}
function context(flags={}){
  return {flags,visitedNodeIds:[],hasDiscovery:()=>false,isStageCleared:()=>true};
}

test('CLR-1 session clear flag is deterministic and scoped to the battle node',()=>{
  assert.equal(adventure4Clr1BattleClearFlag('clr1-battle-1'),'clr1:cleared:clr1-battle-1');
  assert.equal(adventure4Clr1BattleClearFlag(''),null);
});

test('CLR-1 victory clears pending encounter and records only an Adventure-local clear flag',()=>{
  const node={id:'clr1-battle-1',tags:[CLR1_COMBAT_CHAIN_TAG]};
  const patch=adventure4Clr1BattleResultPatch(node,{cleared:true},{temporaryFlags:{existing:true}});
  assert.equal(patch.pendingEncounter,null);
  assert.deepEqual(patch.temporaryFlags,{existing:true,'clr1:cleared:clr1-battle-1':true});
});

test('CLR-1 retreat/defeat leaves pending encounter untouched so the current battle remains retryable',()=>{
  const node={id:'clr1-battle-1',tags:[CLR1_COMBAT_CHAIN_TAG]};
  assert.equal(adventure4Clr1BattleResultPatch(node,{cleared:false},{temporaryFlags:{}}),null);
  assert.equal(adventure4Clr1BattleResultPatch(node,{retreated:true},{temporaryFlags:{}}),null);
});

test('non-CLR Adventure battles keep the existing result contract',()=>{
  assert.deepEqual(adventure4Clr1BattleResultPatch({id:'story',tags:['story']},{cleared:true},{}),{pendingEncounter:null});
});

test('frontier cleared Free Adventure keeps six distinct canonical CLR-1 battles and the Region Boss finisher',()=>{
  const {region,route}=completedFrontierRoute();
  assert.equal(route.id,'frontier-free-adventure');
  assert.ok(route.tags.includes('clr1-combat-first'));
  const chain=route.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG));
  assert.equal(chain.length,6);
  assert.equal(new Set(chain.map(node=>node.stageId)).size,chain.length);
  assert.equal(chain.at(-1).type,'boss');
  assert.equal(chain.at(-1).stageId,adventure4RegionBossEndpoint(region).stageId);
  assert.equal(chain[0].condition,null);
  assert.deepEqual(chain[1].condition,{flag:adventure4Clr1BattleClearFlag(chain[0].id)});
  assert.deepEqual(chain[2].condition,{flag:adventure4Clr1BattleClearFlag(chain[1].id)});
  assert.deepEqual(chain[3].condition,{flag:adventure4Clr1BattleClearFlag(chain[2].id)});
  // CLR-2 steady route may skip battle 4, so deep battle 5 converges from battle 3.
  assert.deepEqual(chain[4].condition,{flag:adventure4Clr1BattleClearFlag(chain[2].id)});
  assert.deepEqual(chain[5].condition,{flag:adventure4Clr1BattleClearFlag(chain[4].id)});
});

test('new frontier entry exposes the first battle and return, while legacy nodes remain for suspended-session compatibility',()=>{
  const {route}=completedFrontierRoute();
  const entry=route.nodes.find(node=>node.id==='entry');
  assert.deepEqual(entry.next,['clr1-battle-1','return']);
  assert.ok(route.nodes.some(node=>node.id==='crossroads'));
  assert.ok(route.nodes.some(node=>node.id==='deep-route'));
});

test('CLR-1 victory unlocks a CLR-2 aftermath checkpoint; defeat still exposes only return',()=>{
  const {route}=completedFrontierRoute();
  const first=route.nodes.find(node=>node.id==='clr1-battle-1');
  const noClear=adventure4AvailableNext(route,first.id,context());
  assert.deepEqual(noClear.map(node=>node.id),['return']);

  const flag=adventure4Clr1BattleClearFlag(first.id);
  const cleared=adventure4AvailableNext(route,first.id,context({[flag]:true}));
  assert.deepEqual(cleared.map(node=>node.id),[adventure4Clr2AftermathNodeId(first.id),'return']);
  assert.ok(cleared[0].tags.includes(CLR2_AFTERMATH_TAG));
});

test('route preview never leaks the post-victory continuation before the battle is cleared',()=>{
  const {route}=completedFrontierRoute();
  const first=route.nodes.find(node=>node.id==='clr1-battle-1');
  const noClear=adventure4AvailableNext(route,first.id,context());
  const hiddenPreview=adventure4PilotPreview(route,first.id,noClear).map(item=>item.name);
  assert.ok(!hiddenPreview.some(name=>name.includes('戦果整理')));

  const flag=adventure4Clr1BattleClearFlag(first.id);
  const cleared=adventure4AvailableNext(route,first.id,context({[flag]:true}));
  const visiblePreview=adventure4PilotPreview(route,first.id,cleared).map(item=>item.name);
  assert.ok(visiblePreview.some(name=>name.includes('戦果整理')));
});

test('CLR-1 does not alter uncleared Story routes or non-frontier Free Adventure topology',()=>{
  const region=frontier();
  const story=buildAdventure4PilotRoute(region,{status:'available',routeEntry:{stageId:'1-1',stageName:'story'}});
  assert.ok(!story.tags.includes('clr1-combat-first'));
  assert.equal(story.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG)).length,0);

  const other=buildWorld4RegionCatalog(CHAPTERS).find(r=>r.id!=='frontier'&&r.chapterNumbers?.length);
  if(other){
    const free=buildAdventure4PilotRoute(other,{status:'completed',routeEntry:null});
    assert.ok(!free.tags.includes('clr1-combat-first'));
    assert.equal(free.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG)).length,0);
  }
});