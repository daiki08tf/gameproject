import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getItem } from '../js/data/equipment.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { CHAPTER_REGION_TAGS } from '../js/data/chapters.js';
import { planRareOverrideTypes, markGenericElite } from '../js/data/enemyRankVariants2.js';
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
  assert.match(targets[1].name, /Rare \/ Elite/);

  for (const target of targets) {
    const stage = buildObservedBranchStage(target.stageId);
    assert.equal(stage.id, target.stageId);
    assert.ok(target.dropTable.length > 0, `${target.stageId} must keep an existing loot target`);
    for (const drop of target.dropTable) {
      assert.ok(getItem(drop.itemId), `${drop.itemId} must resolve through getItem()`);
    }
  }
});

test('CLR-21 Branch stages project the existing Chapter 2 Enemy 2.0 encounter contract', () => {
  const branch = observedBranchById(BRANCH_ID);
  for (const stageId of branch.stageIds) {
    const stage = buildObservedBranchStage(stageId);
    assert.ok(stage.encounterPool, `${stageId} must expose the existing Encounter 2.0 pool`);
    assert.equal(stage.encounterPool.id, 'ch2-e8-field');
    assert.equal(stage.encounterPool.rareChance, .04);
    assert.deepEqual(stage.encounterPool.rareTypes, [{ type: 'ch2_rare', weight: 1 }]);
    assert.deepEqual(stage.encounterPool.regionTags, CHAPTER_REGION_TAGS.ch2);
    assert.equal(ENEMY_TYPES.ch2_rare.rareIdentity, true);
    assert.equal(stage.encounterPool.types.some(entry => ENEMY_TYPES[entry.type]?.boss), false);
  }

  const fieldStage = buildObservedBranchStage(branch.stageIds[1]);
  const rarePlan = planRareOverrideTypes(fieldStage, fieldStage.waves[0], ENEMY_TYPES, { rank: 0 }, () => 0);
  assert.equal(rarePlan.filter(Boolean).length, 1);
  assert.equal(rarePlan.find(Boolean), 'ch2_rare');

  const elite = { ...ENEMY_TYPES.ch2_normal, elite: false };
  markGenericElite(elite);
  assert.equal(elite.rank, 'elite');
  assert.equal(elite.genericElite, true);
  assert.equal(elite.elite, false, 'generic World Tier Elite must not enter the Abyss Elite reward path');
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
