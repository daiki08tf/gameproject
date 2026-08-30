/* Content Pack IV C — deterministic Branch Sight awakening. */

export const CP4_BRANCH_SIGHT_AWAKENING=Object.freeze({
  id:'deep-green-branch-sight-awakening',
  prerequisiteDiscoveryId:'cp4:parallax:first-contact',
  activationStageId:'2-5',
  discoveryId:'cp4:branch-sight:active',
  name:'分岐視',
  label:'視差核との再同期',
  intro:'視差核へもう一度触れる。今度は重なった景色を振り払わず、それぞれを別の整合した履歴として見分けようとする。',
  lines:Object.freeze([
    '音の二重化が雑音ではなく、同じ座標から届く別々の響きとして分離して聞こえる。',
    '既知の深緑の森と、生きた根の回廊が同時に見える。それでも輪郭は混ざらない。',
    '白い境界傷は一瞬だけ残るが、まだ意味も行き先も判別できない。',
    '存在すると同時に存在しなかった人影は、壊れた像ではなく「別の履歴に属する像」として認識できる。',
  ]),
  activation:'知覚が安定する。記録不一致は破損ではない。十分に観測された別の履歴なら、同じ場所に重なっていても見分けられる。',
  next:'NEXT — 深緑の森で、認識できるようになった歴史的重なりを確認する。',
});

export function cp4BranchSightProgress({discoveries={}}={}){
  const event=CP4_BRANCH_SIGHT_AWAKENING;
  if(!discoveries[event.prerequisiteDiscoveryId])return Object.freeze({state:'locked',ready:false,active:false,nextStageId:null});
  if(discoveries[event.discoveryId])return Object.freeze({state:'active',ready:false,active:true,nextStageId:null});
  return Object.freeze({state:'stabilize',ready:true,active:false,nextStageId:event.activationStageId});
}

export function cp4BranchSightActivationForStage(stageId,{discoveries={}}={}){
  const progress=cp4BranchSightProgress({discoveries});
  if(!progress.ready||stageId!==progress.nextStageId)return null;
  return CP4_BRANCH_SIGHT_AWAKENING;
}
