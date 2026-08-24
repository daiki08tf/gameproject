/* ============================================================
   Abyss 3.0 — Target Farm profiles
   Route descriptions are converted into real loot/recruit/key biases here.
   ============================================================ */

export const ABYSS_TARGET_FARM = Object.freeze({
  armory: Object.freeze({
    weaponDropMult: 1.75,
    tableDropMult: 1.15,
    setWeightMult: 3.0,
    label: '武器 / Set装備',
  }),
  beast_den: Object.freeze({
    recruitChanceMult: 1.75,
    minRarity: 'rare',
    rareFloorChance: 0.28,
    talentFloorBonus: 0.018,
    highTalentChance: 0.22,
    highTalentFloorBonus: 0.032,
    label: '仲間モンスター / 高Talent個体',
  }),
  blood_mist: Object.freeze({
    weaponDropMult: 1.25,
    cursedChanceMult: 1.85,
    label: 'Cursed装備',
  }),
  golden_vault: Object.freeze({
    label: 'Gold',
  }),
  rift_scar: Object.freeze({
    weaponDropMult: 1.15,
    riftKeyChance: 0.14,
    label: 'Rift Key',
  }),
  veil_fracture: Object.freeze({
    weaponDropMult: 1.45,
    tableDropMult: 1.35,
    setWeightMult: 1.75,
    legendaryChanceAdd: 0.06,
    cursedChanceMult: 1.25,
    riftKeyChance: 0.08,
    label: '高品質戦利品',
  }),
});

export function abyssTargetFarmProfile(routeOrId) {
  const id = typeof routeOrId === 'string' ? routeOrId : routeOrId?.id;
  return id ? ABYSS_TARGET_FARM[id] || null : null;
}

export function isSetDropId(itemId) {
  return typeof itemId === 'string' && itemId.startsWith('set_');
}
