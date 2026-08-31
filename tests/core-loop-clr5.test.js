import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute } from '../js/data/adventureWorld4Pilot.js';
import { CLR1_COMBAT_CHAIN_TAG } from '../js/data/coreLoopClr1.js';
import { adventure4Clr3RunSummary } from '../js/data/coreLoopClr3.js';
import { adventure4Clr5CadenceProfile } from '../js/data/coreLoopClr5.js';

function region(id='frontier'){return buildWorld4RegionCatalog(CHAPTERS).find(r=>r.id===id);}
function route(rank,id='frontier'){return buildAdventure4PilotRoute(region(id),{status:'completed',routeEntry:null},{worldTierRank:rank});}
function battles(r){return r.nodes.filter(n=>n.tags.includes(CLR1_COMBAT_CHAIN_TAG));}

test('CLR-5 cadence grows only expedition length at existing World Tier rank bands',()=>{
  assert.deepEqual(adventure4Clr5CadenceProfile(0),{rank:0,pressureBattles:6,steadyBattles:5,label:'標準遠征'});
  assert.equal(adventure4Clr5CadenceProfile(1).pressureBattles,6);
  assert.equal(adventure4Clr5CadenceProfile(2).pressureBattles,7);
  assert.equal(adventure4Clr5CadenceProfile(3).steadyBattles,6);
  assert.equal(adventure4Clr5CadenceProfile(4).pressureBattles,8);
  assert.equal(adventure4Clr5CadenceProfile(6).steadyBattles,7);
});

test('frontier pressure route grows 6 -> 7 -> 8 canonical battles across tier bands',()=>{
  assert.equal(battles(route(0)).length,6);
  assert.equal(battles(route(2)).length,7);
  assert.equal(battles(route(4)).length,8);
});

test('CLR-5 keeps exactly one optional pressure battle, so steady remains one battle shorter',()=>{
  for(const rank of [0,2,4,6]){
    const r=route(rank);
    const run=adventure4Clr3RunSummary({},r);
    assert.equal(run.fullCount,adventure4Clr5CadenceProfile(rank).pressureBattles);
    assert.equal(run.steadyCount,run.fullCount-1);
  }
});

test('higher cadence uses distinct stages and still finishes on the Region existing boss',()=>{
  const r=route(6);
  const chain=battles(r);
  assert.equal(new Set(chain.map(n=>n.stageId)).size,chain.length);
  assert.equal(chain.at(-1).type,'boss');
  assert.equal(chain.at(-1).tags.includes('finisher'),true);
});

test('elemental reuses the same cadence contract with its own canonical stage IDs',()=>{
  const frontierIds=new Set(battles(route(4,'frontier')).map(n=>n.stageId));
  const elemental=battles(route(4,'elemental'));
  assert.equal(elemental.length,8);
  assert.ok(elemental.some(n=>!frontierIds.has(n.stageId)));
});

test('CLR-5 does not introduce reward, inventory, or save mutation authority',()=>{
  const src=fs.readFileSync('js/data/coreLoopClr5.js','utf8');
  assert.doesNotMatch(src,/^import\s/m);
  assert.doesNotMatch(src,/state\.data|\.save\(|addItem\(|dropMult\s*:|goldMult\s*:|itemPowerMult\s*:|eliteChance\s*:/i);
});

test('Adventure UI feeds the existing World Tier-derived rank into route construction',()=>{
  const src=fs.readFileSync('js/patches/adventureWorld4Ui.js','utf8');
  assert.match(src,/adventure4HighLevelStateForRegion/);
  assert.match(src,/worldTierRank/);
  assert.match(src,/buildAdventure4PilotRoute\(region,regionState\(region\),clrRouteOptions\(region\)\)/);
});
