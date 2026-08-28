import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { buildRiftStage } from '../js/data/riftStages.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { CONVERGENCE_APEX_ID } from '../js/data/postCp3ConvergenceApex.js';
import { ENVIRONMENT_VARIANTS } from '../js/data/enemyRankVariants2.js';
import { globalsForEndgameTags } from '../js/data/endgameEncounters2.js';

function total(stage){return (stage.waves||[]).reduce((n,w)=>n+(Number(w.count)||0),0);}
function bossTypes(stage){return (stage.waves||[]).filter(w=>ENEMY_TYPES[w.type]?.boss).map(w=>w.type);}

test('E9 Abyss adds a curated pool without changing depth identity, waves or reward contract',()=>{
  const stage=buildAbyssStage(321,[],{});
  assert.equal(stage.isAbyss,true);
  assert.equal(stage.abyssDepth,321);
  assert.equal(stage.encounterPool?.e9Curated,true);
  assert.equal(stage.encounterPool?.activity,'abyss');
  assert.equal(stage.encounterPool?.rareChance,0);
  assert.deepEqual(stage.encounterPool?.regionTags,['abyss']);
  assert.ok(stage.encounterPool.types.every(x=>!ENEMY_TYPES[x.type]?.boss));
  assert.ok(stage.encounterPool.types.some(x=>ENEMY_TYPES[x.type]?.e9Endgame));
  assert.ok(total(stage)>0);
  assert.ok(stage.rewards.gold>0&&stage.rewards.exp>0);
  assert.ok(Number.isFinite(stage.abyssShardMult));
});

test('E9 Abyss boss floors keep the authored boss wave outside the random pool',()=>{
  const stage=buildAbyssStage(100,[],{});
  assert.ok(stage.boss);
  const bosses=bossTypes(stage);
  assert.equal(bosses.length,1);
  assert.equal(stage.waves.at(-1).type,bosses[0]);
  assert.equal(stage.encounterPool.types.some(x=>x.type===bosses[0]),false);
});

test('Rift pools are element-curated and keep the key boss authored',()=>{
  const key={id:'e9_lightning',name:'E9雷鳴裂け目',element:'lightning',recLevel:9000,itemPowerTarget:3000,dangers:['haste'],reward:'treasure'};
  const stage=buildRiftStage(key);
  assert.equal(stage.isRift,true);
  assert.equal(stage.riftKey,key);
  assert.equal(stage.encounterPool?.activity,'rift');
  assert.deepEqual(stage.encounterPool?.regionTags,['lightning']);
  assert.equal(stage.encounterPool?.variantChance,.58);
  assert.ok(globalsForEndgameTags(['lightning'],'rift',3).includes('slime'));
  assert.ok(stage.encounterPool.types.some(x=>ENEMY_TYPES[x.type]?.e9Activity==='rift'));
  const boss=stage.waves.at(-1).type;
  assert.equal(ENEMY_TYPES[boss].boss,true);
  assert.equal(stage.encounterPool.types.some(x=>x.type===boss),false);
});

test('E9 includes explicit lightning and Abyss environmental variants',()=>{
  assert.equal(ENVIRONMENT_VARIANTS.lightning_arc.requiredTags[0],'lightning');
  assert.equal(ENVIRONMENT_VARIANTS.abyss_echo.requiredTags[0],'abyss');
});

test('Secret Realm uses a narrow curated pool and preserves its authored reward identity',()=>{
  const stage=buildSecretRealmStage('secret-blood-castle');
  assert.equal(stage.secretRealm,true);
  assert.equal(stage.secretRealmId,'blood_gate');
  assert.equal(stage.encounterPool?.activity,'secret');
  assert.equal(stage.encounterPool?.rareChance,0);
  const globals=stage.encounterPool.types.filter(x=>ENEMY_TYPES[x.type]?.e9Activity==='secret');
  assert.ok(globals.length<=2);
  assert.ok(stage.dropTable.some(x=>x.itemId==='set_blood_head'));
  assert.ok(stage.modifiers.some(x=>x.id==='realm_blood_thirst'));
});

test('Deep Survey curates ordinary threats but keeps Conditions and Apex wave authored',()=>{
  const stage=buildSecretRealmStage('secret-cp3-deep-ninth');
  assert.equal(stage.postCp3DeepSurvey,true);
  assert.equal(stage.encounterPool?.activity,'survey');
  assert.equal(stage.encounterPool?.rareChance,0);
  assert.ok(Array.isArray(stage.deepSurveyConditionIds));
  const apex=stage.waves.find(w=>w.deepSurveyApex);
  assert.ok(apex);
  assert.equal(ENEMY_TYPES[apex.type].boss,true);
  assert.equal(stage.encounterPool.types.some(x=>x.type===apex.type),false);
  assert.ok(stage.loot3Profile);
});

test('Convergence Apex remains a completely authored four-phase boss encounter',()=>{
  const stage=buildSecretRealmStage(CONVERGENCE_APEX_ID);
  assert.equal(stage.convergenceApex,true);
  assert.equal(stage.waves.length,4);
  assert.ok(stage.waves.every(w=>ENEMY_TYPES[w.type]?.boss));
  assert.equal(stage.encounterPool,undefined);
  assert.equal(stage.convergenceApexPhases.length,4);
});
