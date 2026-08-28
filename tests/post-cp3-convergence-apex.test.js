import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CONVERGENCE_APEX_ID,
  CONVERGENCE_APEX_SITE_ID,
  buildConvergenceApexStage,
  convergenceApexExplorationSite,
  convergenceApexUnlockStatus,
} from '../js/data/postCp3ConvergenceApex.js';
import { CP3_DEEP_SURVEYS } from '../js/data/postCp3DeepSurvey.js';
import { encodeDeepSurveyConditionStageId, surveyConditionsForRegion } from '../js/data/postCp3SurveyConditions.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

function fullUnlockIds(){
  const ids=[];
  for(const def of CP3_DEEP_SURVEYS){
    ids.push(def.realmId);
    const first=surveyConditionsForRegion(def.id)[0];
    ids.push(encodeDeepSurveyConditionStageId(def.realmId,[first.id]));
  }
  return ids;
}

test('post-CP3 V4: Apex unlock requires all three baselines plus one Condition in every region',()=>{
  const all=new Set(fullUnlockIds());
  const open=convergenceApexUnlockStatus(id=>all.has(id));
  assert.equal(open.baselineCleared,3);
  assert.equal(open.conditionedRegions,3);
  assert.equal(open.unlocked,true);

  for(const id of [...all]){
    const missing=new Set(all);missing.delete(id);
    const status=convergenceApexUnlockStatus(stageId=>missing.has(stageId));
    assert.equal(status.unlocked,false,`Apex must remain locked without ${id}`);
  }
});

test('post-CP3 V4: Apex exploration site reuses existing Secret Realm surface',()=>{
  const site=convergenceApexExplorationSite();
  assert.equal(site.id,CONVERGENCE_APEX_SITE_ID);
  assert.equal(site.realm.id,CONVERGENCE_APEX_ID);
  assert.equal(site.realm.recLevel,99999);
  assert.equal(site.realm.itemPowerTarget,10000);
  assert.equal(site.postCp3ConvergenceApex,true);
});

test('post-CP3 V4: Apex is one four-phase Lv99,999/IP10,000 encounter',()=>{
  const stage=buildConvergenceApexStage();
  assert.ok(stage);
  assert.equal(stage.id,CONVERGENCE_APEX_ID);
  assert.equal(stage.recLevel,99999);
  assert.equal(stage.itemPowerTarget,10000);
  assert.equal(stage.isAbyss,false);
  assert.equal(stage.secretRealm,true);
  assert.equal(stage.convergenceApex,true);
  assert.deepEqual(stage.waves.map(w=>w.convergencePhase),['ash','ninth','root','convergence']);
  assert.deepEqual(stage.convergenceApexPhases.map(p=>p.id),['ash','ninth','root','convergence']);
  assert.ok(stage.waves.every(w=>w.count===1));
});

test('post-CP3 V4: Apex rewards stay inside existing Gear/CP3 ecosystem',()=>{
  const stage=buildConvergenceApexStage();
  assert.equal(stage.loot3Profile.targetAffixChance,0.36);
  assert.ok(stage.loot3Profile.legendaryChanceAdd<=0.04);
  assert.equal(stage.firstClear.itemId,'uq_cp3_boundary_echo');
  const ids=stage.dropTable.map(x=>x.itemId);
  for(const id of ['uq_cp3_reply_guard','uq_cp3_return_coil','uq_cp3_living_archive','uq_cp3_boundary_echo']) assert.ok(ids.includes(id));
  assert.doesNotMatch(JSON.stringify(stage),/currency|token|apexShard|itemPower.*1000[1-9]/i);
});

test('post-CP3 V4: Secret Realm routing keeps Gear 9 target-farm wrapper authoritative',()=>{
  const stage=buildSecretRealmStage(CONVERGENCE_APEX_ID);
  assert.equal(stage?.convergenceApex,true);
  assert.equal(stage?.secretRealm,true);
  const realms=read('js/data/secretRealms.js');
  assert.match(realms,/buildConvergenceApexStage/);
  assert.match(realms,/applyUnique2TargetFarm\(stage\)/);
});

test('post-CP3 V4: combat bridge cycles final pressure and creates no persisted meter',()=>{
  const combat=read('js/patches/postCp3ConvergenceApexCombat.js');
  assert.match(combat,/\['ash','ninth','root'\]/);
  assert.match(combat,/\/2\)%3/);
  assert.match(combat,/beginNextEncounter/);
  assert.match(combat,/this\.stage\?\.convergenceApex/);
  assert.doesNotMatch(combat,/state\.data\.|save\(\)/);
});

test('post-CP3 V4: exploration gate is derived from ordinary stage clear records only',()=>{
  const core=read('js/patches/exploration1Core.js');
  const data=read('js/data/postCp3ConvergenceApex.js');
  assert.match(core,/convergenceApexUnlockStatus\(stageId=>this\.isStageCleared\(stageId\)\)/);
  assert.doesNotMatch(data,/state\.data\.[A-Za-z0-9_]+\s*=/);
  assert.doesNotMatch(core,/convergenceApex\s*:\s*\{/,'must not add a dedicated Apex save root');
});

test('post-CP3 V6: existing surfaces expose compact portrait-friendly Condition and Apex readability',()=>{
  const ui=read('js/patches/postCp3DeepSurveyUi.js');
  const combat=read('js/patches/postCp3ConvergenceApexCombat.js');
  assert.match(ui,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(ui,/APEX \/ 4-PHASE/);
  assert.match(ui,/MIXED CHASE：全3地域Option \/ 36%/);
  assert.match(ui,/FIRST CLEAR：境界反響核/);
  assert.match(ui,/aria-pressed/);
  assert.match(combat,/TextBattleScreen/);
  assert.match(combat,/収束観測 —/);
  assert.match(combat,/FINAL ·/);
  assert.doesNotMatch(ui,/homeScreen|home-menu|daily|weekly/i);
});
