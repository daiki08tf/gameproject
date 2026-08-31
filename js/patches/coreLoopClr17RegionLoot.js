/* CLR-17 — Region Loot Identity runtime bridge.
   During an active Adventure4 Hunt, enrich normal equipment drop context with
   bounded regional Affix preferences. No new drop table, rarity, IP, reward or save authority. */
import { state } from '../state.js';
import { clr17MergeDropContext,clr17RegionLootProfile } from '../data/coreLoopClr17.js';

const previousAddItem=state.addItem.bind(state);
state.addItem=function coreLoopClr17RegionLootAddItem(itemId,qty=1,dropCtx=null){
  const session=this.adventure4Session?.();
  const regionId=session?.active?session.regionId:null;
  const ctx=regionId?clr17MergeDropContext(dropCtx,regionId):dropCtx;
  return previousAddItem(itemId,qty,ctx);
};

state.clr17RegionLootProfile=function(regionId){return clr17RegionLootProfile(regionId);};
