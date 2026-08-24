import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applySkillModifier, compatibleModifierIds, nextModifierId } from '../js/data/combat2SkillModifiers.js';

test('giant modifier trades efficiency for power without changing technique id', () => {
  const base = { id:'x', type:'damage', target:'enemy', power:4, mpCost:10, cooldownTurns:1 };
  const mod = applySkillModifier(base, 'giant');
  assert.equal(mod.id, 'x');
  assert.equal(mod.power, 5.8);
  assert.equal(mod.mpCost, 14);
  assert.equal(mod.cooldownTurns, 2);
});

test('split modifier turns eligible single-target damage into three random hits', () => {
  const base = { id:'x', type:'damage', target:'enemy', power:4, mpCost:8, cooldownTurns:0 };
  assert.ok(compatibleModifierIds(base).includes('split'));
  const mod = applySkillModifier(base, 'split');
  assert.equal(mod.target, 'randomEnemies');
  assert.equal(mod.hits, 3);
  assert.equal(mod.power, 2.2);
});

test('searing is only offered to fire damage techniques', () => {
  const fire = { id:'f', type:'damage', target:'enemy', power:3, element:'fire' };
  const ice = { id:'i', type:'damage', target:'enemy', power:3, element:'ice' };
  assert.ok(compatibleModifierIds(fire).includes('searing'));
  assert.ok(!compatibleModifierIds(ice).includes('searing'));
  assert.equal(applySkillModifier(fire, 'searing').dot.turns, 3);
});

test('modifier cycling stays inside compatible options', () => {
  const tech = { id:'x', type:'damage', target:'enemy', power:3, mpCost:5 };
  let id = 'none';
  for (let i = 0; i < 20; i++) {
    id = nextModifierId(tech, id);
    assert.ok(compatibleModifierIds(tech).includes(id));
  }
});

test('modifier runtime loads after weapon techniques and before UI use', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const weapon = main.indexOf("./patches/combat2WeaponTechniques.js");
  const modifier = main.indexOf("./patches/combat2SkillModifiers.js");
  const ui = main.indexOf("./patches/combat2SkillModifierUi.js");
  assert.ok(weapon > 0 && modifier > weapon && ui > modifier);
});
