/* Content Pack IV D — first visible historical-overlap anchor. */

export const CP4_FIRST_BRANCH_ANCHOR=Object.freeze({
  id:'deep-green-tree-sovereign-anchor',
  branchSightDiscoveryId:'cp4:branch-sight:active',
  sourceEvidenceDiscoveryId:'cp4:deepgreen:survival-record',
  discoveryId:'cp4:branch-anchor:tree-sovereign',
  chapterNum:2,
  hiddenLabel:'歴史的重なり',
  name:'観測分岐：王樹領',
  preview:'分岐視を通すと、既知の深緑の森と同じ座標に、樹冠へ集落が退いた別の森林史が安定して重なっている。',
  observed:'大樹霊が生存し続けた履歴は、壊れた記録ではない。同じ座標に固定された別の整合した歴史として観測できる。',
  next:'観測点は識別できるが、まだそこへ移動する方法はない。',
});

export const CP4_SECOND_BRANCH_ANCHOR=Object.freeze({
  id:'deep-green-absence-anchor',
  branchSightDiscoveryId:'cp4:branch-sight:active',
  sourceEvidenceDiscoveryId:'cp4:parallax:first-contact',
  prerequisiteAnchorDiscoveryId:'cp4:branch-anchor:tree-sovereign',
  discoveryId:'cp4:branch-anchor:deep-green-absence',
  chapterNum:2,
  hiddenLabel:'別の歴史的重なり',
  name:'観測分岐：深緑消失域',
  preview:'分岐視を通すと、既知の森と王樹領のさらに外側に、森のない白い境界傷だけが同じ座標へ固定されている。',
  observed:'白い境界傷は観測ノイズではない。正史の旅より前に境界崩壊が起こり、森林圏そのものが消失した別の整合した歴史として固定されている。',
  next:'観測座標が安定した。既知の深緑の森から、この消失域のStageを選択できる。',
});

export function cp4SecondBranchAnchorProgress({discoveries={}}={}){
  const anchor=CP4_SECOND_BRANCH_ANCHOR;
  const branchSight=Boolean(discoveries[anchor.branchSightDiscoveryId]);
  const evidence=Boolean(discoveries[anchor.sourceEvidenceDiscoveryId]);
  const firstAnchor=Boolean(discoveries[anchor.prerequisiteAnchorDiscoveryId]);
  const observed=Boolean(discoveries[anchor.discoveryId]);
  if(!branchSight||!evidence||!firstAnchor)return Object.freeze({state:'hidden',visible:false,observed:false});
  if(observed)return Object.freeze({state:'observed',visible:true,observed:true});
  return Object.freeze({state:'recognizable',visible:true,observed:false});
}

export function cp4FirstBranchAnchorProgress({discoveries={}}={}){
  const anchor=CP4_FIRST_BRANCH_ANCHOR;
  const branchSight=Boolean(discoveries[anchor.branchSightDiscoveryId]);
  const evidence=Boolean(discoveries[anchor.sourceEvidenceDiscoveryId]);
  const observed=Boolean(discoveries[anchor.discoveryId]);
  if(!branchSight||!evidence)return Object.freeze({state:'hidden',visible:false,observed:false});
  if(observed)return Object.freeze({state:'observed',visible:true,observed:true});
  return Object.freeze({state:'recognizable',visible:true,observed:false});
}

// M9 — Branch Cluster 2's first anchor (灼熱の火山 / Ch5). Independent of the
// Ch2 anchors: it only needs the already-earned global branch-sight/parallax
// unlock plus its own Chapter-5 evidence discovery (js/data/contentPackIVG.js).
export const CP4_THIRD_BRANCH_ANCHOR=Object.freeze({
  id:'flame-king-volcano-anchor',
  branchSightDiscoveryId:'cp4:branch-sight:active',
  sourceEvidenceDiscoveryId:'cp4:volcano:coronation-record',
  discoveryId:'cp4:branch-anchor:flame-king',
  chapterNum:5,
  hiddenLabel:'歴史的重なり',
  name:'観測分岐：炎帝領',
  preview:'分岐視を通すと、既知の灼熱の火山と同じ座標に、神王として即位した炎帝の火山国家史が安定して重なっている。',
  observed:'炎帝ドレイクが討たれなかった履歴は、壊れた記録ではない。同じ座標に固定された別の整合した歴史として観測できる。',
  next:'観測点は識別できるが、まだそこへ移動する方法はない。',
});

export function cp4ThirdBranchAnchorProgress({discoveries={}}={}){
  const anchor=CP4_THIRD_BRANCH_ANCHOR;
  const branchSight=Boolean(discoveries[anchor.branchSightDiscoveryId]);
  const evidence=Boolean(discoveries[anchor.sourceEvidenceDiscoveryId]);
  const observed=Boolean(discoveries[anchor.discoveryId]);
  if(!branchSight||!evidence)return Object.freeze({state:'hidden',visible:false,observed:false});
  if(observed)return Object.freeze({state:'observed',visible:true,observed:true});
  return Object.freeze({state:'recognizable',visible:true,observed:false});
}
