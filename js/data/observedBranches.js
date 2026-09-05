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
    // CLR-21: references into the existing canonical Stage authority
    // (js/data/observedBranchStages.js resolves these through the same
    // findStage()/stageProgress pipeline as every other Stage). This Branch
    // definition still owns no combat, reward or clear state itself.
    stageIds:freezeList(['observedbranch-tree-sovereign-1','observedbranch-tree-sovereign-2','observedbranch-tree-sovereign-boss']),
    bossStageId:'observedbranch-tree-sovereign-boss',
  }),
  Object.freeze({
    id:'deep-green-absence',
    name:'深緑消失域',
    observedLabel:'観測分岐：深緑消失域',
    primeRegionRef:Object.freeze({
      worldRegionId:'frontier',
      chapterId:'ch2',
      chapterNum:2,
      regionName:'深緑の森',
    }),
    divergencePoint:'正史の旅より前に境界崩壊が発生し、大樹霊と戦う前に森林圏そのものが消失した。',
    historicalSummary:'森林生態系を失い、地形へ残った根の記憶と観測機器だけを頼りに空白域を渡る集落が成立した歴史。',
    technologyProfile:Object.freeze({
      mechanical:'baseline',
      arcane:'regressed',
      bio:'regressedMajor',
      boundary:'dominant',
      information:'advancedMajor',
      material:'advanced',
    }),
    // Read-only presentation override: M1's shared `regressedMajor` symbol is ↓↓,
    // while the M6 roadmap deliberately authors Bio as the more severe ↓↓↓ collapse.
    // The semantic profile value remains `regressedMajor`; this adds no progression authority.
    technologyPresentation:Object.freeze({bio:'↓↓↓'}),
    ecologyProfile:Object.freeze({
      settlement:'観測杭と測線で結ばれた空白域集落',
      species:'森の種族は消滅し、根の記憶だけが地形に残存',
      construction:'位相杭と観測器を基準に、存在する地面だけを接続',
      industry:'生態技術は崩壊し、境界観測・情報記録・位相素材加工が発達',
    }),
    routeRefs:freezeList([]),
    sceneRefs:freezeList([]),
    discoveryConditions:Object.freeze({
      allDiscoveries:freezeList(['cp4:branch-anchor:deep-green-absence']),
      rngRequired:false,
    }),
    traversable:false,
    stageIds:freezeList(['observedbranch-deepgreen-absence-1','observedbranch-deepgreen-absence-2','observedbranch-deepgreen-absence-boss']),
    bossStageId:'observedbranch-deepgreen-absence-boss',
  }),
  // M9 — Branch Cluster expansion. First Branch of a new Prime Region
  // (灼熱の火山, Ch5), reusing the exact same shape as Branch Cluster 1.
  Object.freeze({
    id:'flame-king-volcano',
    name:'炎帝領・灼熱の火山',
    observedLabel:'観測分岐：炎帝領',
    primeRegionRef:Object.freeze({
      worldRegionId:'elemental',
      chapterId:'ch5',
      chapterNum:5,
      regionName:'灼熱の火山',
    }),
    divergencePoint:'炎帝ドレイクが正史の戦いで討たれず、火山国家の神王として即位した。',
    historicalSummary:'炎帝の即位によって火山国家は熔鉱都市として再編され、竜由来の合金技術と製鉄産業が王家の下で急速に発達した歴史。',
    technologyProfile:Object.freeze({
      mechanical:'advancedMajor',
      arcane:'advanced',
      bio:'regressed',
      boundary:'baseline',
      information:'regressed',
      material:'dominant',
    }),
    ecologyProfile:Object.freeze({
      settlement:'火山噴気を動力とする熔鉱都市',
      species:'火山トカゲ・溶岩ゴーレムは王家に従属する労役獣として再編',
      construction:'耐熔合金による築城が発達',
      industry:'王家が独占する製鉄・製鋼が急速に発達',
    }),
    routeRefs:freezeList([]),
    sceneRefs:freezeList([]),
    discoveryConditions:Object.freeze({
      allDiscoveries:freezeList(['cp4:branch-anchor:flame-king']),
      rngRequired:false,
    }),
    traversable:false,
    stageIds:freezeList(['observedbranch-flame-king-1','observedbranch-flame-king-2','observedbranch-flame-king-boss']),
    bossStageId:'observedbranch-flame-king-boss',
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
