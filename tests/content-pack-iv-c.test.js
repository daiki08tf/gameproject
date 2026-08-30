import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP4_BRANCH_SIGHT_AWAKENING,cp4BranchSightProgress,cp4BranchSightActivationForStage } from '../js/data/contentPackIVC.js';

test('CP4-3 waits for Parallax first contact and activates deterministically on the authored revisit',()=>{
  const event=CP4_BRANCH_SIGHT_AWAKENING;
  assert.equal(event.prerequisiteDiscoveryId,'cp4:parallax:first-contact');
  assert.equal(event.activationStageId,'2-5');
  assert.equal(event.discoveryId,'cp4:branch-sight:active');
  assert.equal(cp4BranchSightProgress({discoveries:{}}).state,'locked');
  const discoveries={[event.prerequisiteDiscoveryId]:{}};
  assert.deepEqual(cp4BranchSightProgress({discoveries}),{state:'stabilize',ready:true,active:false,nextStageId:'2-5'});
  assert.equal(cp4BranchSightActivationForStage('2-3',{discoveries}),null);
  assert.equal(cp4BranchSightActivationForStage('2-5',{discoveries})?.id,event.id);
  discoveries[event.discoveryId]={};
  assert.equal(cp4BranchSightProgress({discoveries}).active,true);
  assert.equal(cp4BranchSightActivationForStage('2-5',{discoveries}),null);
});

test('CP4-3 explicitly reinterprets the overlap as separate consistent histories',()=>{
  const event=CP4_BRANCH_SIGHT_AWAKENING;
  const text=[event.intro,...event.lines,event.activation,event.next].join('\n');
  assert.match(text,/別々の響き|別の履歴/);
  assert.match(text,/同時に見える/);
  assert.match(text,/見分け/);
  assert.match(text,/分岐視|歴史的重なり/);
  assert.doesNotMatch(text,/王樹領|深緑消失域|Transcendent|超観測者|日本|東京|Earth/i);
});

test('CP4-3 Branch Sight is authored perception state, never a stat, equipment or battle bonus',()=>{
  const data=fs.readFileSync(new URL('../js/data/contentPackIVC.js',import.meta.url),'utf8');
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVC.js',import.meta.url),'utf8');
  assert.match(runtime,/numeric:false/);
  assert.match(runtime,/trainable:false/);
  assert.match(runtime,/equippable:false/);
  assert.match(runtime,/battleBonus:false/);
  assert.match(runtime,/revealsAllBranches:false/);
  assert.doesNotMatch(data+runtime,/Math\.random|World Tier|worldTier|gearScore|difficulty|currency|token|Branch XP|stamina|daily|weekly|\b(?:reward|gold|exp|damage|attack|defense)\b/i);
});

test('CP4-3 reuses world2 discoveries, Rumor Notebook and TextBattleScreen with no new save root or Home entry',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVC.js',import.meta.url),'utf8');
  const parent=fs.readFileSync(new URL('../js/patches/contentPackIVB.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.data\.world2/);
  assert.match(runtime,/state\.rumorNotebook/);
  assert.match(runtime,/TextBattleScreen\.prototype\.start/);
  assert.equal(CP4_BRANCH_SIGHT_AWAKENING.discoveryId,'cp4:branch-sight:active');
  assert.match(parent,/import '\.\/contentPackIVC\.js';/);
  assert.doesNotMatch(runtime,/branchSightSave|multiverseProgress|goContentPackIV|contentPackIVScreen/i);
});

test('CP4-3 does not chain directly into CP4-2 first contact in the same start',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVC.js',import.meta.url),'utf8');
  const beforeIndex=runtime.indexOf('const before=cp4BranchSightProgress');
  const previousIndex=runtime.indexOf('previousStart.call');
  const recordIndex=runtime.lastIndexOf('recordAwakening(stageId,wasReady)');
  assert.ok(beforeIndex>=0&&previousIndex>beforeIndex&&recordIndex>previousIndex);
});
