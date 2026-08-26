import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASE12_HORIZONTAL_PACK, phase12HorizontalDungeons, phase12RareSpawns } from '../js/data/phase12HorizontalPack.js';
import { SECRET_REALM_EXPANSION } from '../js/data/secretRealmExpansion.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { findStage } from '../js/data/stages.js';
import { getItem } from '../js/data/equipment.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';

test('Phase 12.3 ships five optional dungeons through existing Secret Realm routing',()=>{
  const dungeons=phase12HorizontalDungeons();
  assert.equal(dungeons.length,5);
  assert.deepEqual(dungeons.map(x=>x.site.realmName),['古王墓','幻獣の森','竜骸峡谷','反転図書館','黒月神殿']);
  for(const cfg of dungeons){
    assert.equal(SECRET_REALM_EXPANSION[cfg.site.id],cfg);
    const found=findStage(cfg.site.realm.id);
    assert.ok(found?.stage?.secretRealm);
    assert.equal(found.stage.phase12Horizontal,true);
    assert.equal(found.stage.secretRealmId,cfg.site.id);
    assert.ok(found.stage.recLevel>0&&found.stage.itemPowerTarget>0);
  }
});

test('Phase 12.4 gives every dungeon an authored ecology and distinct boss',()=>{
  const bossIds=[];
  for(const cfg of phase12HorizontalDungeons()){
    const defs=Object.entries(cfg.enemyArchetypes);
    assert.ok(defs.length>=4);
    assert.ok(defs.some(([,x])=>x.boss));
    assert.ok(defs.some(([,x])=>x.role==='rare'));
    const original=Math.random; Math.random=()=>.99;
    try{ buildSecretRealmStage(cfg.site.realm.id); }finally{ Math.random=original; }
    for(const [id] of defs)assert.ok(ENEMY_TYPES[id],`missing ${id}`);
    bossIds.push(defs.find(([,x])=>x.boss)[0]);
  }
  assert.equal(new Set(bossIds).size,5);
});

test('Phase 12.5 rare spawns are low-frequency and actually enter encounter waves',()=>{
  const rares=phase12RareSpawns();
  assert.equal(rares.length,5);
  for(const rare of rares)assert.ok(rare.chance>0&&rare.chance<=.06);
  for(const cfg of phase12HorizontalDungeons()){
    const original=Math.random; Math.random=()=>0;
    let stage;
    try{ stage=buildSecretRealmStage(cfg.site.realm.id); }finally{ Math.random=original; }
    assert.equal(stage.phase12RareSpawn,cfg.rareSpawn.label);
    assert.equal(stage.phase12RareSpawnId,cfg.rareSpawn.enemyId);
    assert.ok(stage.waves.some(w=>w.type===cfg.rareSpawn.enemyId&&w.phase12Rare));
  }
});

test('Phase 12.6 hidden drops are existing fixed-Unique rarity and only enter when rare spawn rolls',()=>{
  for(const cfg of phase12HorizontalDungeons()){
    const item=getItem(cfg.rareSpawn.dropId);
    assert.ok(item?.unique);
    assert.equal(item.rarity,'mythic');
    assert.equal(item.phase12,true);
    assert.equal(item.sourceStageId,cfg.site.realm.id);

    const original=Math.random; Math.random=()=>0;
    let hit;
    try{ hit=buildSecretRealmStage(cfg.site.realm.id); }finally{ Math.random=original; }
    assert.ok(hit.dropTable.some(x=>x.itemId===cfg.rareSpawn.dropId&&x.phase12UltraRare));

    Math.random=()=>.99;
    let miss;
    try{ miss=buildSecretRealmStage(cfg.site.realm.id); }finally{ Math.random=original; }
    assert.equal(miss.phase12RareSpawn,null);
    assert.equal(miss.dropTable.some(x=>x.itemId===cfg.rareSpawn.dropId),false);
  }
});

test('horizontal lore remains optional evidence rather than a main-story answer',()=>{
  for(const cfg of Object.values(PHASE12_HORIZONTAL_PACK)){
    assert.ok(cfg.trace&&cfg.trace.length<90);
    assert.equal(cfg.site.realm.id.startsWith('secret-'),true);
    assert.equal(cfg.site.fragmentsRequired,3);
    const text=[cfg.trace,...cfg.site.inspectText].join(' ');
    assert.doesNotMatch(text,/現代世界へ行く|現代世界が原因|最終回答/);
  }
});
