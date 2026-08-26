/* System Deepening Pack C — Rumor Notebook / regional knowledge / clue chains */
import { PHASE12_RUMORS } from './phase12WorldActivity.js';

export const RUMOR_STATES=Object.freeze({
  unresolved:{id:'unresolved',label:'未解決',rank:1},
  tracking:{id:'tracking',label:'追跡中',rank:2},
  resolved:{id:'resolved',label:'解決済み',rank:3},
});

export const PACK_C_SITE_STAGE=Object.freeze({
  old_king_tomb:'secret-old-king-tomb',
  phantom_beast_forest:'secret-phantom-beast-forest',
  dragonbone_canyon:'secret-dragonbone-canyon',
  inverted_library:'secret-inverted-library',
  black_moon_temple:'secret-black-moon-temple',
});

export const PACK_C_SITE_CHAPTER=Object.freeze({
  old_king_tomb:21,
  phantom_beast_forest:22,
  dragonbone_canyon:23,
  inverted_library:24,
  black_moon_temple:25,
});

export const TREASURE_CLUES=Object.freeze({
  'nameless-king':{id:'royal-rubbing',name:'欠けた王墓拓本',text:'王名だけが削られた拓本。余白の三本線は、墓門よりさらに深い区画を指している。'},
  'mist-beast':{id:'white-horn-trail',name:'白角獣の踏査図',text:'季節の違う足跡が一枚の地図で重なる。霧が濃いほど、白い角の痕跡は新しくなる。'},
  'giant-bone':{id:'bone-star-map',name:'竜骸星図片',text:'骨の導線を星図として読むと、七方向のうち一つだけが既知の境界設備から外れている。'},
  'falling-books':{id:'reversed-margin',name:'反転書庫の余白紙',text:'上下を逆にしても読めない。だが王墓の記号だけを重ねると、座標らしい並びが浮かぶ。'},
  'black-moon':{id:'moonless-survey',name:'無月観測紙',text:'月のない夜だけ記録された黒い円。外側から届く周期信号と同じ間隔で位置がずれている。'},
});

export const SECRET_CHAIN=Object.freeze({
  id:'buried-observation-coordinate',
  name:'埋もれた観測座標',
  steps:[
    {id:'tablet',siteId:'old_king_tomb',stageId:'secret-old-king-tomb',title:'王墓の欠けた石板',text:'古王墓の最深部で、王名ではなく座標を刻んだ石板を見つけた。文字の一部が上下逆に並ぶ。'},
    {id:'decode',siteId:'inverted_library',stageId:'secret-inverted-library',title:'反転目録による解読',text:'反転図書館の欠番目録と重ねると、石板は墓誌ではなく「別地点への照合順序」だったと分かる。次の印は巨大な骨を示す。'},
    {id:'coordinate',siteId:'dragonbone_canyon',stageId:'secret-dragonbone-canyon',title:'竜骸の第零座標',text:'竜骸の導線と石板の座標が一致した。三地点は別々の遺跡ではなく、同じ観測網の端末だった可能性がある。'},
  ],
  resolution:'三つの記録は、まだ開いていない中央観測点へ収束している。場所そのものは特定できない。残る異界の記録が必要だ。',
});

export function rumorStateFor({targetSiteId,discoveries={},isStageCleared=()=>false}={}){
  const stageId=PACK_C_SITE_STAGE[targetSiteId];
  if(stageId&&isStageCleared(stageId))return RUMOR_STATES.resolved;
  if(discoveries[`trace:${targetSiteId}`])return RUMOR_STATES.tracking;
  return RUMOR_STATES.unresolved;
}

export function regionalKnowledgeBenefit({mastered=false,horizontalCleared=false,traceSeen=false}={}){
  const knowledge=mastered?2:(horizontalCleared||traceSeen?1:0);
  return {
    knowledge,
    rumorHintLevel:knowledge,
    rareLeadRelativeMult:mastered?1.05:1,
    clueDetail:knowledge>=1,
    label:mastered?'土地勘 MASTER':knowledge?'土地勘 OBSERVED':'土地勘 未習得',
  };
}

export function enhancedRumorHint(rumor,{mastered=false,traceSeen=false}={}){
  if(!rumor)return'';
  if(mastered&&rumor.targetSiteId){
    const chapter=PACK_C_SITE_CHAPTER[rumor.targetSiteId];
    return `${rumor.hint}　土地勘：Ch${chapter}の横道・異常痕跡を重点的に探すとよい。`;
  }
  if(traceSeen)return `${rumor.hint}　既知の世界痕跡と同じ反応がある。`;
  return rumor.hint;
}

export function packCRumorById(id){return PHASE12_RUMORS.find(r=>r.id===id)||null;}

export function secretChainProgress({isStageCleared=()=>false}={}){
  let completed=0;
  for(const step of SECRET_CHAIN.steps){
    if(!isStageCleared(step.stageId))break;
    completed++;
  }
  return {completed,total:SECRET_CHAIN.steps.length,resolved:completed===SECRET_CHAIN.steps.length,next:SECRET_CHAIN.steps[completed]||null};
}
