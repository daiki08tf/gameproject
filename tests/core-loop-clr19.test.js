import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute,adventure4RegionBossEndpoint } from '../js/data/adventureWorld4Pilot.js';
import { CLR1_COMBAT_CHAIN_TAG } from '../js/data/coreLoopClr1.js';
import { CLR9_MIDRUN_INVESTIGATION_REGION_ID,CLR9_MIDRUN_INVESTIGATION_TAG } from '../js/data/coreLoopClr9.js';
import { CLR19_HUNT_REGION_PROFILES,clr19HuntRegionProfile,clr19RegionUsesSharedHunt } from '../js/data/coreLoopClr19.js';

function catalog(){return buildWorld4RegionCatalog(CHAPTERS);}
function completedRoute(region,worldTierRank=0){return buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null},{worldTierRank});}

test('CLR-19 has one data profile for every canonical World3 Region',()=>{
  assert.deepEqual(Object.keys(CLR19_HUNT_REGION_PROFILES),WORLD3_REGIONS.map(region=>region.id));
  for(const region of WORLD3_REGIONS){
    const profile=clr19HuntRegionProfile(region.id);
    assert.equal(profile.regionId,region.id);
    assert.equal(profile.enabled,true);
    assert.equal(profile.routeKind,'shared-combat-first');
    assert.equal(profile.preserveLegacyNodes,true);
    assert.equal(clr19RegionUsesSharedHunt(region),true);
  }
});

test('CLR-19 gives every completed Region the shared multi-battle Hunt while preserving route IDs',()=>{
  for(const region of catalog()){
    const route=completedRoute(region);
    const chain=route.nodes.filter(node=>node.tags.includes(CLR1_COMBAT_CHAIN_TAG));
    assert.equal(route.id,`${region.id}-free-adventure`);
    assert.ok(route.tags.includes('clr19-full-region-hunt'));
    assert.ok(route.tags.includes('clr1-combat-first'));
    assert.ok(route.tags.includes('clr2-aftermath-branching'));
    assert.ok(route.tags.includes('clr5-tier-cadence'));
    assert.ok(chain.length>=4,`${region.id} should have a playable combat chain`);
    assert.equal(chain.at(-1).type,'boss');
    assert.equal(chain.at(-1).stageId,adventure4RegionBossEndpoint(region).stageId);
  }
});

test('CLR-19 keeps legacy free-adventure node IDs inside generalized routes for suspended-session recovery',()=>{
  for(const region of catalog()){
    const route=completedRoute(region);
    const ids=new Set(route.nodes.map(node=>node.id));
    for(const legacyId of ['crossroads','deep-route','treasure','camp','shortcut','boss-gate','region-boss']){
      assert.ok(ids.has(legacyId),`${region.id} missing legacy node ${legacyId}`);
    }
  }
});

test('CLR-19 preserves frontier-only CLR-9 Investigation instead of copying it to every Region',()=>{
  for(const region of catalog()){
    const route=completedRoute(region);
    const investigation=route.nodes.filter(node=>node.tags.includes(CLR9_MIDRUN_INVESTIGATION_TAG));
    assert.equal(investigation.length,region.id===CLR9_MIDRUN_INVESTIGATION_REGION_ID?1:0);
  }
});

test('CLR-19 Stage-first Hunt remains Region-completion gated and has no new Home Hunt root',()=>{
  const source=fs.readFileSync('js/patches/stageFirstNavigationUi.js','utf8');
  assert.match(source,/progress\.status!=='completed'/);
  assert.match(source,/state\.startAdventure4/);
  assert.match(source,/state\.resumeAdventure4/);
  assert.match(source,/other_active_session/);
  assert.doesNotMatch(source,/goHuntBtn|homeHunt|huntProgress|huntCurrency|huntLevel|stamina/i);
});

test('CLR-19 pilot no longer hardcodes frontier/elemental as the only combat-first Regions',()=>{
  const source=fs.readFileSync('js/data/adventureWorld4Pilot.js','utf8');
  assert.match(source,/clr19RegionUsesSharedHunt/);
  assert.doesNotMatch(source,/CLR_COMBAT_FIRST_REGIONS/);
  assert.doesNotMatch(source,/new Set\(\['frontier','elemental'\]\)/);
});
