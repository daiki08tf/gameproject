/* Blade Vale — Observed Branches M2: discovery/secrecy projection.
   Existing Adventure/Discovery state remains authoritative. This module only
   projects authored Branch definitions that the player has already discovered. */
import {
  OBSERVED_BRANCHES,
  observedBranchDiscoverySatisfied,
} from './observedBranches.js';

function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}

export function knownObservedBranches({discoveries={}}={}){
  const known=OBSERVED_BRANCHES.filter(branch=>observedBranchDiscoverySatisfied(branch,{discoveries:object(discoveries)}));
  return Object.freeze([...known]);
}

export function knownObservedBranchesForPrimeRegion(primeRegionRef,{discoveries={}}={}){
  const query=object(primeRegionRef);
  return Object.freeze(knownObservedBranches({discoveries}).filter(branch=>{
    const ref=branch.primeRegionRef;
    if(query.worldRegionId!=null&&ref.worldRegionId!==query.worldRegionId)return false;
    if(query.chapterId!=null&&ref.chapterId!==query.chapterId)return false;
    if(query.chapterNum!=null&&Number(ref.chapterNum)!==Number(query.chapterNum))return false;
    return true;
  }));
}

export function observedBranchRegionDiscoveryView(primeRegionRef,{discoveries={}}={}){
  const branches=knownObservedBranchesForPrimeRegion(primeRegionRef,{discoveries});
  return Object.freeze({branches});
}
