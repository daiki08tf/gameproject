/* Adventure / World 4.0 — W2 Adventure Session Foundation
   Owns resumable Adventure-only navigation/session state. Permanent Story,
   Discovery, rewards, Settlement, Codex, World Tier, etc. stay with their
   existing authoritative systems. */
import { state } from '../state.js';

export const ADVENTURE4_VERSION=1;

export function defaultAdventure4Session(){
  return {
    version:ADVENTURE4_VERSION,
    active:false,
    suspended:false,
    regionId:null,
    routeId:null,
    currentNodeId:null,
    visitedNodeIds:[],
    discoveredThisRun:[],
    cluesThisRun:[],
    temporaryFlags:{},
    campUsed:false,
    seed:null,
    pendingEncounter:null,
    returnTarget:null,
  };
}

function stringOrNull(value){return typeof value==='string'&&value.length?value:null;}
function uniqueStrings(value){return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&x.length))]:[];}
function plainObject(value){return value&&typeof value==='object'&&!Array.isArray(value)?{...value}:{};}

export function normalizeAdventure4Session(value){
  const src=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const normalized={
    version:ADVENTURE4_VERSION,
    active:!!src.active,
    suspended:!!src.suspended,
    regionId:stringOrNull(src.regionId),
    routeId:stringOrNull(src.routeId),
    currentNodeId:stringOrNull(src.currentNodeId),
    visitedNodeIds:uniqueStrings(src.visitedNodeIds),
    discoveredThisRun:uniqueStrings(src.discoveredThisRun),
    cluesThisRun:uniqueStrings(src.cluesThisRun),
    temporaryFlags:plainObject(src.temporaryFlags),
    campUsed:!!src.campUsed,
    seed:Number.isFinite(src.seed)?src.seed:null,
    pendingEncounter:src.pendingEncounter&&typeof src.pendingEncounter==='object'&&!Array.isArray(src.pendingEncounter)?{...src.pendingEncounter}:null,
    returnTarget:stringOrNull(src.returnTarget),
  };
  if(!normalized.active||!normalized.regionId)return defaultAdventure4Session();
  return normalized;
}

function ensure(){
  const before=state.data.adventure4;
  const normalized=normalizeAdventure4Session(before);
  const changed=JSON.stringify(before)!==JSON.stringify(normalized);
  state.data.adventure4=normalized;
  if(changed)state.save();
  return state.data.adventure4;
}

function snapshot(session=ensure()){
  return typeof structuredClone==='function'?structuredClone(session):JSON.parse(JSON.stringify(session));
}

state.adventure4Session=function(){return snapshot();};
state.adventure4HasSession=function(){return !!ensure().active;};
state.adventure4CanResume=function(){const s=ensure();return !!(s.active&&s.suspended);};

state.startAdventure4=function({regionId,routeId=null,currentNodeId=null,seed=null,returnTarget='home'}={}){
  const current=ensure();
  if(current.active)return{ok:false,reason:'active_session',session:snapshot(current)};
  if(!stringOrNull(regionId))return{ok:false,reason:'region_required'};
  state.data.adventure4=normalizeAdventure4Session({...defaultAdventure4Session(),active:true,regionId,routeId,currentNodeId,seed,returnTarget});
  this.save();
  return{ok:true,session:snapshot(state.data.adventure4)};
};

state.suspendAdventure4=function(){
  const s=ensure();
  if(!s.active)return{ok:false,reason:'no_session'};
  if(s.suspended)return{ok:true,alreadySuspended:true,session:snapshot(s)};
  s.suspended=true;this.save();
  return{ok:true,session:snapshot(s)};
};

state.resumeAdventure4=function(){
  const s=ensure();
  if(!s.active)return{ok:false,reason:'no_session'};
  if(!s.suspended)return{ok:true,alreadyActive:true,session:snapshot(s)};
  s.suspended=false;this.save();
  return{ok:true,session:snapshot(s)};
};

const CHECKPOINT_KEYS=new Set(['routeId','currentNodeId','visitedNodeIds','discoveredThisRun','cluesThisRun','temporaryFlags','campUsed','seed','pendingEncounter','returnTarget']);
state.checkpointAdventure4=function(patch={}){
  const s=ensure();
  if(!s.active)return{ok:false,reason:'no_session'};
  const next={...s};
  for(const [key,value] of Object.entries(patch||{}))if(CHECKPOINT_KEYS.has(key))next[key]=value;
  state.data.adventure4=normalizeAdventure4Session(next);
  this.save();
  return{ok:true,session:snapshot(state.data.adventure4)};
};

state.returnFromAdventure4=function(){
  const s=ensure();
  if(!s.active)return{ok:false,reason:'no_session'};
  const completed=snapshot(s);
  state.data.adventure4=defaultAdventure4Session();
  this.save();
  return{ok:true,session:completed,returnTarget:completed.returnTarget||'home'};
};

ensure();
