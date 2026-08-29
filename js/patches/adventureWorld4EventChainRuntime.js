/* Adventure / World 4.0 — W10 cross-Adventure chain runtime.
   Selection is session-local; W6 eventChains advance only after Scene completion. */
import { state } from '../state.js';
import { adventure4EventChainIForRegion,adventure4EventChainIScene } from '../data/adventureWorld4EventChainsI.js';

const SELECTED='eventChain:selected';
const previousScene=state.adventure4ContentPackIScene?.bind(state);
const previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);

function sessionFlags(manager){return manager.adventure4Session?.()?.temporaryFlags||{};}
function setSelected(manager,id){const session=manager.adventure4Session?.();if(!session?.active)return null;return manager.checkpointAdventure4({temporaryFlags:{...(session.temporaryFlags||{}),[SELECTED]:id||null}});}
function selectedEvent(manager){const session=manager.adventure4Session?.();if(!session?.active)return null;const id=session.temporaryFlags?.[SELECTED];return adventure4EventChainIForRegion(session.regionId).find(event=>event.id===id)||null;}
function currentIndex(){return Math.max(0,Math.floor(Number(state.data.world2?.adventureEventMeta?.adventureIndex)||0));}

function eligibleChainEvents(manager){
  const session=manager.adventure4Session?.();if(!session?.active)return[];
  const memory=manager.adventure4EventMemory?.('frontier-old-sluice');
  return adventure4EventChainIForRegion(session.regionId).filter(event=>!(event.chain?.step>0&&memory?.lastAdventure>=currentIndex()));
}

function chainScene(manager){
  let event=selectedEvent(manager);
  if(!event){
    const candidates=eligibleChainEvents(manager);if(!candidates.length)return null;
    event=manager.rollAdventure4Event?.(candidates,{rareWeightMultiplier:1})||null;
    if(!event)return null;
    setSelected(manager,event.id);
  }
  return adventure4EventChainIScene(event,manager.adventure4EventMemory?.('frontier-old-sluice'));
}

state.adventure4ContentPackIScene=function(){return chainScene(this)||previousScene?.()||null;};
state.completeAdventure4ContentPackIScene=function(){
  const event=selectedEvent(this);
  if(!event)return previousComplete?.()||{ok:true};
  const recorded=this.recordAdventure4Event?.(event);
  setSelected(this,null);
  // W10 counts as this Adventure's authored side scene; do not immediately stack W9.
  previousComplete?.();
  return recorded?.ok?{ok:true,eventId:event.id,chain:event.chain}:recorded;
};

export function adventure4SelectedEventChain(){return selectedEvent(state);}
