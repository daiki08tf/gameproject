import test from 'node:test';
import assert from 'node:assert/strict';
import { fixedEquipmentIdentities, FIXED_IDENTITY_KIND } from '../js/data/equipmentFixedIdentity.js';
import { equipment3Presentation, equipment3SpecialLines } from '../js/data/equipment3Presentation.js';
import { optionFusionPreview } from '../js/data/options4Fusion.js';

test('Unique, Legendary and Curse are modeled as fixed identities outside random Options', () => {
  const item = {
    id: 'uq_test', name: '試作固有装備', unique: true, lore: '固定能力テスト',
    effects: [{ trigger: 'passive', kind: 'dmgBonusAdd', power: 0.2 }],
  };
  const inst = { legendaryEffectId: 'thunderheart', curseId: 'blood_contract' };
  const fixed = fixedEquipmentIdentities(item, inst);
  assert.equal(fixed.length, 3);
  assert.deepEqual(fixed.map(x => x.kind), [FIXED_IDENTITY_KIND.UNIQUE, FIXED_IDENTITY_KIND.LEGENDARY, FIXED_IDENTITY_KIND.CURSE]);
  for (const identity of fixed) {
    assert.equal(identity.consumesOptionSlot, false);
    assert.equal(identity.optionFusionEligible, false);
  }
});

test('only Legendary fixed identity is mutable through extract/imprint', () => {
  const item = { id: 'uq_test', name: '試作固有装備', unique: true, effects: [] };
  const fixed = fixedEquipmentIdentities(item, { legendaryEffectId: 'thunderheart', curseId: 'blood_contract' });
  const unique = fixed.find(x => x.kind === FIXED_IDENTITY_KIND.UNIQUE);
  const legendary = fixed.find(x => x.kind === FIXED_IDENTITY_KIND.LEGENDARY);
  const curse = fixed.find(x => x.kind === FIXED_IDENTITY_KIND.CURSE);
  assert.equal(unique.mutable, false);
  assert.equal(legendary.mutable, true);
  assert.equal(legendary.mutableBy, 'extract_imprint');
  assert.equal(curse.mutable, false);
});

test('presentation keeps fixed identity separate from the max-three Option array', () => {
  const item = { id: 'uq_test', name: '試作固有装備', unique: true, rarity: 'mythic', effects: [], lore: '固定能力テスト' };
  const affixes = [
    { id: 'atk_pct', familyId: 'atk_pct', rarity: 'rare', level: 10, xp: 0, roll: 5 },
    { id: 'def_pct', familyId: 'def_pct', rarity: 'rare', level: 10, xp: 0, roll: 5 },
    { id: 'hp_pct', familyId: 'hp_pct', rarity: 'rare', level: 10, xp: 0, roll: 5 },
  ];
  const p = equipment3Presentation(item, {
    itemPower: 1000,
    affixTier: 1,
    affixes,
    greaterAffixCount: 0,
    legendaryEffectId: 'thunderheart',
    curseId: 'blood_contract',
  });
  assert.equal(p.affixes.length, 3);
  assert.equal(p.fixedIdentities.length, 3);
  const lines = equipment3SpecialLines(p).join('\n');
  assert.match(lines, /【固有】/);
  assert.match(lines, /固定能力/);
  assert.match(lines, /呪印/);
});

test('fixed identities cannot masquerade as Option Fusion material', () => {
  const target = { id: 'atk_pct', familyId: 'atk_pct', rarity: 'rare', level: 1, xp: 0, roll: 1 };
  const fakeLegendary = { id: 'thunderheart', fixedIdentityKind: 'legendary', rarity: 'legendary', level: 1, xp: 0 };
  const preview = optionFusionPreview(target, fakeLegendary);
  assert.equal(preview.ok, false);
  assert.equal(preview.reason, 'family_mismatch');
});
