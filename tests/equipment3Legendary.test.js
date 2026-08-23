import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LEGENDARY_EFFECTS,
  CURSED_AFFIXES,
  legendaryEffectChance,
  cursedAffixChance,
  rollLegendaryPackage,
} from '../js/data/equipment3Legendary.js';

test('Legendary effects are build-defining existing-effect packages', () => {
  assert.ok(Object.keys(LEGENDARY_EFFECTS).length >= 6);
  for (const def of Object.values(LEGENDARY_EFFECTS)) {
    assert.ok(def.name && def.desc);
    assert.ok(Array.isArray(def.effects) && def.effects.length > 0);
    for (const effect of def.effects) assert.ok(effect.trigger && effect.kind);
  }
});

test('Cursed Affixes always pair an upside with a stat penalty', () => {
  assert.ok(Object.keys(CURSED_AFFIXES).length >= 3);
  for (const curse of Object.values(CURSED_AFFIXES)) {
    assert.ok(curse.name && curse.desc);
    assert.ok(Object.values(curse.statMult).some((v) => v < 1));
    assert.ok(Array.isArray(curse.effects) && curse.effects.length > 0);
  }
});

test('Legendary and curse chances respect rarity and endgame sources', () => {
  const legendary = { rarity: 'legendary' };
  const mythic = { rarity: 'mythic' };
  assert.equal(legendaryEffectChance({ rarity: 'rare' }, 10000), 0);
  assert.ok(legendaryEffectChance(mythic, 8000) > legendaryEffectChance(legendary, 800));
  assert.ok(legendaryEffectChance(mythic, 8000, { nemesis: true }) > legendaryEffectChance(mythic, 8000));
  assert.ok(cursedAffixChance(mythic, 8000, { ex: true }) > cursedAffixChance(legendary, 800));
});

test('Legendary package rolls are deterministic for a weapon instance', () => {
  const item = { rarity: 'mythic' };
  const ctx = { nemesis: true, ex: true, boss: true };
  const a = rollLegendaryPackage(item, 10000, ctx, 'weapon#4242');
  const b = rollLegendaryPackage(item, 10000, ctx, 'weapon#4242');
  assert.deepEqual(a, b);
});

test('Legendary runtime loads after Greater Affix and before result visibility', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const greater = main.indexOf("./patches/equipment3Greater.js");
  const legendary = main.indexOf("./patches/equipment3Legendary.js");
  const result = main.indexOf("./patches/weaponAffixResultVisibility.js");
  assert.ok(greater >= 0 && legendary > greater && result > legendary);
});
