import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COMPANION_SPECIES } from '../js/data/companions.js';
import {
  COMPANION_SKILLS,
  getCompanionSkill,
  unlockedCompanionSkills,
  chooseCompanionSkill,
} from '../js/data/companionSkills.js';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('all companion species skill references resolve', () => {
  for (const species of Object.values(COMPANION_SPECIES)) {
    for (const entry of species.skills || []) assert.ok(getCompanionSkill(entry.id), `${species.id}.${entry.id} must resolve`);
  }
});

test('skills unlock by level', () => {
  assert.deepEqual(unlockedCompanionSkills(COMPANION_SPECIES.slime, 1).map((s) => s.id), ['body_attack']);
  assert.deepEqual(unlockedCompanionSkills(COMPANION_SPECIES.slime, 8).map((s) => s.id), ['body_attack', 'slime_heal']);
  assert.ok(unlockedCompanionSkills(COMPANION_SPECIES.goblin, 10).some((s) => s.id === 'dirty_trick'));
  assert.ok(unlockedCompanionSkills(COMPANION_SPECIES.bat, 9).some((s) => s.id === 'sonic'));
});

test('healing skill wins priority at low HP', () => {
  const companion = { level: 8, hp: 20, maxHp: 100, mp: 10 };
  const chosen = chooseCompanionSkill(COMPANION_SPECIES.slime, companion, [{ hp: 100, maxHp: 100 }]);
  assert.equal(chosen.id, 'slime_heal');
});

test('skills respect MP availability', () => {
  const goblin = { level: 10, hp: 100, maxHp: 100, mp: 0 };
  const chosen = chooseCompanionSkill(COMPANION_SPECIES.goblin, goblin, [{ hp: 20, maxHp: 100 }]);
  assert.equal(chosen.id, 'club_hit');
});

test('skill definitions cover damage, heal, and debuff roles', () => {
  const types = new Set(Object.values(COMPANION_SKILLS).map((s) => s.type));
  assert.ok(types.has('damage'));assert.ok(types.has('heal'));assert.ok(types.has('debuff'));
});

test('battle patch executes skills through the shared skill engine', async () => {
  const text = await source('js/patches/companionBattle.js');
  assert.match(text, /chooseCompanionSkill\(species\s*,\s*c\s*,\s*engine\.aliveEnemies\)/,
    'battle AI must ask the shared engine for an action');
  assert.match(text, /skill\.type\s*===\s*'heal'/,
    'healing should be dispatched by skill type');
  assert.match(text, /executeOffensiveSkill\(engine\s*,\s*c\s*,\s*skill\)/,
    'damage and debuff skills should use the generic offensive dispatcher');
  assert.doesNotMatch(text, /speciesId\s*===\s*'slime'/,
    'battle code must not special-case slime behavior');
  assert.doesNotMatch(text, /canCompanionHeal/,
    'legacy species-specific healing branch should be removed');
});

test('sonic debuff has a finite duration and no permanent ATK mutation', async () => {
  const text = await source('js/patches/companionBattle.js');
  assert.match(text, /_companionAtkDebuffTurns/);
  assert.match(text, /const\s+originalAtk\s*=\s*enemy\.atk/);
  assert.match(text, /enemy\.atk\s*=\s*originalAtk/,
    'enemy base ATK must be restored after its action');
  assert.match(text, /delete\s+enemy\._companionAtkDebuffMult/,
    'temporary companion debuff must clean itself up');
});
