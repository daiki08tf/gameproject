import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getItem } from '../js/data/equipment.js';
import { OBSERVED_BRANCHES } from '../js/data/observedBranches.js';
import { knownObservedBranches } from '../js/data/observedBranchDiscovery.js';
import { buildObservedBranchStage, observedBranchStageProgress, observedBranchHuntTargets, isObservedBranchCleared } from '../js/data/observedBranchStages.js';
import { fixedEquipmentIdentities } from '../js/data/equipmentFixedIdentity.js';

// M11 — Endgame Branch chase: verifies the full existing-authority chain
// (discovery -> branch route/boss -> technology-origin gear -> Option/Unique
// refinement -> World Tier / Branch challenge) actually connects end to end,
// and that no new endgame authority (branch tokens, portal-key currency,
// weekly resets, parallel Item Power) was introduced anywhere in the process.

test('M11 chain step 1: Branch discovery gates route access through the existing CP4/discovery authority (M2)', () => {
  assert.deepEqual(knownObservedBranches({ discoveries: {} }), []);
  for (const branch of OBSERVED_BRANCHES) {
    const discoveries = Object.fromEntries(branch.discoveryConditions.allDiscoveries.map(id => [id, { at: 1 }]));
    assert.ok(knownObservedBranches({ discoveries }).some(b => b.id === branch.id), `${branch.id} must become known once its own discovery conditions are met`);
  }
});

test('M11 chain step 2: Branch route/boss resolve and clear through the existing Stage/stageProgress authority (M4/M6/M9)', () => {
  for (const branch of OBSERVED_BRANCHES) {
    const cleared = new Set();
    let progress = observedBranchStageProgress(branch.id, { isStageCleared: id => cleared.has(id) });
    assert.equal(progress.cleared, false);
    for (const id of branch.stageIds) cleared.add(id);
    progress = observedBranchStageProgress(branch.id, { isStageCleared: id => cleared.has(id) });
    assert.equal(progress.cleared, true);
    assert.equal(isObservedBranchCleared(branch.id, { isStageCleared: id => cleared.has(id) }), true);
    const boss = buildObservedBranchStage(branch.bossStageId);
    assert.ok(!boss.isAbyss, 'Branch Stages must not be Abyss stages (World Tier scaling excludes stage?.isAbyss)');
  }
});

test('M11 chain step 3: Branch route/boss yield technology-origin gear through the existing equipment authority (M5/M8/M9)', () => {
  for (const branch of OBSERVED_BRANCHES) {
    for (const stageId of branch.stageIds) {
      const stage = buildObservedBranchStage(stageId);
      for (const drop of stage.dropTable) assert.ok(getItem(drop.itemId), `${drop.itemId} must resolve through getItem()`);
      if (stage.firstClear) assert.ok(getItem(stage.firstClear.itemId), `${stage.firstClear.itemId} must resolve through getItem()`);
    }
  }
});

test('M11 chain step 4: Branch gear supports the existing Option/Unique refinement pipeline exactly like any other equipment', () => {
  const boss = getItem('uq_observed_verdant');
  // Unique Branch gear reaches the same Fixed-identity path (no random Option
  // slot, no Option Fusion eligibility) as every other Unique in the game --
  // not a Branch-specific carve-out, just the shared contract.
  const fixed = fixedEquipmentIdentities(boss);
  assert.equal(fixed.length, 1);
  assert.equal(fixed[0].consumesOptionSlot, false);
  assert.equal(fixed[0].optionFusionEligible, false);
  // Non-unique Branch gear carries no unique/fixed identity at all, so it
  // rolls Options exactly like ordinary epic/legendary gear.
  const staff = getItem('ob_tree_root_staff');
  assert.equal(staff.unique, undefined);
  assert.deepEqual(fixedEquipmentIdentities(staff), []);
  // No Branch item defines a second, parallel Item Power axis.
  for (const item of [boss, staff]) {
    assert.equal(item.itemPower, undefined);
    assert.equal(item.branchItemPower, undefined);
  }
});

test('M11 chain step 5: Branch challenge (Hunt) reuses the existing repeatable Stage-first loop, no new endgame root', () => {
  for (const branch of OBSERVED_BRANCHES) {
    const cleared = new Set(branch.stageIds);
    const targets = observedBranchHuntTargets(branch.id, { isStageCleared: id => cleared.has(id) });
    assert.equal(targets.length, branch.stageIds.length);
    for (const target of targets) {
      const stage = buildObservedBranchStage(target.stageId);
      assert.equal(stage.id, target.stageId);
      assert.ok(!stage.isAbyss);
    }
  }
});

test('M11 introduces no branch tokens, portal-key currency, weekly resets, or parallel Item Power anywhere in the Observed Branches system', () => {
  const files = [
    'js/data/observedBranches.js', 'js/data/observedBranchStages.js', 'js/data/observedBranchDiscovery.js',
    'js/data/observedBranchEquipment.js', 'js/data/observedBranchEquipmentII.js', 'js/data/observedBranchEcology.js',
    'js/data/contentPackIVD.js', 'js/data/contentPackIVG.js', 'js/data/contentPackIVH.js', 'js/data/contentPackIVI.js', 'js/data/contentPackIVJ.js',
    'js/patches/contentPackIVD.js', 'js/patches/contentPackIVG.js', 'js/patches/contentPackIVH.js', 'js/patches/contentPackIVI.js', 'js/patches/contentPackIVJ.js',
  ];
  const forbidden = /branchToken|portalKey|weeklyReset|parallelItemPower|branchCurrency|dailyReset|pityMeter/i;
  for (const path of files) {
    const src = fs.readFileSync(path, 'utf8');
    assert.doesNotMatch(src, forbidden, `${path} must not introduce a new endgame currency/reset/parallel-power authority`);
  }
});
