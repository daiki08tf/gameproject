import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIQUE_TRIALS } from '../js/data/uniqueTrials.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';

test('every bounty unique has mastery trials and two branches',()=>{
  for(const unique of BOUNTY_UNIQUES.filter(u=>u.bountyId)){
    const def=UNIQUE_TRIALS[unique.id];
    assert.ok(def, `${unique.id} trial definition missing`);
    assert.ok(def.trials.length>=3, `${unique.id} should have at least 3 trials`);
    assert.equal(def.branches.length,2, `${unique.id} should have exactly two final branches`);
    for(const trial of def.trials){
      assert.ok(trial.event);
      assert.ok(trial.target>0);
      assert.ok(trial.label);
    }
  }
});

test('trial and branch ids are unique per item',()=>{
  for(const def of Object.values(UNIQUE_TRIALS)){
    const trialIds=def.trials.map(t=>t.id);
    const branchIds=def.branches.map(b=>b.id);
    assert.equal(new Set(trialIds).size,trialIds.length);
    assert.equal(new Set(branchIds).size,branchIds.length);
  }
});
