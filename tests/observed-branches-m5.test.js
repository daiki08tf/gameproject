import test from 'node:test';
import assert from 'node:assert/strict';
import { getItem, allItems } from '../js/data/equipment.js';
import { fixedEquipmentIdentities } from '../js/data/equipmentFixedIdentity.js';
import { equipment3Presentation, equipment3SpecialLines } from '../js/data/equipment3Presentation.js';
import { OBSERVED_BRANCH_EQUIPMENT, observedBranchEquipmentById, branchOriginText } from '../js/data/observedBranchEquipment.js';
import { observedBranchById } from '../js/data/observedBranches.js';
import { buildObservedBranchStage } from '../js/data/observedBranchStages.js';
import { RUNE2_DEFS, runesForStage } from '../js/data/runes2.js';

const TREE_ID = 'tree-sovereign-deep-green';
const ABSENCE_ID = 'deep-green-absence';

test('M5 registers Divergent Technology Gear into the existing shared equipment authority, not a second item store', () => {
  assert.ok(OBSERVED_BRANCH_EQUIPMENT.length > 0);
  for (const def of OBSERVED_BRANCH_EQUIPMENT) {
    const resolved = getItem(def.id);
    assert.ok(resolved, `${def.id} must resolve through getItem()`);
    assert.equal(resolved, def, `${def.id} must be the same authored object, not a copy/second authority`);
    assert.ok(['normal', 'rare', 'epic', 'legendary', 'mythic'].includes(resolved.rarity), `${def.id} must use an existing rarity tier`);
  }
  // allItems() is the shared listing every screen/Codex filter reads from.
  const allIds = new Set(allItems().map(i => i.id));
  for (const def of OBSERVED_BRANCH_EQUIPMENT) assert.ok(allIds.has(def.id), `${def.id} must appear in allItems()`);
});

test('M5 Branch Stage drop tables reference resolvable Branch-native gear for both authored Branches', () => {
  for (const branchId of [TREE_ID, ABSENCE_ID]) {
    const branch = observedBranchById(branchId);
    assert.ok(branch, `${branchId} must be an authored Branch`);
    for (const stageId of branch.stageIds) {
      const stage = buildObservedBranchStage(stageId);
      assert.ok(stage, `${stageId} must resolve through buildObservedBranchStage()`);
      assert.ok(stage.dropTable.length > 0, `${stageId} must have a non-empty dropTable`);
      for (const drop of stage.dropTable) {
        assert.ok(getItem(drop.itemId), `${stageId} dropTable entry ${drop.itemId} must resolve through getItem()`);
      }
    }
    // Boss reward must be this Branch's own Unique2 fixed weapon, not a generic Chapter 2 placeholder.
    const boss = buildObservedBranchStage(branch.bossStageId);
    const bossReward = getItem(boss.firstClear.itemId);
    assert.ok(bossReward, 'Branch boss firstClear reward must resolve through getItem()');
    assert.equal(bossReward.unique, true);
    assert.ok(bossReward.branchOrigin, 'Branch boss firstClear reward must carry Branch Origin presentation metadata');
  }
});

test('M5 Branch-native equipment carries read-only Branch Origin presentation metadata only', () => {
  for (const def of OBSERVED_BRANCH_EQUIPMENT) {
    assert.ok(def.branchOrigin?.label, `${def.id} must carry a branchOrigin label`);
    assert.match(branchOriginText(def), /^Branch Origin：/);
  }
  // Branch Origin text surfaces on the existing equipment3 detail line contract...
  const withOrigin = getItem('ob_absence_echo_dagger');
  const p1 = equipment3Presentation(withOrigin);
  assert.ok(p1.branchOrigin);
  const lines1 = equipment3SpecialLines(p1);
  assert.ok(lines1.some(l => l.startsWith('【Branch Origin】')), 'items with branchOrigin must surface a Branch Origin special line');
  // ...and only for items that actually carry it, never invented for ordinary gear.
  const ordinary = getItem('ch2_accessory');
  assert.ok(ordinary, 'sanity: ch2_accessory must still exist as ordinary Chapter 2 gear');
  const p2 = equipment3Presentation(ordinary);
  assert.equal(p2.branchOrigin, null);
  const lines2 = equipment3SpecialLines(p2);
  assert.ok(!lines2.some(l => l.startsWith('【Branch Origin】')));
});

test('M5 unique Branch rewards resolve through the existing Unique/Fixed Identity authority, not a second Option system', () => {
  for (const id of ['uq_observed_verdant', 'uq_observed_blank_compass']) {
    const item = observedBranchEquipmentById(id) || getItem(id);
    assert.ok(item, `${id} must be an authored item`);
    assert.equal(item.unique, true);
    const identities = fixedEquipmentIdentities(item, null);
    const fixedUnique = identities.find(i => i.kind === 'unique');
    assert.ok(fixedUnique, `${id} must produce a UNIQUE FIXED identity through the shared authority`);
    assert.equal(fixedUnique.consumesOptionSlot, false);
    assert.equal(fixedUnique.optionFusionEligible, false);
    assert.deepEqual(fixedUnique.effects, item.effects);
  }
});

test('M5 adds Rune 2.0 statMult defs routed through existing Branch Stage IDs, not a new drop authority', () => {
  const m5Ids = ['ob_verdant', 'ob_rootsong', 'ob_boundary', 'ob_echo'];
  for (const id of m5Ids) {
    const def = RUNE2_DEFS.find(r => r.id === id);
    assert.ok(def, `${id} must be defined in the shared RUNE2_DEFS table`);
    assert.equal(def.kind, 'statMult', 'M5 runes must use the existing statMult kind, not a new kind');
    assert.equal(def.stageIds.length, 1);
    // The stage id must be a real, resolvable Observed Branch stage, and
    // buildObservedBranchStage()'s returned stage.id must be the exact same
    // string runesForStage() filters on, so the existing rollRune2DropForStage()
    // pipeline actually reaches these Branch stages.
    const stageId = def.stageIds[0];
    const stage = buildObservedBranchStage(stageId);
    assert.ok(stage, `${id} must reference a real Branch stage`);
    assert.equal(stage.id, stageId);
    assert.ok(runesForStage(stageId).some(r => r.id === id));
  }
  // Boss stages intentionally carry no M5 Rune 2.0 def (roadmap only routes the two non-boss stages per Branch).
  for (const branchId of [TREE_ID, ABSENCE_ID]) {
    const boss = observedBranchById(branchId).bossStageId;
    assert.ok(!runesForStage(boss).some(r => m5Ids.includes(r.id)));
  }
});
