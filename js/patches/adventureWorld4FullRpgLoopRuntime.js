/* Adventure / World 4.0 — W26-W29 Full RPG Loop runtime.
   Selects Story Route vs Free Adventure from canonical progression and derives
   endgame presentation without reproducing battle/reward scaling. */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { buildWorld4RegionCatalog,world4RegionById } from '../data/adventureWorld4Regions.js';
import {
  adventure4RegionBossStage,
  adventure4StoryRouteState,
  adventure4WorldMode,
  buildAdventure4StoryRegionRoute,
  buildAdventure4FreeRegionRoute,
  adventure4SecretBossFramework,
} from '../data/adventureWorld4FullRpgLoop.js';
import './adventureWorld4RealmRegionRuntime.js';
import './adventureWorld4MysteryRuntime.js';

function regionById(id){return world4RegionById(buildWorld4RegionCatalog(CHAPTERS),id);}
function shortcutCount(target,regionId){return target.adventure4VisibleShortcuts?.(regionId)?.length||0;}
function modeContext(target,regionId){
  const dynamic=target.adventure4DynamicRegionState?.(regionId)||{status:'stable'};
  const living=target.adventure4LivingWorldContext?.()||{};
  const realms=target.adventure4RealmSignals?.()||[];
  return {
    dynamicStatus:dynamic.status,
    nemesisHere:!!living.nemesisHere,
    realmSignals:realms.filter(x=>x.regionId===regionId),
    worldTierRank:Number(living.worldTierRank)||0,
  };
}

state.adventure4FullRpgLoopStatus=function(regionId=this.adventure4Session?.()?.regionId){
  const region=regionById(regionId);if(!region)return null;
  const story=adventure4StoryRouteState(region,CHAPTERS,id=>this.isStageCleared?.(id)??false);
  const boss=adventure4RegionBossStage(region,CHAPTERS);
  const worldMode=adventure4WorldMode(modeContext(this,regionId));
  return Object.freeze({regionId,story,bossStageId:boss?.id||null,bossName:boss?.name||null,freeAdventureUnlocked:story.complete,worldMode,shortcutCount:shortcutCount(this,regionId)});
};

state.adventure4RegionRoute=function(region,regionState=null){
  if(!region?.id)return null;
  const story=adventure4StoryRouteState(region,CHAPTERS,id=>this.isStageCleared?.(id)??false);
  if(!story.complete)return buildAdventure4StoryRegionRoute(region,CHAPTERS,id=>this.isStageCleared?.(id)??false);
  const worldMode=adventure4WorldMode(modeContext(this,region.id));
  return buildAdventure4FreeRegionRoute(region,CHAPTERS,{shortcutCount:shortcutCount(this,region.id),worldMode});
};

state.adventure4RegionBossFramework=function(regionId=this.adventure4Session?.()?.regionId,{mysteryResolved=null,secretDiscovered=null,nemesisDefeated=null}={}){
  const region=regionById(regionId);if(!region)return adventure4SecretBossFramework({});
  const boss=adventure4RegionBossStage(region,CHAPTERS);
  const discoveries=Object.values(this.data.world2?.discoveries||{});
  const inferredSecret=discoveries.some(x=>x?.regionId===regionId&&x?.category==='secret');
  const inferredMystery=Object.values(this.data.world2?.eventMemory||{}).some(x=>x?.regionId===regionId&&x?.status==='resolved')||Object.values(this.data.world2?.mysteries?.research||{}).some(Boolean);
  const wins=Object.values(this.data.bounty2Wins||{}).reduce((n,v)=>n+(Number(v)||0),0);
  return adventure4SecretBossFramework({bossStageId:boss?.id||null,mysteryResolved:mysteryResolved??inferredMystery,secretDiscovered:secretDiscovered??inferredSecret,nemesisDefeated:nemesisDefeated??wins>0});
};