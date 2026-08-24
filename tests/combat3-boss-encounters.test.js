import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bossEncounterProfile } from '../js/data/bossEncounters.js';

test('all story chapter bosses receive encounter profiles',()=>{
  assert.ok(bossEncounterProfile('boss_orcking'));
  for(let ch=2;ch<=15;ch++)assert.ok(bossEncounterProfile(`ch${ch}_boss`),`ch${ch}`);
});

test('boss phases are ordered from high HP to low HP and remain bounded',()=>{
  for(const type of ['boss_orcking','ch2_boss','ch5_boss','ch10_boss','ch15_boss']){
    const p=bossEncounterProfile(type);let prev=1;
    for(const phase of p.phases){assert.ok(phase.ratio>0&&phase.ratio<prev,`${type}:${phase.name}`);prev=phase.ratio;}
    assert.ok((p.startEscorts||[]).reduce((n,e)=>n+(e.count||1),0)<=3);
  }
});

test('signature bosses have distinct encounter identities',()=>{
  const orc=bossEncounterProfile('boss_orcking'),flame=bossEncounterProfile('ch5_boss'),demon=bossEncounterProfile('ch10_boss'),ark=bossEncounterProfile('ch15_boss');
  assert.equal(orc.id,'orc-king');assert.equal(flame.id,'flame-emperor');assert.equal(demon.id,'true-demon-king');assert.equal(ark.id,'ark-zero');
  assert.ok(flame.phases.some(x=>x.name==='溶岩の護壁'));
  assert.ok(demon.phases.some(x=>x.name==='魔王結界'));
  assert.ok(ark.phases.some(x=>x.name==='最終プロトコル'));
});

test('late bosses use guards and multi-phase pressure',()=>{
  for(const type of ['ch10_boss','ch15_boss']){
    const p=bossEncounterProfile(type);
    assert.ok(p.startEscorts.some(x=>x.guard));
    assert.ok(p.guardDefMult>=1.5);
    assert.ok(p.phases.length>=3);
    assert.ok(p.phases.some(x=>x.accelerateBossAI));
  }
});

test('runtime prevents encounter adds from becoming reward farms and caps field size',async()=>{
  const src=await readFile(new URL('../js/patches/combat3BossEncounter.js',import.meta.url),'utf8');
  assert.match(src,/MAX_ENCOUNTER_ENEMIES=5/);
  assert.match(src,/combat3EncounterMinion=true/);
  assert.match(src,/xp:0,gold:0/);
  assert.match(src,/guardDefMult/);
  assert.match(src,/nextPhase/);
});

test('Boss Encounter patch is loaded after Combat 3 difficulty layer',async()=>{
  const src=await readFile(new URL('../js/patches/combat3Formation.js',import.meta.url),'utf8');
  const difficulty=src.indexOf("./combat3DifficultyRebalance.js");
  const boss=src.indexOf("./combat3BossEncounter.js");
  assert.ok(difficulty>=0&&boss>difficulty);
});
