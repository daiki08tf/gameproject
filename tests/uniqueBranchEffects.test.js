import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIQUE_BRANCH_EFFECTS, uniqueBranchEffect } from '../js/data/uniqueBranchEffects.js';
import { UNIQUE_TRIALS } from '../js/data/uniqueTrials.js';

test('every unique trial branch has a combat effect definition', () => {
  for (const [itemId, trial] of Object.entries(UNIQUE_TRIALS)) {
    assert.ok(UNIQUE_BRANCH_EFFECTS[itemId], `${itemId} missing branch effects`);
    assert.equal(trial.branches.length, 2);
    for (const branch of trial.branches) {
      const effect = uniqueBranchEffect(itemId, branch.id);
      assert.ok(effect, `${itemId}/${branch.id} missing effect`);
      assert.equal(effect.name, branch.name);
      assert.ok(Object.keys(effect.stats || {}).length + (effect.effects || []).length > 0);
    }
  }
});

test('final evolutions stay build-defining rather than flat-only upgrades', () => {
  for (const branches of Object.values(UNIQUE_BRANCH_EFFECTS)) {
    for (const evolution of Object.values(branches)) {
      assert.ok((evolution.effects || []).length >= 1, `${evolution.name} needs a rule-changing effect`);
    }
  }
});
