export const SETTLEMENT_EXPEDITIONS=Object.freeze([
{id:'nearSurvey',name:'近郊踏査',icon:'🥾',length:'short',cycles:1,minHall:10,maxMembers:2,desc:'街道外縁を短く巡り、噂と小さな発見を持ち帰る。',reward:{wood:4,hide:2},lead:{type:'rumor',id:'frontierRumor',name:'辺境の噂'}},
{id:'routeMapping',name:'旧道測量',icon:'🗺️',length:'short',cycles:1,minHall:10,maxMembers:2,desc:'使われなくなった道を測量し、探索用の地図断片を作る。',reward:{wood:3,ore:3},lead:{type:'map',id:'oldRouteMap',name:'旧道の地図断片'}},
{id:'deepRecon',name:'境界深部偵察',icon:'🔭',length:'long',cycles:3,minHall:15,maxMembers:3,desc:'境界近くまで足を延ばし、後続イベントにつながる兆候を探る。',reward:{ore:7,veilstone:1},lead:{type:'event',id:'boundarySignal',name:'境界の異常兆候'}},
{id:'travelerSearch',name:'旅人捜索',icon:'🧭',length:'long',cycles:3,minHall:15,maxMembers:3,desc:'街へ来るはずだった旅人の足取りを追い、新たな人物情報を探す。',reward:{hide:5,wood:5},lead:{type:'npc',id:'lostTravelerLead',name:'行方不明の旅人情報'}}
]);
export function settlementExpeditionEligible(expedition,context={}){return !!expedition&&(context.hall||0)>=(expedition.minHall||0);}
