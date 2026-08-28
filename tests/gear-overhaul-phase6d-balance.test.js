import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPON_ARCHETYPES } from '../js/data/equipment3Archetypes.js';
import { COMBAT2_WEAPON_TECHNIQUES, specializeWeaponTechnique } from '../js/data/combat2WeaponTechniques.js';
import { applyWeaponTechniqueRotation, WEAPON_TECHNIQUE_ROTATIONS } from '../js/data/weaponTechniqueRotation.js';
import { WEAPON_BUILD_LANES } from '../js/data/weaponBuildSynergy.js';

const packet = (t) => Math.max(1, Number(t.hits) || 1) * Number(t.power || 0);
const baseByFamily = Object.fromEntries(Object.keys(WEAPON_ARCHETYPES).map((family) => [
  family,
  COMBAT2_WEAPON_TECHNIQUES.filter((t) => t.weaponType === family),
]));

test('Phase 6D keeps all 24 archetypes inside bounded raw-packet and combat-stat envelopes', () => {
  let checked = 0;
  for (const [family, archetypes] of Object.entries(WEAPON_ARCHETYPES)) {
    const rotation = WEAPON_TECHNIQUE_ROTATIONS[family];
    const bases = baseByFamily[family];
    assert.equal(bases.length, 3, family);

    for (const archetype of archetypes) {
      checked += 1;
      for (const base of bases) {
        let tuned = specializeWeaponTechnique(base, archetype.id);
        if (base.id === rotation.setup) tuned = applyWeaponTechniqueRotation(tuned, { family, step:1 });
        if (base.id === rotation.finisher) tuned = applyWeaponTechniqueRotation(tuned, { family, step:2 });

        const ratio = packet(tuned) / Math.max(0.001, packet(base));
        assert.ok(Number.isFinite(ratio) && ratio >= 0.85 && ratio <= 1.35,
          `${archetype.id}/${base.id}: packet ratio ${ratio}`);
        assert.ok((Number(tuned.hits) || 1) <= 7, `${archetype.id}/${base.id}: hits ${tuned.hits}`);
        assert.ok((Number(tuned.critBonus) || 0) <= 60, `${archetype.id}/${base.id}: crit ${tuned.critBonus}`);
        assert.ok((Number(tuned.armorPenBonus) || 0) <= 0.5, `${archetype.id}/${base.id}: pen ${tuned.armorPenBonus}`);
        assert.ok((Number(tuned.weaken?.pct) || 0) <= 0.4, `${archetype.id}/${base.id}: weaken ${tuned.weaken?.pct}`);
        assert.ok(Number.isFinite(Number(tuned.mpCost)) && Number(tuned.mpCost) >= 1 && Number(tuned.mpCost) <= 30,
          `${archetype.id}/${base.id}: mp ${tuned.mpCost}`);
        if (tuned.targetBonus?.when === 'lowHp') {
          assert.ok(Number(tuned.targetBonus.power) <= 2.0, `${archetype.id}/${base.id}: execution ${tuned.targetBonus.power}`);
          assert.ok(Number(tuned.targetBonus.hpThreshold) <= 0.4, `${archetype.id}/${base.id}: threshold ${tuned.targetBonus.hpThreshold}`);
        }
      }
    }
  }
  assert.equal(checked, 24);
});

test('rapid-hit identities add proc opportunities without doubling raw damage', () => {
  for (const archetypeId of ['shortbow','twinblade','claw']) {
    const [family] = Object.entries(WEAPON_ARCHETYPES).find(([, list]) => list.some((x) => x.id === archetypeId));
    for (const base of baseByFamily[family]) {
      const tuned = specializeWeaponTechnique(base, archetypeId);
      assert.ok(packet(tuned) <= packet(base) * 1.05 + 0.001, `${archetypeId}/${base.id}`);
    }
  }
});

test('all families retain three build lanes after balance closeout', () => {
  for (const family of Object.keys(WEAPON_ARCHETYPES)) {
    assert.equal(WEAPON_BUILD_LANES[family]?.length, 3, family);
  }
});

test('Phase 7 gate remains no-go until a genuinely non-overlapping family is authored', () => {
  const existingArchetypes = Object.values(WEAPON_ARCHETYPES).flat().map((x) => x.name);
  for (const alreadyCovered of ['大剣','魔導書','双短剣','弩']) {
    assert.ok(existingArchetypes.includes(alreadyCovered), alreadyCovered);
  }
  assert.equal(Object.keys(WEAPON_ARCHETYPES).length, 8);
});
