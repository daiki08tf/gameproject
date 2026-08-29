/* Adventure / World 4.0 — W23-W25 Realm discovery, Region state and Settlement feedback.
   All progression remains owned by World2 / Rift / Machine / Settlement systems. */
import { state } from '../state.js';
import { ADVENTURE4_REALM_SIGNALS,adventure4RealmSignals,adventure4DynamicRegionState,buildAdventure4RealmSignalScene } from '../data/adventureWorld4RealmDiscovery.js';
import './adventureWorld4LivingWorldRuntime.js';
import './adventureWorld4DiscoveryRuntime.js';
import './phase9MachineWorldRuntime.js';
import './riftKeyCore.js';
import './world2Core.js';
import './settlementResearch.js';
import './settlementExpeditions.js';
import './settlementChronicle.js';

const DONE='realm:sceneDone',ACTIVE='realm:activeSceneId';
const previousScene=state.adventure4ContentPackIScene?.bind(state);
const previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);
const previousEventContext=state.adventure4EventContext?.bind(state);
const previousResearchOutlook=state.settlementResearchOutlook?.bind(state);
const previousChronicle=state.settlementChronicle?.bind(state);

function expeditionLeadIds(target){return (target.settlementExpeditionState?.().discoveries||[]).map(x=>x?.id).filter(Boolean);}
function recordedRealmSignals(target){const store=target.data.world2?.discoveries||{},out={};for(const def of ADVENTURE4_REALM_SIGNALS)out[def.id]=!!store[`realm-signal-${def.id}`];return out;}
function realmContext(target){
  const flags=target.data.world2?.flags||{};
  return {
    flags,
    realmVisibility:target.world2RealmVisibility?.()||[],
    machineUnlocked:!!target.phase9MachineWorldUnlocked?.(),
    riftKeyCount:target.riftKeys?.().length||0,
    expeditionLeadIds:expeditionLeadIds(target),
    recorded:recordedRealmSignals(target),
  };
}
function patchFlags(target,patch){const s=target.adventure4Session?.();if(!s?.active)return{ok:false,reason:'no_session'};return target.checkpointAdventure4({temporaryFlags:{...(s.temporaryFlags||{}),...patch}});}

state.adventure4RealmSignals=function(){return adventure4RealmSignals(realmContext(this));};
state.adventure4RealmSignalForRegion=function(regionId=this.adventure4Session?.()?.regionId){return this.adventure4RealmSignals().find(x=>x.regionId===regionId)||null;};
state.recordAdventure4RealmDiscovery=function(realmId,regionId=null){
  const def=ADVENTURE4_REALM_SIGNALS.find(x=>x.id===realmId);if(!def)return{ok:false,reason:'unknown_realm_signal'};
  const region=regionId||def.regionId;
  const discovery={id:`realm-signal-${def.id}`,name:def.name,hint:def.hint,regionId:region,category:def.category,sourceId:`realm:${def.id}`};
  return this.recordAdventure4Discovery(discovery,{source:`realm:${def.id}`});
};
state.applyAdventure4RealmEffect=function(effect){if(effect?.type!=='realmDiscovery')return{ok:false,reason:'unknown_effect'};return this.recordAdventure4RealmDiscovery(effect.realmId,effect.regionId);};

state.adventure4DynamicRegionState=function(regionId=this.adventure4Session?.()?.regionId){
  const living=this.adventure4LivingWorldContext?.()||{};
  const shortcuts=Object.values(this.data.world2?.mysteries?.shortcuts||{}).filter(x=>x?.regionId===regionId||x?.region===regionId).length;
  return adventure4DynamicRegionState(regionId,{
    realmSignals:this.adventure4RealmSignals(),worldEvent:living.worldEvent||null,nemesisHere:!!living.nemesisHere,
    weatherId:living.weatherId||null,shortcutCount:shortcuts,
  });
};

state.adventure4SettlementFeedback=function(){
  const discoveries=this.adventure4RealmSignals().filter(x=>recordedRealmSignals(this)[x.id]);
  const expeditionLeads=this.settlementExpeditionState?.().discoveries||[];
  const researchUnlocked=!!this.settlementResearchUnlocked?.();
  return{discoveries,expeditionLeads,researchUnlocked,knownRealmCount:discoveries.length};
};
state.adventure4SettlementKnowledgeFlags=function(){
  const feedback=this.adventure4SettlementFeedback(),flags={};
  for(const lead of feedback.expeditionLeads||[])if(lead?.id)flags[`settlement:expedition:${lead.id}`]=true;
  if(feedback.researchUnlocked&&feedback.knownRealmCount)flags['settlement:research:realm']=true;
  for(const signal of feedback.discoveries)flags[`settlement:realm:${signal.id}`]=true;
  return flags;
};

if(previousEventContext){state.adventure4EventContext=function adventure4RealmEventContext(options={}){const ctx=previousEventContext(options);return{...ctx,flags:{...(ctx.flags||{}),...this.adventure4SettlementKnowledgeFlags()},realmSignals:this.adventure4RealmSignals(),dynamicRegion:this.adventure4DynamicRegionState()};};}

if(previousResearchOutlook){state.settlementResearchOutlook=function adventure4RealmResearchOutlook(){
  const rows=previousResearchOutlook();const feedback=this.adventure4SettlementFeedback();
  for(const signal of feedback.discoveries)rows.push({id:`realm:${signal.id}`,icon:'🌀',title:`境界研究：${signal.name}`,text:`${signal.hint} 既存Realmの鍵・入口条件は変更せず、観測記録だけを照合する。`,source:'Adventure Discovery'});
  return rows;
};}
if(previousChronicle){state.settlementChronicle=function adventure4RealmChronicle(){
  const rows=previousChronicle(),feedback=this.adventure4SettlementFeedback();
  if(feedback.knownRealmCount)rows.push({id:'realmDiscoveries',name:'境界観測記録',icon:'🌀',value:`${feedback.knownRealmCount}件`,detail:feedback.discoveries.map(x=>x.name).join(' / '),records:feedback.discoveries.map(x=>({id:x.id,name:x.name,regionId:x.regionId}))});
  return rows;
};}

state.adventure4ContentPackIScene=function adventure4RealmSignalScene(){
  const session=this.adventure4Session?.();if(!session?.active)return null;
  const existing=previousScene?.();if(existing)return existing;
  const latest=this.adventure4Session();if(latest.temporaryFlags?.[DONE])return null;
  const signal=this.adventure4RealmSignalForRegion(latest.regionId);if(!signal||signal.stage==='discovered')return null;
  const scene=buildAdventure4RealmSignalScene(signal);patchFlags(this,{[ACTIVE]:scene.id});return scene;
};
state.completeAdventure4ContentPackIScene=function adventure4CompleteRealmScene(){const s=this.adventure4Session?.();if(s?.temporaryFlags?.[ACTIVE]){patchFlags(this,{[DONE]:true,[ACTIVE]:null});return{ok:true,realmSceneId:s.temporaryFlags[ACTIVE]};}return previousComplete?.()||{ok:true};};

export { realmContext };
