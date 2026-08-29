import './worldTierRuntime.js';
import './world2Core.js';
import './riftKeyCore.js';
import './phase9MachineWorldRuntime.js';
import { state } from '../state.js';
import { WORLD2_REALMS } from '../data/world2.js';
import { CP3_DEEP_SURVEYS,deepSurveyUnlocked } from '../data/postCp3DeepSurvey.js';
import { SETTLEMENT_ENDGAME_NODES,ABYSS_RETURN_THRESHOLDS } from '../data/settlementEndgameNetwork.js';

const META_KEY='__settlement3';
function ensure(){
 if(!state.data.settlementBuildings)state.data.settlementBuildings={hall:0,inn:0,market:0,watch:0,ranch:0};
 let root=state.data.settlementBuildings[META_KEY];if(!root||typeof root!=='object'||Array.isArray(root)){root={};state.data.settlementBuildings[META_KEY]=root;}
 let n=root.endgameNetwork;let changed=false;
 if(!n||typeof n!=='object'||Array.isArray(n)){n={seenAbyssReturns:[]};root.endgameNetwork=n;changed=true;}
 if(!Array.isArray(n.seenAbyssReturns)){n.seenAbyssReturns=[];changed=true;}
 if(changed)state.save();return n;
}
function worldEvent(){return state.data.world2?.lastEvent||null;}
function discoveries(){return state.data.world2?.discoveries||{};}
function deepSurveys(){const d=discoveries();return CP3_DEEP_SURVEYS.map(x=>({...x,unlocked:deepSurveyUnlocked(x,d)}));}
function realmRows(){const visibility=state.world2RealmVisibility?.()||{};return Object.values(WORLD2_REALMS).map(r=>({...r,visibility:visibility[r.id]||'hidden'}));}
function machine(){return state.phase9MachineWorldProgress?.()||{unlocked:false,cleared:0,total:0,completed:false,stages:[]};}
function nextAbyssReturn(best,seen){return ABYSS_RETURN_THRESHOLDS.find(x=>best>=x&&!seen.includes(x))||null;}

state.settlementEndgameNetwork=function(){
 const meta=ensure(),tier=this.activeWorldTier?.()||{id:this.data.worldTierId||'normal',name:'Normal',rank:0},event=worldEvent(),best=Math.max(0,Number(this.data.abyssBestDepth)||0),riftKeys=this.riftKeys?.()||[],realms=realmRows(),surveys=deepSurveys(),machineState=machine(),expeditionLeads=this.settlementExpeditionState?.().discoveries||[];
 const details={
  worldTier:{status:tier.name||tier.id,active:true,detail:`Rank ${Number(tier.rank)||0} / Lv ${this.characterLevel||1}`,attention:(Number(tier.rank)||0)>0},
  worldEvent:{status:event?'観測中':'平常',active:!!event,detail:event?.name||`発生兆候 ${Math.round((this.world2EventChance?.()||0)*100)}%`,attention:!!event},
  abyss:{status:best?`${best}F到達`:'未到達',active:best>0,detail:nextAbyssReturn(best,meta.seenAbyssReturns)?'深層帰還報告あり':'境界研究記録と同期',attention:!!nextAbyssReturn(best,meta.seenAbyssReturns)},
  rift:{status:riftKeys.length?`Key ${riftKeys.length}`:'Keyなし',active:riftKeys.length>0||!!this.data.world2?.flags?.riftAttunement,detail:this.data.world2?.flags?.riftAttunement?'境界共鳴を観測済み':'Rift Key / World Eventを監視',attention:riftKeys.length>0},
  secretRealm:{status:`接続 ${realms.filter(x=>x.visibility==='open').length}/${realms.length}`,active:realms.some(x=>x.visibility==='open'),detail:realms.filter(x=>x.visibility!=='hidden').map(x=>`${x.name}:${x.visibility}`).join(' / ')||'未発見',attention:realms.some(x=>x.visibility==='hint')},
  machineRealm:{status:machineState.completed?'解析完了':machineState.unlocked?'解析中':'未接続',active:!!machineState.unlocked,detail:machineState.unlocked?`${(machineState.stages||[]).filter(x=>x.cleared).length}/${(machineState.stages||[]).length} stage`:'機界接触記録待ち',attention:!!machineState.unlocked&&!machineState.completed},
  deepSurvey:{status:`解禁 ${surveys.filter(x=>x.unlocked).length}/${surveys.length}`,active:surveys.some(x=>x.unlocked),detail:`地図室 ${surveys.filter(x=>x.unlocked).length} / 遠征発見 ${expeditionLeads.filter(x=>x.type==='map'||x.type==='event').length}`,attention:surveys.some(x=>x.unlocked)}
 };
 return SETTLEMENT_ENDGAME_NODES.map(n=>({...n,...details[n.id]}));
};
state.settlementEndgameSummary=function(){const nodes=this.settlementEndgameNetwork();return{online:nodes.filter(x=>x.active).length,total:nodes.length,attention:nodes.filter(x=>x.attention).length};};
state.consumeSettlementAbyssReturn=function(){const meta=ensure(),best=Math.max(0,Number(this.data.abyssBestDepth)||0),depth=nextAbyssReturn(best,meta.seenAbyssReturns);if(!depth)return null;meta.seenAbyssReturns.push(depth);this.refreshSettlementResidents?.();this.save();return{depth,text:`Abyss ${depth}F以深からの帰還記録を境界研究室へ登録した。`,rewardApplied:false};};
state.settlementEndgameConnections=function(){return{realms:realmRows(),deepSurveys:deepSurveys(),machine:machine(),riftKeys:(this.riftKeys?.()||[]).length,worldEvent:worldEvent(),abyssBestDepth:Math.max(0,Number(this.data.abyssBestDepth)||0)};};
