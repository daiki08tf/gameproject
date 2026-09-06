import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getItem } from '../js/data/equipment.js';
import { fixedEquipmentIdentities, FIXED_IDENTITY_KIND } from '../js/data/equipmentFixedIdentity.js';
import { findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { knownObservedBranches } from '../js/data/observedBranchDiscovery.js';
import { observedBranchById, observedBranchesForPrimeRegion } from '../js/data/observedBranches.js';
import { OBSERVED_BRANCH_ECOLOGY, OBSERVED_BRANCH_ECOLOGY_ROLES } from '../js/data/observedBranchEcology.js';
import { buildObservedBranchStage, observedBranchProfileSummary, observedBranchStageProgress, isObservedBranchCleared } from '../js/data/observedBranchStages.js';
import { CP4_FIFTH_BRANCH_ANCHOR, cp4FifthBranchAnchorProgress } from '../js/data/contentPackIVD.js';
import { CP4_VEIL_EVIDENCE, cp4VeilEvidenceProgress } from '../js/data/contentPackIVJ.js';
import { unique2IdentityById } from '../js/data/unique2IdentityLibrary.js';

// M9 continuation — Branch Cluster 4 (The Veil / Ch19 月蝕の境界), the last
// queued Cluster from the roadmap's Decision log. Mirrors
// tests/observed-branches-m9.test.js's and
// tests/observed-branches-m9-machine-world.test.js's coverage exactly.

const BRANCH_ID = 'unbroken-veil';
const ANCHOR = 'cp4:branch-anchor:unbroken-veil';

test('M9 continuation authors 不断領・月蝕の境界 as Cluster 4\'s Branch (Ch19), reusing the Cluster 1/2/3 shape', () => {
  const branch = observedBranchById(BRANCH_ID);
  assert.ok(branch);
  assert.equal(branch.primeRegionRef.chapterId, 'ch19');
  assert.equal(branch.primeRegionRef.chapterNum, 19);
  assert.equal(branch.primeRegionRef.worldRegionId, 'veil');
  assert.match(branch.divergencePoint, /The Veil/);
  assert.match(branch.divergencePoint, /破断/);
  assert.match(branch.ecologyProfile.settlement, /閉鎖時空集落/);
  assert.deepEqual(branch.discoveryConditions.allDiscoveries, [ANCHOR]);
  assert.equal(branch.discoveryConditions.rngRequired, false);
  assert.deepEqual(observedBranchesForPrimeRegion({ chapterId: 'ch19', chapterNum: 19 }).map(b => b.id), [BRANCH_ID]);
  const summary = observedBranchProfileSummary(BRANCH_ID);
  assert.match(summary, /arcane ↑↑↑/);
  assert.match(summary, /boundary ↓↓/);
});

test('M9 continuation discovery reuses the same global Branch Sight/parallax authority, gated by its own Ch19 evidence', () => {
  assert.equal(CP4_FIFTH_BRANCH_ANCHOR.discoveryId, ANCHOR);
  assert.equal(CP4_FIFTH_BRANCH_ANCHOR.chapterNum, 19);
  assert.equal(cp4FifthBranchAnchorProgress({ discoveries: {} }).visible, false);
  const globalOnly = { 'cp4:branch-sight:active': { at: 1 }, 'cp4:parallax:first-contact': { at: 2 } };
  assert.equal(cp4FifthBranchAnchorProgress({ discoveries: globalOnly }).visible, false);
  const ready = { ...globalOnly, [CP4_VEIL_EVIDENCE.discoveryId]: { at: 3 } };
  const progress = cp4FifthBranchAnchorProgress({ discoveries: ready });
  assert.equal(progress.state, 'recognizable');
  assert.equal(progress.observed, false);
  assert.deepEqual(knownObservedBranches({ discoveries: ready }).map(x => x.id), []);
  const observed = { ...ready, [ANCHOR]: { at: 4 } };
  assert.equal(cp4FifthBranchAnchorProgress({ discoveries: observed }).observed, true);
  assert.deepEqual(knownObservedBranches({ discoveries: observed }).map(x => x.id), [BRANCH_ID]);
});

test('M9 continuation Ch19 evidence gates on an existing Prime stage clear, not a new authority', () => {
  assert.equal(CP4_VEIL_EVIDENCE.prerequisiteStageId, '19-3');
  assert.ok(findStage('19-3'), '19-3 must be a real, existing Prime Chapter 19 stage');
  assert.equal(cp4VeilEvidenceProgress({ discoveries: {}, isStageCleared: () => false }).state, 'locked');
  assert.equal(cp4VeilEvidenceProgress({ discoveries: {}, isStageCleared: id => id === '19-3' }).state, 'ready');
});

test('M9 continuation stages resolve through findStage, use Ch19\'s own enemy/encounter pool, and derive unlock/clear from existing stageProgress authority', () => {
  const branch = observedBranchById(BRANCH_ID);
  for (const stageId of branch.stageIds) {
    const found = findStage(stageId);
    const stage = found?.stage;
    assert.ok(stage, `${stageId} must resolve through findStage()`);
    assert.equal(stage.observedBranchId, BRANCH_ID);
    // Ch19 (an expanded Chapter) authors no CHAPTER_REGION_TAGS of its own --
    // the Branch stage must fall back gracefully, not throw.
    assert.deepEqual(stage.dropRegionTags, []);
    for (const wave of stage.waves) assert.match(wave.type, /^ch19_|^unbroken-veil_boss$/, `${stageId} must use Ch19's own enemy archetypes or the Branch's own boss`);
    for (const drop of stage.dropTable) assert.ok(getItem(drop.itemId), `${drop.itemId} must resolve through getItem()`);
  }
  const boss = buildObservedBranchStage(branch.bossStageId);
  assert.match(boss.name, /UNBROKEN SOVEREIGN/);
  assert.equal(boss.firstClear.itemId, 'uq_observed_unbroken_sovereign');
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

test('UNBROKEN SOVEREIGN is a Fixed Unique using the existing Unique2 identity authority', () => {
  const item = getItem('uq_observed_unbroken_sovereign');
  assert.ok(item);
  assert.equal(item.unique, true);
  assert.equal(item.rarity, 'legendary');
  assert.equal(item.weaponType, 'dagger');
  assert.equal(item.unique2IdentityId, 'u2_dagger_unbroken_sovereign');
  assert.ok(item.branchOrigin);
  const authored = unique2IdentityById(item.unique2IdentityId);
  assert.ok(authored);
  assert.equal(authored.effects[0].kind, 'critExtraAttack');
  const fixed = fixedEquipmentIdentities(item);
  assert.equal(fixed.length, 1);
  assert.equal(fixed[0].kind, FIXED_IDENTITY_KIND.UNIQUE);
  assert.equal(fixed[0].identityId, 'u2_dagger_unbroken_sovereign');
  assert.equal(fixed[0].consumesOptionSlot, false);
  assert.equal(fixed[0].optionFusionEligible, false);
});

test('M9 continuation gives the Branch its own M10-shaped ecology and distinct boss identity, not a reskin of Ch19\'s own', () => {
  const set = OBSERVED_BRANCH_ECOLOGY[BRANCH_ID];
  assert.ok(set);
  for (const role of OBSERVED_BRANCH_ECOLOGY_ROLES) {
    const type = ENEMY_TYPES[`${BRANCH_ID}_${role}`];
    assert.ok(type, `${BRANCH_ID}_${role} must be registered`);
    assert.equal(type.role, role);
    assert.equal(type.branchId, BRANCH_ID);
    assert.equal(type.observedBranch, true);
  }
  const boss = ENEMY_TYPES[`${BRANCH_ID}_boss`];
  const prime = ENEMY_TYPES.ch19_boss;
  assert.ok(boss);
  assert.notEqual(boss.name, prime.name);
  const statsDiffer = ['hp', 'atk', 'def', 'speed'].some(stat => boss[stat] !== prime[stat]);
  assert.ok(statsDiffer, `${BRANCH_ID}'s boss must have at least one distinct stat from Ch19's own boss`);
  const stage = buildObservedBranchStage(observedBranchById(BRANCH_ID).bossStageId);
  assert.equal(stage.encounterPool.id, `${BRANCH_ID}-e8-field`);
  assert.deepEqual(stage.encounterPool.rareTypes, [{ type: `${BRANCH_ID}_rare`, weight: 1 }]);
});

test('M9 continuation adds no new save/combat/loot authority and keeps CP4 DOM rendering emoji-free', () => {
  const stageSrc = fs.readFileSync('js/data/observedBranchStages.js', 'utf8');
  const branchSrc = fs.readFileSync('js/data/observedBranches.js', 'utf8');
  const cp4Runtime = fs.readFileSync('js/patches/contentPackIVD.js', 'utf8');
  const evidenceRuntime = fs.readFileSync('js/patches/contentPackIVJ.js', 'utf8');
  assert.doesNotMatch(stageSrc, /from ['"]\.\.\/state\.js['"]/);
  assert.doesNotMatch(stageSrc, /localStorage|\.save\(\)/);
  assert.doesNotMatch(branchSrc, /localStorage|stageProgress\s*=|worldTier\s*=/i);
  assert.match(cp4Runtime, /state\.data\.world2/);
  assert.doesNotMatch(cp4Runtime, /innerHTML/);
  assert.doesNotMatch(cp4Runtime, /◈|🌿|🔒|✅|❌/u);
  assert.match(evidenceRuntime, /state\.data\.world2/);
  assert.doesNotMatch(evidenceRuntime, /innerHTML/);
  assert.doesNotMatch(evidenceRuntime, /🪞|🕰️|✅|❌/u);
});

test('M9 continuation closes M9: all four confirmed Branch Cluster first picks now exist, The Veil was the last queued', () => {
  const roadmap = fs.readFileSync('OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md', 'utf8');
  assert.match(roadmap, /全権域・機界監査層/);
  assert.match(roadmap, /炎帝ドレイク|灼熱の火山/);
  const branchIds = ['tree-sovereign-deep-green', 'deep-green-absence', 'flame-king-volcano', 'mother-full-authority', 'unbroken-veil'];
  for (const id of branchIds) assert.ok(observedBranchById(id), `${id} must exist`);
});
