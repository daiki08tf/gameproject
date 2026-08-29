/* Settlement 3.0 S8 — Ranch 3.0 integration bridge.
   Reads canonical Monster Ranch / Companion state; creates no parallel save root. */
import './monsterRanchCore.js';
import './monsterRanch2Facilities.js';
import './monsterRanch2Complete.js';
import { state } from '../state.js';
import { COMPANION_NATURES,COMPANION_RARITY_LABEL } from '../data/companions.js';
import { RANCH3_CAPABILITIES,ranch3AiLabel,ranch3CapabilityState,ranch3TrainingLabel } from '../data/settlementRanch3.js';

function facilityLevels(){const out={};for(const f of state.ranchFacilities||[])out[f.id]=state.ranchFacilityLevel?.(f.id)||0;return out;}
function talentSummary(talent={}){const entries=['hp','mp','atk','def','mag','spd'].map(k=>[k,Number(talent?.[k])||0]);entries.sort((a,b)=>b[1]-a[1]);return{best:entries[0]||null,average:entries.length?entries.reduce((n,[,v])=>n+v,0)/entries.length:0};}

state.settlementRanch3Unlocked=function(){return(this.settlementLevel?.('ranch')||0)>=1;};
state.settlementRanch3Summary=function(){
  const ranchLevel=this.settlementLevel?.('ranch')||0,facilities=facilityLevels(),research=this.ranchResearchUnlocks?.()||{},policyFavored=this.settlementPolicyBias?.('ranch')===1;
  const capabilityMap=ranch3CapabilityState({ranchLevel,facilityLevels:facilities,researchUnlocks:research});
  return{unlocked:ranchLevel>=1,ranchLevel,count:this.ranchCount?.()||0,capacity:this.ranchCapacity?.()||0,eggs:this.ranchEggList?.().length||0,facilities,research,policyFavored,capabilities:RANCH3_CAPABILITIES.map(x=>({...x,unlocked:!!capabilityMap[x.id]}))};
};
state.settlementRanch3Roster=function(){
  return Object.keys(this.data.companionInstances||{}).map(id=>{
    const info=this.ranchCompanionInfo?.(id),c=this.getCompanion?.(id);if(!info||!c)return null;
    const nature=COMPANION_NATURES[c.instance.nature]||COMPANION_NATURES.balanced,ai=nature.ai||'balanced';
    return{id,name:c.instance.nickname||c.species.name,species:c.species.name,level:c.instance.level||1,rarity:COMPANION_RARITY_LABEL[c.instance.rarity]||c.instance.rarity||'',generation:Number(c.instance.generation)||0,favorite:!!c.instance.favorite,traits:[...(c.species.traits||[])],talent:{...(c.instance.talent||{})},talentSummary:talentSummary(c.instance.talent),trainingFocus:c.instance.trainingFocus||'balanced',trainingLabel:ranch3TrainingLabel(c.instance.trainingFocus),natureId:c.instance.nature,natureName:nature.name||c.instance.nature,ai,aiLabel:ranch3AiLabel(ai),mutation:info.mutation?{id:info.mutation.id,name:info.mutation.name,tier:info.mutation.tier}:null,research:info.research};
  }).filter(Boolean).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.level-a.level||a.name.localeCompare(b.name,'ja'));
};
state.settlementRanch3Archive=function(speciesId){return this.ranchResearchArchive?.(speciesId)||null;};
state.settlementRanch3CapabilityState=function(){return this.settlementRanch3Summary().capabilities;};
