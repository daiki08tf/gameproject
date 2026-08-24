/* ============================================================
   深淵（Abyss）ステージ生成 — Abyss 2.0
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { ENEMY_TYPES } from './enemies.js';
import { ABYSS_LAYER } from './balance.js';
import { setDropsForDepth } from './equipment3Sets.js';
import { abyssRecommendedLevel, abyssTargetItemPower, abyssEraForDepth, abyssCombatScale, abyssStageExpBudget } from './abyssEndgame.js';
import { abyssPact, abyssPactMultiplier, abyssPactDanger, maxAbyssPactsForDepth } from './abyssPacts.js';

const CH15=CHAPTER_SPECS.find(c=>c.num===15);
export const ABYSS_MODIFIERS=[
{id:'mod_frenzy',name:'狂乱の霧',desc:'敵SPD+25% ／ 獲得ゴールド+40%',enemySpeedMult:1.25,goldMult:1.4},
{id:'mod_fortress',name:'鉄壁の守り',desc:'敵の防御力+30% ／ ドロップ率+50%',enemyDefMult:1.3,dropMult:1.5},
{id:'mod_swarm',name:'群れの巣窟',desc:'出現数+30% ／ 獲得経験値+30%',enemyCountMult:1.3,expMult:1.3},
{id:'mod_glass',name:'脆き猛威',desc:'敵HP-20% ／ 敵攻撃力+35%',enemyHpMult:.8,enemyAtkMult:1.35},
{id:'mod_venom',name:'瘴気だまり',desc:'回復量-30% ／ 獲得経験値+25%',healMult:.7,expMult:1.25},
{id:'mod_blessed',name:'静穏の加護',desc:'回復量+50% ／ 獲得ゴールド-15%',healMult:1.5,goldMult:.85},];
function modifiersForDepth(depth){const count=isAbyssBossFloor(depth)?2:1,pool=[...ABYSS_MODIFIERS],picks=[];let seed=(depth*2654435761)%2147483647;for(let i=0;i<count&&pool.length;i++){seed=(seed*48271)%2147483647;const idx=seed%pool.length;picks.push(pool.splice(idx,1)[0]);}return picks;}
const N={normal:'深淵の徘徊者',fast:'深淵の疾影',tank:'深淵の巨影',boss:'深淵の支配者'};
function anchor(kind){const key=kind==='boss'?'ch15_boss':`ch15_${kind}`;return ENEMY_TYPES[key]||ENEMY_TYPES[kind]||{hp:1,atk:1,def:0,speed:80,xp:1,gold:1};}
function scaled(kind,depth,goldMult,expMult,hpMult,atkMult,defMult,speedMult){const a=anchor(kind),s=abyssCombatScale(depth),boss=kind==='boss',rr=Math.max(1,s.level/700);return {...a,name:N[kind],boss,hp:Math.max(1,Math.round(a.hp*s.hp*hpMult)),atk:Math.max(1,Math.round(a.atk*s.atk*atkMult)),def:Math.max(0,Math.round(a.def*s.def*defMult)),speed:Math.max(1,Math.round((a.speed||80)*speedMult)),xp:Math.max(1,Math.round(a.xp*Math.pow(rr,.78)*expMult)),gold:Math.max(1,Math.round(a.gold*Math.pow(rr,.62)*goldMult))};}
export function isAbyssBossFloor(depth){return depth%ABYSS_LAYER.BOSS_FLOOR_INTERVAL===0;}
function drops(depth,boss){const dt=[{itemId:`${CH15.id}_named_${CH15.items.named.slot}`,weight:1}];if(CH15.items.named2)dt.push({itemId:`${CH15.id}_named2_${CH15.items.named2.slot}`,weight:1});dt.push(...setDropsForDepth(depth,boss));return dt;}
export function buildAbyssStage(rawDepth,pactIds=[]){
 const depth=Math.max(1,Math.floor(Number(rawDepth)||1)),mods=modifiersForDepth(depth),valid=[...new Set(pactIds)].slice(0,maxAbyssPactsForDepth(depth)).filter(id=>abyssPact(id));
 const mm=k=>mods.reduce((m,x)=>m*(x[k]||1),1),pm=k=>abyssPactMultiplier(valid,k);
 const goldMult=mm('goldMult')*pm('goldMult'),expMult=mm('expMult')*pm('expMult'),countMult=mm('enemyCountMult'),dropMult=mm('dropMult')*pm('dropMult'),healMult=mm('healMult')*pm('healMult');
 const atkMult=mm('enemyAtkMult')*pm('enemyAtkMult'),defMult=mm('enemyDefMult')*pm('enemyDefMult'),speedMult=mm('enemySpeedMult')*pm('enemySpeedMult'),hpMult=mm('enemyHpMult')*pm('enemyHpMult');
 const ids={normal:`abyss_${depth}_normal`,fast:`abyss_${depth}_fast`,tank:`abyss_${depth}_tank`,boss:`abyss_${depth}_boss`};for(const k of Object.keys(ids))ENEMY_TYPES[ids[k]]=scaled(k,depth,goldMult,expMult,hpMult,atkMult,defMult,speedMult);
 const boss=isAbyssBossFloor(depth),waves=boss?[{type:ids.normal,count:3,interval:1},{type:ids.boss,count:1,interval:0}]:[{type:ids.normal,count:Math.round((3+Math.min(12,Math.floor(depth/40)))*countMult),interval:1.1},{type:ids.fast,count:Math.round((2+Math.min(9,Math.floor(depth/55)))*countMult),interval:.9},{type:ids.tank,count:Math.round((1+Math.min(7,Math.floor(depth/70)))*countMult),interval:1.8}];
 const level=abyssRecommendedLevel(depth),ip=abyssTargetItemPower(depth),exp=abyssStageExpBudget(depth)*expMult*(boss?1.35:1),gold=200*chapterMult(15)*Math.pow(Math.max(1,level/700),.72)*goldMult*(boss?ABYSS_LAYER.BOSS_REWARD_MULT:1);
 return {id:`abyss-${depth}`,name:`深淵 ${depth}階${boss?'（ボスフロア）':''}`,recLevel:level,boss,isAbyss:true,abyssDepth:depth,abyssEra:abyssEraForDepth(depth),itemPowerTarget:ip,waves,rewards:{gold:Math.max(1,Math.round(gold)),exp:Math.max(1,Math.round(exp))},dropTable:drops(depth,boss),modifiers:mods.map(m=>({id:m.id,name:m.name,desc:m.desc})),abyssPacts:valid.map(id=>abyssPact(id)),abyssPactDanger:abyssPactDanger(valid),abyssShardMult:pm('shardMult'),dropMult,healMult,enemyAtkMult:atkMult,enemyDefMult:defMult,enemySpeedMult:speedMult,enemyHpMult:hpMult,dropRegionTags:['fire','ice','lightning','wind','light','dark','poison']};
}
