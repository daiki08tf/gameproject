import { abyssRecommendedLevel, abyssTargetItemPower } from './abyssEndgame.js';
const ELEMENTS=[['fire','灼熱'],['ice','氷獄'],['lightning','雷鳴'],['wind','嵐'],['light','聖光'],['dark','冥闇'],['poison','瘴毒']];
const DANGERS=[
 {id:'brutal',name:'凶暴',enemyAtkMult:1.35,score:2},{id:'giant',name:'巨躯',enemyHpMult:1.45,score:2},{id:'iron',name:'鉄壁',enemyDefMult:1.40,score:2},
 {id:'haste',name:'加速',enemySpeedMult:1.30,score:2},{id:'scarcity',name:'枯渇',healMult:.55,score:3},{id:'cataclysm',name:'終末',enemyHpMult:1.25,enemyAtkMult:1.25,score:4}
];
const REWARDS=[
 {id:'greater',name:'大いなる',greaterBonus:.35},{id:'legend',name:'伝説の',legendaryBonus:.20},{id:'power',name:'高位の',itemPowerBonus:.12},
 {id:'treasure',name:'黄金の',dropMult:1.50},{id:'ancient',name:'古代の',ancientBonus:.08}
];
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let x=seed||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function safeDepth(depth){const n=Number(depth);return Number.isFinite(n)?Math.max(1,Math.floor(n)):1;}
export function generateRiftKey(depth,seed=Date.now()){
 depth=safeDepth(depth);const r=rng(hash(`${depth}:${seed}`)),pick=a=>a[Math.floor(r()*a.length)],element=pick(ELEMENTS),reward=pick(REWARDS);const dangerCount=depth>=1800?3:depth>=700?2:1,pool=[...DANGERS],dangers=[];for(let i=0;i<dangerCount;i++){const j=Math.floor(r()*pool.length);dangers.push(pool.splice(j,1)[0]);}
 const danger=dangers.reduce((n,x)=>n+x.score,0),sourceLevel=abyssRecommendedLevel(depth),sourceIp=abyssTargetItemPower(depth);
 // Rift is intentionally harder than the floor that dropped it, but the previous
 // independent linear formula made mid-game keys much harder while awarding far
 // lower IP. Tie both axes to the same Abyss roadmap: every Danger point adds 2.5%
 // recommended level and 1.2% baseline IP. The explicit "power" reward gets its
 // advertised extra 12% on top, making even dangerous keys economically sensible.
 const recLevel=Math.min(99999,Math.max(700,Math.round(sourceLevel*(1+danger*.025))));
 const rewardIpMult=reward.id==='power'?1+(reward.itemPowerBonus||0):1;
 const ip=Math.min(10000,Math.max(1000,Math.round(sourceIp*(1+danger*.012)*rewardIpMult)));
 return{id:`rift_${seed}_${depth}`,seed,sourceDepth:depth,name:`《${element[1]}・${reward.name}虚無鍵》`,element:element[0],recLevel,itemPowerTarget:ip,dangers:dangers.map(x=>x.id),reward:reward.id,dangerScore:danger,createdAt:Date.now()};
}
export function riftDanger(id){return DANGERS.find(x=>x.id===id)||null;} export function riftReward(id){return REWARDS.find(x=>x.id===id)||null;}
export function riftKeySummary(k){if(!k)return '無効な虚無鍵';return `${k.name||'《名称不明の虚無鍵》'} 推奨Lv${Number(k.recLevel||0).toLocaleString()} / IP${Number(k.itemPowerTarget||0)} / Danger ${Number(k.dangerScore||0)}`;}
