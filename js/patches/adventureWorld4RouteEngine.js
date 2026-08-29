/* Adventure / World 4.0 — W3 Route Graph runtime bridge.
   Advances only Adventure Session navigation. Permanent progression remains
   owned by existing Story/World/Settlement systems. */
import { state } from '../state.js';
import { adventure4AvailableNext,adventure4NodeById,validateAdventure4Route } from '../data/adventureWorld4Routes.js';
import './adventureWorld4Session.js';

function sessionContext(session){
  return {
    flags:session.temporaryFlags||{},
    visitedNodeIds:session.visitedNodeIds||[],
    hasDiscovery:id=>!!state.data.world2?.discoveries?.[id],
    isStageCleared:id=>state.isStageCleared?.(id)??false,
  };
}

state.adventure4RouteState=function(route){
  const session=this.adventure4Session();
  const validation=validateAdventure4Route(route);
  if(!validation.ok)return{ok:false,reason:'invalid_route',errors:validation.errors};
  if(!session.active)return{ok:false,reason:'no_session'};
  if(session.regionId!==route.regionId)return{ok:false,reason:'wrong_region'};
  if(session.routeId&&session.routeId!==route.id)return{ok:false,reason:'wrong_route'};
  const currentId=session.currentNodeId||route.entryNodeId;
  const current=adventure4NodeById(route,currentId);
  if(!current)return{ok:false,reason:'node_missing'};
  const next=adventure4AvailableNext(route,current.id,sessionContext(session));
  return{ok:true,current,next,atEntry:current.id===route.entryNodeId};
};

state.enterAdventure4Route=function(route){
  const validation=validateAdventure4Route(route);
  if(!validation.ok)return{ok:false,reason:'invalid_route',errors:validation.errors};
  const session=this.adventure4Session();
  if(!session.active)return{ok:false,reason:'no_session'};
  if(session.regionId!==route.regionId)return{ok:false,reason:'wrong_region'};
  if(session.routeId&&session.routeId!==route.id)return{ok:false,reason:'route_already_selected'};
  const visited=[...new Set([...(session.visitedNodeIds||[]),route.entryNodeId])];
  return this.checkpointAdventure4({routeId:route.id,currentNodeId:route.entryNodeId,visitedNodeIds:visited});
};

state.moveAdventure4ToNode=function(route,nodeId){
  const view=this.adventure4RouteState(route);
  if(!view.ok)return view;
  const allowed=view.next.some(node=>node.id===nodeId);
  if(!allowed)return{ok:false,reason:'unreachable_node'};
  const visited=[...new Set([...(this.adventure4Session().visitedNodeIds||[]),nodeId])];
  return this.checkpointAdventure4({currentNodeId:nodeId,visitedNodeIds:visited});
};
