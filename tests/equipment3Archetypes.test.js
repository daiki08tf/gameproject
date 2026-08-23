import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  WEAPON_ARCHETYPES,
  WEAPON_ARCHETYPE_COUNT,
  archetypesForWeaponType,
  chooseArchetypeForItem,
} from '../js/data/equipment3Archetypes.js';

test('Equipment 3.0 defines three archetypes for each of the eight mastery families', () => {
  assert.equal(Object.keys(WEAPON_ARCHETYPES).length, 8);
  assert.equal(WEAPON_ARCHETYPE_COUNT, 24);
  for (const [family, archetypes] of Object.entries(WEAPON_ARCHETYPES)) {
    assert.equal(archetypes.length, 3, family);
    assert.equal(new Set(archetypes.map((a) => a.id)).size, 3);
    for (const archetype of archetypes) {
      assert.ok(archetype.name && archetype.identity);
      assert.ok(archetype.statMult || archetype.statAdd || archetype.effect);
    }
  }
});

test('archetype selection is deterministic while preserving the parent mastery family', () => {
  const item = { id: 'sword_example', weaponType: 'sword' };
  const a = chooseArchetypeForItem(item, 12);
  const b = chooseArchetypeForItem(item, 12);
  assert.deepEqual(a, b);
  assert.ok(archetypesForWeaponType('sword').some((x) => x.id === a.id));
  assert.equal(archetypesForWeaponType('unknown').length, 0);
});

test('archetype patch loads before weapon instance and loot metadata patches', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const archetype = main.indexOf("./patches/equipment3Archetypes.js");
  const instance = main.indexOf("./patches/weaponInstanceFoundation.js");
  const foundation = main.indexOf("./patches/equipment3Foundation.js");
  assert.ok(archetype >= 0 && instance > archetype && foundation > instance);
});

test('all archetype effects reuse established effect triggers and kinds', () => {
  for (const archetypes of Object.values(WEAPON_ARCHETYPES)) {
    for (const archetype of archetypes) {
      if (!archetype.effect) continue;
      assert.ok(['passive','onHit','onKill'].includes(archetype.effect.trigger));
      assert.ok(typeof archetype.effect.kind === 'string' && archetype.effect.kind.length > 0);
    }
  }
});
