import test from 'node:test';
import assert from 'node:assert/strict';
import { allJobs, fusionJobs, getJob, isUnlocked, unlockRequirementText } from '../js/data/jobsPhase8.js';

test('Phase 8 unified registry exposes all 105 fusion jobs',()=>{
  assert.equal(fusionJobs().length,105);
  assert.equal(allJobs().filter(j=>j.tier==='basic').length,15);
  assert.equal(new Set(allJobs().map(j=>j.id)).size,allJobs().length);
});

test('legacy advanced IDs survive unified registry',()=>{
  assert.equal(getJob('paladin').name,'パラディン');
  assert.equal(getJob('spellblade').name,'魔法剣士');
});

test('new fusion jobs unlock from exactly their two mastered parents',()=>{
  const id='fusion_warrior_merchant';
  assert.equal(isUnlocked(id,new Set(['warrior'])),false);
  assert.equal(isUnlocked(id,new Set(['warrior','merchant'])),true);
  assert.match(unlockRequirementText(id),/戦士/);
  assert.match(unlockRequirementText(id),/商人/);
});

test('new fusion runtime job carries metadata and advanced tier',()=>{
  const j=getJob('fusion_thief_scholar');
  assert.equal(j.tier,'advanced');
  assert.deepEqual(j.requires,['thief','scholar']);
  assert.ok(j.fusion.fusionTrait);
  assert.ok(j.fusion.constellation);
});
