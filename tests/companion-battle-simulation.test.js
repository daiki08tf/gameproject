import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPANION_SPECIES, companionStats } from '../js/data/companions.js';
import { defMitigationPct } from '../js/data/combatStats.js';
import { chooseCompanionSkill } from '../js/data/companionSkills.js';

function makeCompanion(speciesId, level = 10, nature = 'balanced') {
  const species = COMPANION_SPECIES[speciesId];
  const stats = companionStats(species, { level, nature, talent: {} });
  return { species, level, nature, hp: stats.hp, maxHp: stats.hp, mp: stats.mp, ...stats };
}

function resolveOneTurn(companion, enemy) {
  const skill = chooseCompanionSkill(companion.species, companion, [enemy]);
  assert.ok(skill, 'a companion should have an available action');
  if ((skill.mpCost || 0) > 0) companion.mp -= skill.mpCost;
  if (skill.type === 'heal') {
    const amount = Math.max(1, Math.round(companion.maxHp * (skill.maxHpPct || 0) + companion.mag * (skill.power || 0)));
    companion.hp = Math.min(companion.maxHp, companion.hp + amount);
    return { type: 'heal', amount };
  }
  const stat = skill.stat === 'mag' ? companion.mag : companion.atk;
  const damage = Math.max(1, Math.round(stat * (skill.power || 1) * (1 - defMitigationPct(enemy.def || 0))));
  enemy.hp = Math.max(0, enemy.hp - damage);
  if (skill.debuff?.kind === 'weakenAtk') enemy.atkMult = 1 - skill.debuff.power;
  return { type: skill.type, damage };
}

test('100 deterministic-style companion encounters terminate without invalid numbers', () => {
  const speciesIds = ['slime', 'goblin', 'bat'];
  for (let i = 0; i < 100; i++) {
    const companion = makeCompanion(speciesIds[i % speciesIds.length], 10 + (i % 10));
    const enemy = { hp: 80 + i, maxHp: 80 + i, atk: 10 + (i % 6), def: 8 + (i % 15), atkMult: 1 };
    let turns = 0;
    while (enemy.hp > 0 && turns < 100) {
      const out = resolveOneTurn(companion, enemy);
      assert.ok(Number.isFinite(companion.hp) && Number.isFinite(companion.mp));
      if ('damage' in out) assert.ok(Number.isFinite(out.damage) && out.damage >= 1);
      turns++;
    }
    assert.ok(enemy.hp <= 0, `encounter ${i} should terminate`);
    assert.ok(turns < 100, `encounter ${i} should not loop forever`);
  }
});

test('low HP slime spends MP and heals through the same skill model', () => {
  const slime = makeCompanion('slime', 10);
  slime.hp = Math.floor(slime.maxHp * 0.3);
  const beforeHp = slime.hp;
  const beforeMp = slime.mp;
  const out = resolveOneTurn(slime, { hp: 100, maxHp: 100, atk: 10, def: 10 });
  assert.equal(out.type, 'heal');
  assert.ok(slime.hp > beforeHp);
  assert.ok(slime.mp < beforeMp);
});
