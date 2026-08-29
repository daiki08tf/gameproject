/* Adventure / World 4.0 — W10 persistent event-memory runtime. */
import { state } from '../state.js';
import { adventure4EventMemoryFlags,adventure4EventMemoryView,nextAdventure4EventMemory,normalizeAdventure4EventMemory } from '../data/adventureWorld4EventMemory.js';
import './adventureWorld4EventRuntime.js';

function ensure(){
  state.data.world2||={};
  const world=state.data.world2;
  world.eventMemory=normalizeAdventure4EventMemory(world.eventMemory);
  return world.eventMemory;
}
function adventureIndex(){return Math.max(0,Math.floor(Number(state.data.world2?.adventureEventMeta?.adventureIndex)||0));}

state.rememberAdventure4Event=function(eventId,patch={}){
  if(typeof eventId!=='string'||!eventId)return{ok:false,reason:'event_id_required'};
  state.data.world2.eventMemory=nextAdventure4EventMemory(ensure(),eventId,patch,adventureIndex());
  this.save();
  return{ok:true,eventId,memory:adventure4EventMemoryView(state.data.world2.eventMemory,eventId)};
};
state.adventure4EventMemory=function(eventId){return adventure4EventMemoryView(ensure(),eventId);};
state.adventure4EventMemoryFlags=function(){return adventure4EventMemoryFlags(ensure());};
state.applyAdventure4EventMemoryEffect=function(effect){
  if(!effect||effect.type!=='eventMemory'||!effect.key)return{ok:false,reason:'unsupported_effect'};
  const value=effect.value&&typeof effect.value==='object'&&!Array.isArray(effect.value)?effect.value:{};
  return this.rememberAdventure4Event(effect.key,value);
};

ensure();
