export const MARKET2_UNLOCK_HALL_LEVEL=10;

export const TRADE_ROUTES=Object.freeze([
 {id:'greenway',name:'翠葉街道',icon:'🌿',region:'緑野圏',desc:'農村と開拓拠点を結ぶ生活物資の街道。',discover:{hall:10,stageClears:8},secureCost:{wood:28,hide:10},merchant:'行商人ミラ'},
 {id:'ironpass',name:'鉄嶺路',icon:'⛰️',region:'鉱山圏',desc:'鉱石と加工品が流れる険しい山道。',discover:{hall:10,codexKills:50},secureCost:{ore:30,wood:18},merchant:'鉱商ドラン'},
 {id:'beastroad',name:'獣環道',icon:'🐾',region:'魔獣圏',desc:'魔物使いと牧舎の交易を支える危険な獣道。',discover:{hall:12,recruitedCodex:3},secureCost:{hide:28,wood:16},merchant:'獣商ネネ'},
 {id:'veilroad',name:'境界回廊',icon:'🔷',region:'境界圏',desc:'深淵帰りの物資が流れ込む不安定な交易路。',discover:{hall:15,abyssBestDepth:100},secureCost:{ore:24,veilstone:4},merchant:'境界商セラ'},
]);

export const MARKET_OFFERS=Object.freeze([
 {id:'green_supply',routeId:'greenway',name:'開拓補給箱',desc:'生活区向けの基礎素材セット。',cost:{gold:650},reward:{materials:{wood:24,hide:8}},stock:2},
 {id:'iron_supply',routeId:'ironpass',name:'鉱山補給箱',desc:'鍛冶と加工向けの鉱石セット。',cost:{gold:850},reward:{materials:{ore:22,wood:8}},stock:2},
 {id:'beast_exchange',routeId:'beastroad',name:'魔獣商の交換便',desc:'保存食を魔獣素材へ交換するキャラバン取引。',cost:{goods:{ration:2}},reward:{materials:{hide:18}},stock:2},
 {id:'veil_exchange',routeId:'veilroad',name:'境界商の希少便',desc:'加工品とGoldを境界石へ交換する高位取引。',cost:{gold:1800,goods:{frame:1,remedy:1}},reward:{materials:{veilstone:3,ore:12}},stock:1},
]);

export const BLACK_MARKET=Object.freeze({id:'black_market',name:'影市',icon:'🌑',desc:'通常進行には不要な秘密の商取引。Rare観測と深淵到達を重ねた者だけが噂を掴む。',discover:{hall:15,rareSeen:5,abyssBestDepth:150}});

export function tradeRequirementMet(requirement={},context={}){return Object.entries(requirement).every(([key,value])=>(Number(context[key])||0)>=value);}
export function tradeRouteDiscovered(route,context={}){return !!route&&tradeRequirementMet(route.discover,context);}
export function tradeRouteSecured(route,context={}){return !!route&&Array.isArray(context.securedRoutes)&&context.securedRoutes.includes(route.id);}
export function marketOfferAvailable(offer,context={}){if(!offer)return false;return Array.isArray(context.securedRoutes)&&context.securedRoutes.includes(offer.routeId);}
export function marketCanPay(cost={},context={}){if((Number(context.gold)||0)<(Number(cost.gold)||0))return false;for(const [k,v] of Object.entries(cost.materials||{}))if((Number(context.materials?.[k])||0)<v)return false;for(const [k,v] of Object.entries(cost.goods||{}))if((Number(context.goods?.[k])||0)<v)return false;return true;}
