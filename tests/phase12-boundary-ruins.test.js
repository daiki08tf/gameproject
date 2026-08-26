import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PHASE12_BOUNDARY_RUINS, phase12BoundaryRuins } from '../js/data/phase12BoundaryRuins.js';
import { expandedExplorationSites } from '../js/data/secretRealmExpansion.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { abyssRecommendedLevel, abyssTargetItemPower } from '../js/data/abyssEndgame.js';

test('Phase 12.1 ships four unique Boundary Ruins through existing exploration',()=>{
  const ruins=phase12BoundaryRuins();
  assert.equal(ruins.length,4);
  assert.equal(new Set(ruins.map(x=>x.site.id)).size,4);
  assert.equal(new Set(ruins.map(x=>x.site.realm.id)).size,4);
  const allSites=expandedExplorationSites();
  for(const cfg of ruins)assert.ok(allSites.some(site=>site.id===cfg.site.id),`missing exploration site ${cfg.site.id}`);
});

test('Boundary Ruins keep the existing three-fragment discovery model',()=>{
  for(const cfg of phase12BoundaryRuins()){
    const site=cfg.site;
    assert.equal(site.fragmentsRequired,3);
    assert.equal(site.fragmentSources.length,3);
    assert.ok(site.discoverDepth<site.clueDepth);
    assert.ok(site.clueDepth<site.fragmentSources.at(-1));
    assert.equal('currency' in site,false);
  }
});

test('Boundary Ruin recommendations use the canonical Abyss Lv99,999 curve',()=>{
  const ruins=phase12BoundaryRuins();
  let lastLevel=0,lastIp=0;
  for(const cfg of ruins){
    assert.equal(cfg.site.realm.recLevel,abyssRecommendedLevel(cfg.baseDepth));
    assert.equal(cfg.site.realm.itemPowerTarget,abyssTargetItemPower(cfg.baseDepth));
    assert.ok(cfg.site.realm.recLevel>lastLevel);
    assert.ok(cfg.site.realm.itemPowerTarget>lastIp);
    assert.ok(cfg.site.realm.recLevel<=99999);
    assert.ok(cfg.site.realm.itemPowerTarget<=10000);
    lastLevel=cfg.site.realm.recLevel;lastIp=cfg.site.realm.itemPowerTarget;
  }
});

test('each Boundary Ruin resolves through findStage with dedicated enemies and a boss',()=>{
  for(const cfg of phase12BoundaryRuins()){
    const direct=buildSecretRealmStage(cfg.site.realm.id);
    const found=findStage(cfg.site.realm.id);
    assert.ok(direct&&found,`unresolved realm ${cfg.site.realm.id}`);
    assert.equal(found.chapter,null);
    assert.equal(found.stage.id,cfg.site.realm.id);
    assert.equal(direct.phase12BoundaryRuin,true);
    assert.equal(direct.secretRealm,true);
    assert.ok(direct.waves.length>=3);
    const enemyIds=direct.waves.map(w=>w.type);
    assert.ok(enemyIds.every(id=>id.startsWith('phase12_')));
    assert.ok(enemyIds.every(id=>ENEMY_TYPES[id]),`missing enemy in ${cfg.site.realm.id}`);
    assert.ok(enemyIds.some(id=>ENEMY_TYPES[id].boss),`missing boss in ${cfg.site.realm.id}`);
  }
});

test('Boundary Ruins reuse valid existing equipment drops',()=>{
  for(const cfg of phase12BoundaryRuins()){
    const stage=buildSecretRealmStage(cfg.site.realm.id);
    assert.ok(stage.dropTable.length>0);
    for(const drop of stage.dropTable)assert.ok(getItem(drop.itemId),`missing drop ${drop.itemId} in ${stage.id}`);
  }
});

test('rebuilding a Boundary Ruin never compounds dedicated enemy stats',()=>{
  const cfg=PHASE12_BOUNDARY_RUINS.echo_observatory;
  buildSecretRealmStage(cfg.site.realm.id);
  const before=JSON.stringify(Object.fromEntries(Object.keys(cfg.enemyArchetypes).map(id=>[id,ENEMY_TYPES[id]])));
  buildSecretRealmStage(cfg.site.realm.id);
  const after=JSON.stringify(Object.fromEntries(Object.keys(cfg.enemyArchetypes).map(id=>[id,ENEMY_TYPES[id]])));
  assert.equal(after,before);
});

test('Phase 12.1 adds content inside existing UI instead of another Home button',()=>{
  const home=fs.readFileSync(new URL('../js/screens/home.js',import.meta.url),'utf8');
  const abyss=fs.readFileSync(new URL('../js/screens/abyss.js',import.meta.url),'utf8');
  assert.doesNotMatch(home,/Boundary Ruins|境界遺構|zero-station|echo-observatory/);
  assert.match(abyss,/explorationSites|renderExploration/);
});
