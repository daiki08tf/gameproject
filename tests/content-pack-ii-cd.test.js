import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP2_SECRET_CHAINS,CP2_HIDDEN_BOSSES,CP2_SECRET_COMPANIONS,CP2_SPECIAL_HYBRIDS,cp2ChainProgress } from '../js/data/contentPackIICD.js';
import { breedingSpecies } from '../js/data/companionBreeding.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';

test('CP2 C has three authored multi-region secret chains with restrained mystery',()=>{
  const chains=Object.values(CP2_SECRET_CHAINS);
  assert.equal(chains.length,3);
  for(const chain of chains){
    assert.equal(chain.steps.length,3);
    assert.ok(new Set(chain.steps.map(x=>x.site)).size>=3);
    assert.doesNotMatch(chain.resolution,/東京|日本|Tokyo|Japan/);
  }
  const d={'cp2:route:route-silent-nest':{},'cp2:route:route-empty-procession':{}};
  const mid=cp2ChainProgress(CP2_SECRET_CHAINS.silent_beast,{discoveries:d});
  assert.equal(mid.completed,2);assert.equal(mid.resolved,false);assert.equal(mid.next.site,'black_moon_temple');
  d['cp2:route:route-blind-wall']={};
  assert.equal(cp2ChainProgress(CP2_SECRET_CHAINS.silent_beast,{discoveries:d}).resolved,true);
});

test('CP2 D adds five one-at-a-time hidden bosses without conditional-drop objectives',()=>{
  const bosses=Object.entries(CP2_HIDDEN_BOSSES);
  assert.equal(bosses.length,5);
  for(const [id,b] of bosses){
    assert.match(id,/^cp2_boss_/);assert.match(b.stageId,/^secret-/);
    for(const n of ['hpMult','atkMult','defMult','speedMult'])assert.ok(Number.isFinite(b[n])&&b[n]>0);
  }
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIICD.js',import.meta.url),'utf8');
  assert.match(runtime,/encounterQueue\.push\(\{type:bossId,count:1\}\)/);
  assert.doesNotMatch(runtime,/turnLimit|noDeath|breakFinisher|timedKill|withinTurns/i);
});

test('CP2 D adds six secret companions and four deterministic special hybrids',()=>{
  assert.equal(Object.keys(CP2_SECRET_COMPANIONS).length,6);
  assert.equal(Object.keys(CP2_SPECIAL_HYBRIDS).length,4);
  for(const c of Object.values(CP2_SECRET_COMPANIONS)){
    assert.equal(c.id.startsWith('cp2_'),true);
    assert.ok(c.name&&c.role&&c.skills.length>0);
    for(const stat of ['hp','mp','atk','def','mag','spd'])assert.ok(Number.isFinite(c.baseStats[stat]));
  }
  assert.equal(breedingSpecies('cp2_silver_fawn','ash_devourer'),'cp2_ashen_moonhart');
  assert.equal(breedingSpecies('null_hound','cp2_rib_drake'),'cp2_zero_drake');
  assert.equal(breedingSpecies('echo_lux','cp2_margin_sprite'),'cp2_margin_lux');
  assert.equal(breedingSpecies('zero_signal_beast','cp2_parallax_wisp'),'cp2_dual_observer');
});

test('CP2 D supplies twelve fixed meaningful rewards through existing equipment registry',()=>{
  const rewards=BOUNTY_UNIQUES.filter(x=>x.contentPackII);
  assert.equal(rewards.length,12);
  const validSlots=new Set(['weapon','shield','head','body','accessory']);
  for(const item of rewards){
    assert.ok(validSlots.has(item.slot));assert.equal(item.rarity,'mythic');assert.equal(item.unique,true);
    for(const value of Object.values(item.stats||{}))assert.ok(Number.isFinite(value));
    assert.ok((item.effects||[]).length>0);
  }
});

test('CP2 C+D reuses existing save, Ranch, inventory and battle surfaces',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIICD.js',import.meta.url),'utf8');
  const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  assert.match(home,/contentPackIICD\.js/);
  assert.match(runtime,/world2\.discoveries/);
  assert.match(runtime,/state\.addItem/);
  assert.match(runtime,/state\.createCompanion/);
  assert.match(runtime,/COMPANION_SPECIES/);
  assert.doesNotMatch(runtime,/currency|daily|weekly/i);
  assert.doesNotMatch(home,/goCP2|goSecretChain|HiddenBossBtn/);
});

test('CP2 fixed rewards are first-clear chain-boss rewards, not SD-4 conditional hidden drops',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIICD.js',import.meta.url),'utf8');
  assert.match(runtime,/result\?\.cleared/);
  assert.match(runtime,/cp2:boss:\$\{bossId\}:cleared/);
  assert.match(runtime,/state\.addItem\(itemId,1,\{boss:true\}\)/);
  assert.doesNotMatch(runtime,/dropChance|Math\.random\(\).*reward|turns?\s*[<=>]|no-death|break.*finish/i);
});
