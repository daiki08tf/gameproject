import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute,adventure4RegionBossEndpoint } from '../js/data/adventureWorld4Pilot.js';
import { CLR1_COMBAT_CHAIN_TAG } from '../js/data/coreLoopClr1.js';
import { CLR2_BRANCH_NODE_IDS,CLR2_PRESSURE_TAG,CLR2_STEADY_TAG } from '../js/data/coreLoopClr2.js';
import { adventure4Clr5CadenceProfile } from '../js/data/coreLoopClr5.js';
import {
  CLR9_MIDRUN_INVESTIGATION_REGION_ID,
  CLR9_MIDRUN_INVESTIGATION_SCENE_ID,
  CLR9_MIDRUN_INVESTIGATION_TAG,
} from '../js/data/coreLoopClr9.js';

const LEGACY_NODE_IDS=['crossroads','deep-route','treasure','camp','shortcut','boss-gate','region-boss'];

function catalog(){return buildWorld4RegionCatalog(CHAPTERS);}
function completedRoute(region,options={}){
  return buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null},options);
}
function chain(route){return route.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG));}
function ownedChapters(region){
  const chapterNumbers=new Set(region.chapterNumbers.map(Number));
  return CHAPTERS.filter(chapter=>chapterNumbers.has(Number(chapter.num)));
}
function canonicalStageIds(region){
  return new Set(ownedChapters(region).flatMap(chapter=>(chapter.stages||[]).filter(stage=>!stage.branch).map(stage=>stage.id)));
}
function huntStageCapacity(region){
  let count=0;
  for(const chapter of ownedChapters(region)){
    const primary=(chapter.stages||[]).filter(stage=>!stage.branch);
    const first=primary[0]||null;
    const boss=(chapter.stages||[]).find(stage=>stage.boss&&!stage.branch)||(chapter.stages||[]).find(stage=>stage.boss)||(chapter.stages||[]).at(-1)||null;
    if(first)count++;
    if(boss&&boss.id!==first?.id)count++;
  }
  return count;
}

test('CLR-19 derives all completed Hunt routes from the existing eight-Region catalog',()=>{
  const regions=catalog();
  assert.equal(regions.length,WORLD3_REGIONS.length);
  assert.equal(regions.length,8);
  assert.deepEqual(regions.map(region=>region.id),WORLD3_REGIONS.map(region=>region.id));

  for(const region of regions){
    const route=completedRoute(region);
    assert.equal(route.id,`${region.id}-free-adventure`);
    assert.ok(route.tags.includes('clr4-shared-combat-loop'),`legacy route remained for ${region.id}`);
    assert.ok(route.tags.includes('clr1-combat-first'),`combat-first tag missing for ${region.id}`);
    assert.ok(chain(route).length>=4,`combat chain missing for ${region.id}`);
  }
});

test('CLR-19 keeps every Region Hunt on canonical Stage IDs and its own existing Region Boss finisher',()=>{
  const allRegionChainIds=new Map();
  for(const region of catalog()){
    const route=completedRoute(region);
    const battles=chain(route);
    const allowed=canonicalStageIds(region);
    assert.ok(battles.length>0);
    for(const battle of battles)assert.ok(allowed.has(battle.stageId),`${region.id} leaked non-owned Stage ${battle.stageId}`);
    const finisher=battles.at(-1);
    assert.equal(finisher.stageId,adventure4RegionBossEndpoint(region).stageId,`wrong finisher for ${region.id}`);
    assert.equal(finisher.type,'boss');
    assert.ok(finisher.tags.includes('finisher'));
    allRegionChainIds.set(region.id,new Set(battles.map(battle=>battle.stageId)));
  }

  const entries=[...allRegionChainIds.entries()];
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
    const [leftId,left]=entries[i],[rightId,right]=entries[j];
    assert.equal([...left].some(stageId=>right.has(stageId)),false,`${leftId} and ${rightId} mixed Stage IDs`);
  }
});

test('CLR-19 shares the same Safe / Pressure / Return topology across all Regions',()=>{
  for(const region of catalog()){
    const route=completedRoute(region);
    const steady=route.nodes.find(node=>node.id===CLR2_BRANCH_NODE_IDS.steady);
    const pressure=route.nodes.find(node=>node.id===CLR2_BRANCH_NODE_IDS.pressure);
    assert.ok(steady,`steady branch missing for ${region.id}`);
    assert.ok(pressure,`pressure branch missing for ${region.id}`);
    assert.deepEqual(steady.next,['clr1-battle-5','return']);
    assert.deepEqual(pressure.next,['clr1-battle-4','return']);
    assert.ok(steady.tags.includes(CLR2_STEADY_TAG));
    assert.ok(pressure.tags.includes(CLR2_PRESSURE_TAG));
    assert.ok(route.nodes.some(node=>node.id==='return'&&node.next.length===0));
  }
});

test('CLR-19 preserves legacy free-adventure node IDs for suspended-session recovery in every Region',()=>{
  for(const region of catalog()){
    const route=completedRoute(region);
    for(const nodeId of LEGACY_NODE_IDS){
      assert.ok(route.nodes.some(node=>node.id===nodeId),`${region.id} cannot recover legacy currentNodeId ${nodeId}`);
    }
  }
});

test('CLR-19 applies the existing World Tier cadence contract once and never invents Stage authority',()=>{
  for(const region of catalog()){
    const baseProfile=adventure4Clr5CadenceProfile(0);
    const tierProfile=adventure4Clr5CadenceProfile(4);
    const capacity=huntStageCapacity(region);
    const base=completedRoute(region,{worldTierRank:0});
    const tiered=completedRoute(region,{worldTierRank:4});
    assert.equal(base.tags.filter(tag=>tag==='clr5-tier-cadence').length,1,`base cadence tag duplicated for ${region.id}`);
    assert.equal(tiered.tags.filter(tag=>tag==='clr5-tier-cadence').length,1,`tier cadence tag duplicated for ${region.id}`);
    assert.equal(chain(base).length,Math.min(baseProfile.pressureBattles,capacity),`unexpected base cadence for ${region.id}`);
    assert.equal(chain(tiered).length,Math.min(tierProfile.pressureBattles,capacity),`unexpected tier cadence for ${region.id}`);
  }
});

test('CLR-19 keeps CLR-9 mid-run Investigation authored only for frontier',()=>{
  for(const region of catalog()){
    const route=completedRoute(region);
    const investigationNodes=route.nodes.filter(node=>node.sceneId===CLR9_MIDRUN_INVESTIGATION_SCENE_ID||node.tags.includes(CLR9_MIDRUN_INVESTIGATION_TAG));
    if(region.id===CLR9_MIDRUN_INVESTIGATION_REGION_ID){
      assert.equal(investigationNodes.length,1);
      assert.equal(investigationNodes[0].sceneId,CLR9_MIDRUN_INVESTIGATION_SCENE_ID);
    }else{
      assert.equal(investigationNodes.length,0,`CLR-9 Investigation leaked into ${region.id}`);
    }
  }
});
