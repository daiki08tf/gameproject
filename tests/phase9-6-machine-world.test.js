import test from 'node:test';
import assert from 'node:assert/strict';
import { MACHINE_WORLD_ENEMIES, MACHINE_WORLD_STAGES, machineWorldProgress } from '../js/data/phase9MachineWorld.js';
import { buildMachineWorldStage } from '../js/data/phase9MachineWorldStages.js';
import { RANCH_RECRUIT_BY_ENEMY_TYPE, RANCH_REGION_SPECIES } from '../js/data/monsterRanchSpecies.js';
import { WORLD3_REALM_NODES, world3RealmNodeState } from '../js/data/world3Realms.js';

test('Machine World keeps the original five-stage first district',()=>{
  const first=MACHINE_WORLD_STAGES.filter(s=>s.district===1);
  assert.equal(first.length,5);
  for(let i=0;i<first.length;i++)assert.equal(first[i].requires,i?first[i-1].id:null);
  assert.equal(first.at(-1).boss,true);
  assert.match(first.at(-1).name,/MOTHER-0|中央演算/);
});

test('Machine World keeps its original combat roster while allowing expansion',()=>{
  for(const id of ['machine_scout','machine_drone','machine_guard','machine_repair','machine_boss'])assert.ok(MACHINE_WORLD_ENEMIES[id]);
  const stages=MACHINE_WORLD_STAGES.filter(s=>s.district===1).map(s=>buildMachineWorldStage(s.id));
  assert.ok(stages.every(Boolean));
  assert.ok(stages.every(s=>s.machineWorld&&s.secretRealm&&!s.isAbyss));
  assert.ok(stages.every(s=>s.dropRegionTags.includes('construct')));
  assert.ok(stages[4].itemPowerTarget>=stages[0].itemPowerTarget);
  assert.ok(stages.every(s=>!('bgm' in s)));
});

test('Machine World introduces a recruitable machine lifeform',()=>{
  assert.equal(RANCH_RECRUIT_BY_ENEMY_TYPE.machine_scout,'machine_iris');
  const iris=RANCH_REGION_SPECIES.machine_iris;
  assert.ok(iris);
  assert.equal(iris.family,'construct');
  assert.equal(iris.regionId,'machine_world');
  assert.ok(iris.traits.includes('自己学習'));
});

test('Machine World realm node becomes a real chapter route after contact',()=>{
  const node=WORLD3_REALM_NODES.find(n=>n.id==='modern');
  assert.equal(node.route,25);
  const open=world3RealmNodeState(node,{}, {phase9MachineWorldOpen:true});
  assert.equal(open.name,'機界');
  assert.equal(open.selectable,true);
  assert.equal(open.badge,'NEW WORLD');
});

test('Machine World progress no longer completes at MOTHER-0 after Phase 9.7 expansion',()=>{
  const cleared=new Set(MACHINE_WORLD_STAGES.filter(s=>s.district===1).map(s=>s.id));
  const p=machineWorldProgress(id=>cleared.has(id));
  assert.equal(p.district1,5);
  assert.equal(p.completed,false);
});
