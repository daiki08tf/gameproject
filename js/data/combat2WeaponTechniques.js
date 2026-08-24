/* ============================================================
   Combat 2.0 — Weapon techniques
   ------------------------------------------------------------
   Learned from the equipped weapon family, independent of Job. This gives the
   weapon itself a combat identity and lets Job + Weapon combinations diverge.
   ============================================================ */

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
  T('wtech_axe_execution', '断頭撃', 'axe', 350, { power: 5.7, mpCost: 18, cooldownTurns: 2, targetLowHpBonus: { threshold: 0.35, power: 1.4 } }),

  T('wtech_staff_arcane', '魔力打', 'staff', 1, { magic: true, power: 3.0, mpCost: 5 }),
  T('wtech_staff_flame', '炎杖陣', 'staff', 100, { magic: true, element: 'fire', target: 'allEnemies', power: 3.1, mpCost: 12, cooldownTurns: 1 }),
  T('wtech_staff_nova', '星霊爆', 'staff', 350, { magic: true, element: 'random', target: 'allEnemies', power: 4.8, mpCost: 20, cooldownTurns: 2 }),

  T('wtech_bow_pierce', '貫通射撃', 'bow', 1, { power: 3.0, mpCost: 5, armorPenBonus: 0.18 }),
  T('wtech_bow_volley', '五月雨矢', 'bow', 100, { target: 'randomEnemies', hits: 4, power: 1.05, mpCost: 10, cooldownTurns: 1 }),
  T('wtech_bow_hawkeye', '鷹眼の一矢', 'bow', 350, { power: 5.2, mpCost: 15, cooldownTurns: 2, critBonus: 25, armorPenBonus: 0.20 }),

  T('wtech_dagger_twinstab', '双牙', 'dagger', 1, { hits: 2, power: 1.35, mpCost: 4 }),
  T('wtech_dagger_poison', '毒牙連刃', 'dagger', 100, { hits: 2, power: 1.6, mpCost: 9, cooldownTurns: 1, element: 'poison', dot: { power: 0.11, turns: 3, maxStacks: 3 } }),
  T('wtech_dagger_assassinate', '絶影', 'dagger', 350, { power: 5.0, mpCost: 14, cooldownTurns: 2, critBonus: 30, targetLowHpBonus: { threshold: 0.30, power: 1.5 } }),

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

export function weaponTechniquesFor(weaponType, characterLevel = 1) {
  const lv = Math.max(1, Math.floor(Number(characterLevel) || 1));
  return COMBAT2_WEAPON_TECHNIQUES.filter((t) => t.weaponType === weaponType && lv >= t.unlockLevel);
}
