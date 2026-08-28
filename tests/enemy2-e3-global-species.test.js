import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import {
  GLOBAL_ENEMY_SPECIES,
  globalEnemySpecies,
  globalSpeciesForHabitat,
  globalSpeciesAnchorRole,
  materializeGlobalSpecies,
} from '../js/data/globalEnemySpecies.js';

const anchorByRole = {
  normal: ENEMY_TYPES.grunt,
  fast: ENEMY_TYPES.fast,
  tank: ENEMY_TYPES.tank,
};

test('Enemy 2.0 E3: canonical Global Species catalog contains twelve stable identities', () => {
  assert.equal(GLOBAL_ENEMY_SPECIES.length, 12);
  const ids = GLOBAL_ENEMY_SPECIES.map(s => s.speciesId);
  assert.equal(new Set(ids).size, ids.length);
  for (const species of GLOBAL_ENEMY_SPECIES) {
    assert.match(species.speciesId, /^[a-z0-9_]+$/);
    assert.ok(species.name.length > 0);
    assert.ok(['normal','fast','tank','attacker','caster','trickster','support'].includes(species.role));
    assert.ok(Array.isArray(species.habitats) && species.habitats.length > 0);
    assert.ok(species.spawnWeight > 0);
  }
});

test('Enemy 2.0 E3: slime is a true-global reference species', () => {
  const slime = globalEnemySpecies('slime');
  assert.ok(slime);
  assert.equal(slime.name, 'スライム');
  assert.equal(slime.trueGlobal, true);
  assert.ok(slime.habitats.includes('any'));
  for (const habitat of ['plain','forest','volcanic','dark','unknown-future-region']) {
    assert.ok(globalSpeciesForHabitat(habitat).some(s => s.speciesId === 'slime'));
  }
});

test('Enemy 2.0 E3: non-true-global species remain habitat-aware', () => {
  assert.ok(globalSpeciesForHabitat('cave').some(s => s.speciesId === 'bat'));
  assert.ok(globalSpeciesForHabitat('forest').some(s => s.speciesId === 'wolf'));
  assert.ok(globalSpeciesForHabitat('treasure').some(s => s.speciesId === 'mimic'));
  assert.ok(!globalSpeciesForHabitat('snow').some(s => s.speciesId === 'mimic'));
});

test('Enemy 2.0 E3: every species can materialize from an existing role anchor without Boss/Elite leakage', () => {
  for (const species of GLOBAL_ENEMY_SPECIES) {
    const anchorRole = globalSpeciesAnchorRole(species);
    const anchor = anchorByRole[anchorRole];
    assert.ok(anchor, `${species.speciesId} missing anchor for ${anchorRole}`);
    const enemy = materializeGlobalSpecies(species.speciesId, anchor);
    assert.ok(enemy);
    assert.equal(enemy.speciesId, species.speciesId);
    assert.equal(enemy.role, species.role);
    assert.equal(enemy.globalSpecies, true);
    assert.equal(enemy.boss, false);
    assert.equal(enemy.elite, false);
    for (const stat of ['hp','atk','def','speed','xp','gold']) assert.ok(Number.isFinite(enemy[stat]));
  }
});

test('Enemy 2.0 E3: story fixed waves are not migrated to Global Species yet', () => {
  const waveTypes = CHAPTERS.flatMap(ch => ch.stages.flatMap(stage => (stage.waves || []).map(w => w.type)));
  assert.ok(waveTypes.length > 0);
  assert.ok(waveTypes.every(type => !String(type).startsWith('global_')));
});
