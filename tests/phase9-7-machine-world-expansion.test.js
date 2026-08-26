import test from 'node:test';
import assert from 'node:assert/strict';
import { MACHINE_WORLD_ENEMIES, MACHINE_WORLD_STAGES, machineWorldProgress } from '../js/data/phase9MachineWorld.js';
import { buildMachineWorldStage } from '../js/data/phase9MachineWorldStages.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';
import { SECRET_JOBS } from '../js/data/secretJobs.js';
import { secretJobPhase2 } from '../js/data/secretJobPhase2.js';

test('Phase 9.7 adds a second five-stage Machine World district',()=>{
  const second=MACHINE_WORLD_STAGES.filter(s=>s.district===2);
  assert.equal(second.length,5);
  assert.equal(second[0].requires,'machine-world-5');
  for(let i=1;i<second.length;i++)assert.equal(second[i].requires,second[i-1].id);
  assert.equal(second.at(-1).id,'machine-world-10');
  assert.equal(second.at(-1).boss,true);
  assert.equal(second.at(-1).final,true);
  assert.match(second.at(-1).name,/設計神殿/);
});

test('second district introduces authored Machine World enemy identities',()=>{
  for(const id of ['machine_hunter','machine_null','machine_colossus','machine_architect'])assert.ok(MACHINE_WORLD_ENEMIES[id]);
  assert.equal(MACHINE_WORLD_ENEMIES.machine_architect.role,'boss');
  assert.match(MACHINE_WORLD_ENEMIES.machine_architect.name,/ARCHITECT-1/);
});

test('second district scales past first district and final stage carries Unique chase',()=>{
  const first=buildMachineWorldStage('machine-world-5');
  const final=buildMachineWorldStage('machine-world-10');
  assert.ok(first&&final);
  assert.ok(final.recLevel>=first.recLevel);
  assert.ok(final.itemPowerTarget>=first.itemPowerTarget);
  assert.ok(final.dropMult>first.dropMult);
  assert.equal(final.machineWorldDistrict,2);
  assert.equal(final.machineWorldFinal,true);
  assert.ok(final.dropTable.some(d=>d.itemId==='uq_architect_core'));
});

test('Architect core is a fixed Machine World Unique',()=>{
  const core=BOUNTY_UNIQUES.find(x=>x.id==='uq_architect_core');
  assert.ok(core);
  assert.equal(core.sourceStageId,'machine-world-10');
  assert.equal(core.unique,true);
  assert.equal(core.rarity,'mythic');
});

test('Machine World completion unlock target has a dedicated secret job identity',()=>{
  const job=SECRET_JOBS.find(j=>j.id==='secret_mechanosage');
  assert.ok(job);
  assert.equal(job.name,'機巧賢者');
  assert.equal(job.carrierJobId,'artificer');
  assert.ok(job.conditions.some(c=>c.id==='architect'));
  assert.ok(job.conditions.some(c=>c.id==='core'));
  const phase2=secretJobPhase2(job.id);
  assert.ok(phase2);
  assert.ok(phase2.techniques.length>=3);
});

test('full Machine World progress requires all ten stages',()=>{
  const cleared=new Set(MACHINE_WORLD_STAGES.slice(0,9).map(s=>s.id));
  assert.equal(machineWorldProgress(id=>cleared.has(id)).completed,false);
  cleared.add('machine-world-10');
  const p=machineWorldProgress(id=>cleared.has(id));
  assert.equal(p.completed,true);
  assert.equal(p.district1,5);
  assert.equal(p.district2,5);
});
