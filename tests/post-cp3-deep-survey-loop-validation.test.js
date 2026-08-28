import test from 'node:test';
import assert from 'node:assert/strict';
import { CP3_DEEP_SURVEYS, buildDeepSurveyStage } from '../js/data/postCp3DeepSurvey.js';
import { steerRealmAffix } from '../js/patches/loot3RealmTargetFarm.js';
import { isOption4 } from '../js/data/options4.js';

function simulateTargetRate(def, trials = 10000) {
  const stage = buildDeepSurveyStage(def.realmId);
  let hits = 0;
  let checkedOption4 = false;
  for (let i = 0; i < trials; i += 1) {
    const inst = {
      itemId: 'wp_sword_l',
      itemPower: 10000,
      affixTier: 7,
      affixes: [{ id: 'atk_pct', familyId: 'atk_pct', rarity: 'rare', level: 70, xp: 321, roll: 10, greater: true }],
    };
    const id = `${def.realmId}#sim-${i}`;
    if (!steerRealmAffix(inst, stage.loot3Profile, id)) continue;
    hits += 1;
    assert.ok(def.preferredAffixIds.includes(inst.affixes[0].id));
    assert.equal(inst.affixes[0].greater, true, 'target steering must preserve Greater status');
    assert.ok(isOption4(inst.affixes[0]), 'target steering must return a canonical Option 4.0 record');
    assert.ok(inst.affixes[0].level >= 1 && inst.affixes[0].level <= 97);
    assert.equal(inst.targetFarmHit, true);
    checkedOption4 = true;
  }
  assert.equal(checkedOption4, true);
  return hits / trials;
}

test('Deep Survey profiles remain a bounded bias rather than guaranteed loot', () => {
  for (const def of CP3_DEEP_SURVEYS) {
    const rate = simulateTargetRate(def);
    assert.ok(rate > 0.30 && rate < 0.38, `${def.id} target rate drifted to ${(rate * 100).toFixed(2)}%`);
  }
});

test('Deep Survey loop stays on canonical Gear Overhaul systems', () => {
  for (const def of CP3_DEEP_SURVEYS) {
    const stage = buildDeepSurveyStage(def.realmId);
    assert.equal(stage.itemPowerTarget, 10000);
    assert.equal(stage.deepSurveyMixedChase, true);
    assert.equal(stage.loot3Profile.targetAffixChance, 0.34);
    assert.ok(stage.loot3Profile.legendaryChanceAdd >= 0.03 && stage.loot3Profile.legendaryChanceAdd <= 0.04);
    assert.equal(stage.loot3Profile.informationalOnly, undefined);
    assert.ok(stage.dropTable.length > 1);
  }
});
