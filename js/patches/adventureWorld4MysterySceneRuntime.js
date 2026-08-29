/* Adventure / World 4.0 — W11-W13 authored Mystery scene bridge. */
import { state } from '../state.js';
import { adventure4MysterySceneForStage } from '../data/adventureWorld4MysteryScenes.js';
import './adventureWorld4MysteryRuntime.js';
import './adventureWorld4EventChainRuntime.js';

const DONE='mystery:sceneDone';
const previousScene=state.adventure4ContentPackIScene?.bind(state);
const previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);
let activeMysterySceneId=null;

function patchDone(manager,value){const session=manager.adventure4Session?.();if(!session?.active)return null;return manager.checkpointAdventure4({temporaryFlags:{...(session.temporaryFlags||{}),[DONE]:!!value}});}

state.adventure4ContentPackIScene=function(){
  const session=this.adventure4Session?.();if(!session?.active)return null;
  if(session.regionId==='frontier'&&!session.temporaryFlags?.[DONE]){
    const stage=this.adventure4MysteryStage?.('frontier-buried-bell');
    const scene=adventure4MysterySceneForStage(stage);
    if(scene){activeMysterySceneId=scene.id;return scene;}
  }
  activeMysterySceneId=null;return previousScene?.()||null;
};

state.completeAdventure4ContentPackIScene=function(){
  if(activeMysterySceneId){const id=activeMysterySceneId;activeMysterySceneId=null;patchDone(this,true);return{ok:true,mysterySceneId:id};}
  return previousComplete?.()||{ok:true};
};
