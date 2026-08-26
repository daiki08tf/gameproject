import test from 'node:test';
import assert from 'node:assert/strict';
import { SECRET_JOBS, getSecretJob } from '../js/data/secretJobs.js';

const PHASE1_NAMES=['魔剣士','暗黒騎士','死霊術師','魔物使い','処刑人'];
const phase1Jobs=SECRET_JOBS.filter(j=>PHASE1_NAMES.includes(j.name));

test('phase1 defines five hidden jobs with unique ids and discovery conditions',()=>{
  assert.equal(phase1Jobs.length,5);
  assert.equal(new Set(phase1Jobs.map(j=>j.id)).size,5);
  for(const j of phase1Jobs){
    assert.equal(j.secret,true);
    assert.ok(j.carrierJobId);
    assert.ok(j.masteryLv>=40);
    assert.ok(j.conditions.length>=3);
    assert.ok(j.hint.length>0);
    assert.equal(getSecretJob(j.id)?.name,j.name);
  }
});

test('secret jobs retain the planned Phase 1 archetypes',()=>{
  assert.deepEqual(phase1Jobs.map(j=>j.name),PHASE1_NAMES);
});

test('later endgame secret jobs may extend the registry without replacing Phase 1 ids',()=>{
  assert.ok(SECRET_JOBS.length>=phase1Jobs.length);
  assert.equal(new Set(SECRET_JOBS.map(j=>j.id)).size,SECRET_JOBS.length);
});
