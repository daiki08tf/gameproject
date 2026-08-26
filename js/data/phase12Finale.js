/* Phase 12.11-12.14 — horizontal mastery, Codex grouping and apex finale. */
import { abyssRecommendedLevel, abyssTargetItemPower } from './abyssEndgame.js';
import { PHASE12_HORIZONTAL_PACK } from './phase12HorizontalPack.js';

export const PHASE12_REGION_DEPTH=Object.freeze([
  {chapter:21,region:'灰燼の外縁',siteId:'old_king_tomb',stageId:'secret-old-king-tomb',label:'古王墓を踏破'},
  {chapter:22,region:'玻璃凍原',siteId:'phantom_beast_forest',stageId:'secret-phantom-beast-forest',label:'幻獣の森を踏破'},
  {chapter:23,region:'天雷墓標群',siteId:'dragonbone_canyon',stageId:'secret-dragonbone-canyon',label:'竜骸峡谷を踏破'},
  {chapter:24,region:'虚花の庭園',siteId:'inverted_library',stageId:'secret-inverted-library',label:'反転図書館を踏破'},
  {chapter:25,region:'境界王座',siteId:'black_moon_temple',stageId:'secret-black-moon-temple',label:'黒月神殿を踏破'},
]);

const horizontalBossIds=Object.values(PHASE12_HORIZONTAL_PACK).flatMap(cfg=>Object.entries(cfg.enemyArchetypes).filter(([,d])=>d.boss).map(([id])=>id));
export const PHASE12_CODEX_GROUPS=Object.freeze([
  {id:'horizontal_common',name:'横断異界種',enemyIds:Object.values(PHASE12_HORIZONTAL_PACK).flatMap(cfg=>Object.keys(cfg.enemyArchetypes).filter(id=>cfg.enemyArchetypes[id].role!=='rare'&&!cfg.enemyArchetypes[id].boss))},
  {id:'horizontal_rare',name:'希少観測種',enemyIds:Object.values(PHASE12_HORIZONTAL_PACK).map(cfg=>cfg.rareSpawn.enemyId)},
  {id:'horizontal_boss',name:'異界主',enemyIds:horizontalBossIds},
  {id:'horizontal_apex',name:'収束観測種',enemyIds:['phase12_apex_guard','phase12_apex_wisp','phase12_apex_boss']},
]);

export const PHASE12_APEX={
  site:{
    id:'convergence_observatory',hiddenName:'？？？？？？',discoveredName:'五つの座標が重なる観測孔',realmName:'収束観測界',
    discoverDepth:2997,clueDepth:2998,fragmentSources:[2998,2999,3000],fragmentsRequired:3,
    inspectText:['五つの異界で得た座標が、一点だけ同じ空白を指している。','空白は新しい世界ではなく、複数の異界を同時に観測する中継層らしい。','五つの異界主を越えた記録が揃えば、観測孔を逆向きに辿れる。'],
    unlockedText:'五つの異界記録が重なり、観測する側へ向かう逆流路が開いた。',
    realm:{id:'secret-convergence-observatory',recLevel:abyssRecommendedLevel(3000),itemPowerTarget:abyssTargetItemPower(3000),rule:'五異界複合 / 4段階Boss / 短Break窓',rewardHint:'Phase 12横断制覇のApex戦。既存最高IP帯の装備を狙える。'},
  },
  baseDepth:3000,dropMult:1.78,goldMult:1.55,expMult:1.52,setPrefix:'set_abyss_',tags:['apex','analysis','break','dark','light'],
  trace:'五つの異界は孤立した例外ではなく、同じ観測網から枝分かれした試験区画だった可能性がある。',
  modifier:{id:'realm_convergence',name:'五界収束',desc:'五異界の戦闘特性が収束 ／ 短Break窓 ／ 最高IP帯'},
  enemyArchetypes:{
    phase12_apex_guard:{source:'tank',name:'収束守衛',hpMult:1.16,defMult:1.20,role:'guardian'},
    phase12_apex_wisp:{source:'fast',name:'観測残光',atkMult:1.18,speedMult:1.22,role:'controller'},
    phase12_apex_boss:{source:'boss',name:'五界観測体・PENTARCH',hpMult:1.36,atkMult:1.30,defMult:1.16,speedMult:1.12,boss:true,role:'boss'},
  },
  waves:[{type:'phase12_apex_guard',count:2,interval:.90},{type:'phase12_apex_wisp',count:3,interval:.55},{type:'phase12_apex_boss',count:1,interval:0}],
  phase12Apex:true,
};

export const PHASE12_APEX_BOSS_PROFILE=Object.freeze({
  id:'five-realm-observer-pentarch',dangerTags:['guard','analysis','break','phase'],counterHint:'収束守衛を落とし、観測位相が切り替わるたびに短く開くBreak窓を逃さない。',
  startEscorts:[{type:'phase12_apex_guard',count:2,guard:true},{type:'phase12_apex_wisp',count:1}],guardDefMult:2.12,
  phases:[
    {ratio:.82,name:'第一観測・王墓',defMult:1.18,spawn:[{type:'phase12_apex_guard',count:1,guard:true}]},
    {ratio:.58,name:'第二観測・幻獣',spdMult:1.18,breakGaugePct:.58,spawn:[{type:'phase12_apex_wisp',count:1}]},
    {ratio:.33,name:'第三観測・反転',atkMult:1.28,breakGaugePct:.36,accelerateBossAI:.58},
    {ratio:.10,name:'五界同時観測',atkMult:1.42,spdMult:1.20,breakGaugePct:.18,accelerateBossAI:.40},
  ],
});

export function phase12MasterySnapshot(isCleared,discoveries={}){
  const regions=PHASE12_REGION_DEPTH.map(x=>({...x,cleared:Boolean(isCleared(x.stageId)),traceSeen:Boolean(discoveries[`trace:${x.siteId}`])}));
  const cleared=regions.filter(x=>x.cleared).length,traces=regions.filter(x=>x.traceSeen).length;
  return {regions,cleared,total:regions.length,traces,complete:cleared===regions.length,apexReady:cleared===regions.length};
}

export function phase12CodexGroupForEnemy(enemyId){return PHASE12_CODEX_GROUPS.find(g=>g.enemyIds.includes(enemyId))||null;}