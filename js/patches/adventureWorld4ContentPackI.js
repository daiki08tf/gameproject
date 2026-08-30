/* Adventure / World 4.0 — W9/W31 authored event runtime facade.
   Pack II adds Region variety while W6 event history and the Adventure session
   remain authoritative. No reward or permanent progression state is owned here. */
import { state } from '../state.js';
import { adventure4ContentPackIForRegion,adventure4ContentPackISceneById } from '../data/adventureWorld4ContentPackI.js';
import './adventureWorld4EventRuntime.js';
import './adventureWorld4HorizontalGearRuntime.js';
import './adventureWorld4ContentPackII.js';

const EVENT_FLAG='contentPackI:eventId';
const DONE_FLAG='contentPackI:done';

function patchFlags(manager,changes){const session=manager.adventure4Session?.();if(!session?.active)return null;return manager.checkpointAdventure4({temporaryFlags:{...(session.temporaryFlags||{}),...changes}});}

state.adventure4ContentPackIEvent=function(){
  const session=this.adventure4Session?.();if(!session?.active)return null;
  const id=session.temporaryFlags?.[EVENT_FLAG];
  if(id)return adventure4ContentPackIForRegion(session.regionId).events.find(event=>event.id===id)||null;
  if(session.temporaryFlags?.[DONE_FLAG])return null;
  const pack=adventure4ContentPackIForRegion(session.regionId);if(!pack.events.length)return null;
  const event=this.rollAdventure4Event?.(pack.events);if(!event)return null;
  this.recordAdventure4Event?.(event);patchFlags(this,{[EVENT_FLAG]:event.id});return event;
};

// The UI keeps one ambient-scene entry point. Pack II is tried first on its
// deterministic alternating Adventures; Pack I remains the fallback.
state.adventure4ContentPackIScene=function(){
  const expanded=this.adventure4ContentPackIIScene?.();if(expanded)return expanded;
  const event=this.adventure4ContentPackIEvent();return event?adventure4ContentPackISceneById(event.sceneId):null;
};
state.completeAdventure4ContentPackIScene=function(){
  const session=this.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};
  if(session.temporaryFlags?.['contentPackII:eventId'])return this.completeAdventure4ContentPackIIScene?.()||{ok:false,reason:'missing_pack_ii'};
  return patchFlags(this,{[EVENT_FLAG]:null,[DONE_FLAG]:true});
};
