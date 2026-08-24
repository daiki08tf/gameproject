import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  BREEDING_COST,
  breedingSpecies,
  inheritTalent,
  inheritNature,
  inheritRarity,
  hybridSpeciesIds,
} from '../js/data/companionBreeding.js';

test('special parent pairs always resolve to registered hybrid species',()=>{
  assert.equal(breedingSpecies('slime','goblin',()=>0.99),'gobslime');
  assert.equal(breedingSpecies('bat','thunder_beast',()=>0.99),'thunder_bat');
  assert.equal(breedingSpecies('ash_soldier','iron_hound',()=>0.99),'ash_hound');
  assert.equal(breedingSpecies('crystal_bug','rot_beast',()=>0.99),'crystal_rot');
  assert.equal(hybridSpeciesIds().length,4);
});

test('same species breeding keeps species and talent inheritance stays bounded',()=>{
  assert.equal(breedingSpecies('slime','slime',()=>0),'slime');
  let i=0;const seq=[0,0,1,1,0.5,0.25,0.75,0.5,0,1,0.5,0.5];
  const talent=inheritTalent({hp:1.3,mp:1.2,atk:1.1,def:1,mag:.95,spd:1.05},{hp:.9,mp:1,atk:1.2,def:1.25,mag:1.1,spd:.95},()=>seq[(i++)%seq.length]);
  for(const v of Object.values(talent))assert.ok(v>=.88&&v<=1.34);
});

test('nature and rarity inheritance can inherit parents or mutate upward',()=>{
  assert.equal(inheritNature('brave','clever',()=>0.1),'brave');
  let calls=0;assert.equal(inheritRarity('rare','epic',()=>calls++===0?.9:.01),'legendary');
  assert.ok(BREEDING_COST.gold>0&&BREEDING_COST.manastone>0);
});

test('runtime stores lineage and is loaded before companion battle snapshot',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/companion3Breeding.js',import.meta.url),'utf8');
  assert.match(runtime,/child\.generation=generation/);
  assert.match(runtime,/child\.parents=\[parentAId,parentBId\]/);
  assert.match(runtime,/child\.inheritedTraits=inheritedTraits/);
  assert.match(runtime,/new Set\(\[\.\.\.\(c\.species\.traits\|\|\[\]\),\.\.\.inherited\]\)/);
  const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');
  const breeding=main.indexOf("./patches/companion3Breeding.js");
  const battle=main.indexOf("./patches/companionBattle.js");
  const evolution=main.indexOf("./patches/companionEvolution.js");
  assert.ok(evolution>=0&&breeding>evolution&&battle>breeding);
});
