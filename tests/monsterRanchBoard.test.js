import test from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES_BOARD_NODES, speciesBoardCost, speciesBoardEffects } from '../js/data/monsterRanchBoard.js';
import { abyssTargetFarmProfile } from '../js/data/abyssTargetFarm.js';

test('Species Board has bounded progression and escalating costs',()=>{
  assert.ok(SPECIES_BOARD_NODES.length>=6);
  const vitality=SPECIES_BOARD_NODES.find(x=>x.id==='vitality');
  assert.ok(vitality);
  assert.equal(vitality.maxRank,3);
  assert.ok(speciesBoardCost(vitality,2)>speciesBoardCost(vitality,0));
});

test('Species Board effects combine stat, recruit and talent bonuses',()=>{
  const effects=speciesBoardEffects({vitality:3,ferocity:2,affinity:3,pedigree:2,master_trait:1});
  assert.ok(effects.hpMult>1.08);
  assert.ok(effects.atkMult>1.06);
  assert.equal(Math.round(effects.recruitChanceBonus*1000)/1000,.015);
  assert.equal(Math.round(effects.talentFloorBonus*1000)/1000,.01);
});

test('beast den is a real monster quality target farm',()=>{
  const profile=abyssTargetFarmProfile('beast_den');
  assert.ok(profile.recruitChanceMult>1);
  assert.equal(profile.minRarity,'rare');
  assert.ok(profile.rareFloorChance>0);
  assert.ok(profile.talentFloorBonus>0);
  assert.ok(profile.highTalentChance>0);
});
