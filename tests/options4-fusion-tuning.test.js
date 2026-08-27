import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPTION_MILESTONES,
  optionXpBetween,
  optionMaterialXp,
  optionMilestoneState,
  optionMilestonesCrossed,
  optionFusionPreview,
} from '../js/data/options4Fusion.js';
import {
  DEFAULT_LOOT_FILTER_3,
  normalizeLootFilter3,
  smartLootReasons,
} from '../js/data/equipment3SmartLoot.js';

function option(id, rarity, level, xp = 0) {
  return { id, familyId: id, rarity, level, xp, roll: 1, optionSchemaVersion: 1 };
}

test('Phase 2C keeps Lv100 a long chase while milestone totals are deterministic', () => {
  assert.deepEqual(OPTION_MILESTONES, [25, 50, 75, 100]);
  const total = optionXpBetween(1, 100);
  assert.ok(total > 60000 && total < 65000, `unexpected total XP ${total}`);
  assert.ok(optionXpBetween(75, 100) > optionXpBetween(1, 25));
});

test('material tuning makes same-rarity drops meaningful without making low rarity equal to chase rarity', () => {
  const target = option('atk_pct', 'ancient', 50);
  const common = option('atk_pct', 'common', 50);
  const ancient = option('atk_pct', 'ancient', 50);
  const commonXp = optionMaterialXp(target, common);
  const ancientXp = optionMaterialXp(target, ancient);
  assert.ok(commonXp > 0, 'low rarity material must always be useful');
  assert.ok(ancientXp >= commonXp * 20, 'ancient matching material should remain dramatically better than common material');
  assert.ok(ancientXp >= 350, `same-rarity ancient material should feel meaningful, got ${ancientXp}`);
});

test('Fusion preview reports milestone crossings and MASTER state', () => {
  const target = option('def_pct', 'legendary', 24, 0);
  const material = option('def_pct', 'ancient', 90);
  const preview = optionFusionPreview(target, material);
  assert.equal(preview.ok, true);
  assert.ok(preview.afterLevel >= 25);
  assert.ok(preview.milestones.includes(25));
  assert.deepEqual(optionMilestonesCrossed(49, 76), [50, 75]);
  assert.equal(optionMilestoneState(100).mastered, true);
  assert.equal(optionMilestoneState(100).label, 'MASTER');
});

test('Smart Loot protects only genuinely valuable Fusion materials by default and works on armor too', () => {
  const filter = normalizeLootFilter3(DEFAULT_LOOT_FILTER_3);
  assert.equal(filter.autoLock.protectFusionMaterials, true);
  assert.equal(filter.autoLock.minOptionRarity, 'ancient');
  assert.equal(filter.autoLock.minOptionLevel, 80);

  const armor = { id: 'armor_test', slot: 'body', rarity: 'legendary' };
  const ancientInst = { affixes: [option('hp_pct', 'ancient', 40)] };
  const highLevelInst = { affixes: [option('hp_pct', 'rare', 82)] };
  const ordinaryInst = { affixes: [option('hp_pct', 'rare', 45)] };

  // Phase 5B renamed these player-facing reasons from the old `Fusion素材:${rarity|level}`
  // wording to explicit `Ancient Option` / `Option Lv${n}` labels (see
  // tests/gear-overhaul-phase5b-protection.test.js). Assert on the new wording.
  assert.ok(smartLootReasons(armor, ancientInst, filter).includes('Ancient Option'));
  assert.ok(smartLootReasons(armor, highLevelInst, filter).some((r) => r.startsWith('Option Lv')));
  assert.deepEqual(smartLootReasons(armor, ordinaryInst, filter), []);
});
