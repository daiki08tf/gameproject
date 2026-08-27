import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  WEAPON_FAMILY_IDENTITIES,
  WEAPON_ARCHETYPE_TECHNIQUE_PROFILES,
  WEAPON_IDENTITY_FAMILY_COUNT,
  WEAPON_IDENTITY_ARCHETYPE_COUNT,
} from '../js/data/weaponIdentity.js';
import { WEAPON_ARCHETYPES } from '../js/data/equipment3Archetypes.js';
import {
  COMBAT2_WEAPON_TECHNIQUES,
  specializeWeaponTechnique,
  weaponTechniquesFor,
} from '../js/data/combat2WeaponTechniques.js';

const FAMILIES = ['sword','axe','staff','bow','dagger','knuckle','instrument','rod'];

test('Phase 6A defines one combat identity for all 8 families and all 24 existing archetypes', () => {
  assert.equal(WEAPON_IDENTITY_FAMILY_COUNT, 8);
  assert.equal(WEAPON_IDENTITY_ARCHETYPE_COUNT, 24);
  assert.deepEqual(Object.keys(WEAPON_FAMILY_IDENTITIES).sort(), [...FAMILIES].sort());

  for (const [family, archetypes] of Object.entries(WEAPON_ARCHETYPES)) {
    assert.equal(archetypes.length, 3);
    for (const archetype of archetypes) {
      const profile = WEAPON_ARCHETYPE_TECHNIQUE_PROFILES[archetype.id];
      assert.ok(profile, `${family}/${archetype.id}`);
      assert.equal(profile.family, family);
      assert.ok(profile.specialty);
    }
  }
});

test('Phase 6A specializes techniques without mutating canonical definitions', () => {
  const base = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_sword_iaigiri');
  const original = { ...base };
  const katana = specializeWeaponTechnique(base, 'katana');
  assert.notEqual(katana, base);
  assert.equal(katana.weaponArchetypeId, 'katana');
  assert.equal(katana.critBonus, 32);
  assert.ok(katana.power > base.power);
  assert.deepEqual({ ...base }, original);
});

test('rapid-hit archetypes gain proc opportunities without receiving free huge raw packet damage', () => {
  const base = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_dagger_twinstab');
  const twin = specializeWeaponTechnique(base, 'twinblade');
  assert.equal(base.hits, 2);
  assert.equal(twin.hits, 3);
  const basePacket = base.hits * base.power;
  const twinPacket = twin.hits * twin.power;
  assert.ok(twinPacket >= basePacket);
  assert.ok(twinPacket <= basePacket * 1.05);
});

test('heavy, resource, penetration and execution archetypes produce distinct combat loops', () => {
  const sword = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_sword_double');
  const greatsword = specializeWeaponTechnique(sword, 'greatsword');
  assert.ok(greatsword.power > sword.power);
  assert.ok(greatsword.mpCost >= sword.mpCost);

  const nova = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_staff_nova');
  const grimoire = specializeWeaponTechnique(nova, 'grimoire');
  assert.ok(grimoire.mpCost < nova.mpCost);

  const pierce = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_bow_pierce');
  const crossbow = specializeWeaponTechnique(pierce, 'crossbow');
  assert.ok(crossbow.armorPenBonus > pierce.armorPenBonus);

  const crush = COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === 'wtech_axe_crush');
  const greataxe = specializeWeaponTechnique(crush, 'greataxe');
  assert.equal(greataxe.targetBonus.when, 'lowHp');
  assert.ok(greataxe.targetBonus.power > 1);
});

test('weaponTechniquesFor stays backward compatible without an archetype and specializes with one', () => {
  const legacy = weaponTechniquesFor('bow', 99999);
  const shortbow = weaponTechniquesFor('bow', 99999, 'shortbow');
  assert.equal(legacy.length, 3);
  assert.equal(shortbow.length, 3);
  assert.equal(legacy[0].weaponArchetypeId, undefined);
  assert.equal(shortbow[0].weaponArchetypeId, 'shortbow');
});

test('Phase 6A runtime resolves the equipped weapon archetype instead of creating a second progression root', () => {
  const runtime = fs.readFileSync(new URL('../js/patches/combat2WeaponTechniques.js', import.meta.url), 'utf8');
  assert.match(runtime, /state\.data\?\.equipped\?\.weapon/);
  assert.match(runtime, /weapon\?\.weaponArchetype/);
  assert.match(runtime, /weaponTechniquesFor\(weaponType, state\.characterLevel \|\| 1, equipped\.archetypeId\)/);
  assert.doesNotMatch(runtime, /currency|daily|weekly/i);
});
