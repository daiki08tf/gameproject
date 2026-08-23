import test from 'node:test';
import assert from 'node:assert/strict';
import { SECRET_JOBS, getSecretJob } from '../js/data/secretJobs.js';

test('phase1 defines five hidden jobs with unique ids and discovery conditions',()=>{
  assert.equal(SECRET_JOBS.length,5);
  assert.equal(new Set(SECRET_JOBS.map(j=>j.id)).size,5);
  for(const j of SECRET_JOBS){
    assert.equal(j.secret,true);
    assert.ok(j.carrierJobId);
    assert.ok(j.masteryLv>=40);
    assert.ok(j.conditions.length>=3);
    assert.ok(j.hint.length>0);
    assert.equal(getSecretJob(j.id)?.name,j.name);
  }
});

test('secret jobs include the planned archetypes',()=>{
  assert.deepEqual(SECRET_JOBS.map(j=>j.name),['魔剣士','暗黒騎士','死霊術師','魔物使い','処刑人']);
});
