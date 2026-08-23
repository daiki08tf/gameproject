import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GREATER_AFFIX_MULT,
  GREATER_AFFIX_MAX_PER_ITEM,
  greaterAffixChance,
  applyGreaterAffixes,
} from '../js/data/equipment3Greater.js';

test('Greater Affix chance rises through endgame Item Power bands', () => {
  assert.equal(greaterAffixChance(500), 0);
  assert.ok(greaterAffixChance(1000) > 0);
  assert.ok(greaterAffixChance(5000) > greaterAffixChance(1000));
  assert.ok(greaterAffixChance(10000) > greaterAffixChance(5000));
  assert.ok(greaterAffixChance(10000, { nemesis: true, ex: true, boss: true }) <= 0.30);
});

test('Greater Affix multiplier and per-item cap stay bounded', () => {
  assert.equal(GREATER_AFFIX_MULT, 1.5);
  assert.equal(GREATER_AFFIX_MAX_PER_ITEM, 3);
});

test('Greater evaluation is deterministic and never double-multiplies', () => {
  const source = [
    { id: 'atk_pct', rarity: 'ancient', roll: 20 },
    { id: 'crit_pct', rarity: 'ancient', roll: 10 },
    { id: 'dmg_boss', rarity: 'ancient', roll: 12 },
    { id: 'lifesteal', rarity: 'ancient', roll: 8 },
    { id: 'cdr_pct', rarity: 'ancient', roll: 5 },
  ];
  const first = applyGreaterAffixes(source, 10000, { nemesis: true, ex: true, boss: true }, 'test#999');
  const second = applyGreaterAffixes(first.affixes, 10000, { nemesis: true, ex: true, boss: true }, 'test#999');
  assert.deepEqual(second.affixes, first.affixes);
  assert.ok(first.greaterCount <= GREATER_AFFIX_MAX_PER_ITEM);
  for (const affix of first.affixes.filter((a) => a.greater)) {
    assert.equal(affix.roll, Math.round(affix.baseRoll * GREATER_AFFIX_MULT * 100) / 100);
  }
});

test('Greater runtime patch loads after Equipment 3.0 foundation', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const foundation = main.indexOf("./patches/equipment3Foundation.js");
  const greater = main.indexOf("./patches/equipment3Greater.js");
  const resultVisibility = main.indexOf("./patches/weaponAffixResultVisibility.js");
  assert.ok(foundation >= 0 && greater > foundation && resultVisibility > greater);
});
