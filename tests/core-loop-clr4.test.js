import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute,adventure4RegionBossEndpoint } from '../js/data/adventureWorld4Pilot.js';
import { CLR1_COMBAT_CHAIN_TAG } from '../js/data/coreLoopClr1.js';
import { CLR2_BRANCH_NODE_IDS } from '../js/data/coreLoopClr2.js';
import { adventure4Clr3RunSummary } from '../js/data/coreLoopClr3.js';

function catalog(){return buildWorld4RegionCatalog(CHAPTERS);}
function completedRoute(regionId){
  const region=catalog().find(item=>item.id===regionId);
  return {region,route:buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null})};
}

test('CLR-4 extends the shared combat-first loop to elemental without changing its route id authority',()=>{
  const {route}=completedRoute('elemental');
  assert.equal(route.id,'elemental-free-adventure');
  assert.ok(route.tags.includes('clr4-shared-combat-loop'));
  assert.ok(route.tags.includes('clr1-combat-first'));
  assert.ok(route.tags.includes('clr2-aftermath-branching'));
});

test('elemental uses six distinct canonical stages and its own existing Region Boss as finisher',()=>{
  const {region,route}=completedRoute('elemental');
  const chain=route.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG));
  assert.equal(chain.length,6);
  assert.equal(new Set(chain.map(node=>node.stageId)).size,6);
  assert.equal(chain.at(-1).stageId,adventure4RegionBossEndpoint(region).stageId);
  assert.equal(chain.at(-1).type,'boss');
});

test('elemental reuses the same 5-vs-6 steady/pressure topology rather than defining a second reward loop',()=>{
  const {route}=completedRoute('elemental');
  const steady=route.nodes.find(node=>node.id===CLR2_BRANCH_NODE_IDS.steady);
  const pressure=route.nodes.find(node=>node.id===CLR2_BRANCH_NODE_IDS.pressure);
  assert.deepEqual(steady.next,['clr1-battle-5','return']);
  assert.deepEqual(pressure.next,['clr1-battle-4','return']);
  const summary=adventure4Clr3RunSummary({temporaryFlags:{},visitedNodeIds:[]},route);
  assert.equal(summary.fullCount,6);
  assert.equal(summary.steadyCount,5);
});

test('frontier and elemental use region-specific canonical stage IDs even though CLR node IDs stay session-local',()=>{
  const frontier=completedRoute('frontier').route.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG)).map(node=>node.stageId);
  const elemental=completedRoute('elemental').route.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG)).map(node=>node.stageId);
  assert.notDeepEqual(elemental,frontier);
  assert.equal(new Set([...frontier,...elemental]).size,12);
});

test('CLR-4 does not expand the combat-first loop to every completed Region at once',()=>{
  const untouched=catalog().find(item=>!['frontier','elemental'].includes(item.id)&&item.chapterNumbers?.length);
  assert.ok(untouched);
  const route=buildAdventure4PilotRoute(untouched,{status:'completed',routeEntry:null});
  assert.ok(!route.tags.includes('clr4-shared-combat-loop'));
  assert.equal(route.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG)).length,0);
});
