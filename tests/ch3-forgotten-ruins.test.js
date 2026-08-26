import test from 'node:test';
import assert from 'node:assert/strict';
import { findStage } from '../js/data/stages.js';
import { buildBattleGroups, battleGroupEnemyCount, BATTLE_GROUP_MAX_ENEMIES } from '../js/data/battleGroups.js';
import { enemyCombatProfile } from '../js/data/enemyCombat3.js';

test('Forgotten Ruins deepest room stays within an early-game battle load', () => {
  const found = findStage('3-4');
  assert.ok(found?.stage, 'stage 3-4 should exist');
  const groups = buildBattleGroups(found.stage);
  assert.equal(battleGroupEnemyCount(groups), 10);
  for (const group of groups) {
    const count = group.enemies.reduce((sum, enemy) => sum + enemy.count, 0);
    assert.ok(count <= BATTLE_GROUP_MAX_ENEMIES, `${group.id} exceeds group cap`);
  }
});

test('Chapter 3 stone wall cannot sustain an early-game near-lock', () => {
  const skill = enemyCombatProfile('ch3_tank').skill;
  assert.equal(skill.kind, 'guardAll');
  assert.ok(skill.defPct <= 0.20, 'stone wall DEF buff is too strong');
  assert.ok(skill.chance <= 0.25, 'stone wall trigger rate is too high');
});
