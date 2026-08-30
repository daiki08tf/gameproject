/* Adventure / World 4.0 — W31 Content Pack II runtime.
   Uses the existing W6 event history and Adventure session temporary flags.
   No new permanent state. Pack II alternates with Pack I by adventure index so
   the expansion adds variety instead of replacing the original authored pool. */
import { state } from '../state.js';
import { adventure4ContentPackIIForRegion,adventure4ContentPackIISceneById } from '../data/adventureWorld4ContentPackII.js';
import './adventureWorld4EventRuntime.js';

const EVENT_FLAG='contentPackII:eventId';
const DONE_FLAG='contentPackII:done';

function patchFlags(manager,changes){const session=manager.adventure4Session?.();if(!session?.active)return null;return manager.checkpointAdventure4({temporaryFlags:{...(session.temporaryFlags||{}),...changes}});}

state.adventure4ContentPackIIEvent=function(){
  const session=this.adventure4Session?.();if(!session?.active)return null;
  const id=session.temporaryFlags?.[EVENT_FLAG];
  if(id)return adventure4ContentPackIIForRegion(session.regionId).events.find(event=>event.id===id)||null;
  if(session.temporaryFlags?.[DONE_FLAG])return null;
  const context=this.adventure4EventContext?.()||{};
  if((Number(context.adventureIndex)||0)%2!==0)return null;
  const pack=adventure4ContentPackIIForRegion(session.regionId);if(!pack.events.length)return null;
  const event=this.rollAdventure4Event?.(pack.events);if(!event)return null;
  this.recordAdventure4Event?.(event);patchFlags(this,{[EVENT_FLAG]:event.id});return event;
};

state.adventure4ContentPackIIScene=function(){const event=this.adventure4ContentPackIIEvent();return event?adventure4ContentPackIISceneById(event.sceneId):null;};
state.completeAdventure4ContentPackIIScene=function(){const session=this.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};return patchFlags(this,{[EVENT_FLAG]:null,[DONE_FLAG]:true});};
