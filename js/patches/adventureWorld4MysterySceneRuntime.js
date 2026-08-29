/* Adventure / World 4.0 — W11-W13 authored Mystery scene bridge. */
import { state } from '../state.js';
import { adventure4MysterySceneForStage,adventure4MysterySecretRevisitScene } from '../data/adventureWorld4MysteryScenes.js';
import './adventureWorld4MysteryRuntime.js';
import './adventureWorld4EventChainRuntime.js';
const DONE='mystery:sceneDone',SHORTCUT='mystery:shortcutId',ACTIVE='mystery:activeSceneId';
const previousScene=state.adventure4ContentPackIScene?.bind(state),previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);
function patchFlags(manager,changes){const session=manager.adventure4Session?.();if(!session?.active)return null;return manager.checkpointAdventure4({temporaryFlags:{...(session.temporaryFlags||{}),...changes}});}
function activeId(manager){return manager.adventure4Session?.()?.temporaryFlags?.[ACTIVE]||null;}
function selectMystery(manager,id){patchFlags(manager,{[ACTIVE]:id});}
state.enterAdventure4MysteryShortcut=function(id){const session=this.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};const exists=this.adventure4VisibleShortcuts?.(session.regionId).some(x=>x.id===id);if(!exists)return{ok:false,reason:'shortcut_locked'};return patchFlags(this,{[SHORTCUT]:id,[DONE]:false,[ACTIVE]:null});};
state.adventure4ContentPackIScene=function(){
  const session=this.adventure4Session?.();if(!session?.active)return null;
  const active=activeId(this);
  if(active==='frontier-bell-vault-revisit')return adventure4MysterySecretRevisitScene();
  if(active){const stage=this.adventure4MysteryView?.('frontier-buried-bell')?.stage,scene=adventure4MysterySceneForStage(stage==='discovery'&&this.adventure4MysteryView?.('frontier-buried-bell')?.secretVisible?'research':stage);if(scene?.id===active)return scene;}
  if(session.temporaryFlags?.[SHORTCUT]){selectMystery(this,'frontier-bell-vault-revisit');return adventure4MysterySecretRevisitScene();}
  // Existing W10 multi-Adventure chains keep priority. W11 must not starve or reorder them.
  if(this.adventure4HasPendingEventChain?.())return previousScene?.()||null;
  if(session.regionId==='frontier'&&!session.temporaryFlags?.[DONE]){const view=this.adventure4MysteryView?.('frontier-buried-bell'),stage=view?.stage==='discovery'&&view?.secretVisible?'research':view?.stage,scene=adventure4MysterySceneForStage(stage);if(scene){selectMystery(this,scene.id);return scene;}}
  return previousScene?.()||null;
};
state.completeAdventure4ContentPackIScene=function(){const id=activeId(this);if(id){const shortcut=id==='frontier-bell-vault-revisit';patchFlags(this,{[DONE]:true,[SHORTCUT]:shortcut?null:this.adventure4Session()?.temporaryFlags?.[SHORTCUT]||null,[ACTIVE]:null});return{ok:true,mysterySceneId:id};}return previousComplete?.()||{ok:true};};
