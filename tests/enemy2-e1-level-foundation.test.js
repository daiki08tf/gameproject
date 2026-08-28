import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ENEMY_LEVEL_MIN, ENEMY_LEVEL_MAX, clampEnemyLevel, stageEnemyBaseLevel, attachEnemyLevelMetadata } from '../js/data/enemyLevel.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { BattleEngine } from '../js/battleEngine.js';
import '../js/patches/enemy2LevelFoundation.js';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Enemy 2.0 E1: level contract clamps to Lv1–99,999', () => {
  assert.equal(clampEnemyLevel(-50), ENEMY_LEVEL_MIN);
  assert.equal(clampEnemyLevel(0), ENEMY_LEVEL_MIN);
  assert.equal(clampEnemyLevel(1), 1);
  assert.equal(clampEnemyLevel(1234.4), 1234);
  assert.equal(clampEnemyLevel(99999), ENEMY_LEVEL_MAX);
  assert.equal(clampEnemyLevel(150000), ENEMY_LEVEL_MAX);
});

test('Enemy 2.0 E1: stage recLevel is the initial anchor and Deep Survey cap stays valid', () => {
  assert.equal(stageEnemyBaseLevel({ recLevel: 10 }), 10);
  assert.equal(stageEnemyBaseLevel({ recLevel: 99999 }), 99999);
  assert.equal(stageEnemyBaseLevel({ recLevel: 150000 }), 99999);
  assert.equal(stageEnemyBaseLevel({ enemyLevelBase: 777, recLevel: 500 }), 777);
});

test('Enemy 2.0 E1: attaching metadata does not mutate combat/reward stats', () => {
  const enemy = { hp: 100, maxHp: 100, atk: 20, def: 10, spd: 30, xp: 40, gold: 50 };
  const before = { ...enemy };
  attachEnemyLevelMetadata(enemy, { recLevel: 1234 });
  assert.equal(enemy.level, 1234);
  assert.equal(enemy.baseLevel, 1234);
  for (const key of ['hp','maxHp','atk','def','spd','xp','gold']) assert.equal(enemy[key], before[key]);
});

test('Enemy 2.0 E1: actual BattleEngine spawn receives level metadata without stat rebalance', () => {
  const template = ENEMY_TYPES.grunt;
  const fakeEngine = { stage: { recLevel: 321, isAbyss: false }, _nextEnemyId: 0 };
  const enemy = BattleEngine.prototype._spawnEnemy.call(fakeEngine, 'grunt');
  assert.equal(enemy.level, 321);
  assert.equal(enemy.baseLevel, 321);
  assert.equal(enemy.hp, template.hp);
  assert.equal(enemy.atk, template.atk);
  assert.equal(enemy.def, template.def);
  assert.equal(enemy.spd, template.speed);
  assert.equal(enemy.xp, template.xp);
  assert.equal(enemy.gold, template.gold);
});

test('Enemy 2.0 E1: production battle runtime imports the level foundation', () => {
  const battle2 = read('js/patches/battle2RoadmapComplete.js');
  const main = read('js/main.js');
  assert.match(main, /\.\/patches\/battle2RoadmapComplete\.js/);
  assert.match(battle2, /\.\/enemy2LevelFoundation\.js/);
});

test('Enemy 2.0 E1: Text Battle exposes enemy level while E2 scaling remains absent', () => {
  const patch = read('js/patches/enemy2LevelFoundation.js');
  assert.match(patch, /Lv\.\$\{/);
  assert.match(patch, /attachEnemyLevelMetadata/);
  assert.doesNotMatch(patch, /enemy\.hp\s*[=*]|enemy\.atk\s*[=*]|enemy\.def\s*[=*]|enemy\.spd\s*[=*]|enemy\.xp\s*[=*]|enemy\.gold\s*[=*]/);
});
