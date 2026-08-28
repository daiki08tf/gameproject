import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDeepSurveyStage } from '../js/data/postCp3DeepSurvey.js';
import {
  activeDeepSurveyConditions,
  clearActiveDeepSurveyCondition,
  encodeDeepSurveyConditionStageId,
  setActiveDeepSurveyConditions,
  singleConditionStageIds,
  stageIdForActiveDeepSurveyCondition,
  surveyConditionMastery,
  twoConditionUnlocked,
} from '../js/data/postCp3SurveyConditions.js';

const REGION='cp3_deep_ash';
const REALM='secret-cp3-deep-ash';

test('V3: two-Condition mastery unlock is derived only from three ordinary single-clear stage IDs',()=>{
  const ids=singleConditionStageIds(REGION,REALM);
  assert.equal(ids.length,3);
  assert.ok(ids.every(id=>id.startsWith(`${REALM}~ds:`)));
  const cleared=new Set(ids.slice(0,2));
  let mastery=surveyConditionMastery(REGION,REALM,id=>cleared.has(id));
  assert.equal(mastery.cleared,2);assert.equal(mastery.complete,false);
  assert.equal(twoConditionUnlocked(REGION,REALM,id=>cleared.has(id)),false);
  cleared.add(ids[2]);
  mastery=surveyConditionMastery(REGION,REALM,id=>cleared.has(id));
  assert.equal(mastery.cleared,3);assert.equal(mastery.complete,true);
  assert.equal(twoConditionUnlocked(REGION,REALM,id=>cleared.has(id)),true);
});

test('V3: runtime selection stays one-or-two only and stage id carries both mastered Conditions',()=>{
  clearActiveDeepSurveyCondition(REALM);
  let selected=setActiveDeepSurveyConditions(REALM,['ash_pressure','ash_dry_wound','ash_echo_hit'],2);
  assert.deepEqual(selected.map(c=>c.id),['ash_pressure','ash_dry_wound']);
  assert.deepEqual(activeDeepSurveyConditions(REALM).map(c=>c.id),['ash_pressure','ash_dry_wound']);
  assert.equal(stageIdForActiveDeepSurveyCondition(REALM),`${REALM}~ds:ash_pressure+ash_dry_wound`);
  clearActiveDeepSurveyCondition(REALM);
});

test('V3: two Conditions combine combat pressure while keeping reward steering capped at 42%',()=>{
  const one=buildDeepSurveyStage(encodeDeepSurveyConditionStageId(REALM,['ash_pressure']));
  const two=buildDeepSurveyStage(encodeDeepSurveyConditionStageId(REALM,['ash_pressure','ash_dry_wound']));
  assert.equal(one.deepSurveyConditionIds.length,1);
  assert.equal(two.deepSurveyConditionIds.length,2);
  assert.equal(one.loot3Profile.targetAffixChance,.38);
  assert.equal(two.loot3Profile.targetAffixChance,.42);
  assert.ok(two.enemyHpMult>=one.enemyHpMult);
  assert.ok(two.healMult<one.healMult&&two.healMult>0);
  assert.equal(two.itemPowerTarget,10000);
});

test('V3: crafted IDs cannot activate a third Condition in the stage builder',()=>{
  const crafted=`${REALM}~ds:ash_pressure+ash_dry_wound+ash_echo_hit`;
  const stage=buildDeepSurveyStage(crafted);
  assert.equal(stage.deepSurveyConditionIds.length,2);
  assert.equal(stage.loot3Profile.targetAffixChance,.42);
});
