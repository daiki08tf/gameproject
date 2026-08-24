import test from 'node:test';
import assert from 'node:assert/strict';
import { abyssTargetFarmProfile } from '../js/data/abyssTargetFarm.js';
import { cursedAffixChance, legendaryEffectChance } from '../js/data/equipment3Legendary.js';

test('Abyss target farm routes have materially distinct goals',()=>{
  assert.ok(abyssTargetFarmProfile('armory').weaponDropMult>1);
  assert.ok(abyssTargetFarmProfile('armory').setWeightMult>1);
  assert.ok(abyssTargetFarmProfile('beast_den').recruitChanceMult>1);
  assert.ok(abyssTargetFarmProfile('blood_mist').cursedChanceMult>1);
  assert.ok(abyssTargetFarmProfile('rift_scar').riftKeyChance>0);
  assert.ok(abyssTargetFarmProfile('veil_fracture').legendaryChanceAdd>0);
});

test('Blood Mist really raises Cursed chance without bypassing rarity gate',()=>{
  const epic={rarity:'epic'};
  const rare={rarity:'rare'};
  const base=cursedAffixChance(epic,4000,{});
  const blood=cursedAffixChance(epic,4000,{cursedChanceMult:abyssTargetFarmProfile('blood_mist').cursedChanceMult});
  assert.ok(blood>base);
  assert.equal(cursedAffixChance(rare,4000,{cursedChanceMult:99}),0);
});

test('Veil Fracture raises Legendary opportunity but keeps global cap',()=>{
  const mythic={rarity:'mythic'};
  const base=legendaryEffectChance(mythic,10000,{});
  const veil=legendaryEffectChance(mythic,10000,{legendaryChanceAdd:abyssTargetFarmProfile('veil_fracture').legendaryChanceAdd});
  assert.ok(veil>base);
  assert.ok(veil<=0.70);
});
