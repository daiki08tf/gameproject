/* Monster Ranch 2.0 — Ranch sub-facilities */
const costs=(wood,ore,hide,veilstone=0)=>Array.from({length:5},(_,i)=>({wood:Math.round(wood*Math.pow(1.7,i)),ore:Math.round(ore*Math.pow(1.75,i)),hide:Math.round(hide*Math.pow(1.7,i)),veilstone:Math.round(veilstone*Math.pow(1.85,i))}));
export const RANCH_FACILITIES=Object.freeze([
 {id:'incubator',name:'孵化場',desc:'卵と配合卵を孵化する。Lvが上がるほど孵化個体のTalent最低値が上がる。',maxLevel:5,costs:costs(16,10,8,0),effect:{talentFloorPerLv:.006}},
 {id:'training',name:'訓練場',desc:'牧場モンスターの育成施設。仲間EXP+6%/Lv、Bond獲得+3%/Lv。',maxLevel:5,costs:costs(22,8,12,0),effect:{companionExpPerLv:.06,bondExpPerLv:.03}},
 {id:'research',name:'魔物研究所',desc:'種族研究と系譜解析を行う。野へ帰した際の種族の記憶+8%/Lv。',maxLevel:5,costs:costs(14,18,10,1),effect:{memoryPerLv:.08}},
 {id:'mutationLab',name:'変異研究室',desc:'突然変異の兆候を研究する。加入時の突然変異率をわずかに上昇させる。',maxLevel:5,costs:costs(10,22,14,2),effect:{mutationChancePerLv:.001}},
]);
export function ranchFacility(id){return RANCH_FACILITIES.find(x=>x.id===id)||null;}
export function ranchFacilityCost(id,nextLevel){const f=ranchFacility(id);return f&&nextLevel>=1&&nextLevel<=f.maxLevel?{...f.costs[nextLevel-1]}:null;}
export function ranchFacilityEffects(levels={}){const out={talentFloorBonus:0,companionExpMult:1,bondExpMult:1,memoryMult:1,mutationChanceBonus:0};for(const f of RANCH_FACILITIES){const lv=Math.max(0,Math.floor(levels[f.id]||0)),e=f.effect||{};out.talentFloorBonus+=(e.talentFloorPerLv||0)*lv;out.companionExpMult+=(e.companionExpPerLv||0)*lv;out.bondExpMult+=(e.bondExpPerLv||0)*lv;out.memoryMult+=(e.memoryPerLv||0)*lv;out.mutationChanceBonus+=(e.mutationChancePerLv||0)*lv;}return out;}
