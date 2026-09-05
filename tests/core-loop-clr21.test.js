import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { state } from '../js/state.js';
import { findStage, CHAPTERS } from '../js/data/stages.js';
import { OBSERVED_BRANCHES, observedBranchById } from '../js/data/observedBranches.js';
import {
  buildObservedBranchStage,
  observedBranchStageProgress,
  isObservedBranchCleared,
} from '../js/data/observedBranchStages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';

const BRANCH_ID = 'tree-sovereign-deep-green';

function resetBranchStageProgress() {
  const branch = observedBranchById(BRANCH_ID);
  for (const id of branch.stageIds) delete state.data.stageProgress[id];
}

test('CLR-21 王樹領・深緑の森 resolves as a playable Branch through the existing findStage() authority', () => {
  const branch = observedBranchById(BRANCH_ID);
  assert.ok(branch.stageIds.length >= 3);
  for (const stageId of branch.stageIds) {
    const found = findStage(stageId);
    assert.ok(found, `${stageId} must resolve via findStage()`);
    assert.equal(found.chapter, null);
    assert.equal(found.stage.id, stageId);
  }
  assert.equal(findStage('observedbranch-does-not-exist'), null);
});

test('CLR-21 Branch contains only its own canonical Stage IDs — no cross-Branch or cross-Region mixing', () => {
  const branch = observedBranchById(BRANCH_ID);
  for (const id of branch.stageIds) assert.ok(id.startsWith('observedbranch-tree-sovereign-'));
  // Branch Stage IDs never collide with any canonical Chapter Stage ID.
  const chapterStageIds = new Set(CHAPTERS.flatMap(ch => ch.stages.map(s => s.id)));
  for (const id of branch.stageIds) assert.equal(chapterStageIds.has(id), false);
  // M6 adds a sibling Branch, but all Branch Stage IDs remain globally unique.
  const allBranchStageIds = OBSERVED_BRANCHES.flatMap(candidate => candidate.stageIds ?? []);
  assert.equal(new Set(allBranchStageIds).size, allBranchStageIds.length);
  assert.ok(OBSERVED_BRANCHES.some(candidate => candidate.id === 'deep-green-absence'));
  assert.equal(new Set(branch.stageIds).size, branch.stageIds.length);
});

test('CLR-21 the first Branch Stage is unlocked and later Stages are locked until reached', () => {
  resetBranchStageProgress();
  const progress = observedBranchStageProgress(BRANCH_ID, { isStageCleared: id => state.isStageCleared(id) });
  assert.equal(progress.stages[0].unlocked, true);
  assert.equal(progress.stages[0].cleared, false);
  for (const stage of progress.stages.slice(1)) assert.equal(stage.unlocked, false);
  assert.equal(progress.nextStageId, progress.stages[0].id);
  assert.equal(progress.cleared, false);
});

test('CLR-21 clearing a Branch Stage unlocks exactly the next one, via existing state.recordStageResult', () => {
  resetBranchStageProgress();
  const branch = observedBranchById(BRANCH_ID);
  state.recordStageResult(branch.stageIds[0], true);
  const progress = observedBranchStageProgress(BRANCH_ID, { isStageCleared: id => state.isStageCleared(id) });
  assert.equal(progress.stages[0].cleared, true);
  assert.equal(progress.stages[1].unlocked, true);
  assert.equal(progress.stages[1].cleared, false);
  assert.equal(progress.stages[2].unlocked, false);
  assert.equal(progress.nextStageId, branch.stageIds[1]);
  resetBranchStageProgress();
});

test('CLR-21 clearing the final Boss Stage derives Branch clear — no new save flag is introduced', () => {
  resetBranchStageProgress();
  const branch = observedBranchById(BRANCH_ID);
  for (const id of branch.stageIds) state.recordStageResult(id, true);
  assert.equal(isObservedBranchCleared(BRANCH_ID, { isStageCleared: id => state.isStageCleared(id) }), true);
  const progress = observedBranchStageProgress(BRANCH_ID, { isStageCleared: id => state.isStageCleared(id) });
  assert.equal(progress.cleared, true);
  assert.equal(progress.bossStageId, branch.bossStageId);
  // Branch clear is derived purely from existing stageProgress — no sibling
  // save key for it exists anywhere in state.data.
  assert.equal('observedBranchClears' in state.data, false);
  assert.equal('branchProgress' in state.data, false);
  resetBranchStageProgress();
});

test('CLR-21 Branch progress/clear are derived read-only functions built on existing stageProgress/isStageCleared', () => {
  const dataSrc = fs.readFileSync('js/data/observedBranchStages.js', 'utf8');
  assert.match(dataSrc, /isStageCleared/);
  assert.doesNotMatch(dataSrc, /state\.data\.stageProgress\s*\[.*\]\s*=/);
  assert.doesNotMatch(dataSrc, /\.save\(\)/);
  assert.doesNotMatch(dataSrc, /Math\.random/);
});

test('CLR-21 Battle launch reuses 100% existing combat authority: Branch waves reference already-registered Chapter 2 enemy archetypes', () => {
  const boss = buildObservedBranchStage(observedBranchById(BRANCH_ID).bossStageId);
  assert.ok(boss.waves.length > 0);
  for (const wave of [...buildObservedBranchStage(observedBranchById(BRANCH_ID).stageIds[0]).waves, ...boss.waves]) {
    assert.ok(ENEMY_TYPES[wave.type], `${wave.type} must already be a registered enemy type`);
  }
  assert.equal(boss.boss, true);
  assert.ok(boss.dropTable.length > 0);
  assert.ok(boss.firstClear);
});

test('CLR-21 replaying an already-cleared Branch Stage does not corrupt or duplicate clear state', () => {
  resetBranchStageProgress();
  const branch = observedBranchById(BRANCH_ID);
  state.recordStageResult(branch.stageIds[0], true);
  const before = observedBranchStageProgress(BRANCH_ID, { isStageCleared: id => state.isStageCleared(id) });
  state.recordStageResult(branch.stageIds[0], true); // replay victory
  const after = observedBranchStageProgress(BRANCH_ID, { isStageCleared: id => state.isStageCleared(id) });
  assert.deepEqual(before, after);
  resetBranchStageProgress();
});

test('CLR-21 introduces no Branch-specific World Tier authority', () => {
  const dataSrc = fs.readFileSync('js/data/observedBranchStages.js', 'utf8');
  const branchSrc = fs.readFileSync('js/data/observedBranches.js', 'utf8');
  assert.doesNotMatch(`${dataSrc}\n${branchSrc}`, /worldTier/i);
});

test('CLR-21 does not disturb existing Observed Branch M1/M2 discovery authority', () => {
  const branch = observedBranchById(BRANCH_ID);
  assert.equal(branch.traversable, false);
  assert.deepEqual(branch.discoveryConditions.allDiscoveries, ['cp4:branch-anchor:tree-sovereign']);
  const forbidden = ['combat', 'battle', 'rewards', 'reward', 'dropTable', 'loot', 'itemPower', 'currency', 'worldTierId'];
  for (const key of forbidden) assert.equal(Object.hasOwn(branch, key), false);
});

test('CLR-21 legacy saves without any Branch stageProgress entries resolve safely', () => {
  resetBranchStageProgress();
  const isStageCleared = id => Boolean(state.data.stageProgress[id]?.cleared); // pre-CLR-21 shape: key absent entirely
  const progress = observedBranchStageProgress(BRANCH_ID, { isStageCleared });
  assert.equal(progress.stages[0].unlocked, true);
  assert.equal(progress.cleared, false);
  assert.equal(isObservedBranchCleared(BRANCH_ID, { isStageCleared }), false);
  // An unknown/未定義 Branch id must never throw or fabricate state.
  assert.deepEqual(observedBranchStageProgress('no-such-branch', { isStageCleared }), { stages: [], nextStageId: null, bossStageId: null, cleared: false });
  assert.equal(isObservedBranchCleared('no-such-branch', { isStageCleared }), false);
});

test('CLR-21/M6 playable Branch set expands only through the two authored Ch2 Branch stage lists', () => {
  const playable = OBSERVED_BRANCHES
    .filter(branch => Array.isArray(branch.stageIds) && branch.stageIds.length)
    .map(branch => branch.id)
    .sort();
  assert.deepEqual(playable, ['deep-green-absence', 'tree-sovereign-deep-green'].sort());
  for (const branch of OBSERVED_BRANCHES.filter(candidate => playable.includes(candidate.id))) {
    for (const stageId of branch.stageIds) assert.ok(findStage(stageId), `${stageId} must resolve via findStage()`);
  }
});

test('CLR-21 Stage-first UI resolves Branch Stages alongside canonical Chapter Stages without a Route Graph regression', () => {
  const navSrc = fs.readFileSync('js/patches/stageFirstNavigationUi.js', 'utf8');
  assert.match(navSrc, /buildObservedBranchStage/);
  // The Hunt-context resolver's existing chapter-derived Region gate is
  // reused as-is; Branch Stages naturally fall through it since they carry
  // chapter:null (no Region/World Tier double-application risk).
  assert.match(navSrc, /const region=regionForChapter\(chapter\)/);
  const selectSrc = fs.readFileSync('js/screens/stageSelect.js', 'utf8');
  assert.match(selectSrc, /renderObservedBranchStageCards/);
  // Branch cards must be appended strictly after the chapter's own stage
  // cards so stageFirstNavigationUi.js's index-based card decoration for
  // ordinary Chapter stages is never misaligned.
  const forEachIndex = selectSrc.indexOf('chapter.stages.forEach');
  const appendCallIndex = selectSrc.indexOf('renderObservedBranchStageCards(chapter, list, onPick);');
  assert.ok(forEachIndex >= 0 && appendCallIndex > forEachIndex);
});
