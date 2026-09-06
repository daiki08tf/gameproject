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

// M9 continuation — Branch Cluster 3's first anchor (機界監査層 / Ch28).
// Independent of the Ch2/Ch5 anchors: it only needs the already-earned
// global branch-sight/parallax unlock plus its own Chapter-28 evidence
// discovery (js/data/contentPackIVI.js).
export const CP4_FOURTH_BRANCH_ANCHOR=Object.freeze({
  id:'mother-full-authority-anchor',
  branchSightDiscoveryId:'cp4:branch-sight:active',
  sourceEvidenceDiscoveryId:'cp4:machineworld:audit-authority-record',
  discoveryId:'cp4:branch-anchor:mother-full-authority',
  chapterNum:28,
  hiddenLabel:'歴史的重なり',
  name:'観測分岐：全権域',
  preview:'分岐視を通すと、既知の機界監査層と同じ座標に、MOTHERが全権を掌握した統一管理史が安定して重なっている。',
  observed:'MOTHERが緊急全権を受理した履歴は、壊れた記録ではない。同じ座標に固定された別の整合した歴史として観測できる。',
  next:'観測点は識別できるが、まだそこへ移動する方法はない。',
});

export function cp4FourthBranchAnchorProgress({discoveries={}}={}){
  const anchor=CP4_FOURTH_BRANCH_ANCHOR;
  const branchSight=Boolean(discoveries[anchor.branchSightDiscoveryId]);
  const evidence=Boolean(discoveries[anchor.sourceEvidenceDiscoveryId]);
  const observed=Boolean(discoveries[anchor.discoveryId]);
  if(!branchSight||!evidence)return Object.freeze({state:'hidden',visible:false,observed:false});
  if(observed)return Object.freeze({state:'observed',visible:true,observed:true});
  return Object.freeze({state:'recognizable',visible:true,observed:false});
}

// M9 continuation — Branch Cluster 4's anchor (月蝕の境界 / Ch19), the last
// queued Cluster. Independent of every other anchor: it only needs the
// already-earned global branch-sight/parallax unlock plus its own
// Chapter-19 evidence discovery (js/data/contentPackIVJ.js).
export const CP4_FIFTH_BRANCH_ANCHOR=Object.freeze({
  id:'unbroken-veil-anchor',
  branchSightDiscoveryId:'cp4:branch-sight:active',
  sourceEvidenceDiscoveryId:'cp4:veil:unbroken-record',
  discoveryId:'cp4:branch-anchor:unbroken-veil',
  chapterNum:19,
  hiddenLabel:'歴史的重なり',
  name:'観測分岐：不断領',
  preview:'分岐視を通すと、既知の月蝕の境界と同じ座標に、The Veilが一度も破断しなかった閉鎖史が安定して重なっている。',
  observed:'The Veilが破断しなかった履歴は、壊れた記録ではない。同じ座標に固定された別の整合した歴史として観測できる。',
  next:'観測点は識別できるが、まだそこへ移動する方法はない。',
});

export function cp4FifthBranchAnchorProgress({discoveries={}}={}){
  const anchor=CP4_FIFTH_BRANCH_ANCHOR;
  const branchSight=Boolean(discoveries[anchor.branchSightDiscoveryId]);
  const evidence=Boolean(discoveries[anchor.sourceEvidenceDiscoveryId]);
  const observed=Boolean(discoveries[anchor.discoveryId]);
  if(!branchSight||!evidence)return Object.freeze({state:'hidden',visible:false,observed:false});
  if(observed)return Object.freeze({state:'observed',visible:true,observed:true});
  return Object.freeze({state:'recognizable',visible:true,observed:false});
}
