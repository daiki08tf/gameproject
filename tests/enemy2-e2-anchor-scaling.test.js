import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ENEMY_LEVEL_BANDS,
  rollEnemyLevel,
  attachEnemyLevelMetadata,
  applyEnemyLevelScaling,
} from '../js/data/enemyLevel.js';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function baseEnemy() {
  return { hp: 1000, maxHp: 1000, atk: 200, def: 100, spd: 100, xp: 500, gold: 300, boss: false };
}

test('Enemy 2.0 E2: ordinary level roll is bounded at 92–108% of stage anchor', () => {
  const stage = { recLevel: 1000 };
  assert.equal(rollEnemyLevel(stage, { boss: false }, () => 0), 920);
  assert.equal(rollEnemyLevel(stage, { boss: false }, () => 0.5), 1000);
  assert.equal(rollEnemyLevel(stage, { boss: false }, () => 1), 1080);
  assert.deepEqual(ENEMY_LEVEL_BANDS.ordinary, { min: 0.92, max: 1.08 });
});

test('Enemy 2.0 E2: bosses remain authored at the stage anchor', () => {
  const stage = { recLevel: 4321 };
  assert.equal(rollEnemyLevel(stage, { boss: true }, () => 0), 4321);
  assert.equal(rollEnemyLevel(stage, { boss: true }, () => 1), 4321);
});

test('Enemy 2.0 E2: anchor level preserves every E0 combat/reward stat exactly', () => {
  const enemy = baseEnemy();
  const before = { ...enemy };
  attachEnemyLevelMetadata(enemy, { recLevel: 1000 }, 1000);
  applyEnemyLevelScaling(enemy);
  for (const key of ['hp','maxHp','atk','def','spd','xp','gold']) assert.equal(enemy[key], before[key]);
});

test('Enemy 2.0 E2: higher/lower ordinary levels move stats monotonically without changing identity', () => {
  const low = baseEnemy();
  const high = baseEnemy();
  attachEnemyLevelMetadata(low, { recLevel: 1000 }, 920);
  attachEnemyLevelMetadata(high, { recLevel: 1000 }, 1080);
  applyEnemyLevelScaling(low);
  applyEnemyLevelScaling(high);

  for (const key of ['hp','atk','def','spd','xp','gold']) {
    assert.ok(low[key] <= baseEnemy()[key], `low ${key} should not exceed anchor`);
    assert.ok(high[key] >= baseEnemy()[key], `high ${key} should not fall below anchor`);
  }
  assert.equal(low.boss, false);
  assert.equal(high.boss, false);
});

test('Enemy 2.0 E2: Lv99,999 cap cannot create an above-cap Deep Survey roll', () => {
  const stage = { recLevel: 99999 };
  for (const r of [0, 0.25, 0.5, 0.75, 1]) {
    const level = rollEnemyLevel(stage, { boss: false }, () => r);
    assert.ok(level >= 1 && level <= 99999);
  }
});

test('Enemy 2.0 E2: production import order is metadata then scaling, while fixed waves remain untouched', () => {
  const battle2 = read('js/patches/battle2RoadmapComplete.js');
  const stages = read('js/data/stages.js');
  const foundationAt = battle2.indexOf("import './enemy2LevelFoundation.js'");
  const scalingAt = battle2.indexOf("import './enemy2LevelScaling.js'");
  assert.ok(foundationAt >= 0 && scalingAt > foundationAt);
  assert.match(stages, /waves:/);
  assert.doesNotMatch(read('js/patches/enemy2LevelScaling.js'), /dropTable|addAbyssShards|itemPower|currency/i);
});
