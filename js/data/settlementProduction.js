export const PRODUCTION_UNLOCK_HALL_LEVEL=10;

export const PRODUCTION_GOODS=Object.freeze({
 ration:{id:'ration',name:'保存食',icon:'🥖',desc:'遠征・探索・酒場依頼へ接続する携行食。'},
 remedy:{id:'remedy',name:'調合薬',icon:'🧪',desc:'薬師系イベントや将来の回復支援へ接続する加工品。'},
 bait:{id:'bait',name:'魔獣餌',icon:'🦴',desc:'Monster Ranch・探索・特殊遭遇へ接続する餌。'},
 frame:{id:'frame',name:'建築部材',icon:'🧱',desc:'街区・隠し施設・防衛設備などの建築素材。'},
});

export const PRODUCTION_FACILITIES=Object.freeze([
 {id:'farm',name:'農園',icon:'🌾',linkedBuilding:'inn',minLinkedLevel:8,desc:'生活区の食料生産を支える。冒険素材を置き換える自動収入ではなく、加工用の保存食を作る。'},
 {id:'mine',name:'採掘場',icon:'⛏️',linkedBuilding:'watch',minLinkedLevel:8,desc:'外縁の鉱脈を管理し、鉱石を加工工程へ回す。'},
 {id:'lumber',name:'伐採場',icon:'🪓',linkedBuilding:'market',minLinkedLevel:8,desc:'古木を選別・乾燥し、建築向けの資材供給を補助する。'},
 {id:'workshop',name:'加工工房',icon:'⚒️',linkedBuilding:'market',minLinkedLevel:10,desc:'街で集めた素材を料理・薬・餌・建築部材へ加工する。'},
]);

export const PRODUCTION_RECIPES=Object.freeze([
 {id:'trail_ration',facilityId:'farm',name:'旅支度の保存食',output:{good:'ration',amount:1},cost:{wood:6,hide:2},minHall:10},
 {id:'field_remedy',facilityId:'workshop',name:'野戦用調合薬',output:{good:'remedy',amount:1},cost:{wood:4,ore:3,hide:3},minHall:10},
 {id:'monster_bait',facilityId:'farm',name:'魔獣用の餌',output:{good:'bait',amount:1},cost:{wood:5,hide:5},minHall:10},
 {id:'building_frame',facilityId:'lumber',name:'補強建築部材',output:{good:'frame',amount:1},cost:{wood:12,ore:5},minHall:10},
 {id:'reinforced_frame',facilityId:'workshop',name:'境界補強部材',output:{good:'frame',amount:3},cost:{wood:20,ore:16,hide:4,veilstone:1},minHall:15},
 {id:'deep_remedy',facilityId:'mine',name:'深層鉱薬',output:{good:'remedy',amount:2},cost:{ore:14,hide:6,veilstone:1},minHall:15},
]);

export function productionFacilityUnlocked(facility,context={}){if(!facility)return false;if((Number(context.hall)||0)<PRODUCTION_UNLOCK_HALL_LEVEL)return false;return (Number(context.buildings?.[facility.linkedBuilding])||0)>=facility.minLinkedLevel;}
export function productionRecipeUnlocked(recipe,context={}){if(!recipe||(Number(context.hall)||0)<recipe.minHall)return false;const facility=PRODUCTION_FACILITIES.find(x=>x.id===recipe.facilityId);return productionFacilityUnlocked(facility,context);}
export function productionCanCraft(recipe,context={}){if(!productionRecipeUnlocked(recipe,context))return false;return Object.entries(recipe.cost||{}).every(([k,v])=>(Number(context.materials?.[k])||0)>=v);}
