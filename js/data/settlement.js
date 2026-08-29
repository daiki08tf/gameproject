export const SETTLEMENT_MATERIALS=Object.freeze({wood:{id:'wood',name:'古木',icon:'🪵'},ore:{id:'ore',name:'鉱石',icon:'⛏️'},hide:{id:'hide',name:'魔獣皮',icon:'🧶'},veilstone:{id:'veilstone',name:'境界石',icon:'🔷'}});
export const SETTLEMENT_MAX_LEVEL=20;
export const SETTLEMENT_ERAS=Object.freeze([
{id:'frontier',name:'開拓地',minLevel:0,milestone:5},
{id:'village',name:'開拓村',minLevel:5,milestone:10},
{id:'town',name:'交易町',minLevel:10,milestone:15},
{id:'city',name:'城塞都市',minLevel:15,milestone:20},
{id:'capital',name:'辺境首都',minLevel:20,milestone:null},
]);
export function settlementEraForLevel(level){const lv=Math.max(0,Math.min(SETTLEMENT_MAX_LEVEL,Math.floor(Number(level)||0)));return[...SETTLEMENT_ERAS].reverse().find(era=>lv>=era.minLevel)||SETTLEMENT_ERAS[0];}
export function settlementEffectiveLevels(level){const lv=Math.max(0,Math.min(SETTLEMENT_MAX_LEVEL,Math.floor(Number(level)||0)));return Math.min(lv,5)+Math.max(0,Math.min(lv,10)-5)*.5+Math.max(0,Math.min(lv,15)-10)*.25+Math.max(0,lv-15)*.125;}
const levels=(wood,ore,hide=0,veilstone=0)=>{const costs=Array.from({length:5},(_,i)=>({wood:Math.round(wood*Math.pow(1.8,i)),ore:Math.round(ore*Math.pow(1.8,i)),hide:Math.round(hide*Math.pow(1.8,i)),veilstone:Math.round(veilstone*Math.pow(1.9,i))}));for(let i=5;i<SETTLEMENT_MAX_LEVEL;i++){const growth=i<10?1.35:i<15?1.28:1.22,prev=costs[i-1];costs.push(Object.fromEntries(Object.entries(prev).map(([k,v])=>[k,v>0?Math.max(v+1,Math.round(v*growth)):0])));}return costs;};
export const SETTLEMENT_BUILDINGS=Object.freeze([
{id:'hall',name:'集会所',icon:'🏛️',desc:'拠点の中心。ほかの施設の最大Lvは集会所Lvを超えられない。素材発見量を強化する。',maxLevel:SETTLEMENT_MAX_LEVEL,costs:levels(20,10,0,0),effect:{materialMultPerLv:.05}},
{id:'inn',name:'宿屋',icon:'🛏️',desc:'旅人と仲間の休息所。最大HP/MPを強化する。',maxLevel:SETTLEMENT_MAX_LEVEL,costs:levels(16,8,4,0),effect:{hpMultPerLv:.03,mpMultPerLv:.03}},
{id:'market',name:'市場',icon:'🏪',desc:'戦利品と物資が集まる。獲得Goldを強化する。',maxLevel:SETTLEMENT_MAX_LEVEL,costs:levels(22,6,3,0),effect:{goldMultPerLv:.05}},
{id:'watch',name:'見張り塔',icon:'🗼',desc:'危険地帯の情報を先回りして集める。Drop率を強化する。',maxLevel:SETTLEMENT_MAX_LEVEL,costs:levels(12,18,2,0),effect:{dropMultPerLv:.04}},
{id:'ranch',name:'牧舎',icon:'🐾',desc:'仲間モンスターが暮らす場所。加入率と仲間EXPを強化し、Monster Ranchへ接続する。',maxLevel:SETTLEMENT_MAX_LEVEL,costs:levels(18,8,12,1),effect:{recruitChancePerLv:.02,companionExpMultPerLv:.05}},
]);
export function settlementBuilding(id){return SETTLEMENT_BUILDINGS.find(x=>x.id===id)||null;}
export function settlementCost(id,nextLevel){const b=settlementBuilding(id);return b&&nextLevel>=1&&nextLevel<=b.maxLevel?{...b.costs[nextLevel-1]}:null;}
export function settlementMaterialYield(stage){if(!stage)return{};const d=Math.max(1,Number(stage.abyssDepth)||Number(stage.recLevel)||1),boss=!!stage.boss;if(stage.isAbyss)return{wood:0,ore:2+Math.floor(d/150)+(boss?3:0),hide:1+(boss?1:0),veilstone:(boss?2:1)+Math.floor(d/500)};const tier=Math.max(1,Math.ceil((Number(stage.recLevel)||1)/80));return{wood:3+tier+(boss?2:0),ore:1+Math.floor(tier/2)+(boss?2:0),hide:Math.max(0,Math.floor(tier/2))+(boss?1:0),veilstone:0};}
