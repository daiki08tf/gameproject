/* World 2.0 / Phase 10.1.5 — regional progression, keys, realms, chained random events */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { KEY_DUNGEON_TYPES,availableKeyDungeons,realmVisibility,worldProgressFromClears } from '../data/world2.js';
import { WORLD_EVENT_COOLDOWN_CLEARS,eventChanceForDryStreak,outcomeForWorldEvent,rollWorldEvent2 } from '../data/worldEvents2.js';
import { phase12DiscoveryForStage,phase12RumorFromFlag } from '../data/phase12WorldActivity.js';

function ensure(){
  let changed=false;
  if(!state.data.world2){state.data.world2={keyFragments:0,keys:{},eventsSeen:{},flags:{},discoveries:{},lastEvent:null,keyDungeonClears:{}};changed=true;}
  const w=state.data.world2;
  w.keys||={};w.eventsSeen||={};w.flags||={};w.discoveries||={};w.keyDungeonClears||={};w.eventChains||={};
  if(!Number.isFinite(w.keyFragments))w.keyFragments=0;
  if(!Number.isFinite(w.eventCooldown))w.eventCooldown=0;
  if(!Number.isFinite(w.eventDryClears))w.eventDryClears=0;
  if(changed)state.save();
}
ensure();

state.world2Progress=function(){return worldProgressFromClears(CHAPTERS,id=>this.isStageCleared(id));};
state.world2RealmVisibility=function(){ensure();return realmVisibility(this.world2Progress(),this.data.world2.flags);};
state.world2KeyFragments=function(){ensure();return Math.max(0,Math.floor(this.data.world2.keyFragments||0));};
state.world2AvailableKeyDungeons=function(){ensure();return availableKeyDungeons(this.world2Progress(),this.world2KeyFragments());};
state.world2Discoveries=function(){ensure();return Object.entries(this.data.world2.discoveries).filter(([,v])=>v?.name).map(([id,v])=>({id,...v})).sort((a,b)=>(b.at||0)-(a.at||0));};
state.world2EventChains=function(){ensure();return typeof structuredClone==='function'?structuredClone(this.data.world2.eventChains):JSON.parse(JSON.stringify(this.data.world2.eventChains));};
state.world2EventChance=function(){ensure();return eventChanceForDryStreak(this.data.world2.eventDryClears||0);};

state.world2ForgeKey=function(typeId){ensure();const def=KEY_DUNGEON_TYPES[typeId];if(!def)return{ok:false,reason:'unknown'};if(this.world2Progress()<def.minProgress)return{ok:false,reason:'progress',required:def.minProgress};if(this.world2KeyFragments()<def.fragmentCost)return{ok:false,reason:'fragments',cost:def.fragmentCost};this.data.world2.keyFragments-=def.fragmentCost;this.data.world2.keys[typeId]=(this.data.world2.keys[typeId]||0)+1;this.save();return{ok:true,typeId,count:this.data.world2.keys[typeId]};};
state.world2UseKey=function(typeId){ensure();const def=KEY_DUNGEON_TYPES[typeId],count=this.data.world2.keys[typeId]||0;if(!def||count<=0)return{ok:false,reason:'missing'};this.data.world2.keys[typeId]--;if(typeId==='celestial')this.data.world2.flags.heavenOpened=true;if(typeId==='infernal')this.data.world2.flags.underworldOpened=true;if(typeId==='anomaly')this.data.world2.flags.modernContact=true;this.save();return{ok:true,dungeon:{...def,seed:Date.now(),depth:1}};};

function recordPhase12Rumor(w,flag){
  const rumor=phase12RumorFromFlag(flag);
  if(!rumor)return null;
  const id=`rumor:${rumor.id}`;
  if(!w.discoveries[id])w.discoveries[id]={name:`噂：${rumor.name}`,hint:rumor.hint,targetSiteId:rumor.targetSiteId,sourceFlag:flag,phase12Rumor:true,at:Date.now()};
  return rumor;
}

function applyEventOutcome(manager,event,outcome){
  const w=manager.data.world2;
  const result={gold:0,goldSpent:0,keyFragments:0,choice:null,discovery:outcome?.discovery||null,hint:outcome?.hint||'',tag:outcome?.tag||null,chainId:event.chainId||null,chainName:event.chainName||null,nemesis:null,rumor:null};
  const delta=Number(outcome?.gold||0);
  if(delta>0){manager.data.gold=(manager.data.gold||0)+delta;result.gold=delta;}
  else if(delta<0){const spent=Math.min(manager.data.gold||0,Math.abs(delta));manager.data.gold=Math.max(0,(manager.data.gold||0)-spent);result.goldSpent=spent;}
  const fragments=Math.max(0,Math.floor(outcome?.keyFragments||0));
  if(fragments){w.keyFragments+=fragments;result.keyFragments=fragments;}
  if(outcome?.flag){
    w.flags[outcome.flag]=true;
    w.discoveries[outcome.flag]={name:outcome.discovery||event.name,hint:outcome.hint||'',source:event.id,chainId:event.chainId||null,at:Date.now()};
    result.rumor=recordPhase12Rumor(w,outcome.flag);
  }
  if(outcome?.flag==='riftAttunement')w.flags.modernContact=true;
  if(event.chainId==='nemesis'&&outcome?.flag)result.nemesis=manager.applyNemesisEventFlag?.(outcome.flag)||null;
  if(event.chainId){
    const chain=w.eventChains[event.chainId]||(w.eventChains[event.chainId]={started:true,step:0,wait:0,completed:false});
    chain.started=true;chain.lastEventId=event.id;chain.lastAt=Date.now();
    if(outcome?.chainEnd){chain.completed=true;chain.wait=0;chain.endingFlag=outcome.flag||null;}
    else if(Number.isInteger(outcome?.next)){chain.step=outcome.next;chain.wait=4;}
  }
  return result;
}

state.world2ResolveEvent=function(eventId,choiceIndex=0){
  ensure();const w=this.data.world2,event=w.lastEvent;
  if(!event||event.id!==eventId)return{ok:false,reason:'missing'};
  const choice=event.choices?.[choiceIndex]||event.choices?.[0];
  const outcome=outcomeForWorldEvent(event,choiceIndex);
  const result=applyEventOutcome(this,event,outcome);result.choice=choice;
  w.eventsSeen[event.id]=(w.eventsSeen[event.id]||0)+1;w.lastEvent=null;
  this.save();return{ok:true,result};
};

function eventContext(manager,progress){
  const w=manager.data.world2;
  const machineUnlocked=!!manager.phase9MachineWorldUnlocked?.()||!!w.flags.modernContact&&progress>=20;
  const nemesisEligible=!!manager.activeBountyNemesis?.()||Object.values(manager.data.bountyNemesis||{}).some(n=>(n?.level||0)>0);
  return{progress,currentJobId:manager.currentJobId,flags:w.flags,machineUnlocked,nemesisEligible};
}
function tickChainWaits(chains){for(const chain of Object.values(chains||{})){if(Number.isFinite(chain?.wait)&&chain.wait>0)chain.wait--;}}
function chainsReadyForRoll(chains){const copy={};for(const [id,s] of Object.entries(chains||{})){copy[id]={...s};if(copy[id].wait>0)copy[id].step=0;}return copy;}

state.rollWorld2ClearRewards=function(stage,{rng=Math.random}={}){
  ensure();const w=this.data.world2,progress=this.world2Progress();let fragment=0,event=null,keyDungeon=null,phase12Trace=null;
  if(progress>=5&&rng()<Math.min(.12,.025+progress*.003)){w.keyFragments++;fragment=1;}
  if(stage?.phase12Horizontal){
    phase12Trace=phase12DiscoveryForStage(stage);
    if(phase12Trace&&!w.discoveries[phase12Trace.id])w.discoveries[phase12Trace.id]={name:phase12Trace.name,hint:phase12Trace.hint,fragments:phase12Trace.fragments,source:stage.id,phase12Trace:true,at:Date.now()};
  }
  if(stage?.keyDungeon&&stage.world2KeyType){
    const type=stage.world2KeyType;w.keyDungeonClears[type]=(w.keyDungeonClears[type]||0)+1;
    const clears=w.keyDungeonClears[type],bonus=type==='anomaly'?3:2;w.keyFragments+=bonus;keyDungeon={type,clears,keyFragments:bonus};
    if(type==='anomaly'){w.flags.modernSignal=true;if(clears>=3)w.flags.modernTrace=true;recordPhase12Rumor(w,clears>=3?'modernTrace':'modernSignal');}
  }else{
    tickChainWaits(w.eventChains);
    if(w.eventCooldown>0)w.eventCooldown--;
    if(!w.lastEvent&&w.eventCooldown<=0){
      const chance=eventChanceForDryStreak(w.eventDryClears||0);
      if(rng()<chance){
        event=rollWorldEvent2({chainState:chainsReadyForRoll(w.eventChains),ctx:eventContext(this,progress),rng,followupChance:.30});
        if(event){w.lastEvent={...event,stageId:stage?.id||null};w.eventCooldown=WORLD_EVENT_COOLDOWN_CLEARS;w.eventDryClears=0;
          if(event.chainId){const chain=w.eventChains[event.chainId]||(w.eventChains[event.chainId]={started:true,step:event.chainStep||0,wait:0,completed:false});chain.started=true;if(!Number.isInteger(chain.step))chain.step=event.chainStep||0;}
        }else w.eventDryClears++;
      }else w.eventDryClears++;
    }else if(!w.lastEvent)w.eventDryClears++;
  }
  if(fragment||event||keyDungeon||phase12Trace||stage?.keyDungeon||w.eventCooldown>=0)this.save();
  return{fragment,event,keyDungeon,phase12Trace,eventChance:eventChanceForDryStreak(w.eventDryClears||0),eventDryClears:w.eventDryClears,eventCooldown:w.eventCooldown};
};

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function(stageId,onEnd,blessingId){
  const keyPrefix='secret-worldkey-';
  if(String(stageId).startsWith(keyPrefix)){const typeId=String(stageId).slice(keyPrefix.length),use=state.world2UseKey?.(typeId);if(!use?.ok){queueMicrotask(()=>onEnd?.({cleared:false,retreated:true,keyMissing:true,rewards:{gold:0,exp:0}}));return;}}
  return previousStart.call(this,stageId,result=>{if(result?.cleared&&!result.retreated)result.world2=state.rollWorld2ClearRewards?.(this.engine?.stage||{id:stageId})||null;onEnd(result);},blessingId);
};
