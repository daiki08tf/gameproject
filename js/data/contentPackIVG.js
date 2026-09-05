/* Content Pack IV G — 灼熱の火山 (Ch5) contradictory-history evidence.
   Branch Cluster 2's own single-step counterpart to contentPackIVA.js's
   three-step Deep Green chain: minimal, data-driven evidence gating M9's
   flame-king Branch anchor (js/data/contentPackIVD.js). */

export const CP4_VOLCANO_EVIDENCE=Object.freeze({
  id:'volcano-coronation-evidence',
  prerequisiteStageId:'5-3',
  primeChapter:5,
  discoveryId:'cp4:volcano:coronation-record',
  label:'存在しない戴冠記録',
  text:'火口付近の焼け残った記録板には「炎帝ドレイクは討たれず、火山国家の神王として即位した」と記されている。現在史の炎帝討伐とは矛盾する、別系統の記録である。',
  next:'この記録が指す座標を、分岐視で確認する。',
});

export function cp4VolcanoEvidenceProgress({discoveries={},isStageCleared=()=>false}={}){
  const evidence=CP4_VOLCANO_EVIDENCE;
  if(!isStageCleared(evidence.prerequisiteStageId))return Object.freeze({state:'locked',complete:false});
  if(discoveries[evidence.discoveryId])return Object.freeze({state:'observed',complete:true});
  return Object.freeze({state:'ready',complete:false});
}
