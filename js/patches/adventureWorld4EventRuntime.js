/* Adventure / World 4.0 — W6 event runtime bridge.
   Reuses world2.eventsSeen/eventChains as persistent event history and stores
   only scheduling metadata needed by the Adventure event selector. */
import { state } from '../state.js';
import { nextAdventure4EventHistory,rollAdventure4Event } from '../data/adventureWorld4Events.js';
import './adventureWorld4Session.js';

function ensure(){
  state.data.world2||={};
  const world=state.data.world2;
  world.eventsSeen||={};world.eventChains||={};world.discoveries||={};world.flags||={};
  world.adventureEventMeta||={adventureIndex:0,lastSeenAdventure:{},recentEventIds:[]};
  const meta=world.adventureEventMeta;
  if(!Number.isFinite(meta.adventureIndex))meta.adventureIndex=0;
  if(!meta.lastSeenAdventure||typeof meta.lastSeenAdventure!=='object'||Array.isArray(meta.lastSeenAdventure))meta.lastSeenAdventure={};
  if(!Array.isArray(meta.recentEventIds))meta.recentEventIds=[];
  return{world,meta};
}

const previousStartAdventure4=state.startAdventure4;
state.startAdventure4=function(...args){
  const result=previousStartAdventure4.apply(this,args);
  if(result?.ok){const {meta}=ensure();meta.adventureIndex++;this.save();}
  return result;
};

state.adventure4EventContext=function({allowRare=true}={}){
  const {world,meta}=ensure();const session=this.adventure4Session();
  return{
    flags:session.temporaryFlags||{},
    visitedNodeIds:session.visitedNodeIds||[],
    hasDiscovery:id=>!!world.discoveries?.[id],
    isStageCleared:id=>this.isStageCleared?.(id)??false,
    eventsSeen:world.eventsSeen,
    eventChains:world.eventChains,
    adventureIndex:meta.adventureIndex,
    lastSeenAdventure:meta.lastSeenAdventure,
    recentEventIds:meta.recentEventIds,
    allowRare,
  };
};

state.rollAdventure4Event=function(catalog,{rng=Math.random,allowRare=true,rareWeightMultiplier=.35}={}){
  return rollAdventure4Event(catalog,{context:this.adventure4EventContext({allowRare}),rng,rareWeightMultiplier});
};

state.recordAdventure4Event=function(event){
  if(!event?.id)return{ok:false,reason:'event_required'};
  const {world,meta}=ensure();
  const history=nextAdventure4EventHistory({eventsSeen:world.eventsSeen,eventChains:world.eventChains,lastSeenAdventure:meta.lastSeenAdventure,recentEventIds:meta.recentEventIds},event,meta.adventureIndex);
  world.eventsSeen=history.eventsSeen;
  world.eventChains=history.eventChains;
  meta.lastSeenAdventure=history.lastSeenAdventure;
  meta.recentEventIds=history.recentEventIds;
  this.save();
  return{ok:true,eventId:event.id,seen:world.eventsSeen[event.id],adventureIndex:meta.adventureIndex};
};

ensure();
