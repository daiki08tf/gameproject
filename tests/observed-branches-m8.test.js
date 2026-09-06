import test from 'node:test';
import assert from 'node:assert/strict';
import { getItem } from '../js/data/equipment.js';
import { fixedEquipmentIdentities, FIXED_IDENTITY_KIND } from '../js/data/equipmentFixedIdentity.js';
import { equipment3Presentation, equipment3SpecialLines } from '../js/data/equipment3Presentation.js';
import { OBSERVED_BRANCH_EQUIPMENT_II, observedBranchEquipmentIIById } from '../js/data/observedBranchEquipmentII.js';
import { buildObservedBranchStage } from '../js/data/observedBranchStages.js';
import { unique2IdentityById } from '../js/data/unique2IdentityLibrary.js';

test('M8 authors separate Branch Equipment II variants for specific familiar Prime items, never modifying the Prime item', () => {
  assert.equal(OBSERVED_BRANCH_EQUIPMENT_II.length, 3);
  for (const variant of OBSERVED_BRANCH_EQUIPMENT_II) {
    assert.ok(variant.variantOfId, `${variant.id} must record which Prime item it varies`);
    const prime = getItem(variant.variantOfId);
    assert.ok(prime, `${variant.variantOfId} must be a real, already-live Prime item`);
    assert.notEqual(prime.id, variant.id, 'the variant must be a separate item id, not an in-place edit');
    const resolvedVariant = getItem(variant.id);
    assert.equal(resolvedVariant, variant, `${variant.id} must resolve through the shared equipment authority`);
  }
});

test('M8 Prime items keep their original effect untouched (no automatic conversion, Prime stays useful)', () => {
  const wolfKing = getItem('ch2_named_weapon');
  assert.equal(wolfKing.name, '狼王の逆咬み');
  assert.equal(wolfKing.effects[0].kind, 'counter');
  const salamander = getItem('ch5_named_body');
  assert.equal(salamander.name, 'サラマンダーの鱗');
  assert.equal(salamander.effects[0].kind, 'burnDamage');
});

test('M8 variants each carry a distinct combat loop from their Prime original and from each other', () => {
  const verdantFang = getItem('uq_observed_verdant_fang');
  const nullFang = getItem('uq_observed_null_fang');
  const royalScale = getItem('uq_observed_royal_scale');
  const primeDagger = getItem('ch2_named_weapon');
  const primeBody = getItem('ch5_named_body');
  const kinds = [verdantFang, nullFang, royalScale].map(item => item.effects[0].kind);
  assert.equal(new Set(kinds).size, 3, 'all three variants must use distinct effect kinds');
  assert.notEqual(verdantFang.effects[0].kind, primeDagger.effects[0].kind);
  assert.notEqual(nullFang.effects[0].kind, primeDagger.effects[0].kind);
  assert.notEqual(royalScale.effects[0].kind, primeBody.effects[0].kind);
  // 王樹領 (sustain via kill) and 深緑消失域 (anti-recovery aggression) are
  // opposite reactions to the same Prime punish-on-hurt dagger, matching
  // Branch Cluster 1's Bio-dominant vs Boundary-dominant technology split.
  assert.equal(verdantFang.effects[0].kind, 'healOnKill');
  assert.equal(nullFang.effects[0].kind, 'noRecoveryDmgBonus');
  assert.equal(royalScale.effects[0].kind, 'guardNextAtkBuff');
});

test('M8 dagger variants use the existing Unique2 identity authority within its authored safety envelope', () => {
  for (const [itemId, identityId] of [['uq_observed_verdant_fang', 'u2_dagger_verdant_fang'], ['uq_observed_null_fang', 'u2_dagger_null_fang']]) {
    const item = getItem(itemId);
    assert.equal(item.unique2IdentityId, identityId);
    const identity = unique2IdentityById(identityId);
    assert.ok(identity);
    assert.equal(identity.family, 'dagger');
    assert.equal(identity.consumesOptionSlot, false);
    assert.equal(identity.optionFusionEligible, false);
    const fixed = fixedEquipmentIdentities(item);
    assert.equal(fixed.length, 1);
    assert.equal(fixed[0].kind, FIXED_IDENTITY_KIND.UNIQUE);
    assert.equal(fixed[0].identityId, identityId);
  }
  const verdant = unique2IdentityById('u2_dagger_verdant_fang');
  assert.ok(verdant.effects[0].power <= 0.04, 'healOnKill must stay inside the shared safety cap');
  const nullId = unique2IdentityById('u2_dagger_null_fang');
  assert.ok(nullId.effects[0].power > 0 && nullId.effects[0].power <= 0.22, 'noRecoveryDmgBonus must stay inside the shared safety cap');
});

test('M8 body-slot variant uses the existing plain Unique/Fixed authority (no weapon-family identity needed, matching precedent)', () => {
  const royalScale = getItem('uq_observed_royal_scale');
  assert.equal(royalScale.unique, true);
  assert.equal(royalScale.unique2IdentityId, undefined);
  assert.ok(royalScale.effects[0].power <= 0.58, 'guardNextAtkBuff must stay inside the shared safety cap');
  const fixed = fixedEquipmentIdentities(royalScale);
  assert.equal(fixed.length, 1);
  assert.equal(fixed[0].kind, FIXED_IDENTITY_KIND.UNIQUE);
});

test('M8 variants are obtainable through their designated Branch Stage dropTables, no new stage or discovery gate', () => {
  for (const [itemId, stageId] of [
    ['uq_observed_verdant_fang', 'observedbranch-tree-sovereign-2'],
    ['uq_observed_null_fang', 'observedbranch-deepgreen-absence-2'],
    ['uq_observed_royal_scale', 'observedbranch-flame-king-2'],
  ]) {
    const item = observedBranchEquipmentIIById(itemId);
    assert.equal(item.sourceStageId, stageId);
    const stage = buildObservedBranchStage(stageId);
    assert.ok(stage.dropTable.some(drop => drop.itemId === itemId), `${itemId} must appear in ${stageId}'s dropTable`);
  }
});

test('M8 surfaces "Variant of" as a read-only presentation line, only for items that carry it', () => {
  const p = equipment3Presentation(getItem('uq_observed_verdant_fang'));
  assert.equal(p.variantOfName, '狼王の逆咬み');
  const lines = equipment3SpecialLines(p);
  assert.ok(lines.some(l => l === '【Variant of】狼王の逆咬み'));
  const ordinary = equipment3Presentation(getItem('ch2_accessory'));
  assert.equal(ordinary.variantOfName, null);
  assert.ok(!equipment3SpecialLines(ordinary).some(l => l.startsWith('【Variant of】')));
});
