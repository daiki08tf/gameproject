export const SETTLEMENT_MATERIALS=Object.freeze({wood:{id:'wood',name:'古木',icon:'🪵'},ore:{id:'ore',name:'鉱石',icon:'⛏️'},hide:{id:'hide',name:'魔獣皮',icon:'🧶'},veilstone:{id:'veilstone',name:'境界石',icon:'🔷'}});
const levels=(wood,ore,hide=0,veilstone=0)=>Array.from({length:5},(_,i)=>({wood:Math.round(wood*Math.pow(1.8,i)),ore:Math.round(ore*Math.pow(1.8,i)),hide:Math.round(hide*Math.pow(1.8,i)),veilstone:Math.round(veilstone*Math.pow(1.9,i))}));
export const SETTLEMENT_BUILDINGS=Object.freeze([
{id:'hall',name:'集会所',icon:'🏛️',desc:'村の中心。ほかの施設の最大Lvは集会所Lvを超えられない。素材発見量+5%/Lv。',maxLevel:5,costs:levels(20,10,0,0),effect:{materialMultPerLv:.05}},
{id:'inn',name:'宿屋',icon:'🛏️',desc:'旅人と仲間の休息所。最大HP/MP+3%/Lv。',maxLevel:5,costs:levels(16,8,4,0),effect:{hpMultPerLv:.03,mpMultPerLv:.03}},
{id:'market',name:'市場',icon:'🏪',desc:'戦利品と物資が集まる。獲得Gold+5%/Lv。',maxLevel:5,costs:levels(22,6,3,0),effect:{goldMultPerLv:.05}},
{id:'watch',name:'見張り塔',icon:'🗼',desc:'危険地帯の情報を先回りして集める。Drop率+4%/Lv。',maxLevel:5,costs:levels(12,18,2,0),effect:{dropMultPerLv:.04}},
{id:'ranch',name:'牧舎',icon:'🐾',desc:'仲間モンスターが暮らす場所。加入率+2pt/Lv、仲間EXP+5%/Lv。Monster Ranchの基礎施設。',maxLevel:5,costs:levels(18,8,12,1),effect:{recruitChancePerLv:.02,companionExpMultPerLv:.05}},
]);
export function settlementBuilding(id){return SETTLEMENT_BUILDINGS.find(x=>x.id===id)||null;}
export function settlementCost(id,nextLevel){const b=settlementBuilding(id);return b&&nextLevel>=1&&nextLevel<=b.maxLevel?{...b.costs[nextLevel-1]}:null;}
export function settlementMaterialYield(stage){if(!stage)return{};const d=Math.max(1,Number(stage.abyssDepth)||Number(stage.recLevel)||1),boss=!!stage.boss;if(stage.isAbyss)return{wood:0,ore:2+Math.floor(d/150)+(boss?3:0),hide:1+(boss?1:0),veilstone:(boss?2:1)+Math.floor(d/500)};const tier=Math.max(1,Math.ceil((Number(stage.recLevel)||1)/80));return{wood:3+tier+(boss?2:0),ore:1+Math.floor(tier/2)+(boss?2:0),hide:Math.max(0,Math.floor(tier/2))+(boss?1:0),veilstone:0};}
