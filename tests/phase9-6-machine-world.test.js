import test from 'node:test';
import assert from 'node:assert/strict';
import { MACHINE_WORLD_ENEMIES, MACHINE_WORLD_STAGES, machineWorldProgress } from '../js/data/phase9MachineWorld.js';
import { buildMachineWorldStage } from '../js/data/phase9MachineWorldStages.js';
import { RANCH_RECRUIT_BY_ENEMY_TYPE, RANCH_REGION_SPECIES } from '../js/data/monsterRanchSpecies.js';
import { WORLD3_REALM_NODES, world3RealmNodeState } from '../js/data/world3Realms.js';

test('Machine World opens as a five-stage post-Eighth-Key district',()=>{
  assert.equal(MACHINE_WORLD_STAGES.length,5);
  for(let i=0;i<MACHINE_WORLD_STAGES.length;i++)assert.equal(MACHINE_WORLD_STAGES[i].requires,i?MACHINE_WORLD_STAGES[i-1].id:null);
  assert.equal(MACHINE_WORLD_STAGES.at(-1).boss,true);
  assert.match(MACHINE_WORLD_STAGES.at(-1).name,/MOTHER-0|中央演算/);
});

test('Machine World uses a distinct combat roster and deep endgame stage builders',()=>{
  assert.deepEqual(Object.keys(MACHINE_WORLD_ENEMIES),['machine_scout','machine_drone','machine_guard','machine_repair','machine_boss']);
  const stages=MACHINE_WORLD_STAGES.map(s=>buildMachineWorldStage(s.id));
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

test('Machine World progress completes only after all five districts',()=>{
  const cleared=new Set(MACHINE_WORLD_STAGES.slice(0,4).map(s=>s.id));
  assert.equal(machineWorldProgress(id=>cleared.has(id)).completed,false);
  cleared.add('machine-world-5');
  assert.equal(machineWorldProgress(id=>cleared.has(id)).completed,true);
});
