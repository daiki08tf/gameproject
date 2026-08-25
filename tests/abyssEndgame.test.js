import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  abyssRecommendedLevel,
  abyssTargetItemPower,
  abyssCombatScale,
  ABYSS_ENDGAME_MILESTONES,
} from '../js/data/abyssEndgame.js';
import { itemPowerForDrop, ITEM_POWER_MAX } from '../js/data/equipment3.js';
import { buildAbyssStage } from '../js/data/abyss.js';

test('Abyss roadmap spans Chapter 20 story end Lv3000 to Character Lv99999', () => {
  assert.equal(abyssRecommendedLevel(1), 3000);
  assert.equal(abyssRecommendedLevel(100), 9999);
  assert.equal(abyssRecommendedLevel(500), 29999);
  assert.equal(abyssRecommendedLevel(1000), 49999);
  assert.equal(abyssRecommendedLevel(2000), 74999);
  assert.equal(abyssRecommendedLevel(3000), 99999);
  assert.equal(abyssRecommendedLevel(9999), 99999);
});

test('Abyss Item Power spans IP3000 to IP10000 and never exceeds cap', () => {
  assert.equal(abyssTargetItemPower(1), 3000);
  assert.equal(abyssTargetItemPower(100), 4500);
  assert.equal(abyssTargetItemPower(500), 6500);
  assert.equal(abyssTargetItemPower(3000), ITEM_POWER_MAX);
  assert.equal(abyssTargetItemPower(99999), ITEM_POWER_MAX);
});

test('explicit endgame Item Power target is honored by drop generator', () => {
  const item = { id: 'ch15_weapon', slot: 'weapon', rarity: 'legendary' };
  const normal = itemPowerForDrop(item, { depth: 500, itemPowerTarget: 6500 }, 'drop-a');
  const boss = itemPowerForDrop(item, { depth: 500, itemPowerTarget: 6500, boss: true }, 'drop-a');
  assert.ok(normal >= 6200 && normal <= 6800);
  assert.ok(boss >= normal);
  assert.ok(boss <= ITEM_POWER_MAX);
});

test('Abyss stages expose recommended Lv, era and Item Power target', () => {
  const stage1 = buildAbyssStage(1);
  const stage500 = buildAbyssStage(500);
  const stage3000 = buildAbyssStage(3000);
  assert.equal(stage1.recLevel, 3000);
  assert.equal(stage1.itemPowerTarget, 3000);
  assert.equal(stage500.recLevel, 29999);
  assert.equal(stage500.itemPowerTarget, 6500);
  assert.equal(stage3000.recLevel, 99999);
  assert.equal(stage3000.itemPowerTarget, 10000);
  assert.ok(stage3000.abyssEra);
  assert.ok(stage3000.rewards.exp > 0);
});

test('combat scale is continuous, monotonic and continues slowly after level cap', () => {
  const d1 = abyssCombatScale(1);
  const d100 = abyssCombatScale(100);
  const d3000 = abyssCombatScale(3000);
  const d4000 = abyssCombatScale(4000);
  assert.equal(d1.hp, 1);
  assert.ok(d100.hp > d1.hp);
  assert.ok(d3000.hp > d100.hp);
  assert.ok(d4000.hp > d3000.hp);
  assert.equal(d4000.level, 99999);
});

test('Abyss generator is anchored to Chapter 20 and Lv3000 baseline', () => {
  const src = fs.readFileSync(new URL('../js/data/abyss.js', import.meta.url), 'utf8');
  assert.match(src, /ch20_boss/);
  assert.match(src, /s\.level\/3000/);
  assert.match(src, /level\/3000/);
});

test('roadmap milestones stay ordered and Abyss UI is windowed for thousands of floors', () => {
  for (let i = 1; i < ABYSS_ENDGAME_MILESTONES.length; i += 1) {
    assert.ok(ABYSS_ENDGAME_MILESTONES[i].depth > ABYSS_ENDGAME_MILESTONES[i - 1].depth);
    assert.ok(ABYSS_ENDGAME_MILESTONES[i].level >= ABYSS_ENDGAME_MILESTONES[i - 1].level);
    assert.ok(ABYSS_ENDGAME_MILESTONES[i].itemPower >= ABYSS_ENDGAME_MILESTONES[i - 1].itemPower);
  }
  const src = fs.readFileSync(new URL('../js/screens/abyss.js', import.meta.url), 'utf8');
  assert.match(src, /abyssVisibleDepths/);
  assert.match(src, /next - 39/);
  assert.match(src, /目標IP/);
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.match(main, /equipment3AbyssEndgame/);
});
