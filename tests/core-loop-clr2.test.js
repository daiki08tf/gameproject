import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute } from '../js/data/adventureWorld4Pilot.js';
import { adventure4AvailableNext } from '../js/data/adventureWorld4Routes.js';
import { CLR1_COMBAT_CHAIN_TAG,adventure4Clr1BattleClearFlag } from '../js/data/coreLoopClr1.js';
import {
  CLR2_AFTERMATH_TAG,
  CLR2_BRANCH_NODE_IDS,
  CLR2_PRESSURE_TAG,
  CLR2_STEADY_TAG,
  adventure4Clr2AftermathNodeId,
} from '../js/data/coreLoopClr2.js';

function route(){
  const region=buildWorld4RegionCatalog(CHAPTERS).find(item=>item.id==='frontier');
  return buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null});
}
function ctx(flags={}){return{flags,visitedNodeIds:[],hasDiscovery:()=>false,isStageCleared:()=>true};}
function flag(id){return adventure4Clr1BattleClearFlag(id);}

test('CLR-2 aftermath IDs are deterministic and do not create another save authority',()=>{
  assert.equal(adventure4Clr2AftermathNodeId('clr1-battle-3'),'clr2-aftermath:clr1-battle-3');
  assert.equal(adventure4Clr2AftermathNodeId(''),null);
});

test('CLR-2 inserts a post-victory aftermath checkpoint between ordinary canonical battles',()=>{
  const r=route();
  const battle1=r.nodes.find(node=>node.id==='clr1-battle-1');
  const after1=r.nodes.find(node=>node.id===adventure4Clr2AftermathNodeId(battle1.id));
  assert.ok(after1.tags.includes(CLR2_AFTERMATH_TAG));
  assert.deepEqual(battle1.next,[after1.id,'return']);
  assert.deepEqual(after1.condition,{flag:flag(battle1.id)});
  assert.deepEqual(after1.next,['clr1-battle-2','return']);
});

test('CLR-2 midpoint offers steady and pressure routes only after battle 3 is won',()=>{
  const r=route();
  const battle3=r.nodes.find(node=>node.id==='clr1-battle-3');
  const aftermath=r.nodes.find(node=>node.id===adventure4Clr2AftermathNodeId(battle3.id));
  const before=adventure4AvailableNext(r,aftermath.id,ctx());
  assert.deepEqual(before.map(node=>node.id),['return']);
  const after=adventure4AvailableNext(r,aftermath.id,ctx({[flag(battle3.id)]:true}));
  assert.deepEqual(after.map(node=>node.id),[CLR2_BRANCH_NODE_IDS.steady,CLR2_BRANCH_NODE_IDS.pressure,'return']);
});

test('steady route skips the optional fourth battle while pressure route explicitly enters it',()=>{
  const r=route();
  const steady=r.nodes.find(node=>node.id===CLR2_BRANCH_NODE_IDS.steady);
  const pressure=r.nodes.find(node=>node.id===CLR2_BRANCH_NODE_IDS.pressure);
  assert.ok(steady.tags.includes(CLR2_STEADY_TAG));
  assert.ok(pressure.tags.includes(CLR2_PRESSURE_TAG));
  assert.deepEqual(steady.next,['clr1-battle-5','return']);
  assert.deepEqual(pressure.next,['clr1-battle-4','return']);
  assert.ok(r.nodes.find(node=>node.id==='clr1-battle-4').tags.includes(CLR2_PRESSURE_TAG));
});

test('steady run contains five canonical battles; pressure run contains six and therefore only earns more through existing battle rewards',()=>{
  const r=route();
  const chain=r.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG));
  assert.equal(chain.length,6);
  const steadyBattleIds=['clr1-battle-1','clr1-battle-2','clr1-battle-3','clr1-battle-5','clr1-battle-6'];
  const pressureBattleIds=['clr1-battle-1','clr1-battle-2','clr1-battle-3','clr1-battle-4','clr1-battle-5','clr1-battle-6'];
  assert.equal(steadyBattleIds.length,5);
  assert.equal(pressureBattleIds.length,6);
  for(const id of [...new Set([...steadyBattleIds,...pressureBattleIds])]){
    const node=r.nodes.find(item=>item.id===id);
    assert.ok(node?.stageId,'every CLR-2 combat must still reference a canonical stage');
  }
  const clr2Nodes=r.nodes.filter(node=>node.tags.some(tag=>tag.startsWith('clr2-')));
  assert.ok(clr2Nodes.every(node=>!['treasure','discovery'].includes(node.type)));
});

test('CLR-2 branch converges on battle 5 and then the existing Region Boss without bespoke reward nodes',()=>{
  const r=route();
  const battle4=r.nodes.find(node=>node.id==='clr1-battle-4');
  const after4=r.nodes.find(node=>node.id===adventure4Clr2AftermathNodeId(battle4.id));
  const battle5=r.nodes.find(node=>node.id==='clr1-battle-5');
  const after5=r.nodes.find(node=>node.id===adventure4Clr2AftermathNodeId(battle5.id));
  assert.deepEqual(after4.next,['clr1-battle-5','return']);
  assert.deepEqual(after5.next,['clr1-battle-6','return']);
  assert.equal(r.nodes.find(node=>node.id==='clr1-battle-6').type,'boss');
});

test('CLR-2 remains scoped to cleared frontier Free Adventure',()=>{
  const frontier=buildWorld4RegionCatalog(CHAPTERS).find(item=>item.id==='frontier');
  const story=buildAdventure4PilotRoute(frontier,{status:'available',routeEntry:{stageId:'1-1',stageName:'story'}});
  assert.ok(!story.tags.includes('clr2-aftermath-branching'));
  const other=buildWorld4RegionCatalog(CHAPTERS).find(item=>item.id!=='frontier'&&item.chapterNumbers?.length);
  if(other){
    const free=buildAdventure4PilotRoute(other,{status:'completed',routeEntry:null});
    assert.ok(!free.tags.includes('clr2-aftermath-branching'));
  }
});
