import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCompanionSynergies, bondRuneEffects } from '../js/data/companionSynergies.js';
import { getRune2, rune2EffectText } from '../js/data/runes2.js';

function c(speciesId,{evolved=false,nature='balanced'}={}){return{instance:{speciesId,baseSpeciesId:speciesId,evolution:evolved?'evo':null,nature}};}

test('three-member and diverse-species synergies stack multiplicatively',()=>{
  const out=evaluateCompanionSynergies([c('slime'),c('goblin',{nature:'aggressive'}),c('bat',{nature:'defensive'})]);
  assert.ok(out.active.some(s=>s.id==='full_party'));
  assert.ok(out.active.some(s=>s.id==='diverse_species'));
  assert.ok(out.total.hpMult>1);
  assert.ok(out.total.atkMult>1);
});

test('two evolved companions activate awakening resonance',()=>{
  const out=evaluateCompanionSynergies([c('slime',{evolved:true}),c('goblin',{evolved:true})]);
  assert.ok(out.active.some(s=>s.id==='evolved_pair'));
  assert.equal(out.total.atkMult,1.08);
});

test('Bond rune scales to a capped ★1000 gameplay effect',()=>{
  const zero=bondRuneEffects(0),mid=bondRuneEffects(500),cap=bondRuneEffects(1000),over=bondRuneEffects(5000);
  assert.equal(zero.recruitChanceBonus,0);
  assert.ok(mid.companionExpMult>1);
  assert.equal(cap.recruitChanceBonus,0.15);
  assert.equal(cap.companionExpMult,1.5);
  assert.equal(cap.rareRecruitChance,0.2);
  assert.deepEqual(over,cap);
  assert.match(rune2EffectText(getRune2('bond'),1000),/仲間加入率/);
});
