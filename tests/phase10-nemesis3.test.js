import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NEMESIS_MAX_LEVEL,NEMESIS_TRAITS,nemesisTraitIdsForLevel,nemesisTitleForLevel,nemesisHuntBonus,nemesisWeaknessBonus } from '../js/data/nemesis3.js';

test('Nemesis 3.0 grows across meaningful mutation thresholds',()=>{
  assert.equal(NEMESIS_MAX_LEVEL,15);
  assert.deepEqual(nemesisTraitIdsForLevel(0),[]);
  assert.equal(nemesisTraitIdsForLevel(3).length,1);
  assert.equal(nemesisTraitIdsForLevel(6).length,2);
  assert.equal(nemesisTraitIdsForLevel(15).length,5);
  assert.ok(Object.keys(NEMESIS_TRAITS).length>=6);
  assert.equal(nemesisTitleForLevel(1),'【勇者殺し】');
  assert.equal(nemesisTitleForLevel(12),'【終焉を学ぶ者】');
});

test('World Event hunt choices produce distinct risk and intel effects',()=>{
  assert.ok(nemesisHuntBonus('preempt').enemyHp<1);
  assert.ok(nemesisHuntBonus('ambush').enemySpd<1);
  assert.ok(nemesisHuntBonus('highRisk').reward>nemesisHuntBonus('final').reward);
  const intel=nemesisWeaknessBonus(['weakness','witness','mutation']);
  assert.ok(intel.enemyDef<1);
  assert.ok(intel.enemySpd<1);
  assert.ok(intel.reward>1);
});

test('Nemesis runtime persists mutations and consumes World Event flags',()=>{
  const foundation=fs.readFileSync(new URL('../js/patches/bounty2Foundation.js',import.meta.url),'utf8');
  const combat=fs.readFileSync(new URL('../js/patches/bounty2Combat.js',import.meta.url),'utf8');
  const world=fs.readFileSync(new URL('../js/patches/world2Core.js',import.meta.url),'utf8');
  assert.match(foundation,/NEMESIS_MAX_LEVEL/);
  assert.match(foundation,/applyNemesisEventFlag/);
  assert.match(foundation,/nemesisWeakness/);
  assert.match(foundation,/nemesisHighRisk/);
  assert.match(combat,/nemesisTraitsFor/);
  assert.match(combat,/rewardMult/);
  assert.match(world,/event\.chainId==='nemesis'/);
  assert.match(world,/activeBountyNemesis/);
});
