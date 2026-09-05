import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getItem } from '../js/data/equipment.js';
import { fixedEquipmentIdentities, FIXED_IDENTITY_KIND } from '../js/data/equipmentFixedIdentity.js';
import { findStage } from '../js/data/stages.js';
import { knownObservedBranches } from '../js/data/observedBranchDiscovery.js';
import { observedBranchById, observedBranchesForPrimeRegion } from '../js/data/observedBranches.js';
import { buildObservedBranchStage, observedBranchProfileSummary, observedBranchStageProgress, isObservedBranchCleared } from '../js/data/observedBranchStages.js';
import { CP4_THIRD_BRANCH_ANCHOR, cp4ThirdBranchAnchorProgress } from '../js/data/contentPackIVD.js';
import { CP4_VOLCANO_EVIDENCE, cp4VolcanoEvidenceProgress } from '../js/data/contentPackIVG.js';
import { unique2IdentityById } from '../js/data/unique2IdentityLibrary.js';

const BRANCH_ID = 'flame-king-volcano';
const ANCHOR = 'cp4:branch-anchor:flame-king';

test('M9 authors 炎帝領・灼熱の火山 as the first Branch of a new Prime Region (Ch5), reusing the Cluster 1 shape', () => {
  const branch = observedBranchById(BRANCH_ID);
  assert.ok(branch);
  assert.equal(branch.primeRegionRef.chapterId, 'ch5');
  assert.equal(branch.primeRegionRef.chapterNum, 5);
  assert.equal(branch.primeRegionRef.worldRegionId, 'elemental');
  assert.match(branch.divergencePoint, /炎帝ドレイク/);
  assert.match(branch.divergencePoint, /神王として即位/);
  assert.match(branch.ecologyProfile.settlement, /熔鉱都市/);
  assert.deepEqual(branch.discoveryConditions.allDiscoveries, [ANCHOR]);
  assert.equal(branch.discoveryConditions.rngRequired, false);
  assert.deepEqual(observedBranchesForPrimeRegion({ chapterId: 'ch5', chapterNum: 5 }).map(b => b.id), [BRANCH_ID]);
  const summary = observedBranchProfileSummary(BRANCH_ID);
  assert.match(summary, /mechanical ↑↑/);
  assert.match(summary, /material ↑↑↑/);
});

test('M9 discovery reuses the same global Branch Sight/parallax authority as Cluster 1, gated by its own Ch5 evidence', () => {
  assert.equal(CP4_THIRD_BRANCH_ANCHOR.discoveryId, ANCHOR);
  assert.equal(CP4_THIRD_BRANCH_ANCHOR.chapterNum, 5);
  assert.equal(cp4ThirdBranchAnchorProgress({ discoveries: {} }).visible, false);
  // Global branch-sight/parallax alone is not enough without Ch5's own evidence.
  const globalOnly = { 'cp4:branch-sight:active': { at: 1 }, 'cp4:parallax:first-contact': { at: 2 } };
  assert.equal(cp4ThirdBranchAnchorProgress({ discoveries: globalOnly }).visible, false);
  const ready = { ...globalOnly, [CP4_VOLCANO_EVIDENCE.discoveryId]: { at: 3 } };
  const progress = cp4ThirdBranchAnchorProgress({ discoveries: ready });
  assert.equal(progress.state, 'recognizable');
  assert.equal(progress.observed, false);
  assert.deepEqual(knownObservedBranches({ discoveries: ready }).map(x => x.id), []);
  const observed = { ...ready, [ANCHOR]: { at: 4 } };
  assert.equal(cp4ThirdBranchAnchorProgress({ discoveries: observed }).observed, true);
  assert.deepEqual(knownObservedBranches({ discoveries: observed }).map(x => x.id), [BRANCH_ID]);
});

test('M9 Ch5 evidence gates on an existing Prime stage clear, not a new authority', () => {
  assert.equal(CP4_VOLCANO_EVIDENCE.prerequisiteStageId, '5-3');
  assert.ok(findStage('5-3'), '5-3 must be a real, existing Prime Chapter 5 stage');
  assert.equal(cp4VolcanoEvidenceProgress({ discoveries: {}, isStageCleared: () => false }).state, 'locked');
  assert.equal(cp4VolcanoEvidenceProgress({ discoveries: {}, isStageCleared: id => id === '5-3' }).state, 'ready');
});

test('M9 stages resolve through findStage, use Ch5\'s own enemy/encounter pool, and derive unlock/clear from existing stageProgress authority', () => {
  const branch = observedBranchById(BRANCH_ID);
  for (const stageId of branch.stageIds) {
    const found = findStage(stageId);
    const stage = found?.stage;
    assert.ok(stage, `${stageId} must resolve through findStage()`);
    assert.equal(stage.observedBranchId, BRANCH_ID);
    assert.deepEqual(stage.dropRegionTags, ['fire']);
    for (const wave of stage.waves) assert.match(wave.type, /^ch5_/, `${stageId} must use Ch5's own enemy archetypes`);
    for (const drop of stage.dropTable) assert.ok(getItem(drop.itemId), `${drop.itemId} must resolve through getItem()`);
  }
  const boss = buildObservedBranchStage(branch.bossStageId);
  assert.match(boss.name, /EMBER THRONE/);
  assert.equal(boss.firstClear.itemId, 'uq_observed_ember_throne');
  assert.ok(getItem(boss.firstClear.itemId));
  const cleared = new Set();
  let progress = observedBranchStageProgress(BRANCH_ID, { isStageCleared: id => cleared.has(id) });
  assert.equal(progress.nextStageId, branch.stageIds[0]);
  assert.equal(progress.cleared, false);
  cleared.add(branch.stageIds[0]);
  progress = observedBranchStageProgress(BRANCH_ID, { isStageCleared: id => cleared.has(id) });
  assert.equal(progress.nextStageId, branch.stageIds[1]);
  cleared.add(branch.stageIds[1]);
  cleared.add(branch.bossStageId);
  assert.equal(isObservedBranchCleared(BRANCH_ID, { isStageCleared: id => cleared.has(id) }), true);
});

test('EMBER THRONE is a Fixed Unique using the existing Unique2 identity authority', () => {
  const item = getItem('uq_observed_ember_throne');
  assert.ok(item);
  assert.equal(item.unique, true);
  assert.equal(item.rarity, 'legendary');
  assert.equal(item.weaponType, 'axe');
  assert.equal(item.unique2IdentityId, 'u2_axe_ember_throne');
  assert.ok(item.branchOrigin);
  const authored = unique2IdentityById(item.unique2IdentityId);
  assert.ok(authored);
  assert.equal(authored.effects[0].kind, 'burnDamage');
  const fixed = fixedEquipmentIdentities(item);
  assert.equal(fixed.length, 1);
  assert.equal(fixed[0].kind, FIXED_IDENTITY_KIND.UNIQUE);
  assert.equal(fixed[0].identityId, 'u2_axe_ember_throne');
  assert.equal(fixed[0].consumesOptionSlot, false);
  assert.equal(fixed[0].optionFusionEligible, false);
});

test('M9 adds no new save/combat/loot authority and keeps CP4 DOM rendering emoji-free', () => {
  const stageSrc = fs.readFileSync('js/data/observedBranchStages.js', 'utf8');
  const branchSrc = fs.readFileSync('js/data/observedBranches.js', 'utf8');
  const cp4Runtime = fs.readFileSync('js/patches/contentPackIVD.js', 'utf8');
  const evidenceRuntime = fs.readFileSync('js/patches/contentPackIVG.js', 'utf8');
  assert.doesNotMatch(stageSrc, /from ['"]\.\.\/state\.js['"]/);
  assert.doesNotMatch(stageSrc, /localStorage|\.save\(\)/);
  assert.doesNotMatch(branchSrc, /localStorage|stageProgress\s*=|worldTier\s*=/i);
  assert.match(cp4Runtime, /state\.data\.world2/);
  assert.doesNotMatch(cp4Runtime, /innerHTML/);
  assert.doesNotMatch(cp4Runtime, /◈|🌿|🔒|✅|❌/u);
  assert.match(evidenceRuntime, /state\.data\.world2/);
  assert.doesNotMatch(evidenceRuntime, /innerHTML/);
  assert.doesNotMatch(evidenceRuntime, /🌋|🔥|✅|❌/u);
});
