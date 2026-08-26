import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { BOUNTIES, buildBountyStage } from '../data/bounties.js';
import { BOUNTY2_STAGES, bountyBaseIdForStage } from '../data/bounty2.js';
import { NEMESIS_MAX_LEVEL,nemesisTraitIdsForLevel,nemesisTraitsFor,nemesisTitleForLevel } from '../data/nemesis3.js';

state.data.bountyMarks ??= 0;
state.data.bountyNemesis ??= {};
state.data.bounty2Wins ??= {};

// 読み込み順に依存しないよう、通常手配書を先に保証する。
for(const bounty of BOUNTIES){
  const chapter=CHAPTERS.find(ch=>ch.id===bounty.chapterId);
  if(!chapter) continue;
  if(!chapter.stages.some(s=>s.id===bounty.id)) chapter.stages.push(buildBountyStage(bounty));
}
for(const stage of BOUNTY2_STAGES){
  const chapter=CHAPTERS.find(ch=>ch.stages.some(s=>s.id===stage.bountyBaseId));
  if(!chapter) continue;
  if(!chapter.stages.some(s=>s.id===stage.id)) chapter.stages.push(stage);
}

function normalizeNemesis(n={}){
  n.level=Math.max(0,Math.min(NEMESIS_MAX_LEVEL,Math.floor(n.level||0)));
  n.wins=Math.max(0,Math.floor(n.wins||0));
  n.losses=Math.max(0,Math.floor(n.losses||0));
  n.bestLevel=Math.max(n.level,Math.floor(n.bestLevel||0));
  n.traits=nemesisTraitIdsForLevel(n.level);
  n.intel=Array.isArray(n.intel)?[...new Set(n.intel)]:[];
  n.huntMode=n.huntMode||null;
  return n;
}

state.bountyMarks=function(){return this.data.bountyMarks||0;};
state.addBountyMarks=function(amount){this.data.bountyMarks=Math.max(0,(this.data.bountyMarks||0)+Math.max(0,Math.floor(amount||0)));this.save();return this.data.bountyMarks;};
state.bountyNemesisInfo=function(stageOrId){const id=typeof stageOrId==='string'?stageOrId:bountyBaseIdForStage(stageOrId);const raw=this.data.bountyNemesis[id];return raw?normalizeNemesis(raw):normalizeNemesis({});};
state.activeBountyNemesis=function(){
  const entries=Object.entries(this.data.bountyNemesis||{}).map(([id,n])=>({id,...normalizeNemesis(n)})).filter(n=>n.level>0);
  entries.sort((a,b)=>b.level-a.level||b.losses-a.losses);return entries[0]||null;
};
state.recordBountyLoss=function(stage){
  const id=bountyBaseIdForStage(stage);if(!id)return null;
  const n=normalizeNemesis(this.data.bountyNemesis[id]??={});
  n.level=Math.min(NEMESIS_MAX_LEVEL,n.level+1);n.losses++;n.bestLevel=Math.max(n.bestLevel,n.level);n.traits=nemesisTraitIdsForLevel(n.level);n.lastLossAt=Date.now();
  this.data.bountyNemesis[id]=n;this.save();return {...n,traits:nemesisTraitsFor(n)};
};
state.recordBountyWin=function(stage){
  const id=bountyBaseIdForStage(stage);if(!id)return null;
  const n=normalizeNemesis(this.data.bountyNemesis[id]??={});const bonusLevel=n.level||0;const traits=[...n.traits];const huntMode=n.huntMode;const intel=[...n.intel];
  n.wins++;n.level=0;n.traits=[];n.intel=[];n.huntMode=null;n.lastDefeatedAt=Date.now();this.data.bounty2Wins[id]=(this.data.bounty2Wins[id]||0)+1;
  this.data.bountyNemesis[id]=n;this.save();return {bonusLevel,wins:n.wins,traits,huntMode,intel,bestLevel:n.bestLevel};
};
state.bountyNemesisTitle=function(stageOrId){return nemesisTitleForLevel(this.bountyNemesisInfo(stageOrId).level||0);};
state.bountyNemesisTraits=function(stageOrId){return nemesisTraitsFor(this.bountyNemesisInfo(stageOrId));};
state.applyNemesisEventFlag=function(flag){
  const active=this.activeBountyNemesis();if(!active)return{ok:false,reason:'no_active_nemesis'};
  const n=normalizeNemesis(this.data.bountyNemesis[active.id]??={});
  if(flag==='nemesisWeakness'&&!n.intel.includes('weakness'))n.intel.push('weakness');
  if(flag==='nemesisMutationKnown'&&!n.intel.includes('mutation'))n.intel.push('mutation');
  if(flag==='nemesisWitnessSaved'&&!n.intel.includes('witness'))n.intel.push('witness');
  if(flag==='nemesisPreempt')n.huntMode='preempt';
  if(flag==='nemesisAmbush')n.huntMode='ambush';
  if(flag==='nemesisFinalHunt')n.huntMode='final';
  if(flag==='nemesisSpared'){n.level=Math.min(NEMESIS_MAX_LEVEL,n.level+2);n.huntMode='highRisk';}
  if(flag==='nemesisHighRisk'){n.level=Math.min(NEMESIS_MAX_LEVEL,n.level+1);n.huntMode='highRisk';}
  n.bestLevel=Math.max(n.bestLevel,n.level);n.traits=nemesisTraitIdsForLevel(n.level);this.data.bountyNemesis[active.id]=n;this.save();
  return{ok:true,id:active.id,info:{...n},traits:nemesisTraitsFor(n)};
};
