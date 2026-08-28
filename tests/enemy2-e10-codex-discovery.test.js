import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ENEMY2_ECOLOGY_KEY,
  enemy2EcologyIdentity,
  recordEnemy2Discovery,
  enemy2EcologyEntries,
  isEnemy2GeneratedMaterializationId,
} from '../js/data/enemyCodex2Discovery.js';

async function src(p){return readFile(new URL(`../${p}`,import.meta.url),'utf8');}

test('E10 folds generated global materializations into one species ecology entry',()=>{
  const entries={};
  const story={type:'e8_ch5_global_slime',name:'灰熱のスライム',speciesId:'slime',globalSpecies:true,variantId:'fire_ash',variantName:'灰熱の',level:520};
  const rift={type:'e9_rift_key_slime',name:'雷光のスライム',speciesId:'slime',globalSpecies:true,variantId:'lightning_arc',variantName:'雷光の',level:1800};
  recordEnemy2Discovery(entries,story,{id:'5-3',encounterPool:{regionTags:['fire']}});
  recordEnemy2Discovery(entries,rift,{id:'rift-key',isRift:true,encounterPool:{regionTags:['lightning']}},{kill:true});
  const rows=enemy2EcologyEntries(entries);
  assert.equal(rows.length,1);
  assert.equal(rows[0].key,'global:slime');
  assert.equal(rows[0].name,'スライム');
  assert.deepEqual(rows[0].activities,['story','rift']);
  assert.deepEqual(rows[0].variants,['fire_ash','lightning_arc']);
  assert.equal(rows[0].maxLevel,1800);
  assert.equal(rows[0].kills,1);
  assert.deepEqual(rows[0].regionTags,['fire','lightning']);
});

test('E10 records Rare, generic Elite and historical Abyss Elite as distinct sightings',()=>{
  const entries={};
  recordEnemy2Discovery(entries,{type:'ch5_rare',name:'金炎スライム',rareIdentity:true,rank:'rare',level:700},{id:'5-5'});
  recordEnemy2Discovery(entries,{type:'ch5_attacker',name:'灼牙サラマンダー',genericElite:true,rank:'elite',level:760},{id:'5-5'});
  recordEnemy2Discovery(entries,{type:'abyss_900_normal',name:'深淵の徘徊者',elite:true,rank:'elite',level:9000},{id:'abyss-900',isAbyss:true});
  const ecology=entries[ENEMY2_ECOLOGY_KEY];
  assert.deepEqual(ecology['type:ch5_rare'].ranks,['rare']);
  assert.deepEqual(ecology['type:ch5_attacker'].ranks,['elite']);
  assert.deepEqual(ecology['type:abyss_900_normal'].ranks,['abyssElite']);
  assert.deepEqual(ecology['type:abyss_900_normal'].activities,['abyss']);
});

test('E10 keeps bosses out of ecology aggregation and recognizes generated E8/E9 ids',()=>{
  assert.equal(enemy2EcologyIdentity({type:'boss',name:'Boss',boss:true}),null);
  assert.equal(isEnemy2GeneratedMaterializationId('e8_ch30_global_slime'),true);
  assert.equal(isEnemy2GeneratedMaterializationId('e9_abyss_900_slime'),true);
  assert.equal(isEnemy2GeneratedMaterializationId('ch30_attacker'),false);
});

test('Codex foundation tracks ecology without creating a new save root',async()=>{
  const s=await src('js/patches/codexFoundation.js');
  assert.match(s,/recordEnemy2Discovery\(entries,enemy,stage/);
  assert.match(s,/isEnemy2GeneratedMaterializationId/);
  assert.match(s,/enemy\?\.rank==='rare'\|\|enemy\?\.rareIdentity/);
  assert.doesNotMatch(s,/state\.data\.enemy2/);
});

test('Codex UI exposes activity, Variant, Rank and max-level ecology discovery',async()=>{
  const s=await src('js/patches/codexUi.js');
  assert.match(s,/Enemy 2\.0 生態記録/);
  assert.match(s,/活動：/);
  assert.match(s,/Variant：/);
  assert.match(s,/Rank：/);
  assert.match(s,/最高遭遇Lv/);
  assert.match(s,/isEnemy2GeneratedMaterializationId/);
});
