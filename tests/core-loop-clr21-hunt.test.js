import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getItem } from '../js/data/equipment.js';
import { observedBranchById } from '../js/data/observedBranches.js';
import { buildObservedBranchStage, observedBranchHuntTargets } from '../js/data/observedBranchStages.js';

const BRANCH_ID = 'tree-sovereign-deep-green';

test('CLR-21 Branch Hunt stays unavailable until the existing boss Stage is cleared', () => {
  const branch = observedBranchById(BRANCH_ID);
  const clearedBeforeBoss = new Set(branch.stageIds.filter(id => id !== branch.bossStageId));
  const targets = observedBranchHuntTargets(BRANCH_ID, {
    isStageCleared: id => clearedBeforeBoss.has(id),
  });
  assert.deepEqual(targets, []);
});

test('CLR-21 Branch Hunt reuses every authored Branch Stage after clear', () => {
  const branch = observedBranchById(BRANCH_ID);
  const cleared = new Set(branch.stageIds);
  const targets = observedBranchHuntTargets(BRANCH_ID, {
    isStageCleared: id => cleared.has(id),
  });

  assert.deepEqual(targets.map(target => target.stageId), [...branch.stageIds]);
  assert.deepEqual(targets.map(target => target.role), ['ecology', 'deep', 'boss']);

  for (const target of targets) {
    const stage = buildObservedBranchStage(target.stageId);
    assert.equal(stage.id, target.stageId);
    assert.ok(target.dropTable.length > 0, `${target.stageId} must keep an existing loot target`);
    for (const drop of target.dropTable) {
      assert.ok(getItem(drop.itemId), `${drop.itemId} must resolve through getItem()`);
    }
  }
});

test('CLR-21 Branch Hunt is derived-only and the Stage browser launches canonical Branch Stages', () => {
  const helperSrc = observedBranchHuntTargets.toString();
  assert.doesNotMatch(helperSrc, /localStorage|\.save\(|state\.data/);

  const selectSrc = fs.readFileSync('js/screens/stageSelect.js', 'utf8');
  assert.match(selectSrc, /observedBranchHuntTargets\(branch\.id/);
  assert.match(selectSrc, /生態巡回/);
  assert.match(selectSrc, /深部巡回/);
  assert.match(selectSrc, /Boss再戦/);
  assert.match(selectSrc, /buildObservedBranchStage\(target\.stageId\)/);
  assert.doesNotMatch(selectSrc, /huntCurrency|huntLevel|huntSave|stamina|energy/);
});
