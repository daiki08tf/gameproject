/* ============================================================
   Combat 2.0 — Weapon techniques
   ------------------------------------------------------------
   Learned from the equipped weapon family, independent of Job. Phase 6 keeps
   the existing 24 techniques but lets the equipped Equipment 3.0 archetype
   specialize them, so weapon choice changes the combat loop without adding a
   second skill/progression system.
   ============================================================ */
import { weaponArchetypeTechniqueProfile } from './weaponIdentity.js';

const T = (id, name, weaponType, unlockLevel, extra) => Object.freeze({
  id, name, weaponType, unlockLevel, type: 'damage', target: 'enemy',
  mpCost: 6, cooldownTurns: 0, power: 2.8, ...extra,
  combat2WeaponTechnique: true,
});

export const COMBAT2_WEAPON_TECHNIQUES = Object.freeze([
  T('wtech_sword_double', '二連斬', 'sword', 1, { hits: 2, power: 1.45, mpCost: 5 }),
  T('wtech_sword_break', '剣閃・崩', 'sword', 100, { power: 3.8, mpCost: 9, cooldownTurns: 1, weaken: { stat: 'def', pct: 0.18, turns: 2 } }),
  T('wtech_sword_iaigiri', '居合・一閃', 'sword', 350, { power: 5.4, mpCost: 16, cooldownTurns: 2, critBonus: 20 }),

  T('wtech_axe_crush', '破砕斧', 'axe', 1, { power: 3.2, mpCost: 6, armorPenBonus: 0.12 }),
  T('wtech_axe_armor', '鎧砕き', 'axe', 100, { power: 3.9, mpCost: 10, cooldownTurns: 1, armorPenBonus: 0.24, weaken: { stat: 'def', pct: 0.22, turns: 3 } }),
  T('wtech_axe_execution', '断頭撃', 'axe', 350, { power: 5.7, mpCost: 18, cooldownTurns: 2, targetBonus: { when: 'lowHp', hpThreshold: 0.35, power: 1.4 } }),

  T('wtech_staff_arcane', '魔力打', 'staff', 1, { magic: true, power: 3.0, mpCost: 5 }),
  T('wtech_staff_flame', '炎杖陣', 'staff', 100, { magic: true, element: 'fire', target: 'allEnemies', power: 3.1, mpCost: 12, cooldownTurns: 1 }),
  T('wtech_staff_nova', '星霊爆', 'staff', 350, { magic: true, element: 'random', target: 'allEnemies', power: 4.8, mpCost: 20, cooldownTurns: 2 }),

  T('wtech_bow_pierce', '貫通射撃', 'bow', 1, { power: 3.0, mpCost: 5, armorPenBonus: 0.18 }),
  T('wtech_bow_volley', '五月雨矢', 'bow', 100, { target: 'randomEnemies', hits: 4, power: 1.05, mpCost: 10, cooldownTurns: 1 }),
  T('wtech_bow_hawkeye', '鷹眼の一矢', 'bow', 350, { power: 5.2, mpCost: 15, cooldownTurns: 2, critBonus: 25, armorPenBonus: 0.20 }),

  T('wtech_dagger_twinstab', '双牙', 'dagger', 1, { hits: 2, power: 1.35, mpCost: 4 }),
  T('wtech_dagger_poison', '毒牙連刃', 'dagger', 100, { hits: 2, power: 1.6, mpCost: 9, cooldownTurns: 1, element: 'poison', dot: { power: 0.11, turns: 3, maxStacks: 3 } }),
  T('wtech_dagger_assassinate', '絶影', 'dagger', 350, { power: 5.0, mpCost: 14, cooldownTurns: 2, critBonus: 30, targetBonus: { when: 'lowHp', hpThreshold: 0.30, power: 1.5 } }),

  T('wtech_knuckle_combo', '三連拳', 'knuckle', 1, { hits: 3, power: 0.95, mpCost: 5 }),
  T('wtech_knuckle_breaker', '震脚', 'knuckle', 100, { target: 'allEnemies', power: 3.0, mpCost: 10, cooldownTurns: 1, weaken: { stat: 'spd', pct: 0.18, turns: 2 } }),
  T('wtech_knuckle_rush', '百烈連環', 'knuckle', 350, { hits: 6, power: 0.92, mpCost: 18, cooldownTurns: 2 }),

  T('wtech_instrument_note', '戦律', 'instrument', 1, { power: 2.6, mpCost: 5, selfBuff: { atkPct: 0.12, turns: 2 } }),
  T('wtech_instrument_resonance', '共鳴波', 'instrument', 100, { target: 'allEnemies', magic: true, power: 3.2, mpCost: 11, cooldownTurns: 1, selfBuff: { magPct: 0.15, turns: 2 } }),
  T('wtech_instrument_finale', '英雄終楽章', 'instrument', 350, { target: 'allEnemies', magic: true, power: 4.4, mpCost: 18, cooldownTurns: 2, selfBuff: { atkPct: 0.15, magPct: 0.15, spdPct: 0.12, turns: 3 } }),

  T('wtech_rod_light', '聖光打', 'rod', 1, { magic: true, element: 'light', power: 2.9, mpCost: 5 }),
  T('wtech_rod_purify', '祓魔光', 'rod', 100, { magic: true, element: 'light', target: 'allEnemies', power: 3.1, mpCost: 10, cooldownTurns: 1 }),
  T('wtech_rod_judgment', '天罰光輪', 'rod', 350, { magic: true, element: 'light', target: 'allEnemies', power: 4.7, mpCost: 18, cooldownTurns: 2, selfBuff: { regenAdd: 0.025, turns: 3 } }),
]);

const round3 = (v) => Math.round(Number(v || 0) * 1000) / 1000;

function mergeSelfBuff(base = null, add = null) {
  if (!add) return base ? { ...base } : null;
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(add)) {
    if (key === 'turns') out.turns = Math.max(Number(out.turns) || 0, Number(value) || 0);
    else out[key] = round3((Number(out[key]) || 0) + (Number(value) || 0));
  }
  return out;
}

/**
 * Returns an encounter-local technique copy specialized by the equipped
 * Equipment 3.0 archetype. Base definitions stay immutable for saves/tests.
 */
export function specializeWeaponTechnique(technique, archetypeId = null) {
  const profile = weaponArchetypeTechniqueProfile(archetypeId);
  if (!technique || !profile || profile.family !== technique.weaponType) return technique;

  const out = { ...technique };
  const baseHits = Math.max(1, Math.floor(Number(technique.hits) || 1));
  const nextHits = Math.max(1, baseHits + Math.floor(Number(profile.hitDelta) || 0));
  const powerMult = Number(profile.powerMult) || 1;
  // Extra-hit profiles preserve roughly the same raw packet total; the reward
  // is more Trigger/crit/DoT opportunities rather than free huge DPS.
  out.power = round3((Number(technique.power) || 0) * powerMult * baseHits / nextHits);
  if (nextHits !== baseHits || technique.hits) out.hits = nextHits;

  if (profile.mpCostMult) out.mpCost = Math.max(1, Math.round((Number(technique.mpCost) || 0) * profile.mpCostMult));
  if (profile.critBonusAdd) out.critBonus = round3((Number(technique.critBonus) || 0) + profile.critBonusAdd);
  if (profile.armorPenAdd) out.armorPenBonus = round3((Number(technique.armorPenBonus) || 0) + profile.armorPenAdd);

  if (profile.weakenPctAdd) {
    out.weaken = technique.weaken
      ? { ...technique.weaken, pct: round3((Number(technique.weaken.pct) || 0) + profile.weakenPctAdd) }
      : { stat: 'def', pct: round3(profile.weakenPctAdd), turns: 2 };
  }

  if (profile.execution) {
    const existing = technique.targetBonus?.when === 'lowHp' ? technique.targetBonus : null;
    out.targetBonus = existing
      ? {
          ...existing,
          hpThreshold: Math.max(Number(existing.hpThreshold) || 0, Number(profile.execution.hpThreshold) || 0),
          power: round3((Number(existing.power) || 1) * (Number(profile.execution.power) || 1)),
        }
      : { when:'lowHp', hpThreshold:profile.execution.hpThreshold, power:profile.execution.power };
  }

  const selfBuff = mergeSelfBuff(technique.selfBuff, profile.selfBuffAdd);
  if (selfBuff) out.selfBuff = selfBuff;

  out.weaponArchetypeId = archetypeId;
  out.weaponArchetypeSpecialty = profile.specialty;
  out.baseTechniqueId = technique.id;
  return out;
}

export function weaponTechniquesFor(weaponType, characterLevel = 1, archetypeId = null) {
  const lv = Math.max(1, Math.floor(Number(characterLevel) || 1));
  const unlocked = COMBAT2_WEAPON_TECHNIQUES.filter((t) => t.weaponType === weaponType && lv >= t.unlockLevel);
  return archetypeId ? unlocked.map((t) => specializeWeaponTechnique(t, archetypeId)) : unlocked;
}
