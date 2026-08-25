import test from 'node:test';
import assert from 'node:assert/strict';
import { BATTLE3_ELITE_RULES, bossPhaseSummary, encounterLabel } from '../js/patches/battleIntegration3Final.js';
import { bossEncounterProfile } from '../js/data/bossEncounters.js';

test('Elite pressure remains bounded and tactical',()=>{
  assert.ok(BATTLE3_ELITE_RULES.hpMult>1&&BATTLE3_ELITE_RULES.hpMult<1.5);
  assert.ok(BATTLE3_ELITE_RULES.atkMult>1&&BATTLE3_ELITE_RULES.atkMult<1.3);
  assert.equal(BATTLE3_ELITE_RULES.skillCooldownAfterUse,1);
  assert.match(encounterLabel({elite:true}),/ELITE/);
});

test('Boss phase summary exposes current phase and next threshold',()=>{
  const profile=bossEncounterProfile('ch10_boss');
  const boss={boss:true,type:'ch10_boss',combat3Encounter:{profile,nextPhase:0}};
  const first=bossPhaseSummary(boss);
  assert.equal(first.phaseNumber,1);
  assert.equal(first.total,profile.phases.length+1);
  assert.equal(first.nextRatio,profile.phases[0].ratio);
  assert.match(encounterLabel(boss),/BOSS PHASE 1\//);

  boss.combat3Encounter.nextPhase=profile.phases.length;
  const last=bossPhaseSummary(boss);
  assert.equal(last.phaseNumber,last.total);
  assert.equal(last.nextRatio,null);
  assert.match(encounterLabel(boss),/最終局面/);
});

test('Normal enemies do not gain encounter-tier labels',()=>{
  assert.equal(encounterLabel({boss:false,elite:false}),null);
});
