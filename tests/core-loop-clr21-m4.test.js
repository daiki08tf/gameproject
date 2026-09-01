import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getItem } from '../js/data/equipment.js';
import { observedBranchById } from '../js/data/observedBranches.js';
import { buildObservedBranchStage, observedBranchProfileSummary } from '../js/data/observedBranchStages.js';

const BRANCH_ID = 'tree-sovereign-deep-green';

test('CLR-21 M4 王樹領 equipment rewards resolve through the existing equipment authority', () => {
  const branch = observedBranchById(BRANCH_ID);
  for (const stageId of branch.stageIds) {
    const stage = buildObservedBranchStage(stageId);
    for (const drop of stage.dropTable) {
      assert.ok(getItem(drop.itemId), `${drop.itemId} must resolve through getItem()`);
    }
    if (stage.firstClear?.itemId) {
      assert.ok(getItem(stage.firstClear.itemId), `${stage.firstClear.itemId} must resolve through getItem()`);
    }
  }
  const boss = buildObservedBranchStage(branch.bossStageId);
  assert.equal(boss.firstClear.itemId, 'ch2_weapon_epic');
});

test('CLR-21 M4 ecology and technology presentation is derived from existing Branch history data', () => {
  const summary = observedBranchProfileSummary(BRANCH_ID);
  assert.match(summary, /生態：/);
  assert.match(summary, /樹冠集落/);
  assert.match(summary, /生体建築/);
  assert.match(summary, /技術：/);
  assert.match(summary, /bio ↑↑↑/);
  assert.match(summary, /mechanical ↓↓/);

  const stage = buildObservedBranchStage(observedBranchById(BRANCH_ID).stageIds[0]);
  assert.match(stage.observedBranchLabel, /観測分岐：王樹領/);
  assert.match(stage.observedBranchLabel, /生態：/);
  assert.match(stage.observedBranchLabel, /技術：/);
});

test('CLR-21 M4 reuses the existing Stage confirmation surface and introduces no new presentation save authority', () => {
  const selectSrc = fs.readFileSync('js/screens/stageSelect.js', 'utf8');
  const stageSrc = fs.readFileSync('js/data/observedBranchStages.js', 'utf8');
  assert.match(selectSrc, /stage\.observedBranchLabel/);
  assert.match(selectSrc, /Prime世界とは異なる歴史が観測されている/);
  assert.doesNotMatch(stageSrc, /localStorage|\.save\(\)|state\.data\./);
});
