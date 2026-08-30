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

export function cp4FirstBranchAnchorProgress({discoveries={}}={}){
  const anchor=CP4_FIRST_BRANCH_ANCHOR;
  const branchSight=Boolean(discoveries[anchor.branchSightDiscoveryId]);
  const evidence=Boolean(discoveries[anchor.sourceEvidenceDiscoveryId]);
  const observed=Boolean(discoveries[anchor.discoveryId]);
  if(!branchSight||!evidence)return Object.freeze({state:'hidden',visible:false,observed:false});
  if(observed)return Object.freeze({state:'observed',visible:true,observed:true});
  return Object.freeze({state:'recognizable',visible:true,observed:false});
}
