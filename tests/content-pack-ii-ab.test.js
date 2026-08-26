import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP2_RUMORS,CP2_HIDDEN_ENCOUNTERS,CP2_HIDDEN_ROUTES,cp2RumorState,cp2EncounterChance } from '../js/data/contentPackIIAB.js';

test('CP2-A adds ten diegetic rumors across all five horizontal sites',()=>{
  assert.equal(CP2_RUMORS.length,10);
  const sites=new Set(CP2_RUMORS.map(r=>r.siteId));
  assert.deepEqual([...sites].sort(),['black_moon_temple','dragonbone_canyon','inverted_library','old_king_tomb','phantom_beast_forest']);
  for(const r of CP2_RUMORS){assert.ok(r.text.length>20);assert.ok(r.tracking.length>20);assert.doesNotMatch(r.text+r.tracking,/%|0\.\d|東京|日本|Tokyo|Japan/);}
});

test('CP2-A hidden encounters are rumor gated and remain very rare',()=>{
  assert.equal(Object.keys(CP2_HIDDEN_ENCOUNTERS).length,5);
  for(const e of Object.values(CP2_HIDDEN_ENCOUNTERS))assert.ok(e.chance>0&&e.chance<=.03);
  assert.equal(cp2EncounterChance({baseChance:.02,rumorState:'unresolved',mastered:true,codexKnown:true}),0);
  const tracked=cp2EncounterChance({baseChance:.02,rumorState:'tracking'});
  const informed=cp2EncounterChance({baseChance:.02,rumorState:'tracking',mastered:true,codexKnown:true});
  assert.ok(informed>tracked);assert.ok(informed<=.05);
});

test('CP2 rumor progression reuses trace and encounter discoveries',()=>{
  const rumor=CP2_RUMORS[0];
  assert.equal(cp2RumorState({rumor,discoveries:{},isStageCleared:()=>false}),'unresolved');
  assert.equal(cp2RumorState({rumor,discoveries:{[`trace:${rumor.siteId}`]:{}},isStageCleared:()=>false}),'tracking');
  assert.equal(cp2RumorState({rumor,discoveries:{[`cp2:encounter:${rumor.id}`]:{}},isStageCleared:()=>false}),'resolved');
});

test('CP2-B adds five textual hidden routes without a new currency or screen',()=>{
  assert.equal(Object.keys(CP2_HIDDEN_ROUTES).length,5);
  for(const route of Object.values(CP2_HIDDEN_ROUTES)){assert.ok(route.clue.length>20);assert.ok(route.rewardHint.length>5);assert.equal('currency' in route,false);}
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIIAB.js',import.meta.url),'utf8');
  const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  assert.match(runtime,/world2\.discoveries/);
  assert.match(runtime,/encounterQueue\.unshift/);
  assert.match(runtime,/totalToDefeat\+=1/);
  assert.match(runtime,/HIDDEN ENCOUNTER/);
  assert.match(home,/contentPackIIAB\.js/);
  assert.doesNotMatch(runtime,/daily|weekly|new Currency|treasure.*currency/i);
  assert.doesNotMatch(home,/goCP2|goRumor|goTreasure/);
});

test('CP2 hidden ecology cannot enlarge the initial enemy pile',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIIAB.js',import.meta.url),'utf8');
  assert.match(runtime,/initial encounter is already visible/i);
  assert.match(runtime,/encounterQueue\.unshift\(\{type:def\.enemyId,count:1\}\)/);
  assert.doesNotMatch(runtime,/aliveEnemies\.push|enemies\.push/);
});
