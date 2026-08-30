import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP4_PARALLAX_CONTACT,cp4ParallaxProgress,cp4ParallaxContactForStage } from '../js/data/contentPackIVB.js';

test('CP4-2 waits for the CP4-1 overlap coordinate and uses one deterministic revisit',()=>{
  const event=CP4_PARALLAX_CONTACT;
  assert.equal(event.prerequisiteDiscoveryId,'cp4:deepgreen:overlap-coordinate');
  assert.equal(event.investigationStageId,'2-5');
  assert.equal(event.discoveryId,'cp4:parallax:first-contact');
  assert.equal(cp4ParallaxProgress({discoveries:{}}).state,'locked');
  const discoveries={[event.prerequisiteDiscoveryId]:{}};
  assert.deepEqual(cp4ParallaxProgress({discoveries}),{state:'investigate',ready:true,complete:false,nextStageId:'2-5'});
  assert.equal(cp4ParallaxContactForStage('2-3',{discoveries}),null);
  assert.equal(cp4ParallaxContactForStage('2-5',{discoveries})?.id,event.id);
  discoveries[event.discoveryId]={};
  assert.equal(cp4ParallaxProgress({discoveries}).complete,true);
  assert.equal(cp4ParallaxContactForStage('2-5',{discoveries}),null);
});

test('CP4-2 presents the required temporary three-way perception and collapses to Prime',()=>{
  const event=CP4_PARALLAX_CONTACT;
  assert.equal(event.perceptions.length,3);
  const text=[event.intro,event.core.description,...event.perceptions,event.collapse].join('\n');
  assert.match(text,/音.*二重/);
  assert.match(text,/生きた根|根の回廊/);
  assert.match(text,/境界傷/);
  assert.match(text,/人影.*存在.*存在しない/);
  assert.match(text,/Prime.*収束/);
  assert.doesNotMatch(text,/王樹領|深緑消失域|Observed Branch|観測分岐世界|Transcendent|超観測者/i);
});

test('CP4-2 is perception/discovery only: no Branch Sight activation, combat reward or new progression gate',()=>{
  const data=fs.readFileSync(new URL('../js/data/contentPackIVB.js',import.meta.url),'utf8');
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVB.js',import.meta.url),'utf8');
  assert.match(runtime,/branchSightActive:false/);
  assert.doesNotMatch(data+runtime,/Math\.random|World Tier|worldTier|gearScore|difficulty|Hard Mode|Extreme|currency|token|Branch XP|stamina|daily|weekly|reward|gold|exp/i);
  assert.doesNotMatch(runtime,/new BattleEngine|goContentPackIV|contentPackIVScreen|multiverseProgress|branchSightSave/i);
});

test('CP4-2 reuses world2 discoveries, Rumor Notebook and TextBattleScreen and boots from CP4-A',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVB.js',import.meta.url),'utf8');
  const parent=fs.readFileSync(new URL('../js/patches/contentPackIVA.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.data\.world2/);
  assert.match(runtime,/state\.rumorNotebook/);
  assert.match(runtime,/TextBattleScreen\.prototype\.start/);
  assert.match(runtime,/contentPackIV:true/);
  assert.match(parent,/import '\.\/contentPackIVB\.js';/);
});

test('CP4-2 captures readiness before the previous start so CP4-1 cannot chain directly into first contact',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVB.js',import.meta.url),'utf8');
  const beforeIndex=runtime.indexOf('const before=cp4ParallaxProgress');
  const previousIndex=runtime.indexOf('previousStart.call');
  const recordIndex=runtime.indexOf('recordContact(stageId,wasReady)');
  assert.ok(beforeIndex>=0&&previousIndex>beforeIndex&&recordIndex>previousIndex);
});
