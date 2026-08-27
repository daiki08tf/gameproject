import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  normalizeLootFilter3,
  smartLootReasons,
  shouldAutoLockEquipment,
} from '../js/data/equipment3SmartLoot.js';

const item = { id: 'gear_test', slot: 'body', rarity: 'mythic' };
const baseInst = {
  itemPower: 7000,
  greaterAffixCount: 0,
  legendaryEffectId: null,
  curseId: null,
  affixes: [],
};

function option(id, rarity, level, name = id) {
  return { id, familyId: id, rarity, level, roll: 1, name };
}

function protectionOnly(patch = {}) {
  return normalizeLootFilter3({
    autoLock: {
      legendary: false,
      cursed: false,
      minGreater: 0,
      minItemPower: 0,
      protectAncientOption: false,
      protectHighLevelOption: false,
      ...patch,
    },
  });
}

test('Phase 5B defaults protect only high-value Fusion material thresholds', () => {
  const filter = normalizeLootFilter3({});
  assert.equal(filter.autoLock.protectAncientOption, true);
  assert.equal(filter.autoLock.protectHighLevelOption, true);
  assert.equal(filter.autoLock.minOptionRarity, 'ancient');
  assert.equal(filter.autoLock.minOptionLevel, 80);

  const ordinary = { ...baseInst, affixes: [option('atk_pct', 'mythic', 79)] };
  assert.equal(shouldAutoLockEquipment(item, ordinary, filter), false);

  const ancient = { ...baseInst, affixes: [option('atk_pct', 'ancient', 1)] };
  assert.ok(smartLootReasons(item, ancient, filter).includes('Ancient Option'));

  const highLevel = { ...baseInst, affixes: [option('atk_pct', 'rare', 80)] };
  assert.ok(smartLootReasons(item, highLevel, filter).includes('Option Lv80'));
});

test('Ancient and Lv80+ protection can be disabled independently', () => {
  const ancientOnly = protectionOnly({ protectAncientOption: true });
  assert.equal(shouldAutoLockEquipment(item, { ...baseInst, affixes: [option('atk_pct', 'ancient', 1)] }, ancientOnly), true);
  assert.equal(shouldAutoLockEquipment(item, { ...baseInst, affixes: [option('atk_pct', 'rare', 100)] }, ancientOnly), false);

  const levelOnly = protectionOnly({ protectHighLevelOption: true });
  assert.equal(shouldAutoLockEquipment(item, { ...baseInst, affixes: [option('atk_pct', 'ancient', 1)] }, levelOnly), false);
  assert.equal(shouldAutoLockEquipment(item, { ...baseInst, affixes: [option('atk_pct', 'rare', 80)] }, levelOnly), true);
});

test('legacy protectFusionMaterials=false migrates to both split protections OFF', () => {
  const filter = normalizeLootFilter3({ autoLock: { protectFusionMaterials: false } });
  assert.equal(filter.autoLock.protectAncientOption, false);
  assert.equal(filter.autoLock.protectHighLevelOption, false);
  assert.equal(filter.autoLock.protectFusionMaterials, false);
});

test('legacy auto-lock Affix text migrates to player-facing Option text rule', () => {
  const filter = normalizeLootFilter3({ autoLock: { affixQuery: 'atk_pct' } });
  assert.equal(filter.autoLock.optionQuery, 'atk_pct');
  assert.equal(filter.autoLock.affixQuery, 'atk_pct');

  const inst = { ...baseInst, affixes: [option('atk_pct', 'rare', 1)] };
  const reasons = smartLootReasons(item, inst, protectionOnly({ optionQuery: 'atk_pct' }));
  assert.ok(reasons.includes('Option一致:atk_pct'));
});

test('Greater default remains 2+ and fixed identities use explicit player wording', () => {
  const filter = normalizeLootFilter3({});
  assert.equal(filter.autoLock.minGreater, 2);
  assert.ok(smartLootReasons(item, { ...baseInst, legendaryEffectId: 'power_test' }, filter).includes('Legendary Power'));
  assert.ok(smartLootReasons(item, { ...baseInst, curseId: 'curse_test' }, filter).includes('Curse'));
  assert.equal(shouldAutoLockEquipment(item, { ...baseInst, greaterAffixCount: 1 }, filter), false);
  assert.equal(shouldAutoLockEquipment(item, { ...baseInst, greaterAffixCount: 2 }, filter), true);
});

test('Phase 5B UI exposes compact protection rules and retires player-facing legacy labels', () => {
  const ui = fs.readFileSync(new URL('../js/patches/smartLoot4EquipmentUi.js', import.meta.url), 'utf8');
  assert.match(ui, /Legendary Power/);
  assert.match(ui, /Ancient Option/);
  assert.match(ui, /Option Lv80\+/);
  assert.match(ui, /Option文字一致/);
  assert.match(ui, /protectAncientOption/);
  assert.match(ui, /protectHighLevelOption/);
  assert.match(ui, /smartloot4-protection/);
});
