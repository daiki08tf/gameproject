import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { phase9EnemyCombatProfile } from '../js/data/enemyCombatPhase9.js';
import { breedingSpecies } from '../js/data/companionBreeding.js';
import { uniqueBranchEffect } from '../js/data/uniqueBranchEffects.js';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const SUPPORTED=new Set(['power','multi','guardAll','hasteAll','healAlly','mpDrain','slow','weakenAtk','poison','burn']);

test('polish 3: Ch26-30 keep authored tactical AI instead of generic fallback',()=>{
  const suffixes=['normal','fast','tank','midboss','branchboss'];
  for(let chapter=26;chapter<=30;chapter++){
    const profiles=suffixes.map(s=>phase9EnemyCombatProfile(`ch${chapter}_${s}`));
    for(const p of profiles){
      assert.ok(p?.skill,`Ch${chapter} needs authored Combat 3 skill coverage`);
      assert.ok(SUPPORTED.has(p.skill.kind),`unsupported skill kind ${p.skill.kind}`);
      assert.ok(p.skill.chance>=.4&&p.skill.chance<=.6,`Ch${chapter} tactical chance must stay bounded`);
    }
    assert.ok(new Set(profiles.map(p=>p.role)).size>=3,`Ch${chapter} should preserve role variety`);
    assert.ok(new Set(profiles.map(p=>p.skill.kind)).size>=3,`Ch${chapter} should preserve tactical variety`);
  }
  assert.ok(phase9EnemyCombatProfile('ch30_branchboss').skill.power>=2.3,'final branch boss should remain a real tactical threat');
});

test('polish 3: companion species inheritance honors supplied RNG',()=>{
  assert.equal(breedingSpecies('slime','bat',()=>0),'slime');
  assert.equal(breedingSpecies('slime','bat',()=>0.99),'bat');
  assert.equal(breedingSpecies('goblin','slime',()=>0.99),'gobslime','authored hybrids must remain deterministic');
});

test('polish 3: Tyrant Unique branch has a bounded live kill-momentum runtime',()=>{
  const tyrant=uniqueBranchEffect('uq_regicide','tyrant');
  const momentum=tyrant?.effects?.find(e=>e.kind==='strongKillMomentum');
  assert.ok(momentum,'Tyrant branch needs authored momentum');
  assert.equal(momentum.power,.12);
  assert.equal(momentum.maxStacks,5);
  const src=read('js/patches/uniqueBranchEffects.js');
  assert.match(src,/_uniqueKillMomentumStacks/);
  assert.match(src,/effects\(this,'strongKillMomentum'\)/);
  assert.match(src,/_grantKillRewards=function uniqueBranchKillMomentum/);
  assert.match(src,/strong\?2:1/);
});

test('polish 3: CP3 special breeding works through egg and direct breeding routes',()=>{
  const src=read('js/patches/contentPackIIIB.js');
  assert.match(src,/resolvedHybridFor/);
  assert.match(src,/state\.createBreedingEgg/);
  assert.match(src,/state\.breedCompanions/);
  assert.match(src,/child\.speciesId=hybrid\.id/);
  assert.match(src,/child\.baseSpeciesId=hybrid\.id/);
  assert.match(src,/cp3SpecialBreeding/);
  assert.match(src,/chainState\(CP3_SECRET_CHAINS\[required\]\)\.resolved/,'secret-chain gate must remain authoritative');
});
