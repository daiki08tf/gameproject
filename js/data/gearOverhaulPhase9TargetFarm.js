/* ============================================================
   Gear Overhaul Phase 9 — Named Unique target-farm distribution
   ------------------------------------------------------------
   Reuses existing Abyss / Rift / Secret Realm stage metadata.
   No new activity, currency, save root, pity meter or daily/weekly loop.
   ============================================================ */

const P = (id, itemId, label, activity, config, matches) => Object.freeze({
  id, itemId, label, activity, ...config, matches,
});

export const UNIQUE2_TARGET_FARM_PROFILES = Object.freeze([
  P(
    'u2farm_grimhead',
    'uq_u2_grimhead',
    '終王斧グリムヘッド — 深淵「武器 / Set装備」ボス階',
    'abyss',
    { mode:'dropTable', weight:0.08 },
    stage => !!stage?.isAbyss && stage?.abyssRoute?.id === 'armory' && !!stage?.boss && Number(stage?.abyssDepth || 0) >= 1200,
  ),
  P(
    'u2farm_alka',
    'uq_u2_alka',
    '連星拳アルカ — 深淵「武器 / Set装備」高深度',
    'abyss',
    { mode:'dropTable', weight:0.07 },
    stage => !!stage?.isAbyss && stage?.abyssRoute?.id === 'armory' && Number(stage?.abyssDepth || 0) >= 1800,
  ),
  P(
    'u2farm_asterion',
    'uq_u2_asterion',
    '残光弓アステリオン — 風 / 雷の虚無鍵',
    'rift',
    { mode:'clearChance', clearChance:0.06 },
    stage => !!stage?.isRift && ['wind', 'lightning'].includes(stage?.riftKey?.element),
  ),
  P(
    'u2farm_miasma',
    'uq_u2_miasma',
    '葬毒刃ミアズマ — 毒 / 闇の虚無鍵',
    'rift',
    { mode:'clearChance', clearChance:0.06 },
    stage => !!stage?.isRift && ['poison', 'dark'].includes(stage?.riftKey?.element),
  ),
  P(
    'u2farm_cadenza',
    'uq_u2_cadenza',
    '戦律器カデンツァ — 異界・反転図書館',
    'secret_realm',
    { mode:'dropTable', weight:0.11 },
    stage => !!stage?.secretRealm && stage?.id === 'secret-inverted-library',
  ),
  P(
    'u2farm_seraphim',
    'uq_u2_seraphim',
    '反照錫セラフィム — 第八鍵・最終域',
    'secret_realm',
    { mode:'dropTable', weight:0.12 },
    stage => !!stage?.secretRealm && !!stage?.phase9EighthKeyFinal,
  ),
]);

export function unique2TargetFarmProfilesForStage(stage) {
  return UNIQUE2_TARGET_FARM_PROFILES.filter(profile => profile.matches(stage));
}

export function clearChanceProfilesForStage(stage) {
  return unique2TargetFarmProfilesForStage(stage).filter(profile => profile.mode === 'clearChance');
}

export function rollUnique2ClearReward(stage, rng=Math.random) {
  for (const profile of clearChanceProfilesForStage(stage)) {
    const chance=Math.max(0,Math.min(0.20,Number(profile.clearChance)||0));
    if (chance>0 && rng()<chance) return profile;
  }
  return null;
}

export function applyUnique2TargetFarm(stage) {
  if (!stage || typeof stage !== 'object') return stage;
  const profiles = unique2TargetFarmProfilesForStage(stage);
  if (!profiles.length) return stage;

  const tableProfiles=profiles.filter(profile => profile.mode === 'dropTable');
  const existing = new Set((stage.dropTable || []).map(entry => entry?.itemId).filter(Boolean));
  const uniqueDrops = tableProfiles
    .filter(profile => !existing.has(profile.itemId))
    .map(profile => ({
      itemId: profile.itemId,
      weight: profile.weight,
      gearOverhaulUnique2: true,
      targetFarmId: profile.id,
    }));

  stage.dropTable = [...uniqueDrops, ...(stage.dropTable || [])];
  stage.unique2TargetFarm = profiles.map(profile => ({
    id: profile.id,
    itemId: profile.itemId,
    label: profile.label,
    activity: profile.activity,
    mode: profile.mode,
    weight: Number(profile.weight)||0,
    clearChance: Number(profile.clearChance)||0,
  }));
  return stage;
}
