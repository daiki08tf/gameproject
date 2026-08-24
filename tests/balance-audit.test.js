import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { INHERITANCE_MIN_LEVEL, INHERITANCE_RATE_CAP_PCT, inheritanceRatePct, inheritanceBonusPointGain } from '../js/data/inheritance.js';
import { abyssRecommendedLevel, abyssTargetItemPower } from '../js/data/abyssEndgame.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { generateRiftKey } from '../js/data/riftKeys.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';

test('inheritance is a post-2000 system with bounded carry rate',()=>{
  assert.equal(INHERITANCE_MIN_LEVEL,2000);
  assert.equal(inheritanceBonusPointGain(1999,99),0);
  assert.equal(inheritanceRatePct(2000,0),10);
  assert.ok(inheritanceRatePct(10000,0)>10&&inheritanceRatePct(10000,0)<20);
  assert.ok(inheritanceRatePct(99999,999)<=INHERITANCE_RATE_CAP_PCT);
  assert.ok(inheritanceBonusPointGain(99999,0)<500);
});

test('Rift keys stay economically ahead of their source floor',()=>{
  for(const depth of [100,500,1000,2000,3000]){
    const k=generateRiftKey(depth,`audit-${depth}`);
    assert.ok(k.recLevel>=abyssRecommendedLevel(depth));
    assert.ok(k.itemPowerTarget>=abyssTargetItemPower(depth));
    assert.ok(k.recLevel<=99999);
    assert.ok(k.itemPowerTarget<=10000);
  }
});

test('Blood Castle recommendation matches its source and exposes only its own rules',()=>{
  const realm=buildSecretRealmStage('secret-blood-castle');
  assert.equal(realm.recLevel,abyssRecommendedLevel(800));
  assert.ok(realm.itemPowerTarget>abyssTargetItemPower(800));
  assert.equal(realm.dropMult,1.35);
  assert.equal(realm.healMult,0.5);
  assert.equal(realm.modifiers.length,1);
});

test('Abyss template can suppress floor modifiers for fixed Secret Realms',()=>{
  const normal=buildAbyssStage(800);
  const clean=buildAbyssStage(800,[],{suppressModifiers:true});
  assert.ok(normal.modifiers.length>0);
  assert.equal(clean.modifiers.length,0);
  assert.equal(clean.dropMult,1);
  assert.equal(clean.healMult,1);
});

test('endgame drop patch carries target IP and pact shard multiplier',()=>{
  const src=fs.readFileSync(new URL('../js/patches/endgameDropContextFix.js',import.meta.url),'utf8');
  assert.match(src,/itemPowerTarget/);
  assert.match(src,/abyssShardMult/);
  assert.match(src,/secretRealm/);
  assert.match(src,/isRift/);
});

test('companion cap follows Character level cap',()=>{
  const src=fs.readFileSync(new URL('../js/patches/companionLevelCap.js',import.meta.url),'utf8');
  assert.match(src,/CHARACTER_LEVEL_MAX/);
  assert.match(src,/cappedGainCompanionExp/);
});
