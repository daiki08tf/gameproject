/* Adventure / World 4.0 — W4 pilot route adapter.
   Builds the first playable vertical slice from the canonical next Story stage.
   No Story completion, battle stats, rewards, or loot are duplicated here. */
import { normalizeAdventure4Route } from './adventureWorld4Routes.js';

export function buildAdventure4PilotRoute(region,regionState){
  if(!region?.id)return null;
  const story=regionState?.routeEntry||null;
  const nodes=[
    {id:'entry',type:'scene',name:`${region.name}への道`,next:['fork'],tags:['major','visible']},
    {id:'fork',type:'event',name:'分かれ道',next:story?['story','return']:['return'],tags:['choice','visible']},
  ];
  if(story){
    nodes.push({
      id:'story',
      type:'battle',
      name:story.stageName||'物語の戦い',
      stageId:story.stageId,
      next:['return'],
      tags:['story','major'],
    });
  }
  nodes.push({id:'return',type:'camp',name:'帰還路',next:[],tags:['return','visible']});
  return normalizeAdventure4Route({
    id:`${region.id}-story-pilot`,
    regionId:region.id,
    name:`${region.name}・主要路`,
    entryNodeId:'entry',
    nodes,
    tags:['story','pilot'],
  });
}

export function adventure4PilotPreview(route,currentNodeId){
  if(!route)return[];
  const current=route.nodes.find(node=>node.id===currentNodeId)||route.nodes.find(node=>node.id===route.entryNodeId)||null;
  if(!current)return[];
  const next=current.next.map(id=>route.nodes.find(node=>node.id===id)).filter(Boolean);
  const visible=[{name:current.name,state:'current'},...next.map(node=>({name:node.name,state:'next'}))];
  if(next.some(node=>node.next?.length))visible.push({name:'この先は未詳',state:'unknown'});
  return visible;
}
