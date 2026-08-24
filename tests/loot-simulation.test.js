import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSeededRandom,
  runLootSimulation,
  simulateLootCheckpoint,
} from '../scripts/loot-simulation.js';

test('loot simulator is deterministic for the same seed', () => {
  const a = simulateLootCheckpoint({ itemPower: 5000, samples: 10000, seed: 'fixed' });
  const b = simulateLootCheckpoint({ itemPower: 5000, samples: 10000, seed: 'fixed' });
  assert.deepEqual(a, b);
});

test('seeded RNG stays inside [0, 1)', () => {
  const random = createSeededRandom('range');
  for (let i = 0; i < 10000; i += 1) {
    const v = random();
    assert.ok(v >= 0 && v < 1);
  }
});

test('endgame checkpoints improve high-rarity and jackpot opportunity', () => {
  const rows = runLootSimulation({ samples: 50000, seed: 'progression-check' });
  const first = rows[0].observed;
  const last = rows.at(-1).observed;
  assert.ok(last.mythicPlusItem > first.mythicPlusItem);
  assert.ok(last.ancientItem > first.ancientItem);
  assert.ok(last.greater2 > first.greater2);
  assert.ok(last.legendaryEffect > first.legendaryEffect);
  assert.ok(last.godRoll > first.godRoll);
});

test('IP10000 jackpot remains rare even for representative Legendary gear', () => {
  const row = simulateLootCheckpoint({ itemPower: 10000, samples: 100000, seed: 'jackpot-cap' });
  assert.ok(row.observed.jackpotRoll > 0);
  assert.ok(row.observed.jackpotRoll < 0.02);
  assert.ok(row.observed.godRoll < 0.15);
});

test('Nemesis source is richer than normal source at the same IP', () => {
  const normal = simulateLootCheckpoint({ itemPower: 5000, samples: 50000, seed: 'source', source: 'normal' });
  const nemesis = simulateLootCheckpoint({ itemPower: 5000, samples: 50000, seed: 'source', source: 'nemesis' });
  assert.ok(nemesis.observed.greater2 > normal.observed.greater2);
  assert.ok(nemesis.observed.legendaryEffect > normal.observed.legendaryEffect);
  assert.ok(nemesis.observed.godRoll > normal.observed.godRoll);
});
