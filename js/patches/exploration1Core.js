import './world2Core.js';
import './phase9RegionalExplorationRuntime.js';
import './phase9RegionalMasteryRuntime.js';
import { state } from '../state.js';
import { EXPLORATION_SITES, explorationSite, explorationProgressFor } from '../data/exploration1.js';

function ensure(){
  if(!state.data.exploration || typeof state.data.exploration!=='object') state.data.exploration={};
  for(const site of EXPLORATION_SITES){
    if(!state.data.exploration[site.id]) state.data.exploration[site.id]={ inspected:false, seenUnlocked:false };
  }
}
ensure();

state.explorationSites=EXPLORATION_SITES;
state.explorationSite=function(id){ return explorationSite(id); };
state.explorationProgress=function(id){
  ensure(); const site=explorationSite(id); if(!site) return null;
  return explorationProgressFor(site,this.data.abyssBestDepth,this.data.exploration[id]);
};
state.inspectExplorationSite=function(id){
  ensure(); const site=explorationSite(id); if(!site || this.data.abyssBestDepth<site.discoverDepth) return false;
  this.data.exploration[id].inspected=true; this.save(); return true;
};
state.unlockedSecretRealms=function(){
  return EXPLORATION_SITES.filter(s=>s.realm&&this.explorationProgress(s.id)?.unlocked).map(s=>s.realm);
};
