import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildDeepSurveyStage, CP3_DEEP_SURVEYS } from '../js/data/postCp3DeepSurvey.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import {
  DEEP_SURVEY_CONDITIONS,
  clearActiveDeepSurveyCondition,
  encodeDeepSurveyConditionStageId,
  parseDeepSurveyConditionStageId,
  setActiveDeepSurveyCondition,
  stageIdForActiveDeepSurveyCondition,
  surveyConditionsForRegion,
} from '../js/data/postCp3SurveyConditions.js';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

const BASE_REALMS={
  cp3_deep_ash:'secret-cp3-deep-ash',
  cp3_deep_ninth:'secret-cp3-deep-ninth',
  cp3_deep_root:'secret-cp3-deep-root',
};

test('V1: exactly three authored Conditions exist for each Deep Survey region',()=>{
  assert.equal(DEEP_SURVEY_CONDITIONS.length,9);
  assert.equal(new Set(DEEP_SURVEY_CONDITIONS.map(c=>c.id)).size,9);
  for(const def of CP3_DEEP_SURVEYS){
    const list=surveyConditionsForRegion(def.id);
    assert.equal(list.length,3,def.id);
    assert.ok(list.every(c=>c.name&&c.desc&&c.effect));
  }
});

test('V1: Condition stage ids round-trip without a parallel progression id space',()=>{
  const id=encodeDeepSurveyConditionStageId(BASE_REALMS.cp3_deep_ash,['ash_pressure']);
  assert.equal(id,'secret-cp3-deep-ash~ds:ash_pressure');
  assert.deepEqual(parseDeepSurveyConditionStageId(id),{
    baseRealmId:'secret-cp3-deep-ash',conditionIds:['ash_pressure'],
  });
  assert.equal(parseDeepSurveyConditionStageId(BASE_REALMS.cp3_deep_ash).conditionIds.length,0);
});

test('V2: baseline Deep Survey remains unchanged when no Condition is encoded',()=>{
  for(const def of CP3_DEEP_SURVEYS){
    const stage=buildDeepSurveyStage(def.realmId);
    assert.equal(stage.id,def.realmId);
    assert.deepEqual(stage.deepSurveyConditionIds,[]);
    assert.equal(stage.loot3Profile.targetAffixChance,.34);
    assert.equal(stage.recLevel,99999);
    assert.equal(stage.itemPowerTarget,10000);
  }
});

test('V2: every single Condition builds through the existing Secret Realm route with capped rewards',()=>{
  for(const condition of DEEP_SURVEY_CONDITIONS){
    const realm=BASE_REALMS[condition.regionId];
    const encoded=encodeDeepSurveyConditionStageId(realm,[condition.id]);
    const stage=buildSecretRealmStage(encoded);
    assert.ok(stage,condition.id);
    assert.equal(stage.id,encoded);
    assert.equal(stage.secretRealm,true);
    assert.equal(stage.postCp3DeepSurvey,true);
    assert.deepEqual(stage.deepSurveyConditionIds,[condition.id]);
    assert.ok(stage.modifiers.some(m=>m.id===`deep_condition_${condition.id}`));
    assert.equal(stage.loot3Profile.targetAffixChance,.38);
    const baseline=CP3_DEEP_SURVEYS.find(d=>d.id===condition.regionId).legendaryChanceAdd;
    assert.ok(stage.loot3Profile.legendaryChanceAdd>=baseline);
    assert.ok(stage.loot3Profile.legendaryChanceAdd<=baseline+.04+1e-9);
    assert.equal(stage.itemPowerTarget,10000);
  }
});

test('V2: representative combat pressures are live stage data, not reward-only labels',()=>{
  const ashBase=buildDeepSurveyStage(BASE_REALMS.cp3_deep_ash);
  const ashHp=buildDeepSurveyStage(encodeDeepSurveyConditionStageId(BASE_REALMS.cp3_deep_ash,['ash_pressure']));
  const ashHeal=buildDeepSurveyStage(encodeDeepSurveyConditionStageId(BASE_REALMS.cp3_deep_ash,['ash_dry_wound']));
  assert.ok(ashHp.enemyHpMult>ashBase.enemyHpMult);
  assert.ok(ashHeal.healMult<ashBase.healMult&&ashHeal.healMult>0,'healing is pressured, never disabled');

  const ninthBase=buildDeepSurveyStage(BASE_REALMS.cp3_deep_ninth);
  const ninthElite=buildDeepSurveyStage(encodeDeepSurveyConditionStageId(BASE_REALMS.cp3_deep_ninth,['ninth_elite_chain']));
  assert.ok(ninthElite.waves.reduce((s,w)=>s+w.count,0)>ninthBase.waves.reduce((s,w)=>s+w.count,0));

  const rootMp=buildDeepSurveyStage(encodeDeepSurveyConditionStageId(BASE_REALMS.cp3_deep_root,['root_depletion']));
  const rootRepeat=buildDeepSurveyStage(encodeDeepSurveyConditionStageId(BASE_REALMS.cp3_deep_root,['root_saturation']));
  assert.equal(rootMp.deepSurveyConditionEffects.mpCostMult,1.2);
  assert.ok(rootRepeat.deepSurveyConditionEffects.repeatedActionPenalty>0);
});

test('V2: runtime picker resolves only at battle-start boundary and can return to baseline',()=>{
  const realm=BASE_REALMS.cp3_deep_root;
  clearActiveDeepSurveyCondition(realm);
  assert.equal(stageIdForActiveDeepSurveyCondition(realm),realm);
  setActiveDeepSurveyCondition(realm,'root_replay');
  assert.equal(stageIdForActiveDeepSurveyCondition(realm),'secret-cp3-deep-root~ds:root_replay');
  clearActiveDeepSurveyCondition(realm);
  assert.equal(stageIdForActiveDeepSurveyCondition('secret-cp3-deep-root~ds:root_replay'),realm);
});

test('V2: implementation stays inside existing stage UI/save surfaces and uses transient combat state only',()=>{
  const data=read('js/data/postCp3SurveyConditions.js');
  const ui=read('js/patches/postCp3DeepSurveyUi.js');
  const combat=read('js/patches/postCp3SurveyConditionCombat.js');
  assert.doesNotMatch(data,/state\.data\.[A-Za-z0-9_]+\s*=/);
  assert.doesNotMatch(combat,/state\.data\.[A-Za-z0-9_]+\s*=/);
  assert.doesNotMatch(ui,/homeScreen|home-menu|createElement\(['"]section['"]\)/);
  assert.match(ui,/confirmModifiers/);
  assert.match(combat,/stageIdForActiveDeepSurveyCondition/);
  assert.match(combat,/directPressure/);
  assert.match(combat,/repeatedActionPenalty/);
  assert.match(combat,/mpCostMult/);
  assert.match(combat,/bossTechniqueIntervalMult/);
});
