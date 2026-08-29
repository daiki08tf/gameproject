/* Adventure / World 4.0 — W6 Data-Driven Event Framework
   Filters and selects authored events without owning permanent world state.
   Persistent history is supplied by the caller (normally existing world2
   eventsSeen/eventChains plus lightweight scheduling metadata). */
import { adventure4ConditionMet } from './adventureWorld4Routes.js';

function str(value){return typeof value==='string'&&value.length?value:null;}
function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function list(value){return Array.isArray(value)?value:[];}
function number(value,fallback=0){return Number.isFinite(value)?value:fallback;}

export function normalizeAdventure4Event(value){
  const src=object(value),id=str(src.id),sceneId=str(src.sceneId);
  if(!id||!sceneId)return null;
  const chain=object(src.chain);
  return Object.freeze({
    id,
    sceneId,
    name:str(src.name)||'未詳の出来事',
    weight:Math.max(0,number(src.weight,1)),
    rare:!!src.rare,
    oneShot:!!src.oneShot,
    repeatable:src.repeatable!==false,
    cooldownAdventures:Math.max(0,Math.floor(number(src.cooldownAdventures,0))),
    condition:src.condition&&typeof src.condition==='object'&&!Array.isArray(src.condition)?Object.freeze({...src.condition}):null,
    chain:chain.id?Object.freeze({id:str(chain.id),step:Math.max(0,Math.floor(number(chain.step,0))),terminal:!!chain.terminal}):null,
    tags:Object.freeze(list(src.tags).filter(item=>typeof item==='string'&&item.length)),
  });
}

export function normalizeAdventure4EventCatalog(values){
  const seen=new Set(),out=[];
  for(const raw of list(values)){
    const event=normalizeAdventure4Event(raw);if(!event||seen.has(event.id))continue;
    seen.add(event.id);out.push(event);
  }
  return Object.freeze(out);
}

function chainEligible(event,chains){
  if(!event.chain)return true;
  const state=chains?.[event.chain.id];
  if(event.chain.step===0)return !state||(!state.completed&&(state.step??0)===0);
  return !!state&&!state.completed&&(state.step??0)===event.chain.step;
}

export function adventure4EventEligible(event,context={}){
  if(!event)return false;
  const seenCount=Math.max(0,Number(context.eventsSeen?.[event.id]||0));
  if(event.oneShot&&seenCount>0)return false;
  if(!event.repeatable&&seenCount>0)return false;
  if(!chainEligible(event,context.eventChains||{}))return false;
  if(event.condition&&!adventure4ConditionMet(event.condition,context))return false;
  const now=Math.max(0,Math.floor(number(context.adventureIndex,0)));
  const last=Math.floor(number(context.lastSeenAdventure?.[event.id],-Infinity));
  if(Number.isFinite(last)&&now-last<=event.cooldownAdventures)return false;
  const recent=list(context.recentEventIds);
  if(recent.includes(event.id))return false;
  if(event.rare&&context.allowRare===false)return false;
  return true;
}

export function adventure4EventPool(catalog,context={}){
  return list(catalog).filter(event=>adventure4EventEligible(event,context));
}

function weightedRoll(pool,rng,rareWeightMultiplier){
  const weighted=pool.map(event=>({event,weight:event.weight*(event.rare?Math.max(0,rareWeightMultiplier):1)})).filter(entry=>entry.weight>0);
  if(!weighted.length)return null;
  const total=weighted.reduce((sum,entry)=>sum+entry.weight,0);
  let roll=Math.min(.999999999999,Math.max(0,number(rng?.(),0)))*total;
  for(const entry of weighted){roll-=entry.weight;if(roll<0)return entry.event;}
  return weighted.at(-1).event;
}

export function rollAdventure4Event(catalog,{context={},rng=Math.random,rareWeightMultiplier=.35}={}){
  let pool=adventure4EventPool(catalog,context);
  if(!pool.length&&list(context.recentEventIds).length){
    pool=adventure4EventPool(catalog,{...context,recentEventIds:[]});
  }
  return weightedRoll(pool,rng,rareWeightMultiplier);
}

export function nextAdventure4EventHistory(history,event,adventureIndex,{recentLimit=3}={}){
  const src=object(history),eventsSeen={...object(src.eventsSeen)},lastSeenAdventure={...object(src.lastSeenAdventure)},eventChains={};
  for(const [id,value] of Object.entries(object(src.eventChains)))eventChains[id]={...object(value)};
  const recent=list(src.recentEventIds).filter(id=>typeof id==='string'&&id.length);
  if(!event)return{eventsSeen,lastSeenAdventure,eventChains,recentEventIds:recent.slice(-recentLimit)};
  eventsSeen[event.id]=(eventsSeen[event.id]||0)+1;
  lastSeenAdventure[event.id]=Math.max(0,Math.floor(number(adventureIndex,0)));
  const nextRecent=[...recent.filter(id=>id!==event.id),event.id].slice(-Math.max(1,recentLimit));
  if(event.chain){
    const current=eventChains[event.chain.id]||{started:true,step:0,completed:false};
    current.started=true;
    if(event.chain.terminal){current.completed=true;current.step=event.chain.step;}
    else{current.completed=false;current.step=event.chain.step+1;}
    eventChains[event.chain.id]=current;
  }
  return{eventsSeen,lastSeenAdventure,eventChains,recentEventIds:nextRecent};
}
