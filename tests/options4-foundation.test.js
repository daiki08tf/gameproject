import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPTION_LEVEL_MIN,
  OPTION_LEVEL_MAX,
  OPTION_RARITY,
  OPTION_COUNT_BY_EQUIPMENT_RARITY,
  optionCountRange,
  optionDisplayName,
  optionFromAffix,
  isOption4,
  optionMaterialEfficiency,
} from '../js/data/options4.js';

test('Option 4.0 fixes the approved level and rarity axes', () => {
  assert.equal(OPTION_LEVEL_MIN, 1);
  assert.equal(OPTION_LEVEL_MAX, 100);
  assert.deepEqual(OPTION_RARITY, ['common','uncommon','rare','epic','legendary','mythic','ancient']);
});

test('random Option count never exceeds three', () => {
  assert.deepEqual(OPTION_COUNT_BY_EQUIPMENT_RARITY.normal, [0, 1]);
  assert.deepEqual(OPTION_COUNT_BY_EQUIPMENT_RARITY.rare, [1, 1]);
  assert.deepEqual(OPTION_COUNT_BY_EQUIPMENT_RARITY.epic, [1, 2]);
  assert.deepEqual(OPTION_COUNT_BY_EQUIPMENT_RARITY.legendary, [2, 3]);
  assert.deepEqual(OPTION_COUNT_BY_EQUIPMENT_RARITY.mythic, [3, 3]);
  for (const rarity of Object.keys(OPTION_COUNT_BY_EQUIPMENT_RARITY)) {
    assert.ok(optionCountRange(rarity)[1] <= 3, rarity);
  }
});

test('ATK family exposes authored rarity names', () => {
  assert.equal(optionDisplayName('atk_pct', 'common', '剛力'), '怪力');
  assert.equal(optionDisplayName('atk_pct', 'legendary', '剛力'), '覇力');
  assert.equal(optionDisplayName('atk_pct', 'ancient', '剛力'), '天威');
  assert.equal(optionDisplayName('unknown_family', 'ancient', '既存名'), '既存名');
});

test('legacy Affix can be viewed as Option 4.0 without losing roll', () => {
  const legacy = { id: 'atk_pct', rarity: 'legendary', roll: 15.5 };
  const option = optionFromAffix(legacy, { level: 1 });
  assert.equal(option.familyId, 'atk_pct');
  assert.equal(option.level, 1);
  assert.equal(option.roll, 15.5);
  assert.equal(isOption4(option), true);
});

test('same-family fusion keeps low rarity materials useful at reduced efficiency', () => {
  assert.equal(optionMaterialEfficiency('legendary', 'legendary'), 1);
  assert.equal(optionMaterialEfficiency('legendary', 'mythic'), 1);
  assert.equal(optionMaterialEfficiency('legendary', 'epic'), 0.8);
  assert.equal(optionMaterialEfficiency('legendary', 'rare'), 0.6);
  assert.equal(optionMaterialEfficiency('legendary', 'uncommon'), 0.4);
  assert.equal(optionMaterialEfficiency('legendary', 'common'), 0.2);
});
