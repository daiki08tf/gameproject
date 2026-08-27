import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP3_RUMORS,CP3_HIDDEN_ENCOUNTERS,CP3_HIDDEN_ROUTES,cp3RumorState,cp3EncounterChance } from '../js/data/contentPackIIIA.js';

test('Content Pack III A adds three post-Ch30 observation reflux clusters',()=>{
  assert.equal(CP3_RUMORS.length,6);
  assert.equal(Object.keys(CP3_HIDDEN_ENCOUNTERS).length,3);
  assert.equal(Object.keys(CP3_HIDDEN_ROUTES).length,3);
  assert.deepEqual(Object.keys(CP3_HIDDEN_ENCOUNTERS),['21-8','23-8','24-8']);
});

test('CP3 rumors do not activate before Story Expansion I is complete',()=>{
  const rumor=CP3_RUMORS[0];
  assert.equal(cp3RumorState({rumor,storyComplete:false,isStageCleared:()=>true}),'unresolved');
  assert.equal(cp3RumorState({rumor,storyComplete:true,isStageCleared:()=>true}),'tracking');
  assert.equal(cp3RumorState({rumor,storyComplete:true,isStageCleared:()=>true,discoveries:{[`cp3:encounter:${rumor.id}`]:{}}}),'resolved');
});

test('hidden encounters only roll while a rumor is actively tracked',()=>{
  assert.equal(cp3EncounterChance({baseChance:.02,rumorState:'unresolved'}),0);
  assert.equal(cp3EncounterChance({baseChance:.02,rumorState:'resolved'}),0);
  assert.ok(cp3EncounterChance({baseChance:.02,rumorState:'tracking'})>0);
  assert.ok(cp3EncounterChance({baseChance:.02,rumorState:'tracking',codexKnown:true})>.02);
});

test('CP3 A reuses existing world discoveries and battle/Codex surfaces',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIIIA.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.data\.world2/);
  assert.match(runtime,/TextBattleScreen\.prototype\.start/);
  assert.match(runtime,/rumorNotebook/);
  assert.doesNotMatch(runtime,/state\.data\.contentPackIII\s*=/);
  assert.doesNotMatch(runtime,/goContentPackIII|contentPackIIIScreen|currency|token|daily|weekly/i);
});

test('CP3 hidden encounters preserve mobile battle density by adding one follow-up encounter',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIIIA.js',import.meta.url),'utf8');
  assert.match(runtime,/encounterQueue\.unshift\(\{type:def\.enemyId,count:1\}\)/);
  assert.match(runtime,/totalToDefeat\+=1/);
  assert.doesNotMatch(runtime,/aliveEnemies\.push|waves\.push/);
});

test('CP3 A keeps Modern World identification restrained',()=>{
  const text=JSON.stringify({CP3_RUMORS,CP3_HIDDEN_ROUTES});
  assert.doesNotMatch(text,/東京|日本|Tokyo|Japan/i);
  assert.match(text,/生活|電子音|外部|観測/);
});
