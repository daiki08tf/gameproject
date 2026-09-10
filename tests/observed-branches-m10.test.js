import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { OBSERVED_BRANCHES } from '../js/data/observedBranches.js';
import { OBSERVED_BRANCH_ECOLOGY, OBSERVED_BRANCH_ECOLOGY_ROLES } from '../js/data/observedBranchEcology.js';
import { buildObservedBranchStage } from '../js/data/observedBranchStages.js';
import { nemesisBranchResonanceBonus } from '../js/data/nemesis3.js';
import fs from 'node:fs';

const BRANCH_IDS = ['tree-sovereign-deep-green', 'deep-green-absence', 'flame-king-volcano'];

test('M10 gives each Branch its own regional Enemy 2.0 ecology instead of inheriting the Prime Chapter\'s', () => {
  for (const branchId of BRANCH_IDS) {
    const set = OBSERVED_BRANCH_ECOLOGY[branchId];
    assert.ok(set, `${branchId} must have an authored ecology set`);
    for (const role of OBSERVED_BRANCH_ECOLOGY_ROLES) {
      const type = ENEMY_TYPES[`${branchId}_${role}`];
      assert.ok(type, `${branchId}_${role} must be registered`);
      assert.equal(type.role, role);
      assert.equal(type.branchId, branchId);
      assert.equal(type.observedBranch, true);
      assert.ok(type.hp > 0 && type.atk > 0);
    }
    assert.equal(ENEMY_TYPES[`${branchId}_rare`].rareIdentity, true);
  }
  // The three Branches must not share identical regional identities (that
  // would just be a renamed copy, not a genuine ecology divergence).
  const rareNames = BRANCH_IDS.map(id => ENEMY_TYPES[`${id}_rare`].name);
  assert.equal(new Set(rareNames).size, BRANCH_IDS.length);
});

test('M10 gives each Branch Boss its own distinct enemy identity and stat silhouette, not a reskin of the Prime boss', () => {
  const primeBossByBranch = {
    'tree-sovereign-deep-green': ENEMY_TYPES.ch2_boss,
    'deep-green-absence': ENEMY_TYPES.ch2_boss,
    'flame-king-volcano': ENEMY_TYPES.ch5_boss,
  };
  for (const branchId of BRANCH_IDS) {
    const boss = ENEMY_TYPES[`${branchId}_boss`];
    assert.ok(boss, `${branchId}_boss must be registered`);
    assert.equal(boss.boss, true);
    assert.equal(boss.branchId, branchId);
    assert.equal(boss.observedBranch, true);
    const prime = primeBossByBranch[branchId];
    assert.notEqual(boss.name, prime.name, `${branchId}'s boss must not share the Prime boss's display name`);
    const statsDiffer = ['hp', 'atk', 'def', 'speed'].some(stat => boss[stat] !== prime[stat]);
    assert.ok(statsDiffer, `${branchId}'s boss must have at least one distinct stat from the Prime boss`);
  }
  // 王樹領 and 深緑消失域 previously shared the exact same ch2_boss stat block
  // despite being narratively opposite outcomes -- M10 must have separated them.
  const tree = ENEMY_TYPES['tree-sovereign-deep-green_boss'];
  const absence = ENEMY_TYPES['deep-green-absence_boss'];
  assert.notDeepEqual({ hp: tree.hp, speed: tree.speed, def: tree.def }, { hp: absence.hp, speed: absence.speed, def: absence.def });
});

test('M10 Branch Stages actually resolve into their own boss wave and encounter pool, not the Prime Chapter\'s', () => {
  for (const branch of OBSERVED_BRANCHES) {
    const boss = buildObservedBranchStage(branch.bossStageId);
    const bossWave = boss.waves.find(w => w.type === `${branch.id}_boss`);
    assert.ok(bossWave, `${branch.bossStageId} must wave-spawn the Branch's own boss type`);
    assert.equal(boss.encounterPool.id, `${branch.id}-e8-field`);
    assert.deepEqual(boss.encounterPool.rareTypes, [{ type: `${branch.id}_rare`, weight: 1 }]);
  }
});

test('M10 optional pilot: a Branch-derived Nemesis reward modifier reuses existing Nemesis ownership, no new save root', () => {
  assert.deepEqual(nemesisBranchResonanceBonus(false), { reward: 1 });
  assert.deepEqual(nemesisBranchResonanceBonus(true), { reward: 1.05 });
  const combat = fs.readFileSync(new URL('../js/patches/bounty2Combat.js', import.meta.url), 'utf8');
  assert.match(combat, /nemesisBranchResonanceBonus/);
  assert.match(combat, /knownObservedBranchesForPrimeRegion/);
  assert.doesNotMatch(combat, /data\.branchNemesis|data\.observedBranchNemesis/, 'must not introduce a second Nemesis save root');
});
