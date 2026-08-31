/* CLR-17 — Stage / Region Loot Identity
   Adds bounded target-farm metadata only. Existing Equipment/Loot systems stay authoritative. */

export const CLR17_REGION_LOOT_PROFILES=Object.freeze({
  frontier:Object.freeze({
    regionId:'frontier',
    label:'前線装備',
    summary:'物理火力・耐久・強敵戦向けAffixを狙いやすい。',
    preferredAffixIds:Object.freeze(['atk_pct','def_pct','hp_pct','dmg_boss']),
    targetAffixChance:0.28,
  }),
  elemental:Object.freeze({
    regionId:'elemental',
    label:'元素装備',
    summary:'魔力・MP・詠唱火力・速度系Affixを狙いやすい。',
    preferredAffixIds:Object.freeze(['mag_pct','mp_pct','dmg_spell','spd_pct']),
    targetAffixChance:0.28,
  }),
});

export function clr17RegionLootProfile(regionId){
  return CLR17_REGION_LOOT_PROFILES[regionId]||null;
}

export function clr17MergeDropContext(dropCtx,regionId){
  const profile=clr17RegionLootProfile(regionId);
  if(!profile)return dropCtx;
  const base=dropCtx&&typeof dropCtx==='object'?dropCtx:{};
  // Do not override stronger/specialized existing target-farm contexts such as Realm keys.
  if(Array.isArray(base.preferredAffixIds)&&base.preferredAffixIds.length)return base;
  return{
    ...base,
    preferredAffixIds:[...profile.preferredAffixIds],
    targetAffixChance:profile.targetAffixChance,
    targetFarm:`region:${regionId}`,
    clr17RegionId:regionId,
  };
}
