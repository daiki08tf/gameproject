import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateLootCheckpoint } from '../scripts/loot-simulation.js';

test('build-target simulation is deterministic for the same seed', () => {
  const options = {
    itemPower: 8000,
    samples: 20000,
    targetWeaponType: 'sword',
    targetArchetype: true,
    requiredAffixes: ['crit_pct', 'crit_damage_pct'],
    seed: 'same-seed',
  };
  assert.deepEqual(simulateLootCheckpoint(options), simulateLootCheckpoint(options));
});

test('exact weapon family and archetype make the target rarer than unrestricted loot', () => {
  const base = simulateLootCheckpoint({ itemPower: 8000, samples: 50000, seed: 'target-rarity' });
  const targeted = simulateLootCheckpoint({
    itemPower: 8000,
    samples: 50000,
    targetWeaponType: 'sword',
    targetArchetype: true,
    seed: 'target-rarity',
  });
  assert.equal(base.observed.buildTarget, 1);
  assert.ok(targeted.observed.buildTarget < 0.06);
  assert.ok(targeted.observed.buildTarget > 0.02);
});

test('requiring multiple affixes sharply reduces true build completion odds', () => {
  const loose = simulateLootCheckpoint({
    itemPower: 10000,
    samples: 100000,
    targetWeaponType: 'sword',
    targetArchetype: true,
    requiredAffixes: ['crit_pct'],
    seed: 'affix-targets',
  });
  const strict = simulateLootCheckpoint({
    itemPower: 10000,
    samples: 100000,
    targetWeaponType: 'sword',
    targetArchetype: true,
    requiredAffixes: ['crit_pct', 'crit_damage_pct'],
    seed: 'affix-targets',
  });
  assert.ok(strict.observed.buildTarget < loose.observed.buildTarget);
  assert.ok(strict.observed.trueGodRoll <= strict.observed.buildTarget);
});

test('unknown Affix ids are ignored rather than making impossible targets', () => {
  const row = simulateLootCheckpoint({
    itemPower: 5000,
    samples: 1000,
    requiredAffixes: ['not_a_real_affix'],
  });
  assert.deepEqual(row.targeting.requiredAffixes, []);
  assert.equal(row.observed.affixPackage, 1);
});
