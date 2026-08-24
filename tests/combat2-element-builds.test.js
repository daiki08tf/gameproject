import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { AFFIXES } from '../js/data/affixes.js';
import '../js/patches/combat2ElementAffixes.js';
import { elementDamageBonus } from '../js/patches/combat2ElementBuilds.js';

test('six elemental Affixes are registered into Equipment 3.0 pool', () => {
  for (const id of ['element_fire_dmg','element_ice_dmg','element_lightning_dmg','element_wind_dmg','element_light_dmg','element_dark_dmg']) {
    assert.ok(AFFIXES[id]);
    assert.equal(AFFIXES[id].effect(10).kind, 'elementDmg');
  }
});

test('element build bonus only applies to matching element and is capped', () => {
  const effects = [
    { kind:'elementDmg', element:'fire', power:0.30 },
    { kind:'elementDmg', element:'fire', power:0.60 },
    { kind:'elementDmg', element:'ice', power:0.50 },
  ];
  assert.equal(elementDamageBonus(effects, 'fire'), 0.75);
  assert.equal(elementDamageBonus(effects, 'ice'), 0.50);
  assert.equal(elementDamageBonus(effects, 'dark'), 0);
});

test('element Affixes load before combat build damage and before item use', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const affix = main.indexOf("./patches/combat2ElementAffixes.js");
  const core = main.indexOf("./patches/combat2ElementCore.js");
  const build = main.indexOf("./patches/combat2ElementBuilds.js");
  assert.ok(affix > 0 && core > affix && build > core);
});
