/* Adventure / World 4.0 — W3 Route Graph & Node Engine
   Pure data/graph utilities. Nodes reference canonical systems (stageId, sceneId,
   discoveryId, etc.) and never duplicate battle/reward definitions. */

export const ADVENTURE4_NODE_TYPES=Object.freeze(['battle','elite','boss','event','discovery','treasure','camp','npc','nemesis','rift','secret','scene']);
const TYPE_SET=new Set(ADVENTURE4_NODE_TYPES);

function strings(value){return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&x.length))]:[];}
function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?{...value}:{};}
function str(value){return typeof value==='string'&&value.length?value:null;}

export function normalizeAdventure4Node(value){
  const src=object(value),id=str(src.id);
  if(!id)return null;
  const type=TYPE_SET.has(src.type)?src.type:'scene';
  return Object.freeze({
    id,
    type,
    name:str(src.name)||'未詳の地点',
    next:Object.freeze(strings(src.next)),
    stageId:str(src.stageId),
    sceneId:str(src.sceneId),
    discoveryId:str(src.discoveryId),
    hidden:!!src.hidden,
    condition:src.condition&&typeof src.condition==='object'&&!Array.isArray(src.condition)?Object.freeze({...src.condition}):null,
    tags:Object.freeze(strings(src.tags)),
  });
}

export function normalizeAdventure4Route(value){
  const src=object(value),id=str(src.id),regionId=str(src.regionId);
  if(!id||!regionId)return null;
  const seen=new Set(),nodes=[];
  for(const raw of Array.isArray(src.nodes)?src.nodes:[]){
    const node=normalizeAdventure4Node(raw);
    if(!node||seen.has(node.id))continue;
    seen.add(node.id);nodes.push(node);
  }
  const entryNodeId=str(src.entryNodeId)||nodes[0]?.id||null;
  return Object.freeze({
    id,regionId,
    name:str(src.name)||'探索路',
    entryNodeId,
    nodes:Object.freeze(nodes),
    tags:Object.freeze(strings(src.tags)),
  });
}

export function adventure4NodeById(route,nodeId){return route?.nodes?.find(node=>node.id===nodeId)||null;}

export function validateAdventure4Route(route){
  const errors=[];
  if(!route)return{ok:false,errors:['route_missing']};
  const ids=new Set(route.nodes.map(n=>n.id));
  if(!route.entryNodeId||!ids.has(route.entryNodeId))errors.push('entry_missing');
  for(const node of route.nodes){
    for(const nextId of node.next)if(!ids.has(nextId))errors.push(`missing_edge:${node.id}->${nextId}`);
    if(['battle','elite','boss'].includes(node.type)&&!node.stageId)errors.push(`stage_missing:${node.id}`);
  }
  return{ok:errors.length===0,errors};
}

export function adventure4ConditionMet(condition,context={}){
  if(!condition)return true;
  if(condition.anyOf){return condition.anyOf.some(c=>adventure4ConditionMet(c,context));}
  if(condition.allOf){return condition.allOf.every(c=>adventure4ConditionMet(c,context));}
  if(condition.flag)return !!context.flags?.[condition.flag];
  if(condition.discovery)return !!context.hasDiscovery?.(condition.discovery);
  if(condition.stageCleared)return !!context.isStageCleared?.(condition.stageCleared);
  if(condition.visited)return !!context.visitedNodeIds?.includes(condition.visited);
  return false;
}

export function adventure4AvailableNext(route,currentNodeId,context={}){
  const current=adventure4NodeById(route,currentNodeId);
  if(!current)return[];
  return current.next
    .map(id=>adventure4NodeById(route,id))
    .filter(Boolean)
    .filter(node=>adventure4ConditionMet(node.condition,context));
}

export function adventure4Reachable(route,{includeHidden=false,context={}}={}){
  if(!route?.entryNodeId)return[];
  const out=[],seen=new Set(),queue=[route.entryNodeId];
  while(queue.length){
    const id=queue.shift();if(seen.has(id))continue;seen.add(id);
    const node=adventure4NodeById(route,id);if(!node)continue;
    const conditionMet=adventure4ConditionMet(node.condition,context);
    const visible=!node.hidden||includeHidden;
    if(!conditionMet||!visible)continue;
    out.push(node);
    for(const nextId of node.next)if(!seen.has(nextId))queue.push(nextId);
  }
  return out;
}
