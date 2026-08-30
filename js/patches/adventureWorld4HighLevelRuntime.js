/* Adventure / World 4.0 — W29 High-Level / Lv99,999 World runtime.
   Reads existing World Tier, Region completion and Nemesis Hunt authorities
   and derives a display-only atmosphere state. No new save root, no reward
   recomputation: Lv1-99,999 progression and Endgame Reward Scaling stay
   exactly as they are. */
import { state } from '../state.js';
import { adventure4HighLevelState } from '../data/adventureWorld4HighLevel.js';
import { CHAPTERS,isChapterUnlocked } from '../data/stages.js';
import { buildWorld4RegionCatalog,world4RegionById,world4RegionState } from '../data/adventureWorld4Regions.js';
import './adventureWorld4RealmRegionRuntime.js';
import './worldTierRuntime.js';

const previousEventContext=state.adventure4EventContext?.bind(state);

function regionStatus(regionId){
  const region=world4RegionById(buildWorld4RegionCatalog(CHAPTERS),regionId);
  if(!region)return null;
  return world4RegionState(region,CHAPTERS,{
    isStageCleared:id=>state.isStageCleared(id),
    isChapterUnlocked:index=>isChapterUnlocked(index,id=>state.isStageCleared(id)),
  }).status;
}

state.adventure4HighLevelStateForRegion=function(regionId){
  if(!regionId)return adventure4HighLevelState({});
  const tier=this.activeWorldTier?.()||{rank:0};
  const hunt=this.adventure4NemesisHuntState?.()||{active:false,regionId:null};
  const status=regionStatus(regionId);
  return{
    regionId,
    ...adventure4HighLevelState({
      rank:tier.rank||0,
      nemesisHere:!!hunt.active&&hunt.regionId===regionId,
      regionCompleted:status==='completed',
    }),
  };
};

if(previousEventContext){
  state.adventure4EventContext=function adventure4HighLevelEventContext(options={}){
    const ctx=previousEventContext(options);
    const regionId=this.adventure4Session?.()?.regionId||null;
    return{...ctx,highLevel:regionId?this.adventure4HighLevelStateForRegion(regionId):null};
  };
}
