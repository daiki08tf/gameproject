/* Content Pack IV I — 機界監査層 (Ch28) contradictory-history evidence.
   Branch Cluster 3's own single-step counterpart to contentPackIVG.js's
   single-step Volcano chain: minimal, data-driven evidence gating M9's
   mother-full-authority Branch anchor (js/data/contentPackIVD.js). */

export const CP4_AUDIT_EVIDENCE=Object.freeze({
  id:'audit-authority-evidence',
  prerequisiteStageId:'28-3',
  primeChapter:28,
  discoveryId:'cp4:machineworld:audit-authority-record',
  label:'存在しない全権受理記録',
  text:'監査記録庫の奥、焼却を免れた記録層には「MOTHERは監査要求を退けず、内部監査の緊急全権を受理した」と記されている。現在史のMOTHER権限とは矛盾する、別系統の記録である。',
  next:'この記録が指す座標を、分岐視で確認する。',
});

export function cp4AuditEvidenceProgress({discoveries={},isStageCleared=()=>false}={}){
  const evidence=CP4_AUDIT_EVIDENCE;
  if(!isStageCleared(evidence.prerequisiteStageId))return Object.freeze({state:'locked',complete:false});
  if(discoveries[evidence.discoveryId])return Object.freeze({state:'observed',complete:true});
  return Object.freeze({state:'ready',complete:false});
}
