/* Adventure / World 4.0 — W18-W22 Living World runtime.
   Reads current authorities and translates them into optional Adventure state.
   No combat/reward multipliers are reproduced here. */
import { state } from '../state.js';
import {
  adventure4UtilitySetFromRegionalGear,
  adventure4WorldTierAvailability,
  adventure4NemesisHuntStage,
  adventure4NemesisRegion,
  adventure4LivingWorldFlags,
  buildAdventure4LivingWorldScene,
} from '../data/adventureWorld4LivingWorld.js';
import './adventureWorld4BuildExpressionRuntime.js';
import './adventureWorld4EventRuntime.js';
import './settlementSeasons.js';
import './worldTierRuntime.js';
import './bounty2Foundation.js';

const DONE='living:sceneDone',ACTIVE='living:activeSceneId',HUNT_MOVES='living:nemesisMoves';
const previousScene=state.adventure4ContentPackIScene?.bind(state);
const previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);
const previousEventContext=state.adventure4EventContext?.bind(state);

function equippedRegionalInstances(target){
  const out=[];
  for(const slot of ['weapon','shield','head','body','accessory1','accessory2']){
    const id=target.data.equipped?.[slot];if(!id)continue;
    const inst=target.data.weaponInstances?.[id]||target.data.gearInstances?.[id];
    if(inst)out.push(inst);
  }
  return out;
}
function patchFlags(target,patch){
  const session=target.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};
  return target.checkpointAdventure4({temporaryFlags:{...(session.temporaryFlags||{}),...patch}});
}

state.adventure4UtilitySetStatus=function(regionId=this.adventure4Session?.()?.regionId){
  return adventure4UtilitySetFromRegionalGear(equippedRegionalInstances(this),regionId||null);
};

state.adventure4NemesisHuntState=function(){
  const active=this.activeBountyNemesis?.();
  if(!active)return{active:false,stage:'inactive',regionId:null,targetStageId:null,info:null};
  const session=this.adventure4Session?.();
  const moves=Math.max(0,Math.floor(Number(session?.temporaryFlags?.[HUNT_MOVES])||0));
  const stage=adventure4NemesisHuntStage({active:true,intel:active.intel,huntMode:active.huntMode});
  return{active:true,stage,regionId:adventure4NemesisRegion(active.id,moves),targetStageId:active.id,info:active,moves};
};

state.advanceAdventure4NemesisHunt=function(){
  const hunt=this.adventure4NemesisHuntState();
  if(!hunt.active)return{ok:false,reason:'no_active_nemesis'};
  if(hunt.stage==='located')return{ok:true,...hunt,ready:true};
  const flag=hunt.stage==='activity'?'nemesisWeakness':hunt.stage==='trace'?'nemesisMutationKnown':'nemesisPreempt';
  const applied=this.applyNemesisEventFlag?.(flag);
  if(!applied?.ok)return applied||{ok:false,reason:'nemesis_authority_unavailable'};
  const session=this.adventure4Session?.();
  if(session?.active)patchFlags(this,{[HUNT_MOVES]:hunt.moves+1,'living:nemesisEscaped':false});
  return{ok:true,...this.adventure4NemesisHuntState(),appliedFlag:flag};
};

state.escapeAdventure4NemesisHunt=function(){
  const hunt=this.adventure4NemesisHuntState();if(!hunt.active)return{ok:false,reason:'no_active_nemesis'};
  const result=patchFlags(this,{'living:nemesisEscaped':true,[HUNT_MOVES]:hunt.moves+1});
  return result?.ok?{ok:true,...this.adventure4NemesisHuntState(),escaped:true}:result;
};

state.adventure4LivingWorldContext=function(){
  const session=this.adventure4Session?.();
  const cycle=this.settlementSeasonState?.()||{};
  const tier=this.activeWorldTier?.()||{id:'normal',rank:0};
  const utility=this.adventure4UtilitySetStatus(session?.regionId||null);
  const hunt=this.adventure4NemesisHuntState();
  const worldEvent=this.data.world2?.lastEvent||null;
  const availability=adventure4WorldTierAvailability(tier.rank||0);
  return{
    regionId:session?.regionId||null,
    seasonId:cycle.season?.id||null,seasonName:cycle.season?.name||null,
    weatherId:cycle.weather?.id||null,weatherName:cycle.weather?.name||null,
    daypartId:cycle.daypart?.id||null,daypartName:cycle.daypart?.name||null,
    festivalId:cycle.festival?.id||null,
    worldEvent,
    worldTierId:tier.id||'normal',worldTierRank:tier.rank||0,worldTierAvailability:availability,
    utility,hunt,nemesisStage:hunt.stage,nemesisHere:!!hunt.active&&hunt.regionId===session?.regionId,
    flags:adventure4LivingWorldFlags({
      season:cycle.season?.id||null,weather:cycle.weather?.id||null,daypart:cycle.daypart?.id||null,
      worldEvent:worldEvent?.id||null,worldTierRank:tier.rank||0,utilityEffects:utility.effects,
      nemesisStage:hunt.stage,nemesisRegion:hunt.regionId,
    }),
  };
};

state.adventure4RefreshLivingWorldFlags=function(){
  const session=this.adventure4Session?.();if(!session?.active)return{ok:false,reason:'no_session'};
  const ctx=this.adventure4LivingWorldContext(),flags={...(session.temporaryFlags||{})};
  for(const key of Object.keys(flags))if(key.startsWith('living:season:')||key.startsWith('living:weather:')||key.startsWith('living:daypart:')||key.startsWith('living:event:')||key.startsWith('living:utility:')||key.startsWith('living:wt:')||key.startsWith('living:nemesis:')||key.startsWith('living:nemesisRegion:'))delete flags[key];
  Object.assign(flags,ctx.flags);
  return this.checkpointAdventure4({temporaryFlags:flags});
};

state.applyAdventure4LivingWorldEffect=function(effect){
  if(effect?.type!=='nemesisHuntAdvance')return{ok:false,reason:'unknown_effect'};
  return this.advanceAdventure4NemesisHunt();
};

if(previousEventContext){
  state.adventure4EventContext=function adventure4LivingEventContext(options={}){
    const ctx=previousEventContext(options),living=this.adventure4LivingWorldContext();
    return{...ctx,flags:{...(ctx.flags||{}),...living.flags},livingWorld:living};
  };
}

state.adventure4ContentPackIScene=function adventure4LivingWorldScene(){
  const session=this.adventure4Session?.();if(!session?.active)return null;
  this.adventure4RefreshLivingWorldFlags();
  const existing=previousScene?.();if(existing)return existing;
  const latest=this.adventure4Session();if(latest.temporaryFlags?.[DONE])return null;
  const ctx=this.adventure4LivingWorldContext();
  const scene=buildAdventure4LivingWorldScene({
    ...ctx,
    regionName:latest.regionId,
    nemesisId:ctx.hunt.targetStageId,
  });
  patchFlags(this,{[ACTIVE]:scene.id});return scene;
};
state.completeAdventure4ContentPackIScene=function adventure4CompleteLivingWorldScene(){
  const session=this.adventure4Session?.();
  if(session?.temporaryFlags?.[ACTIVE]){patchFlags(this,{[DONE]:true,[ACTIVE]:null});return{ok:true,livingWorldSceneId:session.temporaryFlags[ACTIVE]};}
  return previousComplete?.()||{ok:true};
};

export { equippedRegionalInstances };
