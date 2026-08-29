/* Adventure / World 4.0 — W5 Scene runtime bridge.
   Applies Adventure-scoped consequences to W2 session state and delegates
   known persistent consequence families to their authoritative World 4.0 runtimes. */
import { state } from '../state.js';
import './adventureWorld4Session.js';
import './adventureWorld4EventRuntime.js';
import './adventureWorld4DiscoveryRuntime.js';
import './adventureWorld4InvestigationRuntime.js';
import './adventureWorld4EventMemoryRuntime.js';
import './adventureWorld4MysteryRuntime.js';

function unique(values){return [...new Set((values||[]).filter(value=>typeof value==='string'&&value.length))];}

state.applyAdventure4SceneResolution=function(resolution){
  if(!resolution?.ok)return{ok:false,reason:'invalid_resolution'};
  const session=this.adventure4Session();if(!session.active)return{ok:false,reason:'no_session'};
  const patch={temporaryFlags:{...(session.temporaryFlags||{})},cluesThisRun:[...(session.cluesThisRun||[])],discoveredThisRun:[...(session.discoveredThisRun||[])]};
  const immediate=[],external=[],investigation=[],memory=[],mystery=[],living=[],realm=[];
  for(const effect of resolution.consequences||[]){
    if(effect.scope==='adventure'){
      if(effect.type==='flag'&&effect.key)patch.temporaryFlags[effect.key]=effect.value;
      else if(effect.type==='clue'&&effect.key)patch.cluesThisRun.push(effect.key);
      else if(effect.type==='discovery'&&effect.key)patch.discoveredThisRun.push(effect.key);
      else if(effect.type==='trace'&&effect.key)investigation.push({...effect});
      else if(effect.type==='campUsed')patch.campUsed=!!effect.value;
      continue;
    }
    if(effect.scope==='immediate')immediate.push({...effect});
    else if(effect.scope==='world'&&effect.type==='eventMemory')memory.push({...effect});
    else if(effect.scope==='world'&&['mysteryRumor','mysteryTrace','mysteryDiscovery','npcMeeting','mysteryResolve'].includes(effect.type))mystery.push({...effect});
    else if(effect.scope==='world'&&effect.type==='nemesisHuntAdvance')living.push({...effect});
    else if(effect.scope==='world'&&effect.type==='realmDiscovery')realm.push({...effect});
    else external.push({...effect});
  }
  patch.cluesThisRun=unique(patch.cluesThisRun);patch.discoveredThisRun=unique(patch.discoveredThisRun);
  const checkpoint=this.checkpointAdventure4(patch);if(!checkpoint.ok)return checkpoint;
  const investigationResults=[];for(const effect of investigation){const result=this.recordAdventure4TraceById?.(effect.key,{source:`scene:${resolution.sceneId||'unknown'}`});if(result?.ok)investigationResults.push(result);}
  const memoryResults=[];for(const effect of memory){const result=this.applyAdventure4EventMemoryEffect?.(effect);if(result?.ok)memoryResults.push(result);}
  const mysteryResults=[];for(const effect of mystery){const result=this.applyAdventure4MysteryEffect?.(effect);if(result?.ok)mysteryResults.push(result);}
  const livingResults=[];for(const effect of living){const result=this.applyAdventure4LivingWorldEffect?.(effect);if(result?.ok)livingResults.push(result);else external.push({...effect});}
  const realmResults=[];for(const effect of realm){const result=this.applyAdventure4RealmEffect?.(effect);if(result?.ok)realmResults.push(result);else external.push({...effect});}
  return{ok:true,session:this.adventure4Session(),immediate,external,investigation:investigationResults,memory:memoryResults,mystery:mysteryResults,living:livingResults,realm:realmResults};
};