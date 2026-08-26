import test from 'node:test';
import assert from 'node:assert/strict';
import { MACHINE_WORLD_ENEMIES, MACHINE_WORLD_STAGES, machineWorldProgress } from '../js/data/phase9MachineWorld.js';
import { buildMachineWorldStage } from '../js/data/phase9MachineWorldStages.js';
import { EQUIPMENT3_SETS, setPieces } from '../js/data/equipment3Sets.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';
import { BattleEngine } from '../js/battleEngine.js';
import '../js/patches/phase9MechanosageRuntime.js';

test('Phase 9.8 adds a third five-stage deep layer after ARCHITECT-1',()=>{
  const third=MACHINE_WORLD_STAGES.filter(s=>s.district===3);
  assert.equal(third.length,5);
  assert.equal(third[0].requires,'machine-world-10');
  for(let i=1;i<third.length;i++)assert.equal(third[i].requires,third[i-1].id);
  assert.equal(third.at(-1).id,'machine-world-15');
  assert.equal(third.at(-1).boss,true);
  assert.equal(third.at(-1).secretBoss,true);
  assert.equal(third.at(-1).final,true);
});

test('deep layer introduces adaptive enemies and OBSERVER secret boss',()=>{
  for(const id of ['machine_mirror','machine_judge','machine_seraph','machine_observer','machine_origin'])assert.ok(MACHINE_WORLD_ENEMIES[id]);
  assert.equal(MACHINE_WORLD_ENEMIES.machine_origin.role,'secretBoss');
  assert.match(MACHINE_WORLD_ENEMIES.machine_origin.name,/OBSERVER/);
});

test('Machine World final stage is stronger and has unique/set chase',()=>{
  const architect=buildMachineWorldStage('machine-world-10');
  const observer=buildMachineWorldStage('machine-world-15');
  assert.ok(architect&&observer);
  assert.equal(observer.machineWorldDistrict,3);
  assert.equal(observer.machineWorldSecretBoss,true);
  assert.equal(observer.machineWorldFinal,true);
  assert.ok(observer.recLevel>=architect.recLevel);
  assert.ok(observer.dropMult>architect.dropMult);
  assert.ok(observer.itemPowerTarget>=architect.itemPowerTarget);
  assert.ok(observer.dropTable.some(d=>d.itemId==='uq_observer_zero'));
  assert.ok(observer.dropTable.some(d=>d.itemId==='set_machine_accessory'));
});

test('Phase 9.8 adds the Machine Architect mythic set',()=>{
  const set=EQUIPMENT3_SETS.machine_architect;
  assert.ok(set);
  assert.equal(setPieces('machine_architect').length,3);
  assert.ok(set.unlockDepth>=3000);
  assert.ok(set.bonuses[2]);
  assert.ok(set.bonuses[3]);
  assert.ok(set.bonuses[3].effects.some(e=>e.kind==='actionDiversityBuff'));
});

test('OBSERVER drops a fixed mythic unique',()=>{
  const unique=BOUNTY_UNIQUES.find(x=>x.id==='uq_observer_zero');
  assert.ok(unique);
  assert.equal(unique.sourceStageId,'machine-world-15');
  assert.equal(unique.rarity,'mythic');
  assert.equal(unique.unique,true);
});

test('Mechanosage Phase 9.8 runtime exposes tactical diversity state',()=>{
  assert.equal(typeof BattleEngine.prototype.mechanosageSummary,'function');
});

test('full Machine World completion now requires all fifteen stages',()=>{
  const cleared=new Set(MACHINE_WORLD_STAGES.slice(0,14).map(s=>s.id));
  assert.equal(machineWorldProgress(id=>cleared.has(id)).completed,false);
  cleared.add('machine-world-15');
  const p=machineWorldProgress(id=>cleared.has(id));
  assert.equal(p.completed,true);
  assert.equal(p.total,15);
  assert.equal(p.district1,5);
  assert.equal(p.district2,5);
  assert.equal(p.district3,5);
});
