/* Adventure / World 4.0 — W11-W13 runtime.
   Keeps Mystery/NPC metadata under world2 while reusing W7 Discovery and W8 Trace stores. */
import { state } from '../state.js';
import { ADVENTURE4_MYSTERIES,ADVENTURE4_NPCS,ADVENTURE4_MYSTERY_TRACES,ADVENTURE4_MYSTERY_DISCOVERIES,adventure4MysteryById,adventure4MysteryStage,adventure4MysteryHint,adventure4MysterySecretVisible,adventure4NpcById } from '../data/adventureWorld4Mysteries.js';
import './adventureWorld4DiscoveryRuntime.js';
import './adventureWorld4InvestigationRuntime.js';

function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function ensure(){
  state.data.world2||={};const world=state.data.world2;
  world.mysteries=object(world.mysteries);world.mysteries.rumors=object(world.mysteries.rumors);world.mysteries.research=object(world.mysteries.research);world.mysteries.shortcuts=object(world.mysteries.shortcuts);
  world.npcNetwork=object(world.npcNetwork);world.npcNetwork.people=object(world.npcNetwork.people);world.npcNetwork.tradeRoutes=object(world.npcNetwork.tradeRoutes);
  return world;
}
function mysteryContext(world=ensure()){return{rumors:world.mysteries.rumors,traces:world.investigation?.traces||{},discoveries:world.discoveries||{},research:world.mysteries.research};}

state.adventure4MysteryStage=function(id){const mystery=adventure4MysteryById(id);return adventure4MysteryStage(mystery,mysteryContext());};
state.adventure4MysteryView=function(id){const mystery=adventure4MysteryById(id);if(!mystery)return null;const stage=this.adventure4MysteryStage(id);return Object.freeze({id,name:mystery.name,regionId:mystery.regionId,stage,hint:adventure4MysteryHint(mystery,stage),secretVisible:adventure4MysterySecretVisible(mystery,mysteryContext()),storyOptional:!!mystery.storyOptional});};
state.recordAdventure4Rumor=function(rumorId,{source=null}={}){const world=ensure();if(typeof rumorId!=='string'||!rumorId)return{ok:false,reason:'rumor_required'};const existing=world.mysteries.rumors[rumorId];if(!existing)world.mysteries.rumors[rumorId]={source,at:Date.now()};this.save();return{ok:true,id:rumorId,new:!existing};};
state.researchAdventure4Mystery=function(id){const mystery=adventure4MysteryById(id);if(!mystery)return{ok:false,reason:'unknown_mystery'};const world=ensure(),ctx=mysteryContext(world);if(!ctx.traces[mystery.traceId]||!ctx.discoveries[mystery.discoveryId])return{ok:false,reason:'evidence_missing'};const existing=world.mysteries.research[mystery.researchKey];if(!existing)world.mysteries.research[mystery.researchKey]={mysteryId:id,at:Date.now(),resolved:false};this.save();return{ok:true,id,new:!existing};};
state.resolveAdventure4Mystery=function(id){const mystery=adventure4MysteryById(id);if(!mystery)return{ok:false,reason:'unknown_mystery'};const world=ensure();if(!world.mysteries.research[mystery.researchKey])return{ok:false,reason:'research_required'};world.mysteries.research[mystery.researchKey].resolved=true;world.mysteries.research[mystery.researchKey].resolvedAt=Date.now();world.mysteries.shortcuts[mystery.secret.shortcutId]={regionId:mystery.regionId,secretId:mystery.secret.id,unlockedAt:Date.now()};world.npcNetwork.tradeRoutes['frontier-scholar-path']={from:'settlement',to:'frontier',sourceNpc:'sera-wanderer',at:Date.now()};this.save();return{ok:true,id,shortcutId:mystery.secret.shortcutId};};
state.adventure4VisibleShortcuts=function(regionId){const world=ensure();return ADVENTURE4_MYSTERIES.filter(m=>m.regionId===regionId&&world.mysteries.shortcuts[m.secret.shortcutId]).map(m=>Object.freeze({id:m.secret.shortcutId,name:m.secret.name,secretId:m.secret.id,sceneId:m.secret.sceneId}));};

state.recordAdventure4NpcMeeting=function(id,{location=null}={}){const npc=adventure4NpcById(id);if(!npc)return{ok:false,reason:'unknown_npc'};const world=ensure(),current=object(world.npcNetwork.people[id]),meetings=Math.max(0,Number(current.meetings)||0)+1;world.npcNetwork.people[id]={id,role:npc.role,meetings,location:location||current.location||npc.home,lastMetAt:Date.now()};this.save();return{ok:true,id,meetings,location:world.npcNetwork.people[id].location};};
state.moveAdventure4Npc=function(id,location){const npc=adventure4NpcById(id);if(!npc||typeof location!=='string'||!location)return{ok:false,reason:'invalid'};const world=ensure(),current=object(world.npcNetwork.people[id]);world.npcNetwork.people[id]={id,role:npc.role,meetings:Math.max(0,Number(current.meetings)||0),...current,location};this.save();return{ok:true,id,location};};
state.adventure4NpcNetwork=function(){const world=ensure();return ADVENTURE4_NPCS.map(npc=>Object.freeze({...npc,...object(world.npcNetwork.people[npc.id]),location:world.npcNetwork.people[npc.id]?.location||npc.home}));};

state.applyAdventure4MysteryEffect=function(effect){
  if(!effect?.type)return{ok:false,reason:'effect_required'};
  if(effect.type==='mysteryRumor')return this.recordAdventure4Rumor(effect.key,{source:effect.value?.source||null});
  if(effect.type==='mysteryTrace'){const def=ADVENTURE4_MYSTERY_TRACES.find(x=>x.id===effect.key);return def?this.recordAdventure4Trace(def,{source:'mystery'}):{ok:false,reason:'unknown_trace'};}
  if(effect.type==='mysteryDiscovery'){const def=ADVENTURE4_MYSTERY_DISCOVERIES.find(x=>x.id===effect.key);return def?this.recordAdventure4Discovery(def,{source:'mystery'}):{ok:false,reason:'unknown_discovery'};}
  if(effect.type==='npcMeeting'){const r=this.recordAdventure4NpcMeeting(effect.key,{location:effect.value?.location});if(r.ok&&effect.value?.moveTo)this.moveAdventure4Npc(effect.key,effect.value.moveTo);return r;}
  if(effect.type==='mysteryResolve')return this.resolveAdventure4Mystery(effect.key);
  return{ok:false,reason:'unsupported_effect'};
};

ensure();
