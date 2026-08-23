import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  EQUIPMENT3_CRAFT_COST,
  costAffordable,
  greaterAffixCount,
  canGreaterAscendAffix,
  temperAffixValue,
  ascendAffixToGreater,
} from '../js/data/equipment3Crafting.js';

test('Blacksmith 3.0 reuses existing gold, essence, and manastone economies', () => {
  assert.deepEqual(Object.keys(EQUIPMENT3_CRAFT_COST.REROLL_AFFIX).sort(), ['essence', 'gold']);
  assert.deepEqual(Object.keys(EQUIPMENT3_CRAFT_COST.GREATER_ASCEND).sort(), ['essence', 'gold', 'manastone']);
  assert.equal(costAffordable({ gold: 999999, weaponEssence: 999, manastone: 999 }, EQUIPMENT3_CRAFT_COST.GREATER_ASCEND), true);
  assert.equal(costAffordable({ gold: 0, weaponEssence: 999, manastone: 999 }, EQUIPMENT3_CRAFT_COST.GREATER_ASCEND), false);
});

test('value tempering stays anchored to the original roll instead of ratcheting forever', () => {
  const first = temperAffixValue({ id: 'atk_pct', roll: 10 }, () => 1);
  assert.equal(first.temperBaseRoll, 10);
  assert.equal(first.roll, 11);
  const second = temperAffixValue(first, () => 0);
  assert.equal(second.temperBaseRoll, 10);
  assert.equal(second.roll, 9);
});

test('Greater tempering preserves the 1.5x Greater relationship', () => {
  const tempered = temperAffixValue({ id: 'atk_pct', roll: 15, baseRoll: 10, greater: true }, () => 1);
  assert.equal(tempered.baseRoll, 11);
  assert.equal(tempered.roll, 16.5);
});

test('forge ascension respects the existing three-Greater cap', () => {
  const affixes = [
    { id: 'a', roll: 10, greater: true },
    { id: 'b', roll: 10, greater: true },
    { id: 'c', roll: 10, greater: false },
  ];
  assert.equal(greaterAffixCount(affixes), 2);
  assert.equal(canGreaterAscendAffix(affixes, 2), true);
  const ascended = ascendAffixToGreater(affixes[2]);
  assert.equal(ascended.greater, true);
  assert.equal(ascended.forgedGreater, true);
  assert.equal(ascended.roll, 15);
  const capped = [affixes[0], affixes[1], ascended, { id: 'd', roll: 9 }];
  assert.equal(canGreaterAscendAffix(capped, 3), false);
});

test('Blacksmith 3.0 runtime loads after Legendary integration', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const legendary = main.indexOf("./patches/equipment3Legendary.js");
  const blacksmith = main.indexOf("./patches/equipment3Blacksmith.js");
  const resultVisibility = main.indexOf("./patches/weaponAffixResultVisibility.js");
  assert.ok(legendary >= 0 && blacksmith > legendary);
  assert.ok(resultVisibility > blacksmith);
});
