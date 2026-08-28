import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../js/patches/enemy2EncounterTemplates.js';
import { CHAPTERS } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { deterministicEncounterRng } from '../js/data/encounterPools2.js';
import { CH1_TEMPLATE_IDS, ENCOUNTER_TEMPLATES_2, planRoleFirstEncounter } from '../js/data/encounterTemplates2.js';

const ch1=CHAPTERS.find(ch=>ch.id==='ch1');
const stage=id=>ch1.stages.find(s=>s.id===id);

test('E6 ships six coherent Ch1 template identities',()=>{
  assert.deepEqual(CH1_TEMPLATE_IDS,['mixed','pack','frontline','escort','ambush','bulwark']);
  assert.deepEqual(ENCOUNTER_TEMPLATES_2.mixed.roles,['normal','fast','attacker']);
  assert.deepEqual(ENCOUNTER_TEMPLATES_2.pack.roles,['fast','attacker','fast']);
  assert.deepEqual(ENCOUNTER_TEMPLATES_2.frontline.roles,['tank','attacker','normal']);
  assert.deepEqual(ENCOUNTER_TEMPLATES_2.escort.roles,['tank','support','caster']);
  assert.deepEqual(ENCOUNTER_TEMPLATES_2.ambush.roles,['trickster','fast','attacker']);
  assert.deepEqual(ENCOUNTER_TEMPLATES_2.bulwark.roles,['tank','support','tank']);
});

test('E6 enables templates only on the existing Ch1 Encounter Pool pilot',()=>{
  assert.equal(stage('1-1').encounterPool,undefined);
  assert.equal(stage('1-B').encounterPool,undefined);
  for(const id of ['1-2','1-3','1-4','1-5'])assert.deepEqual(stage(id).encounterPool.templates,CH1_TEMPLATE_IDS);
});

test('E6 resolves role slots before species and keeps every resolved type safe',()=>{
  const st=stage('1-4');
  for(let i=0;i<100;i++){
    const plan=planRoleFirstEncounter(st,{type:'grunt',count:3},ENEMY_TYPES,deterministicEncounterRng(`roles-${i}`));
    assert.ok(plan);
    assert.equal(plan.roles.length,3);
    assert.equal(plan.types.length,3);
    for(let n=0;n<plan.types.length;n++){
      const enemy=ENEMY_TYPES[plan.types[n]];
      assert.ok(enemy);
      assert.equal(enemy.role,plan.roles[n],`${plan.templateId} slot ${n}: ${plan.types[n]}`);
      assert.notEqual(enemy.boss,true);
      assert.notEqual(enemy.rareIdentity,true);
      assert.notEqual(enemy.elite,true);
    }
  }
});

test('E6 seeded planning is reproducible and reaches all six template families',()=>{
  const st=stage('1-4');
  const one=planRoleFirstEncounter(st,{type:'grunt',count:3},ENEMY_TYPES,deterministicEncounterRng('same-template'));
  const two=planRoleFirstEncounter(st,{type:'grunt',count:3},ENEMY_TYPES,deterministicEncounterRng('same-template'));
  assert.deepEqual(one,two);
  const ids=new Set();
  for(let i=0;i<160;i++)ids.add(planRoleFirstEncounter(st,{type:'grunt',count:3},ENEMY_TYPES,deterministicEncounterRng(`template-${i}`))?.templateId);
  for(const id of CH1_TEMPLATE_IDS)assert.ok(ids.has(id),`template never reached: ${id}`);
});

test('E6 never plans over an authored Boss and respects current group size',()=>{
  const st=stage('1-5');
  assert.equal(planRoleFirstEncounter(st,{type:'boss_orcking',count:1},ENEMY_TYPES,deterministicEncounterRng('boss')),null);
  for(const count of [1,2,3]){
    const plan=planRoleFirstEncounter(stage('1-4'),{type:'grunt',count},ENEMY_TYPES,deterministicEncounterRng(`count-${count}`));
    assert.equal(plan.types.length,count);
    assert.equal(plan.roles.length,count);
    assert.ok(count<=3);
  }
});

test('E6 production import order preserves E1/E2/E5 before template planning',()=>{
  const source=fs.readFileSync(new URL('../js/patches/battle2RoadmapComplete.js',import.meta.url),'utf8');
  const scaling=source.indexOf("import './enemy2LevelScaling.js'");
  const pilot=source.indexOf("import './enemy2EncounterPilot.js'");
  const templates=source.indexOf("import './enemy2EncounterTemplates.js'");
  assert.ok(scaling>=0&&pilot>scaling&&templates>pilot);
});
