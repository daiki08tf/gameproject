import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COMBAT2_WEAPON_TECHNIQUES, weaponTechniquesFor } from '../js/data/combat2WeaponTechniques.js';

test('all eight weapon families receive three techniques', () => {
  const families = ['sword','axe','staff','bow','dagger','knuckle','instrument','rod'];
  assert.equal(COMBAT2_WEAPON_TECHNIQUES.length, 24);
  for (const family of families) {
    assert.equal(COMBAT2_WEAPON_TECHNIQUES.filter((t) => t.weaponType === family).length, 3);
  }
});

test('weapon techniques unlock progressively with Character Lv', () => {
  assert.equal(weaponTechniquesFor('sword', 1).length, 1);
  assert.equal(weaponTechniquesFor('sword', 100).length, 2);
  assert.equal(weaponTechniquesFor('sword', 350).length, 3);
  assert.equal(weaponTechniquesFor('sword', 99999).length, 3);
});

test('weapon technique ids are unique', () => {
  const ids = COMBAT2_WEAPON_TECHNIQUES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('weapon technique runtime loads after element core', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const element = main.indexOf("./patches/combat2ElementCore.js");
  const weapon = main.indexOf("./patches/combat2WeaponTechniques.js");
  assert.ok(element > 0 && weapon > element);
});
