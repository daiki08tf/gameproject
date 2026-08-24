import test from 'node:test';
import assert from 'node:assert/strict';
import {
  affixQualityProgress,
  affixRarityDistributionForItemPower,
  applyItemPowerAffixQuality,
} from '../js/data/equipment3AffixQuality.js';

function highRarityChance(dist) {
  return (dist.legendary || 0) + (dist.mythic || 0) + (dist.ancient || 0);
}

test('base Affix quality rises monotonically from Abyss IP1000 to IP10000', () => {
  const checkpoints = [1000, 3000, 5000, 8000, 10000];
  const chances = checkpoints.map((ip) => highRarityChance(affixRarityDistributionForItemPower(ip)));
  for (let i = 1; i < chances.length; i += 1) {
    assert.ok(chances[i] > chances[i - 1], `expected IP${checkpoints[i]} > IP${checkpoints[i - 1]}`);
  }
});

test('IP10000 makes Ancient farmable without making it common', () => {
  const low = affixRarityDistributionForItemPower(1000);
  const cap = affixRarityDistributionForItemPower(10000);
  assert.ok(cap.ancient > low.ancient * 10);
  assert.ok(cap.ancient > 0.03);
  assert.ok(cap.ancient < 0.08);
  assert.ok(highRarityChance(cap) < 0.40);
});

test('premium sources nudge quality at the same Item Power', () => {
  const plain = affixQualityProgress(5000);
  const boss = affixQualityProgress(5000, { boss: true });
  const nemesis = affixQualityProgress(5000, { nemesis: true });
  assert.ok(boss > plain);
  assert.ok(nemesis > boss);
});

test('story and Abyss entry gear preserve the baseline rarity distribution', () => {
  assert.equal(affixQualityProgress(500), 0);
  assert.equal(affixQualityProgress(1000), 0);
  assert.deepEqual(
    affixRarityDistributionForItemPower(500),
    affixRarityDistributionForItemPower(1000),
  );
});

test('IP remap preserves Affix identity and Greater 1.5x roll relationship', () => {
  const plain = {
    itemPower: 10000,
    affixes: [{ id: 'atk_pct', rarity: 'common', roll: 3 }],
  };
  const greater = {
    itemPower: 10000,
    affixes: [{ id: 'atk_pct', rarity: 'common', roll: 4.5, greater: true }],
  };
  applyItemPowerAffixQuality(plain, {}, 'same#1');
  applyItemPowerAffixQuality(greater, {}, 'same#1');
  assert.equal(plain.affixes[0].id, 'atk_pct');
  assert.equal(greater.affixes[0].id, 'atk_pct');
  assert.equal(plain.affixes[0].rarity, greater.affixes[0].rarity);
  const expectedGreater = plain.affixes[0].roll * 1.5;
  assert.ok(Math.abs(greater.affixes[0].roll - expectedGreater) <= 0.011);
});
