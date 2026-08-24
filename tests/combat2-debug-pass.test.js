import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COMBAT2_WEAPON_TECHNIQUES } from '../js/data/combat2WeaponTechniques.js';

test('execution weapon techniques use BattleEngine targetBonus schema', () => {
  const axe = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_axe_execution');
  const dagger = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_dagger_assassinate');
  for (const tech of [axe, dagger]) {
    assert.ok(tech);
    assert.equal(tech.targetLowHpBonus, undefined);
    assert.equal(tech.targetBonus?.when, 'lowHp');
    assert.ok(tech.targetBonus.hpThreshold > 0 && tech.targetBonus.hpThreshold < 1);
    assert.ok(tech.targetBonus.power > 0);
  }
});

test('random-target Combat 2.0 resolver preserves generic combat fields', () => {
  const src = fs.readFileSync(new URL('../js/patches/combat2DebugSafety.js', import.meta.url), 'utf8');
  for (const token of [
    'tech.armorPenBonus', 'tech.critBonus', 'tech.targetBonus', 'tech.weaken',
    'tech.dot', 'tech.selfBuff', '_mainDmgMult(kind)', 'tech.critFollowup',
  ]) assert.ok(src.includes(token), `missing random-target parity: ${token}`);
});

test('random-target status effects are once per touched target, not once per hit', () => {
  const src = fs.readFileSync(new URL('../js/patches/combat2DebugSafety.js', import.meta.url), 'utf8');
  assert.ok(src.includes('const touched = new Map()'));
  assert.ok(src.includes('for (const target of touched.values())'));
});

test('Combat 2.0 debug safety loads after modifier layers', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const modifiers = main.indexOf("./patches/combat2SkillModifiers.js");
  const safety = main.indexOf("./patches/combat2DebugSafety.js");
  assert.ok(modifiers > 0 && safety > modifiers);
});
