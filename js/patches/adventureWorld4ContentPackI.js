/* Adventure / World 4.0 — W9 Content Pack I runtime.
   Selects at most one authored ambient/investigation scene per Adventure and
   reuses W6 history. The existing route/story flow remains authoritative. */
import { state } from '../state.js';
import { adventure4ContentPackIForRegion,adventure4ContentPackISceneById } from '../data/adventureWorld4ContentPackI.js';
import './adventureWorld4EventRuntime.js';

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

state.adventure4ContentPackIScene=function(){const event=this.adventure4ContentPackIEvent();return event?adventure4ContentPackISceneById(event.sceneId):null;};
state.completeAdventure4ContentPackIScene=function(){const session=this.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};return patchFlags(this,{[EVENT_FLAG]:null,[DONE_FLAG]:true});};
