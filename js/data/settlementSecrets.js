export const SETTLEMENT_HIDDEN_FACILITIES=Object.freeze([
{id:'forgeCellar',name:'鍛冶屋地下',icon:'🔥',area:'生活区',requires:{exploration:'abandonedHouse',resident:'garrick',minHall:8},desc:'廃屋から見つかった炉床図面が、鍛冶師ガリックの古い地下炉へ繋がった。'},
{id:'sealedVault',name:'封印庫',icon:'🗝️',area:'外縁区',requires:{exploration:'graveyard',resident:'iris',minHall:10},desc:'削れた墓標の記録を照合すると、街の地下に封印された記録庫の入口が判明した。'},
{id:'ancientLab',name:'古代研究室',icon:'⚗️',area:'交易区',requires:{exploration:'mineShaft',resident:'orwin',minHall:12,minCodexSeen:15},desc:'旧採掘坑の支道から、境界現象を調べていた古い研究区画へ到達した。'},
{id:'riftGate',name:'異界門',icon:'🌀',area:'中央区',requires:{exploration:'sewer',resident:'valen',minHall:15,minBossKills:1},desc:'地下水路の異界痕跡とBoss討伐記録が一致し、封鎖された門の存在が確定した。'}
]);

export const SETTLEMENT_SECRET_QUESTS=Object.freeze([
{id:'buriedFlame',facilityId:'forgeCellar',name:'埋もれた炉火',icon:'🔥',stages:Object.freeze([
{title:'炉床を調べる',text:'地下炉の亀裂から、失われた鍛造記録を回収した。'},
{title:'境界炉を再点火',text:'既存素材を使って炉の安全な火路を確保した。'},
{title:'炉心の残滓',text:'炉心に残った異界反応を封じ、地下炉を安定化した。',reward:{ore:8,veilstone:2}}
])},
{id:'namesUnderStone',facilityId:'sealedVault',name:'石下の名簿',icon:'📜',stages:Object.freeze([
{title:'封印記録を読む',text:'墓地に残る名と封印庫の古い名簿を照合した。'},
{title:'欠落頁を復元',text:'記録官イリスが散逸した頁の順序を復元した。'},
{title:'最後の記録',text:'封印の理由が判明し、街の過去が記録として残った。',reward:{wood:5,hide:5,veilstone:1}}
])},
{id:'boundaryFormula',facilityId:'ancientLab',name:'境界式の残響',icon:'⚗️',stages:Object.freeze([
{title:'研究机を復旧',text:'古代研究室の記録装置から断片的な観測式を読み出した。'},
{title:'Codexと照合',text:'既に遭遇済みのCodex記録だけを使い、観測式の誤りを除いた。'},
{title:'境界反応を固定',text:'研究室の反応炉を安全域に固定した。',reward:{ore:6,veilstone:3}}
])},
{id:'otherSideKnocks',facilityId:'riftGate',name:'門の向こうから',icon:'🌀',stages:Object.freeze([
{title:'門を観測する',text:'門の向こうから周期的な衝撃が返ってくる。'},
{title:'封印を解く',text:'ヴァレンの警戒下で外郭封印だけを解除した。'},
{title:'境界守護者',text:'門の向こうに強大な個体反応を確認した。既存戦闘システムへ渡せる遭遇地点が開いた。',encounter:{id:'settlementBoundaryGuardian',name:'境界守護者',kind:'secretBoss'}}
])}
]);

export function settlementSecretFacilityEligible(facility,context={}){
 const req=facility?.requires||{};
 if((context.hall||0)<(req.minHall||0))return false;
 if(req.exploration&&!context.completedExploration?.includes(req.exploration))return false;
 if(req.resident&&!context.residents?.includes(req.resident))return false;
 if((context.codexSeen||0)<(req.minCodexSeen||0))return false;
 if((context.bossKills||0)<(req.minBossKills||0))return false;
 return true;
}
