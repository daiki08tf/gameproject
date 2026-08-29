/* Adventure / World 4.0 — W14-W17 build expression runtime.
   Translates existing authorities into field actions without creating a second
   Job, Companion, Equipment or Rune progression system. */
import { state } from '../state.js';
import { getCompanionSpecies } from '../data/companions.js';
import {
  ADVENTURE4_FIELD_ACTIONS,
  ADVENTURE4_JOB_FIELD_ACTIONS,
  ADVENTURE4_COMPANION_TRAIT_ACTIONS,
  ADVENTURE4_COMPANION_NATURE_ACTIONS,
  ADVENTURE4_RUNE_FIELD_ACTIONS,
  adventure4RegionalGearProfile,
  buildAdventure4BuildExpressionScene,
} from '../data/adventureWorld4FieldActions.js';
import './adventureWorld4Session.js';

const FIELD_DONE='field:sceneDone',FIELD_ACTIVE='field:activeSceneId';
let regionalDropRegionId=null;

function addSource(map,action,source){
  if(!ADVENTURE4_FIELD_ACTIONS[action]||!source)return;
  map[action]||=[];
  if(!map[action].some(item=>item.kind===source.kind&&item.id===source.id))map[action].push(source);
}
function addActions(map,actions,source){for(const action of actions||[])addSource(map,action,source);}

function jobSources(target,map){
  const job=target.currentJob||null,id=target.data.currentJobId||job?.id||null;
  const ids=[id,...(Array.isArray(job?.requires)?job.requires:[])].filter(Boolean);
  for(const jobId of ids){
    const actions=ADVENTURE4_JOB_FIELD_ACTIONS[jobId];
    if(actions?.length)addActions(map,actions,{kind:'job',id:jobId,label:jobId===id?(job?.name||jobId):`継承: ${jobId}`});
  }
}
function companionSources(target,map){
  for(const instanceId of (target.data.companionParty||[]).filter(Boolean)){
    const inst=target.data.companionInstances?.[instanceId];if(!inst)continue;
    const species=getCompanionSpecies(inst.speciesId),label=inst.nickname||species?.name||inst.speciesId;
    for(const trait of species?.traits||[])addActions(map,ADVENTURE4_COMPANION_TRAIT_ACTIONS[trait],{kind:'companion',id:instanceId,label,detail:trait});
    addActions(map,ADVENTURE4_COMPANION_NATURE_ACTIONS[inst.nature],{kind:'companion',id:instanceId,label,detail:`性格:${inst.nature}`});
  }
}
function gearSources(target,map){
  for(const slot of ['weapon','shield','head','body','accessory1','accessory2']){
    const id=target.data.equipped?.[slot];if(!id)continue;
    const inst=target.data.weaponInstances?.[id]||target.data.gearInstances?.[id];
    const meta=inst?.adventure4RegionalGear;if(!meta?.regionId)continue;
    const profile=adventure4RegionalGearProfile(meta.regionId);if(!profile)continue;
    addActions(map,profile.fieldActions,{kind:'equipment',id,label:inst.displayName||profile.name,detail:profile.name});
  }
}
function runeSources(target,map){
  for(const [id,actions] of Object.entries(ADVENTURE4_RUNE_FIELD_ACTIONS)){
    const marks=Math.max(0,Math.floor(Number(target.data.rune2Active?.[id])||0));if(!marks)continue;
    addActions(map,actions,{kind:'rune',id,label:`Rune:${id}`,detail:`${marks}刻`});
  }
}

state.adventure4FieldActionSources=function(){const map={};jobSources(this,map);companionSources(this,map);gearSources(this,map);runeSources(this,map);return map;};
state.adventure4FieldActions=function(){return Object.keys(this.adventure4FieldActionSources()).filter(id=>ADVENTURE4_FIELD_ACTIONS[id]).map(id=>({...ADVENTURE4_FIELD_ACTIONS[id],sources:this.adventure4FieldActionSources()[id]}));};
state.adventure4HasFieldAction=function(id){return !!this.adventure4FieldActionSources()[id]?.length;};

state.adventure4RefreshFieldActionFlags=function(){
  const session=this.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};
  const flags={...(session.temporaryFlags||{})},available=new Set(Object.keys(this.adventure4FieldActionSources()));let changed=false;
  for(const id of Object.keys(ADVENTURE4_FIELD_ACTIONS)){const key=`field:${id}`,next=available.has(id);if(!!flags[key]!==next){flags[key]=next;changed=true;}}
  return changed?this.checkpointAdventure4({temporaryFlags:flags}):{ok:true,session};
};

state.adventure4TagRegionalGear=function(instanceId,regionId){
  const profile=adventure4RegionalGearProfile(regionId);if(!profile)return{ok:false,reason:'unknown_region'};
  const inst=this.data.weaponInstances?.[instanceId]||this.data.gearInstances?.[instanceId];if(!inst)return{ok:false,reason:'instance_missing'};
  inst.adventure4RegionalGear={regionId,profileId:profile.id,version:1};this.save();return{ok:true,instanceId,profile};
};
state.beginAdventure4RegionalDropContext=function(regionId){regionalDropRegionId=adventure4RegionalGearProfile(regionId)?regionId:null;return regionalDropRegionId;};
state.endAdventure4RegionalDropContext=function(){regionalDropRegionId=null;};

const previousAddItem=state.addItem?.bind(state);
if(previousAddItem&&!state.__adventure4RegionalLootWrapped){
  state.__adventure4RegionalLootWrapped=true;
  state.addItem=function adventure4RegionalAddItem(itemId,qty=1,dropCtx=null){
    const before=new Set([...Object.keys(this.data.weaponInstances||{}),...Object.keys(this.data.gearInstances||{})]);
    const result=previousAddItem(itemId,qty,dropCtx);
    const regionId=regionalDropRegionId||dropCtx?.adventureRegionId||null,profile=adventure4RegionalGearProfile(regionId);
    if(profile){
      let changed=false;
      for(const id of [...Object.keys(this.data.weaponInstances||{}),...Object.keys(this.data.gearInstances||{})]){
        if(before.has(id))continue;const inst=this.data.weaponInstances?.[id]||this.data.gearInstances?.[id];if(!inst)continue;
        inst.adventure4RegionalGear={regionId,profileId:profile.id,version:1};changed=true;
      }
      if(changed)this.save();
    }
    return result;
  };
}

const previousScene=state.adventure4ContentPackIScene?.bind(state),previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);
state.adventure4ContentPackIScene=function adventure4BuildExpressionScene(){
  const session=this.adventure4Session?.();if(!session?.active)return null;
  this.adventure4RefreshFieldActionFlags();
  const latest=this.adventure4Session();
  if(latest.temporaryFlags?.[FIELD_ACTIVE])return buildAdventure4BuildExpressionScene(latest.regionId);
  const existing=previousScene?.();if(existing)return existing;
  if(latest.temporaryFlags?.[FIELD_DONE])return null;
  const scene=buildAdventure4BuildExpressionScene(latest.regionId),flags={...(latest.temporaryFlags||{}),[FIELD_ACTIVE]:scene.id};
  this.checkpointAdventure4({temporaryFlags:flags});return scene;
};
state.completeAdventure4ContentPackIScene=function adventure4CompleteBuildExpression(){
  const session=this.adventure4Session?.();
  if(session?.temporaryFlags?.[FIELD_ACTIVE]){
    const flags={...(session.temporaryFlags||{}),[FIELD_DONE]:true,[FIELD_ACTIVE]:null};this.checkpointAdventure4({temporaryFlags:flags});return{ok:true,fieldSceneId:session.temporaryFlags[FIELD_ACTIVE]};
  }
  return previousComplete?.()||{ok:true};
};

export { ADVENTURE4_FIELD_ACTIONS };
