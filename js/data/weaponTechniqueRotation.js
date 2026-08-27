/* ============================================================
   Gear Overhaul Phase 6B — Weapon Technique Rotations
   ------------------------------------------------------------
   Ephemeral combat-only chaining for the existing 3 techniques per family.
   No meter, currency, save field, or progression root is introduced.
   ============================================================ */

const R = (family, opener, setup, finisher, setupBonus, finisherBonus) => Object.freeze({
  family, opener, setup, finisher,
  setupBonus: Object.freeze(setupBonus),
  finisherBonus: Object.freeze(finisherBonus),
});

export const WEAPON_TECHNIQUE_ROTATIONS = Object.freeze({
  sword: R('sword', 'wtech_sword_double', 'wtech_sword_break', 'wtech_sword_iaigiri',
    { weakenPctAdd:0.05 }, { powerMult:1.08, critBonusAdd:12 }),
  axe: R('axe', 'wtech_axe_crush', 'wtech_axe_armor', 'wtech_axe_execution',
    { armorPenAdd:0.08, weakenPctAdd:0.04 }, { powerMult:1.15, executionPowerMult:1.12 }),
  staff: R('staff', 'wtech_staff_arcane', 'wtech_staff_flame', 'wtech_staff_nova',
    { mpCostMult:0.75 }, { powerMult:1.15, mpCostMult:0.90 }),
  bow: R('bow', 'wtech_bow_pierce', 'wtech_bow_volley', 'wtech_bow_hawkeye',
    { armorPenAdd:0.05 }, { powerMult:1.08, critBonusAdd:15, armorPenAdd:0.05 }),
  dagger: R('dagger', 'wtech_dagger_twinstab', 'wtech_dagger_poison', 'wtech_dagger_assassinate',
    { dotPowerAdd:0.04 }, { critBonusAdd:15, executionPowerMult:1.15 }),
  knuckle: R('knuckle', 'wtech_knuckle_combo', 'wtech_knuckle_breaker', 'wtech_knuckle_rush',
    { weakenPctAdd:0.05 }, { hitDelta:1, powerMult:1.05 }),
  instrument: R('instrument', 'wtech_instrument_note', 'wtech_instrument_resonance', 'wtech_instrument_finale',
    { selfBuffAdd:{ magPct:0.06, spdPct:0.05, turns:2 } }, { selfBuffAdd:{ atkPct:0.08, magPct:0.08, spdPct:0.06, turns:3 } }),
  rod: R('rod', 'wtech_rod_light', 'wtech_rod_purify', 'wtech_rod_judgment',
    { weakenPctAdd:0.05 }, { powerMult:1.08, selfBuffAdd:{ regenAdd:0.015, turns:3 } }),
});

const TECHNIQUE_STAGE = Object.freeze(Object.values(WEAPON_TECHNIQUE_ROTATIONS).reduce((map, r) => {
  map[r.opener] = Object.freeze({ family:r.family, stage:1, role:'opener' });
  map[r.setup] = Object.freeze({ family:r.family, stage:2, role:'setup' });
  map[r.finisher] = Object.freeze({ family:r.family, stage:3, role:'finisher' });
  return map;
}, {}));

const round3 = (v) => Math.round(Number(v || 0) * 1000) / 1000;

export function weaponTechniqueStage(techId) {
  return TECHNIQUE_STAGE[techId] || null;
}

function mergeBuff(base, add) {
  if (!add) return base ? { ...base } : null;
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(add)) {
    if (key === 'turns') out.turns = Math.max(Number(out.turns) || 0, Number(value) || 0);
    else out[key] = round3((Number(out[key]) || 0) + (Number(value) || 0));
  }
  return out;
}

function applyBonus(technique, bonus, label) {
  if (!bonus) return technique;
  const out = { ...technique };
  const baseHits = Math.max(1, Math.floor(Number(out.hits) || 1));
  const nextHits = Math.max(1, baseHits + Math.floor(Number(bonus.hitDelta) || 0));
  if (bonus.powerMult || nextHits !== baseHits) {
    out.power = round3((Number(out.power) || 0) * (Number(bonus.powerMult) || 1) * baseHits / nextHits);
  }
  if (nextHits !== baseHits) out.hits = nextHits;
  if (bonus.mpCostMult) out.mpCost = Math.max(1, Math.round((Number(out.mpCost) || 0) * bonus.mpCostMult));
  if (bonus.critBonusAdd) out.critBonus = round3((Number(out.critBonus) || 0) + bonus.critBonusAdd);
  if (bonus.armorPenAdd) out.armorPenBonus = round3((Number(out.armorPenBonus) || 0) + bonus.armorPenAdd);
  if (bonus.weakenPctAdd) {
    out.weaken = out.weaken
      ? { ...out.weaken, pct:round3((Number(out.weaken.pct) || 0) + bonus.weakenPctAdd) }
      : { stat:'def', pct:round3(bonus.weakenPctAdd), turns:2 };
  }
  if (bonus.dotPowerAdd && out.dot) out.dot = { ...out.dot, power:round3((Number(out.dot.power) || 0) + bonus.dotPowerAdd) };
  if (bonus.executionPowerMult && out.targetBonus?.when === 'lowHp') {
    out.targetBonus = { ...out.targetBonus, power:round3((Number(out.targetBonus.power) || 1) * bonus.executionPowerMult) };
  }
  const selfBuff = mergeBuff(out.selfBuff, bonus.selfBuffAdd);
  if (selfBuff) out.selfBuff = selfBuff;
  out.weaponChainBonus = label;
  return out;
}

/** Apply only the bonus currently earned by the combat-local chain state. */
export function applyWeaponTechniqueRotation(technique, chain = null) {
  const stage = weaponTechniqueStage(technique?.id);
  if (!stage) return technique;
  const rotation = WEAPON_TECHNIQUE_ROTATIONS[stage.family];
  if (stage.stage === 2 && chain?.family === stage.family && chain?.step === 1) {
    return applyBonus(technique, rotation.setupBonus, 'SETUP');
  }
  if (stage.stage === 3 && chain?.family === stage.family && chain?.step === 2) {
    return applyBonus(technique, rotation.finisherBonus, 'FINISH');
  }
  return technique;
}

/**
 * Advance only when a Weapon Technique succeeds. A wrong weapon-technique order
 * simply restarts/clears the chain; Job skills and normal attacks do not erase
 * it, preserving build freedom instead of making this a hard rotation gate.
 */
export function advanceWeaponTechniqueChain(chain, techId) {
  const stage = weaponTechniqueStage(techId);
  if (!stage) return chain || null;
  if (stage.stage === 1) return { family:stage.family, step:1 };
  if (stage.stage === 2) return chain?.family === stage.family && chain?.step === 1
    ? { family:stage.family, step:2 }
    : null;
  return null;
}

export const WEAPON_TECHNIQUE_ROTATION_COUNT = Object.keys(WEAPON_TECHNIQUE_ROTATIONS).length;
