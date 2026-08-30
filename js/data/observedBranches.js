/* Blade Vale — Observed Branches M1: authored Branch data model.
   Branch definitions describe history only. Combat, rewards, traversal runtime,
   discovery mutation and inventory ownership stay with their existing authorities. */

const freezeList=values=>Object.freeze(values.map(value=>typeof value==='object'&&value!==null?Object.freeze({...value}):value));

export const OBSERVED_BRANCH_TECHNOLOGY_AXES=Object.freeze([
  'mechanical','arcane','bio','boundary','information','material',
]);

export const OBSERVED_BRANCH_PROFILE_LEVELS=Object.freeze({
  regressedMajor:'↓↓',
  regressed:'↓',
  baseline:'→',
  advanced:'↑',
  advancedMajor:'↑↑',
  dominant:'↑↑↑',
});

export const OBSERVED_BRANCHES=Object.freeze([
  Object.freeze({
    id:'tree-sovereign-deep-green',
    name:'王樹領・深緑の森',
    observedLabel:'観測分岐：王樹領',
    primeRegionRef:Object.freeze({
      worldRegionId:'frontier',
      chapterId:'ch2',
      chapterNum:2,
      regionName:'深緑の森',
    }),
    divergencePoint:'森の大樹霊が倒されず、森の統治者として定着した。',
    historicalSummary:'大樹霊の生存によって集落は樹冠へ退き、森全体が統治生態系として発達した歴史。',
    technologyProfile:Object.freeze({
      mechanical:'regressedMajor',
      arcane:'advancedMajor',
      bio:'dominant',
      boundary:'baseline',
      information:'regressed',
      material:'advanced',
    }),
    ecologyProfile:Object.freeze({
      settlement:'樹冠集落',
      species:'獣種は植物との共生へ適応',
      construction:'生きた根・樹木を使う生体建築が発達',
      industry:'局地的な金属加工は衰退',
    }),
    routeRefs:freezeList([]),
    sceneRefs:freezeList([]),
    discoveryConditions:Object.freeze({
      allDiscoveries:freezeList(['cp4:branch-anchor:tree-sovereign']),
      rngRequired:false,
    }),
    traversable:false,
  }),
]);

export function observedBranchById(id){
  return OBSERVED_BRANCHES.find(branch=>branch.id===id)||null;
}

export function observedBranchesForPrimeRegion({worldRegionId,chapterId,chapterNum}={}){
  return OBSERVED_BRANCHES.filter(branch=>{
    const ref=branch.primeRegionRef;
    if(worldRegionId!=null&&ref.worldRegionId!==worldRegionId)return false;
    if(chapterId!=null&&ref.chapterId!==chapterId)return false;
    if(chapterNum!=null&&Number(ref.chapterNum)!==Number(chapterNum))return false;
    return true;
  });
}

export function observedBranchDiscoverySatisfied(branch,{discoveries={}}={}){
  if(!branch)return false;
  const required=branch.discoveryConditions?.allDiscoveries||[];
  return required.every(id=>Boolean(discoveries[id]));
}
