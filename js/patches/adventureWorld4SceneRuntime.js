/* Adventure / World 4.0 — W5 Scene runtime bridge.
   Applies Adventure-scoped consequences only to W2 session state.
   Region/World effects are surfaced to their authoritative systems instead of
   being persisted here. */
import { state } from '../state.js';
import './adventureWorld4Session.js';

function unique(values){return [...new Set((values||[]).filter(value=>typeof value==='string'&&value.length))];}

state.applyAdventure4SceneResolution=function(resolution){
  if(!resolution?.ok)return{ok:false,reason:'invalid_resolution'};
  const session=this.adventure4Session();if(!session.active)return{ok:false,reason:'no_session'};
  const patch={
    temporaryFlags:{...(session.temporaryFlags||{})},
    cluesThisRun:[...(session.cluesThisRun||[])],
    discoveredThisRun:[...(session.discoveredThisRun||[])],
  };
  const immediate=[],external=[];
  for(const effect of resolution.consequences||[]){
    if(effect.scope==='adventure'){
      if(effect.type==='flag'&&effect.key)patch.temporaryFlags[effect.key]=effect.value;
      else if(effect.type==='clue'&&effect.key)patch.cluesThisRun.push(effect.key);
      else if(effect.type==='discovery'&&effect.key)patch.discoveredThisRun.push(effect.key);
      else if(effect.type==='campUsed')patch.campUsed=!!effect.value;
      continue;
    }
    if(effect.scope==='immediate')immediate.push({...effect});
    else external.push({...effect});
  }
  patch.cluesThisRun=unique(patch.cluesThisRun);patch.discoveredThisRun=unique(patch.discoveredThisRun);
  const checkpoint=this.checkpointAdventure4(patch);
  if(!checkpoint.ok)return checkpoint;
  return{ok:true,session:checkpoint.session,immediate,external};
};
