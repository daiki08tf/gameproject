import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COMBAT2_WEAPON_TECHNIQUES } from '../js/data/combat2WeaponTechniques.js';
import {
  WEAPON_TECHNIQUE_ROTATIONS,
  WEAPON_TECHNIQUE_ROTATION_COUNT,
  applyWeaponTechniqueRotation,
  advanceWeaponTechniqueChain,
  weaponTechniqueStage,
} from '../js/data/weaponTechniqueRotation.js';

const byId = (id) => COMBAT2_WEAPON_TECHNIQUES.find((t) => t.id === id);

test('Phase 6B gives all 8 weapon families one three-step rotation using the existing 24 techniques', () => {
  assert.equal(WEAPON_TECHNIQUE_ROTATION_COUNT, 8);
  const ids = new Set();
  for (const rotation of Object.values(WEAPON_TECHNIQUE_ROTATIONS)) {
    for (const id of [rotation.opener, rotation.setup, rotation.finisher]) {
      assert.ok(byId(id), id);
      assert.ok(!ids.has(id), id);
      ids.add(id);
    }
  }
  assert.equal(ids.size, 24);
});

test('chain advances opener -> setup -> finisher and wrong order does not grant a hard free bonus', () => {
  let chain = null;
  chain = advanceWeaponTechniqueChain(chain, 'wtech_sword_double');
  assert.deepEqual(chain, { family:'sword', step:1 });
  chain = advanceWeaponTechniqueChain(chain, 'wtech_sword_break');
  assert.deepEqual(chain, { family:'sword', step:2 });
  chain = advanceWeaponTechniqueChain(chain, 'wtech_sword_iaigiri');
  assert.equal(chain, null);

  assert.equal(advanceWeaponTechniqueChain(null, 'wtech_sword_break'), null);
  assert.equal(advanceWeaponTechniqueChain({ family:'axe', step:1 }, 'wtech_sword_break'), null);
});

test('setup and finisher bonuses apply only when the matching prior chain step exists', () => {
  const breakTech = byId('wtech_sword_break');
  const plainSetup = applyWeaponTechniqueRotation(breakTech, null);
  const chainedSetup = applyWeaponTechniqueRotation(breakTech, { family:'sword', step:1 });
  assert.equal(plainSetup.weaponChainBonus, undefined);
  assert.equal(chainedSetup.weaponChainBonus, 'SETUP');
  assert.ok(chainedSetup.weaken.pct > breakTech.weaken.pct);

  const finisher = byId('wtech_sword_iaigiri');
  const chainedFinish = applyWeaponTechniqueRotation(finisher, { family:'sword', step:2 });
  assert.equal(chainedFinish.weaponChainBonus, 'FINISH');
  assert.ok(chainedFinish.power > finisher.power);
  assert.ok(chainedFinish.critBonus > finisher.critBonus);
});

test('families keep distinct rotation payoffs instead of sharing one generic buff', () => {
  const staffSetup = applyWeaponTechniqueRotation(byId('wtech_staff_flame'), { family:'staff', step:1 });
  assert.ok(staffSetup.mpCost < byId('wtech_staff_flame').mpCost);

  const daggerSetup = applyWeaponTechniqueRotation(byId('wtech_dagger_poison'), { family:'dagger', step:1 });
  assert.ok(daggerSetup.dot.power > byId('wtech_dagger_poison').dot.power);

  const axeSetup = applyWeaponTechniqueRotation(byId('wtech_axe_armor'), { family:'axe', step:1 });
  assert.ok(axeSetup.armorPenBonus > byId('wtech_axe_armor').armorPenBonus);

  const instrumentFinish = applyWeaponTechniqueRotation(byId('wtech_instrument_finale'), { family:'instrument', step:2 });
  assert.ok(instrumentFinish.selfBuff.atkPct > byId('wtech_instrument_finale').selfBuff.atkPct);
});

test('rotation metadata is descriptive and weapon chain state remains combat-local', () => {
  for (const tech of COMBAT2_WEAPON_TECHNIQUES) {
    const stage = weaponTechniqueStage(tech.id);
    assert.ok(stage);
    assert.ok(['opener','setup','finisher'].includes(stage.role));
  }
  const runtime = fs.readFileSync(new URL('../js/patches/combat2WeaponTechniques.js', import.meta.url), 'utf8');
  assert.match(runtime, /this\._weaponTechniqueChain/);
  assert.match(runtime, /previousPlayerTechnique\.call/);
  assert.doesNotMatch(runtime, /state\.data\._weaponTechniqueChain|currency|daily|weekly/i);
});
