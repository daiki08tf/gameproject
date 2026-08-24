import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RANCH_FACILITIES,ranchFacilityCost,ranchFacilityEffects } from '../js/data/monsterRanchFacilities.js';

test('Monster Ranch 2.0 defines four ranch sub-facilities',()=>{
  assert.equal(RANCH_FACILITIES.length,4);
  assert.deepEqual(RANCH_FACILITIES.map(x=>x.id),['incubator','training','research','mutationLab']);
  for(const f of RANCH_FACILITIES){assert.equal(f.maxLevel,5);assert.equal(f.costs.length,5);}
});

test('facility costs rise while effects stay bounded',()=>{
  for(const f of RANCH_FACILITIES){const a=ranchFacilityCost(f.id,1),b=ranchFacilityCost(f.id,5);assert.ok(Object.values(b).reduce((x,y)=>x+y,0)>Object.values(a).reduce((x,y)=>x+y,0));}
  const max=ranchFacilityEffects({incubator:5,training:5,research:5,mutationLab:5});
  assert.ok(max.talentFloorBonus<=.05);
  assert.ok(max.companionExpMult<=1.5);
  assert.ok(max.bondExpMult<=1.25);
  assert.ok(max.memoryMult<=1.5);
  assert.ok(max.mutationChanceBonus<=.01);
});

test('egg runtime supports breeding eggs and explicit hatching',()=>{
  const src=fs.readFileSync(new URL('../js/patches/monsterRanch2Facilities.js',import.meta.url),'utf8');
  assert.match(src,/state\.createRanchEgg=/);
  assert.match(src,/state\.createBreedingEgg=/);
  assert.match(src,/state\.hatchRanchEgg=/);
  assert.match(src,/origin:'breedingEgg'/);
});

test('Monster Ranch 2.0 loads after ranch core and before ranch UI',()=>{
  const src=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  const core=src.indexOf("import './monsterRanchCore.js'");
  const facilities=src.indexOf("import './monsterRanch2Facilities.js'");
  const ui=src.indexOf("import './monsterRanchUi.js'");
  assert.ok(core>=0&&facilities>core&&ui>facilities);
  assert.match(src,/monsterRanch2FacilitiesUi\.js/);
});
