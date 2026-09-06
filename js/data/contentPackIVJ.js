/* Content Pack IV J — 月蝕の境界 (Ch19) contradictory-history evidence.
   Branch Cluster 4's own single-step counterpart to contentPackIVG.js's /
   contentPackIVI.js's single-step chains: minimal, data-driven evidence
   gating M9's unbroken-veil Branch anchor (js/data/contentPackIVD.js). */

export const CP4_VEIL_EVIDENCE=Object.freeze({
  id:'veil-unbroken-evidence',
  prerequisiteStageId:'19-3',
  primeChapter:19,
  discoveryId:'cp4:veil:unbroken-record',
  label:'存在しない不断記録',
  text:'鏡世界の奥、砕けずに残っていた鏡面には「The Veilは一度も破断せず、境界網は閉じたまま安定した」と刻まれている。現在史のThe Veil崩壊とは矛盾する、別系統の記録である。',
  next:'この記録が指す座標を、分岐視で確認する。',
});

export function cp4VeilEvidenceProgress({discoveries={},isStageCleared=()=>false}={}){
  const evidence=CP4_VEIL_EVIDENCE;
  if(!isStageCleared(evidence.prerequisiteStageId))return Object.freeze({state:'locked',complete:false});
  if(discoveries[evidence.discoveryId])return Object.freeze({state:'observed',complete:true});
  return Object.freeze({state:'ready',complete:false});
}
