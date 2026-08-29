export const SETTLEMENT_EXPLORATION_LOCATIONS=[
{id:'well',name:'古井戸',icon:'🪣',area:'中央区',minHall:5,repeatable:true,desc:'石組みの古井戸。水面の奥に、まだ誰も確かめていない空洞がある。',firstEvent:'井戸壁の隙間から古い備蓄を発見した。',revisitEvent:'水音を頼りに奥を調べたが、新しい異変はない。',reward:{wood:3,ore:2}},
{id:'graveyard',name:'共同墓地',icon:'🪦',area:'外縁区',minHall:5,minWatch:3,repeatable:false,desc:'開拓初期から残る小さな墓地。いくつかの墓標だけ文字が削られている。',firstEvent:'古い墓標の裏から境界石の欠片を見つけた。',revisitEvent:'静かな墓地には、もう調べ残しはなさそうだ。',reward:{veilstone:1}},
{id:'abandonedHouse',name:'廃屋',icon:'🏚️',area:'生活区',minHall:6,minInn:4,repeatable:false,desc:'住民が増える前から残っていた崩れかけの家。',firstEvent:'床下から使える皮材と古い生活道具を回収した。',revisitEvent:'廃屋は片付けられ、危険な場所は残っていない。',reward:{hide:4,wood:2}},
{id:'outskirtsForest',name:'村外れの森',icon:'🌲',area:'外縁区',minHall:7,minWatch:5,repeatable:true,desc:'見張り台の外側に広がる浅い森。魔物の足跡も混じる。',firstEvent:'獣道の先で採取地点と古い野営跡を発見した。',revisitEvent:'見回りついでに森を再確認した。足跡は増えているが街への脅威ではない。',reward:{wood:5,hide:3}},
{id:'mineShaft',name:'旧採掘坑',icon:'⛏️',area:'交易区',minHall:10,minMarket:6,repeatable:true,desc:'交易町の拡張中に見つかった封鎖済みの旧坑道。',firstEvent:'崩落手前の支道から鉱石と境界石を回収した。',revisitEvent:'補強済み区画を再調査した。新しい鉱脈の兆候だけ記録した。',reward:{ore:7,veilstone:1}},
{id:'sewer',name:'地下水路',icon:'🕳️',area:'中央区',minHall:12,minInn:8,minWatch:8,repeatable:true,desc:'拠点拡張で繋がった古い排水路。街の地下を複雑に走っている。',firstEvent:'水路の奥で古い資材置き場と異界由来の痕跡を発見した。',revisitEvent:'水路を巡回し、異常がないことを確認した。',reward:{ore:4,veilstone:2}}
];

export function settlementExplorationEligible(location,levels={}){
 if((levels.hall||0)<(location.minHall||0))return false;
 if((levels.watch||0)<(location.minWatch||0))return false;
 if((levels.inn||0)<(location.minInn||0))return false;
 if((levels.market||0)<(location.minMarket||0))return false;
 return true;
}
