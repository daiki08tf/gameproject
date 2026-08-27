import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP3_DEEP_SURVEYS, buildDeepSurveyStage } from '../js/data/postCp3DeepSurvey.js';
import { explorationProgressFor } from '../js/data/exploration1.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('post-CP3: Deep Survey adds exactly three authored high-difficulty regions',()=>{
  assert.equal(CP3_DEEP_SURVEYS.length,3);
  assert.deepEqual(CP3_DEEP_SURVEYS.map(x=>x.id),['cp3_deep_ash','cp3_deep_ninth','cp3_deep_root']);
  assert.ok(CP3_DEEP_SURVEYS.every(x=>x.unlockDiscoveries.length>=1));
  assert.ok(CP3_DEEP_SURVEYS.every(x=>x.realmId.startsWith('secret-cp3-deep-')));
});

test('post-CP3: Deep Survey is gated by existing CP3 discoveries, not Abyss depth',()=>{
  const def=CP3_DEEP_SURVEYS[0];
  const site={...def,discoverDepth:0,clueDepth:0,fragmentSources:[],fragmentsRequired:0,finalGoal:false};
  const hidden=explorationProgressFor(site,99999,{}, {discoveries:{}});
  assert.equal(hidden.state,'hidden');
  const discoveries=Object.fromEntries(def.unlockDiscoveries.map(id=>[id,{cleared:true}]));
  const open=explorationProgressFor(site,0,{}, {discoveries});
  assert.equal(open.unlocked,true);
});

test('post-CP3: all Deep Survey stages are Lv99,999/IP10,000 gauntlets with an apex',()=>{
  for(const def of CP3_DEEP_SURVEYS){
    const stage=buildDeepSurveyStage(def.realmId);
    assert.equal(stage.recLevel,99999);
    assert.equal(stage.itemPowerTarget,10000);
    assert.equal(stage.isAbyss,false);
    assert.equal(stage.secretRealm,true);
    assert.equal(stage.postCp3DeepSurvey,true);
    assert.ok(stage.waves.length>=2);
    assert.equal(stage.waves.at(-1).deepSurveyApex,true);
    assert.ok(stage.modifiers.some(m=>m.id===`deep_${def.id}`));
  }
});

test('post-CP3: each region has materially different live challenge pressure',()=>{
  const ash=buildDeepSurveyStage('secret-cp3-deep-ash');
  const ninth=buildDeepSurveyStage('secret-cp3-deep-ninth');
  const root=buildDeepSurveyStage('secret-cp3-deep-root');
  assert.ok(ash.enemyHpMult>=1.30,'ash should carry vitality pressure');
  assert.ok(ash.healMult<=0.50,'ash should carry drought pressure');
  assert.ok(ninth.enemyAtkMult>=1.40,'ninth should carry onslaught pressure');
  assert.ok(ninth.abyssChallengeRewards.eliteBonus>=2,'ninth should carry elite pressure');
  assert.ok(root.enemyHpMult>=1.30&&root.healMult<=0.50,'root should demand long-fight resource control');
  assert.ok(root.abyssChallengeRewards.bossTechniqueBonus>=1,'root apex should carry boss-technique pressure');
});

test('post-CP3: Deep Survey reuses Secret Realm routing and does not create a parallel mode',()=>{
  for(const def of CP3_DEEP_SURVEYS){
    const stage=buildSecretRealmStage(def.realmId);
    assert.equal(stage?.deepSurveyId,def.id);
  }
  const data=read('js/data/postCp3DeepSurvey.js');
  const ui=read('js/patches/postCp3DeepSurveyUi.js');
  assert.doesNotMatch(data,/state\.data/);
  assert.doesNotMatch(ui,/home-menu|createElement\(['"]section['"]\)/);
  assert.doesNotMatch(data,/currency|daily|weekly/i);
});
