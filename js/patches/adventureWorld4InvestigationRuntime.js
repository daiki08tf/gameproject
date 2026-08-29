/* Adventure / World 4.0 — W8 investigation runtime bridge.
   Persistent Trace/Clue knowledge lives under world2.investigation. */
import { state } from '../state.js';
import { ADVENTURE4_INVESTIGATION_CATALOG,adventure4TraceById,adventure4ClueById,deriveAdventure4Clues,adventure4InvestigationBoard } from '../data/adventureWorld4Investigation.js';
import './adventureWorld4Session.js';

function ensure(){
  state.data.world2||={};
  const world=state.data.world2;
  if(!world.investigation||typeof world.investigation!=='object'||Array.isArray(world.investigation))world.investigation={traces:{},clues:{}};
  if(!world.investigation.traces||typeof world.investigation.traces!=='object'||Array.isArray(world.investigation.traces))world.investigation.traces={};
  if(!world.investigation.clues||typeof world.investigation.clues!=='object'||Array.isArray(world.investigation.clues))world.investigation.clues={};
  return world.investigation;
}

function syncSessionClue(manager,id){
  const session=manager.adventure4Session?.();if(!session?.active)return;
  manager.checkpointAdventure4({cluesThisRun:[...new Set([...(session.cluesThisRun||[]),id])]});
}

state.recordAdventure4Clue=function(clue,{source=null}={}){
  if(!clue?.id||!clue?.regionId)return{ok:false,reason:'clue_required'};
  const store=ensure(),existing=store.clues[clue.id];
  if(!existing)store.clues[clue.id]={regionId:clue.regionId,source:source||'investigation',at:Date.now()};
  syncSessionClue(this,clue.id);this.save();
  return{ok:true,id:clue.id,new:!existing};
};

state.resolveAdventure4Investigation=function(catalog=ADVENTURE4_INVESTIGATION_CATALOG){
  const store=ensure(),derived=deriveAdventure4Clues(catalog,store),recorded=[];
  for(const clue of derived){const result=this.recordAdventure4Clue(clue,{source:'connected-evidence'});if(result.ok&&result.new)recorded.push(clue.id);}
  return{ok:true,derived:recorded};
};

state.recordAdventure4Trace=function(trace,{source=null,catalog=ADVENTURE4_INVESTIGATION_CATALOG}={}){
  if(!trace?.id||!trace?.regionId)return{ok:false,reason:'trace_required'};
  const store=ensure(),existing=store.traces[trace.id];
  if(!existing)store.traces[trace.id]={regionId:trace.regionId,source:source||trace.sourceId||null,at:Date.now()};
  const investigation=this.resolveAdventure4Investigation(catalog);this.save();
  return{ok:true,id:trace.id,new:!existing,derivedClues:investigation.derived};
};

state.recordAdventure4TraceById=function(id,{catalog=ADVENTURE4_INVESTIGATION_CATALOG,source=null}={}){
  const trace=adventure4TraceById(catalog,id);if(!trace)return{ok:false,reason:'unknown_trace'};
  return this.recordAdventure4Trace(trace,{source,catalog});
};
state.recordAdventure4ClueById=function(id,{catalog=ADVENTURE4_INVESTIGATION_CATALOG,source=null}={}){
  const clue=adventure4ClueById(catalog,id);if(!clue)return{ok:false,reason:'unknown_clue'};
  return this.recordAdventure4Clue(clue,{source});
};
state.adventure4InvestigationRecords=function(){const store=ensure();return typeof structuredClone==='function'?structuredClone(store):JSON.parse(JSON.stringify(store));};
state.adventure4InvestigationBoard=function({catalog=ADVENTURE4_INVESTIGATION_CATALOG,regions=[]}={}){return adventure4InvestigationBoard(catalog,ensure(),regions);};

ensure();
