import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../js/patches/enemy2EncounterPilot.js';
import { CHAPTERS } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { buildEncounterQueue, deterministicEncounterRng, encounterPoolTotal, pickEncounterPoolType } from '../js/data/encounterPools2.js';
import { CH1_ENCOUNTER_POOL_TYPES } from '../js/patches/enemy2EncounterPilot.js';

const ch1=CHAPTERS.find(ch=>ch.id==='ch1');
const stage=id=>ch1.stages.find(s=>s.id===id);
const total=st=>(st.waves||[]).reduce((n,w)=>n+w.count,0);

test('E5 opts in only Ch1 field stages 1-2 through 1-5',()=>{
  assert.equal(stage('1-1').encounterPool,undefined);
  for(const id of ['1-2','1-3','1-4','1-5']){
    assert.equal(stage(id).encounterPool?.id,'ch1-field-pilot');
    assert.ok(stage(id).encounterPool.types.length>=8);
  }
  assert.equal(stage('1-B').encounterPool,undefined);
});

test('E5 Ch1 pool contains regional roles and true Global Species but no Rare/Boss/Elite',()=>{
  const ids=CH1_ENCOUNTER_POOL_TYPES.map(x=>x.type);
  for(const id of ['ch1_attacker','ch1_caster','ch1_trickster','ch1_support','ch1_global_slime','ch1_global_wolf'])assert.ok(ids.includes(id),id);
  assert.equal(ids.includes('ch1_rare'),false);
  for(const id of ids){
    const enemy=ENEMY_TYPES[id];
    assert.ok(enemy,`missing ${id}`);
    assert.notEqual(enemy.boss,true);
    assert.notEqual(enemy.rareIdentity,true);
    assert.notEqual(enemy.elite,true);
  }
  assert.equal(ENEMY_TYPES.ch1_global_slime.speciesId,'slime');
  assert.equal(ENEMY_TYPES.ch1_global_slime.trueGlobal,true);
});

test('E5 deterministic pool resolution is reproducible and varied',()=>{
  const st=stage('1-4');
  const seq=seed=>{
    const rng=deterministicEncounterRng(seed);
    return Array.from({length:24},()=>pickEncounterPoolType(st,'grunt',ENEMY_TYPES,rng));
  };
  assert.deepEqual(seq('same-seed'),seq('same-seed'));
  const all=new Set();
  for(let i=0;i<40;i++)for(const type of seq(`seed-${i}`))all.add(type);
  assert.ok(all.size>=6,`expected varied pool, got ${[...all].join(', ')}`);
  assert.ok(all.has('ch1_global_slime'),'true-global slime should be reachable in pilot');
});

test('E5 preserves fixed headcount and authored Boss type',()=>{
  for(const id of ['1-2','1-3','1-4','1-5']){
    const st=stage(id);
    const queue=buildEncounterQueue(st,ENEMY_TYPES,{groupSize:3,rng:deterministicEncounterRng(id)});
    assert.equal(queue.reduce((n,x)=>n+x.count,0),total(st));
    assert.equal(encounterPoolTotal(st),total(st));
  }
  const bossStage=stage('1-5');
  for(let i=0;i<50;i++)assert.equal(pickEncounterPoolType(bossStage,'boss_orcking',ENEMY_TYPES,deterministicEncounterRng(`boss-${i}`)),'boss_orcking');
  const queue=buildEncounterQueue(bossStage,ENEMY_TYPES,{groupSize:3,rng:deterministicEncounterRng('boss-queue')});
  assert.equal(queue.at(-1).type,'boss_orcking');
  assert.equal(queue.at(-1).count,1);
});

test('E5 keeps fixed waves as data fallback and loads after Enemy Lv scaling',()=>{
  for(const id of ['1-2','1-3','1-4','1-5'])assert.ok(stage(id).waves?.length>0);
  const source=fs.readFileSync(new URL('../js/patches/battle2RoadmapComplete.js',import.meta.url),'utf8');
  const levelPos=source.indexOf("import './enemy2LevelScaling.js'");
  const poolPos=source.indexOf("import './enemy2EncounterPilot.js'");
  assert.ok(levelPos>=0&&poolPos>levelPos,'Encounter pilot should wrap the completed Enemy Lv chain');
});
