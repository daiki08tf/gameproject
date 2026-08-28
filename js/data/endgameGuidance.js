/* Phase 10.4 — Endgame guidance and progression integrity.
   Produces one canonical recommendation from Character Lv, Abyss depth,
   active World Tier and Nemesis pressure without changing combat math. */
import { highestWorldTier, worldTier } from './worldTiers.js';
import { endgameRewardProfile } from './endgameRewardScaling.js';
import { abyssRecommendedLevel, abyssTargetItemPower, abyssEraForDepth } from './abyssEndgame.js';
import { endgameLootRolesForLevel, compactEndgameLootRoleSummary } from './endgameLootRoles.js';

export const ENDGAME_ABYSS_MAX_DEPTH=3000;

export const ENDGAME_GUIDANCE_LANES=Object.freeze([
  {id:'story',maxLevel:2999,label:'物語・地域探索',target:'goStageBtn',purpose:'未踏破章・地域ルートを進める'},
  {id:'awakening',maxLevel:9998,label:'World Tier + 深淵入口',target:'goAbyssBtn',purpose:'World IIで装備を更新し、深淵を開拓する'},
  {id:'transcendent',maxLevel:29998,label:'深淵・EX賞金首',target:'goAbyssBtn',purpose:'深淵Eraを進め、EX宿敵と高IP装備を狙う'},
  {id:'divine',maxLevel:49998,label:'深淵中層・機界',target:'goAbyssBtn',purpose:'深淵中層と機界の固有報酬でビルドを伸ばす'},
  {id:'cataclysm',maxLevel:74998,label:'深淵深層・Nemesis',target:'goAbyssBtn',purpose:'深淵深層と高Lv宿敵を周回する'},
  {id:'boundary_zero',maxLevel:99998,label:'境界零・最深部',target:'goAbyssBtn',purpose:'World VIと最深部報酬で極限帯へ詰める'},
  {id:'limit',maxLevel:99999,label:'極限帯',target:'goAbyssBtn',purpose:'最高難度の宿敵・深淵・機界を目的別に周回する'},
]);

function clampLevel(level){return Math.max(1,Math.min(99999,Math.floor(Number(level)||1)));}
export function guidanceLaneForLevel(level){const lv=clampLevel(level);return ENDGAME_GUIDANCE_LANES.find(x=>lv<=x.maxLevel)||ENDGAME_GUIDANCE_LANES.at(-1);}

export function suggestedAbyssDepth(level){
  const lv=clampLevel(level);
  if(lv<3000)return 0;
  let lo=1,hi=ENDGAME_ABYSS_MAX_DEPTH;
  while(lo<hi){const mid=Math.floor((lo+hi+1)/2);if(abyssRecommendedLevel(mid)<=lv)lo=mid;else hi=mid-1;}
  return lo;
}

export function buildEndgameGuidance({level=1,abyssBestDepth=0,worldTierId='normal',nemesisLevel=0,abyssUnlocked=true}={}){
  const lv=clampLevel(level),baseLane=guidanceLaneForLevel(lv);
  const best=Math.max(0,Math.min(ENDGAME_ABYSS_MAX_DEPTH,Math.floor(Number(abyssBestDepth)||0)));
  const tier=worldTier(worldTierId),highest=highestWorldTier(lv),reward=endgameRewardProfile(lv);
  const targetDepth=suggestedAbyssDepth(lv);
  const nextDepth=targetDepth>0?(best<targetDepth?Math.min(targetDepth,best+1):targetDepth):1;
  const targetLevel=abyssRecommendedLevel(nextDepth),targetIp=abyssTargetItemPower(nextDepth),era=abyssEraForDepth(nextDepth);
  const storyBlocked=baseLane.id!=='story'&&!abyssUnlocked;
  const lane=storyBlocked?{...baseLane,id:'story_gate',label:'物語クリアを優先',target:'goStageBtn',purpose:'全章ボスを撃破して深淵を解禁する'}:baseLane;
  const tierBehind=!storyBlocked&&highest.rank>tier.rank;
  let reason=lane.purpose;
  if(tierBehind)reason=`${highest.name} が解禁済み。World Tierを上げてから ${lane.purpose}`;
  else if(!storyBlocked&&nemesisLevel>=5)reason=`高Lv Nemesis が成長中。弱点情報を集めつつ ${lane.purpose}`;
  else if(!storyBlocked&&lv>=3000&&best<targetDepth)reason=`現在Lvなら深淵 ${targetDepth}F 前後が進行目安。${lane.purpose}`;
  const lootRoles=storyBlocked?[]:endgameLootRolesForLevel(lv);
  return{
    level:lv,laneId:lane.id,title:lane.label,targetButtonId:tierBehind?'goStageBtn':lane.target,reason,abyssUnlocked:Boolean(abyssUnlocked),
    activeWorldTier:tier.id,recommendedWorldTier:highest.id,recommendedWorldTierName:highest.name,
    abyssBestDepth:best,recommendedAbyssDepth:targetDepth,nextAbyssDepth:nextDepth,nextAbyssLevel:targetLevel,
    nextAbyssItemPower:targetIp,nextAbyssEra:era,nemesisLevel:Math.max(0,Number(nemesisLevel)||0),
    reward:{drop:reward.drop,gold:reward.gold,itemPowerBonus:reward.itemPowerBonus,label:reward.label},
    lootRoles,
    lootRoleSummary:storyBlocked?'':compactEndgameLootRoleSummary(lv),
  };
}
