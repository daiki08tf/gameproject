import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { AFFIXES } from '../js/data/affixes.js';
import { CP3_DEEP_SURVEYS, buildDeepSurveyStage, deepSurveyUnlocked } from '../js/data/postCp3DeepSurvey.js';
import { EXPLORATION_SITES } from '../js/data/exploration1.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

const EXPECTED_OPTIONS={
  cp3_deep_ash:['def_pct','hp_pct','heal_on_guard','lifesteal'],
  cp3_deep_ninth:['spd_pct','crit_pct','atk_speed_pct','crit_damage_pct'],
  cp3_deep_root:['mag_pct','mp_pct','cdr_pct','mp_on_crit'],
};

test('post-Gear: Deep Survey keeps exactly three CP3-authored regions',()=>{
  assert.equal(CP3_DEEP_SURVEYS.length,3);
  assert.deepEqual(CP3_DEEP_SURVEYS.map(x=>x.id),['cp3_deep_ash','cp3_deep_ninth','cp3_deep_root']);
  assert.ok(CP3_DEEP_SURVEYS.every(x=>x.realmId.startsWith('secret-cp3-deep-')));
});

test('post-Gear: Deep Survey unlocks from existing CP3 discoveries only',()=>{
  for(const def of CP3_DEEP_SURVEYS){
    assert.equal(deepSurveyUnlocked(def,{}),false);
    const discoveries=Object.fromEntries(def.unlockDiscoveries.map(id=>[id,{cleared:true}]));
    assert.equal(deepSurveyUnlocked(def,discoveries),true);
  }
});

test('post-Gear: canonical Exploration registry stays unchanged and runtime composes Deep Survey',()=>{
  assert.equal(EXPLORATION_SITES.some(site=>site.postCp3DeepSurvey),false);
  const runtime=read('js/patches/exploration1Core.js');
  assert.match(runtime,/ALL_EXPLORATION_SITES/);
  assert.match(runtime,/deepSurveyUnlocked/);
  assert.match(runtime,/world2\?\.discoveries/);
});

test('post-Gear: each stage is Lv99,999/IP10,000 Secret Realm mixed chase with apex',()=>{
  for(const def of CP3_DEEP_SURVEYS){
    const stage=buildDeepSurveyStage(def.realmId);
    assert.equal(stage.recLevel,99999);
    assert.equal(stage.itemPowerTarget,10000);
    assert.equal(stage.isAbyss,false);
    assert.equal(stage.secretRealm,true);
    assert.equal(stage.postCp3DeepSurvey,true);
    assert.equal(stage.deepSurveyMixedChase,true);
    assert.ok(stage.dropTable.length>1,'Deep Survey must reuse a populated mixed loot table');
    assert.equal(stage.waves.at(-1).deepSurveyApex,true);
    assert.ok(stage.modifiers.some(m=>m.id===`deep_${def.id}`));
  }
});

test('post-Gear: challenge pressure is authored per region and remains live Abyss challenge data',()=>{
  const ash=buildDeepSurveyStage('secret-cp3-deep-ash');
  const ninth=buildDeepSurveyStage('secret-cp3-deep-ninth');
  const root=buildDeepSurveyStage('secret-cp3-deep-root');
  assert.deepEqual(ash.abyssChallenges.map(x=>x.id),['vitality','drought']);
  assert.deepEqual(ninth.abyssChallenges.map(x=>x.id),['onslaught','elite_horde']);
  assert.deepEqual(root.abyssChallenges.map(x=>x.id),['vitality','drought','boss_technique']);
  assert.ok(ash.enemyHpMult>=1.30&&ash.healMult<=0.50);
  assert.ok(ninth.enemyAtkMult>=1.40);
  assert.ok(root.enemyHpMult>=1.30&&root.healMult<=0.50);
});

test('post-Gear: Deep Survey regional Option biases use real live Option families and stay bounded',()=>{
  for(const def of CP3_DEEP_SURVEYS){
    assert.deepEqual(def.preferredAffixIds,EXPECTED_OPTIONS[def.id]);
    for(const id of def.preferredAffixIds) assert.ok(AFFIXES[id],`missing live Option/Affix ${id}`);
    assert.ok(def.targetAffixChance>0&&def.targetAffixChance<=0.35);
    assert.ok(def.legendaryChanceAdd>=0&&def.legendaryChanceAdd<=0.04);
    const stage=buildDeepSurveyStage(def.realmId);
    assert.deepEqual(stage.loot3Profile.preferredAffixIds,EXPECTED_OPTIONS[def.id]);
    assert.equal(stage.loot3Profile.targetAffixChance,def.targetAffixChance);
  }
});

test('post-Gear: Secret Realm routing preserves Gear 9 wrapper and anti-parallel-system guardrails',()=>{
  for(const def of CP3_DEEP_SURVEYS){
    const stage=buildSecretRealmStage(def.realmId);
    assert.equal(stage?.deepSurveyId,def.id);
    assert.equal(stage?.secretRealm,true);
  }
  const data=read('js/data/postCp3DeepSurvey.js');
  const core=read('js/patches/exploration1Core.js');
  const ui=read('js/patches/postCp3DeepSurveyUi.js');
  const realms=read('js/data/secretRealms.js');
  assert.doesNotMatch(data,/state\.data\.[A-Za-z0-9_]+\s*=/,'data module must not create a save root');
  assert.doesNotMatch(ui,/home-menu|homeScreen|createElement\(['"]section['"]\)/,'UI must stay inside existing stage surfaces');
  assert.match(realms,/applyUnique2TargetFarm\(stage\)/,'Gear 9 Secret Realm wrapper must remain authoritative');
  assert.match(core,/state\.data\.exploration/,'existing exploration root is reused');
});
