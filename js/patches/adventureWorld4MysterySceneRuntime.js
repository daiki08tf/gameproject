/* Adventure / World 4.0 — W11-W13 authored Mystery scene bridge. */
import { state } from '../state.js';
import { adventure4MysterySceneForStage,adventure4MysterySecretRevisitScene } from '../data/adventureWorld4MysteryScenes.js';
import './adventureWorld4MysteryRuntime.js';
import './adventureWorld4EventChainRuntime.js';
const DONE='mystery:sceneDone',SHORTCUT='mystery:shortcutId';
const previousScene=state.adventure4ContentPackIScene?.bind(state),previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);let activeMysterySceneId=null;
function patchFlags(manager,changes){const session=manager.adventure4Session?.();if(!session?.active)return null;return manager.checkpointAdventure4({temporaryFlags:{...(session.temporaryFlags||{}),...changes}});}
state.enterAdventure4MysteryShortcut=function(id){const session=this.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};const exists=this.adventure4VisibleShortcuts?.(session.regionId).some(x=>x.id===id);if(!exists)return{ok:false,reason:'shortcut_locked'};return patchFlags(this,{[SHORTCUT]:id,[DONE]:false});};
state.adventure4ContentPackIScene=function(){const session=this.adventure4Session?.();if(!session?.active)return null;if(session.temporaryFlags?.[SHORTCUT]){activeMysterySceneId='frontier-bell-vault-revisit';return adventure4MysterySecretRevisitScene();}if(session.regionId==='frontier'&&!session.temporaryFlags?.[DONE]){const view=this.adventure4MysteryView?.('frontier-buried-bell'),stage=view?.stage==='discovery'&&view?.secretVisible?'research':view?.stage;const scene=adventure4MysterySceneForStage(stage);if(scene){activeMysterySceneId=scene.id;return scene;}}activeMysterySceneId=null;return previousScene?.()||null;};
state.completeAdventure4ContentPackIScene=function(){if(activeMysterySceneId){const id=activeMysterySceneId,shortcut=id==='frontier-bell-vault-revisit';activeMysterySceneId=null;patchFlags(this,{[DONE]:true,[SHORTCUT]:shortcut?null:this.adventure4Session()?.temporaryFlags?.[SHORTCUT]||null});return{ok:true,mysterySceneId:id};}return previousComplete?.()||{ok:true};};
