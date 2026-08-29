/* Adventure / World 4.0 — W7 Discovery runtime bridge.
   world2.discoveries remains the authoritative persistent store. */
import { state } from '../state.js';
import { adventure4DiscoveryById,adventure4RegionDiscoveryProgress,adventure4VisibleDiscoveries } from '../data/adventureWorld4Discoveries.js';
import './adventureWorld4Session.js';

function ensure(){
  state.data.world2||={};
  state.data.world2.discoveries||={};
  return state.data.world2.discoveries;
}

state.recordAdventure4Discovery=function(discovery,{source=null}={}){
  if(!discovery?.id||!discovery?.regionId)return{ok:false,reason:'discovery_required'};
  const store=ensure(),existing=store[discovery.id];
  if(existing){
    if(!existing.regionId)existing.regionId=discovery.regionId;
    if(!existing.category)existing.category=discovery.category;
    if(!existing.name&&discovery.name)existing.name=discovery.name;
    if(!existing.hint&&discovery.hint)existing.hint=discovery.hint;
    if(!existing.source&&source)existing.source=source;
    existing.world4=true;
  }else{
    store[discovery.id]={name:discovery.name,hint:discovery.hint||'',regionId:discovery.regionId,category:discovery.category,source:source||discovery.sourceId||null,world4:true,at:Date.now()};
  }
  const session=this.adventure4Session?.();
  if(session?.active){
    const discovered=[...new Set([...(session.discoveredThisRun||[]),discovery.id])];
    this.checkpointAdventure4({discoveredThisRun:discovered});
  }
  this.save();
  return{ok:true,id:discovery.id,new:!existing,record:{...store[discovery.id]}};
};

state.recordAdventure4DiscoveryById=function(catalog,id,options={}){
  const discovery=adventure4DiscoveryById(catalog,id);
  if(!discovery)return{ok:false,reason:'unknown_discovery'};
  return this.recordAdventure4Discovery(discovery,options);
};

state.adventure4RegionDiscoveryProgress=function(regionId,catalog){return adventure4RegionDiscoveryProgress(regionId,catalog,ensure());};
state.adventure4VisibleDiscoveries=function(regionId,catalog){return adventure4VisibleDiscoveries(regionId,catalog,ensure());};
state.adventure4RegionCompletion=function(region,regionState,catalog){
  if(!region?.id)return null;
  const discoveries=this.adventure4RegionDiscoveryProgress(region.id,catalog);
  const storyCleared=Math.max(0,Number(regionState?.clearedChapters)||0),storyTotal=Math.max(0,Number(regionState?.totalChapters)||0);
  const storyComplete=storyTotal>0&&storyCleared>=storyTotal;
  const publicDiscoveryComplete=discoveries.visibleTotal===0||discoveries.visibleKnownCount>=discoveries.visibleTotal;
  return Object.freeze({regionId:region.id,story:{cleared:storyCleared,total:storyTotal,complete:storyComplete},discoveries,recordedComplete:storyComplete&&publicDiscoveryComplete,label:`Story ${storyCleared}/${storyTotal} / 探索 ${discoveries.label}`});
};
