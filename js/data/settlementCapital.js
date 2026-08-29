/* Settlement 3.0 S18 — Frontier Capital Endgame */
export const FRONTIER_CAPITAL_MIN_HALL = 20;

export const FRONTIER_CAPITAL_PROJECTS = [
  {id:'ancientRelay',name:'古代境界中継機',icon:'🜂',desc:'既存のWorld Tier / Rift / Realm / Machine観測を一枚の首都盤へ束ねる。',require:{networkOnline:4}},
  {id:'finalArchive',name:'最終研究書庫',icon:'📚',desc:'研究所と年代記の蓄積を統合し、未整理の終端知識を可視化する。',require:{researchEvidence:15}},
  {id:'capitalBulwark',name:'首都防衛環',icon:'🛡️',desc:'既存防衛設備と撃退記録を首都級の迎撃計画へ接続する。',require:{defenseClears:2}},
];

export const FRONTIER_CAPITAL_CRISIS = {
  id:'capitalConvergence',
  name:'境界収束災害',
  icon:'⚠️',
  desc:'複数の終端観測が同時に首都へ収束する超高難度Settlement事件。勝敗判定は既存戦闘系へ委譲する。',
  require:{projects:3,abyssDepth:100,worldTierRank:1},
};

export function capitalProjectEligible(project, ctx={}){
  if((ctx.hall||0)<FRONTIER_CAPITAL_MIN_HALL)return false;
  const r=project.require||{};
  if(r.networkOnline!=null&&(ctx.networkOnline||0)<r.networkOnline)return false;
  if(r.researchEvidence!=null&&(ctx.researchEvidence||0)<r.researchEvidence)return false;
  if(r.defenseClears!=null&&(ctx.defenseClears||0)<r.defenseClears)return false;
  return true;
}
