import './world2Core.js';
import './phase9RegionalExplorationRuntime.js';
import './phase9RegionalMasteryRuntime.js';
import './phase9EighthKeyRuntime.js';
import './phase9MachineWorldRuntime.js';
import './postCp3DeepSurveyUi.js';
import { state } from '../state.js';
import { EXPLORATION_SITES, explorationProgressFor } from '../data/exploration1.js';
import { deepSurveyExplorationSites, deepSurveyUnlocked } from '../data/postCp3DeepSurvey.js';

const DEEP_SURVEY_SITES=deepSurveyExplorationSites();
const ALL_EXPLORATION_SITES=Object.freeze([...EXPLORATION_SITES,...DEEP_SURVEY_SITES]);
const SITE_BY_ID=new Map(ALL_EXPLORATION_SITES.map(site=>[site.id,site]));

function ensure(){
  if(!state.data.exploration || typeof state.data.exploration!=='object') state.data.exploration={};
  for(const site of ALL_EXPLORATION_SITES){
    if(!state.data.exploration[site.id]) state.data.exploration[site.id]={ inspected:false, seenUnlocked:false };
  }
}
ensure();

state.explorationSites=ALL_EXPLORATION_SITES;
state.explorationSite=function(id){ return SITE_BY_ID.get(id)||null; };
state.explorationProgress=function(id){
  ensure(); const site=this.explorationSite(id); if(!site) return null;
  if(site.postCp3DeepSurvey&&!deepSurveyUnlocked(site.id,this.data.world2?.discoveries||{})){
    return { state:'hidden', fragments:0, inspected:false, unlocked:false };
  }
  return explorationProgressFor(site,this.data.abyssBestDepth,this.data.exploration[id]);
};
state.inspectExplorationSite=function(id){
  ensure(); const site=this.explorationSite(id); if(!site) return false;
  const progress=this.explorationProgress(id);
  if(progress.state==='hidden')return false;
  this.data.exploration[id].inspected=true; this.save(); return true;
};
state.unlockedSecretRealms=function(){
  return ALL_EXPLORATION_SITES.filter(s=>s.realm&&this.explorationProgress(s.id)?.unlocked).map(s=>s.realm);
};
