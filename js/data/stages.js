/* ============================================================
   ステージ／章データ定義
   第1章は既存のまま。第2〜15章は標準5ステージ構成、
   第16〜32章は8ステージ＋隠し道（中Bossあり）で展開する。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult, CHAPTER_REGION_TAGS } from './chapters.js';
import { CHAPTER_EXPANSION_16_20, CHAPTER_EXPANSION_REGION_TAGS } from './chapters16to20.js';
import { CHAPTER_EXPANSION_21_25, CHAPTER_EXPANSION_REGION_TAGS_21_25 } from './chapters21to25.js';
import { CHAPTER_EXPANSION_26_29, CHAPTER_EXPANSION_REGION_TAGS_26_29 } from './chapters26to29.js';
import { CHAPTER_EXPANSION_30, CHAPTER_EXPANSION_REGION_TAGS_30 } from './chapters30.js';
import { CHAPTER_EXPANSION_31, CHAPTER_EXPANSION_REGION_TAGS_31 } from './chapters31.js';
import { CHAPTER_EXPANSION_32, CHAPTER_EXPANSION_REGION_TAGS_32 } from './chapters32.js';
import { regionProfileForChapter } from './regionsPhase9.js';
import { buildAbyssStage } from './abyss.js';
import { buildSecretRealmStage } from './secretRealms.js';
import { buildRaidStage } from './raidBosses.js';

const CHAPTER_1 = {
  id: 'ch1', num: 1, name: '第1章 はじまりの平原', stages: [
    { id: '1-1', name: '平原の入口', recLevel: 1, waves: [{ type: 'grunt', count: 5, interval: 1.4 }], rewards: { gold: 30, exp: 20 }, firstClear: { itemId: 'wp_sword_n' }, dropTable: [{ itemId: 'ac_ring_n', weight: 1 }] },
    { id: '1-2', name: '風吹く丘', recLevel: 2, waves: [{ type: 'grunt', count: 4, interval: 1.2 }, { type: 'fast', count: 3, interval: 1.0 }], rewards: { gold: 45, exp: 32 }, firstClear: { itemId: 'sh_wood_n' }, dropTable: [{ itemId: 'hd_cap_n', weight: 1 }] },
    { id: '1-3', name: '洞窟の入り口', recLevel: 4, waves: [{ type: 'fast', count: 5, interval: 0.9 }, { type: 'tank', count: 2, interval: 2.0 }], rewards: { gold: 60, exp: 46 }, firstClear: { itemId: 'bd_cloth_n' }, dropTable: [{ itemId: 'wp_sword_r', weight: 1 }, { itemId: 'ac_amulet_r', weight: 1 }] },
    { id: '1-4', name: '魔物の巣窟', recLevel: 6, waves: [{ type: 'grunt', count: 5, interval: 1.0 }, { type: 'fast', count: 5, interval: 0.8 }, { type: 'tank', count: 3, interval: 1.8 }], rewards: { gold: 90, exp: 70 }, firstClear: { itemId: 'sh_iron_r' }, dropTable: [{ itemId: 'hd_helm_r', weight: 1 }, { itemId: 'bd_leather_r', weight: 1 }] },
    { id: '1-5', name: 'オークキングの城', recLevel: 8, boss: true, waves: [{ type: 'grunt', count: 4, interval: 1.2 }, { type: 'boss_orcking', count: 1, interval: 0 }], rewards: { gold: 200, exp: 150 }, firstClear: { itemId: 'wp_sword_e' }, dropTable: [{ itemId: 'ac_charm_e', weight: 1 }, { itemId: 'bd_plate_e', weight: 1 }, { itemId: 'rune_effect_counter', weight: 1 }] },
    { id: '1-B', name: '隠し谷（ゴブリンの頭目）', recLevel: 5, branch: true, requires: '1-3', waves: [{ type: 'grunt', count: 3, interval: 1.2 }, { type: 'branch_goblin_chief', count: 1, interval: 0 }], rewards: { gold: 70, exp: 55 }, firstClear: { itemId: 'ac_valley_e' }, dropTable: [] },
  ],
};
const STAGE_NAMES = ['入口', '奥地', '深部', '最深部'];
function scaleReward(base,mult){return{gold:Math.round(base.gold*mult),exp:Math.round(base.exp*mult)}}
function levelAt(ch,t){return Math.round(ch.recLevel[0]+(ch.recLevel[1]-ch.recLevel[0])*t)}

function buildChapter(ch) { const mult=chapterMult(ch.num),normalId=`${ch.id}_normal`,fastId=`${ch.id}_fast`,tankId=`${ch.id}_tank`,bossId=`${ch.id}_boss`; const rewardBase=[{gold:30,exp:20},{gold:45,exp:32},{gold:60,exp:46},{gold:90,exp:70}]; const stages=[
 {id:`${ch.num}-1`,name:`${ch.name}の${STAGE_NAMES[0]}`,recLevel:ch.recLevel[0],waves:[{type:normalId,count:5,interval:1.4}],rewards:scaleReward(rewardBase[0],mult),dropTable:[{itemId:`${ch.id}_accessory`,weight:1}]},
 {id:`${ch.num}-2`,name:`${ch.name}の${STAGE_NAMES[1]}`,recLevel:levelAt(ch,.25),waves:[{type:normalId,count:4,interval:1.2},{type:fastId,count:3,interval:1}],rewards:scaleReward(rewardBase[1],mult),dropTable:[{itemId:`${ch.id}_shield`,weight:1}]},
 {id:`${ch.num}-3`,name:`${ch.name}の${STAGE_NAMES[2]}`,recLevel:levelAt(ch,.5),waves:[{type:fastId,count:5,interval:.9},{type:tankId,count:2,interval:2}],rewards:scaleReward(rewardBase[2],mult),dropTable:[{itemId:`${ch.id}_weapon`,weight:1},{itemId:`${ch.id}_head`,weight:1}]},
 {id:`${ch.num}-4`,name:`${ch.name}の${STAGE_NAMES[3]}`,recLevel:levelAt(ch,.75),waves:[{type:normalId,count:5,interval:1},{type:fastId,count:5,interval:.8},{type:tankId,count:3,interval:1.8}],rewards:scaleReward(rewardBase[3],mult),dropTable:[{itemId:`${ch.id}_body`,weight:1},{itemId:`${ch.id}_accessory`,weight:1}]},
 {id:`${ch.num}-5`,name:`${ch.name}：${ch.enemies.boss}`,recLevel:ch.recLevel[1],boss:true,waves:[{type:normalId,count:4,interval:1.2},{type:bossId,count:1,interval:0}],rewards:scaleReward({gold:200,exp:150},mult),firstClear:{itemId:`${ch.id}_weapon_epic`},dropTable:[{itemId:`${ch.id}_named_${ch.items.named.slot}`,weight:1},{itemId:`rune_effect_${ch.items.named.effect}`,weight:1}].concat(ch.items.named2?[{itemId:`${ch.id}_named2_${ch.items.named2.slot}`,weight:1},{itemId:`rune_effect_${ch.items.named2.effect}`,weight:1}]:[])}]; if(ch.branch)stages.push({id:`${ch.num}-B`,name:`${ch.name}：隠し道（${ch.branch.enemyName}）`,recLevel:levelAt(ch,.5),branch:true,requires:`${ch.num}-3`,waves:[{type:normalId,count:3,interval:1.2},{type:`${ch.id}_branchboss`,count:1,interval:0}],rewards:scaleReward({gold:70,exp:55},mult),firstClear:{itemId:`${ch.id}_branch`},dropTable:[]}); return{id:ch.id,num:ch.num,name:`第${ch.num}章 ${ch.name}`,stages}; }

function buildExpandedChapter(ch){
  const mult=chapterMult(ch.num),normal=`${ch.id}_normal`,fast=`${ch.id}_fast`,tank=`${ch.id}_tank`,mid=`${ch.id}_midboss`,boss=`${ch.id}_boss`,n=ch.stageNames;
  const namedDrops=[{itemId:`${ch.id}_named_${ch.items.named.slot}`,weight:1}].concat(ch.items.named2?[{itemId:`${ch.id}_named2_${ch.items.named2.slot}`,weight:1}]:[]);
  const stages=[
    {id:`${ch.num}-1`,name:n[0],recLevel:ch.recLevel[0],waves:[{type:normal,count:6,interval:1}],rewards:scaleReward({gold:110,exp:90},mult),dropTable:[{itemId:`${ch.id}_accessory`,weight:1}]},
    {id:`${ch.num}-2`,name:n[1],recLevel:levelAt(ch,.12),waves:[{type:normal,count:4,interval:1},{type:fast,count:3,interval:.8}],rewards:scaleReward({gold:125,exp:105},mult),dropTable:[{itemId:`${ch.id}_shield`,weight:1}]},
    {id:`${ch.num}-3`,name:n[2],recLevel:levelAt(ch,.25),waves:[{type:normal,count:3,interval:1},{type:fast,count:4,interval:.8},{type:tank,count:2,interval:1.5}],rewards:scaleReward({gold:140,exp:120},mult),dropTable:[{itemId:`${ch.id}_weapon`,weight:1},{itemId:`${ch.id}_head`,weight:1}]},
    {id:`${ch.num}-4`,name:`${n[3]}：${ch.midboss.enemyName}`,recLevel:levelAt(ch,.40),midBoss:true,waves:[{type:normal,count:3,interval:1},{type:mid,count:1,interval:0}],rewards:scaleReward({gold:190,exp:165},mult),firstClear:{itemId:`${ch.id}_weapon_epic`},dropTable:[{itemId:`${ch.id}_head`,weight:1},{itemId:`${ch.id}_body`,weight:1}]},
    {id:`${ch.num}-5`,name:n[4],recLevel:levelAt(ch,.52),waves:[{type:normal,count:4,interval:1},{type:tank,count:3,interval:1.4}],rewards:scaleReward({gold:155,exp:135},mult),dropTable:[{itemId:`${ch.id}_body`,weight:1},{itemId:`${ch.id}_accessory`,weight:1}]},
    {id:`${ch.num}-6`,name:n[5],recLevel:levelAt(ch,.66),waves:[{type:fast,count:4,interval:.8},{type:normal,count:3,interval:1},{type:tank,count:2,interval:1.4}],rewards:scaleReward({gold:170,exp:150},mult),dropTable:[{itemId:`${ch.id}_weapon`,weight:1},{itemId:`${ch.id}_shield`,weight:1}]},
    {id:`${ch.num}-7`,name:n[6],recLevel:levelAt(ch,.82),waves:[{type:normal,count:4,interval:1},{type:fast,count:3,interval:.8},{type:tank,count:3,interval:1.4}],rewards:scaleReward({gold:190,exp:170},mult),dropTable:[{itemId:`${ch.id}_head`,weight:1},{itemId:`${ch.id}_body`,weight:1},{itemId:`${ch.id}_accessory`,weight:1}]},
    {id:`${ch.num}-8`,name:`${ch.name}：${ch.enemies.boss}`,recLevel:ch.recLevel[1],boss:true,waves:[{type:normal,count:3,interval:1},{type:tank,count:1,interval:1.4},{type:boss,count:1,interval:0}],rewards:scaleReward({gold:280,exp:240},mult),dropTable:namedDrops},
  ];
  if(ch.branch)stages.push({id:`${ch.num}-B`,name:`${ch.name}：？？？（${ch.branch.enemyName}）`,recLevel:levelAt(ch,.58),branch:true,requires:`${ch.num}-5`,waves:[{type:fast,count:2,interval:.8},{type:`${ch.id}_branchboss`,count:1,interval:0}],rewards:scaleReward({gold:210,exp:180},mult),firstClear:{itemId:`${ch.id}_branch`},dropTable:[],secretHint:true});
  return{id:ch.id,num:ch.num,name:`第${ch.num}章 ${ch.name}`,lore:ch.lore,expanded:true,stages};
}

export const CHAPTERS=[CHAPTER_1,...CHAPTER_SPECS.map(buildChapter),...CHAPTER_EXPANSION_16_20.map(buildExpandedChapter),...CHAPTER_EXPANSION_21_25.map(buildExpandedChapter),...CHAPTER_EXPANSION_26_29.map(buildExpandedChapter),...CHAPTER_EXPANSION_30.map(buildExpandedChapter),...CHAPTER_EXPANSION_31.map(buildExpandedChapter),...CHAPTER_EXPANSION_32.map(buildExpandedChapter)];
const ALL_REGION_TAGS={...CHAPTER_REGION_TAGS,...CHAPTER_EXPANSION_REGION_TAGS,...CHAPTER_EXPANSION_REGION_TAGS_21_25,...CHAPTER_EXPANSION_REGION_TAGS_26_29,...CHAPTER_EXPANSION_REGION_TAGS_30,...CHAPTER_EXPANSION_REGION_TAGS_31,...CHAPTER_EXPANSION_REGION_TAGS_32};
for(const ch of CHAPTERS){
  const tags=ALL_REGION_TAGS[ch.id]||[],profile=regionProfileForChapter(ch.id);
  ch.regionProfile=profile;
  for(const st of ch.stages){st.dropRegionTags=tags;if(profile){st.regionId=profile.id;st.regionTheme=profile.theme;st.fieldRule=profile.fieldRule;st.explorationEvents=profile.events;}}
}
export function finalStageOf(chapter){return chapter.stages.find(s=>s.boss)||chapter.stages[chapter.stages.length-1];}
export function findStage(stageId){
 if(stageId.startsWith('abyss-')){
  const raw=stageId.slice('abyss-'.length),[depthText,routeId]=raw.split('~');
  const depth=parseInt(depthText,10);
  if(Number.isFinite(depth)&&depth>=1)return{chapter:null,stage:buildAbyssStage(depth,[],routeId?{routeId}: {})};
  return null;
 }
 if(stageId.startsWith('secret-')){const stage=buildSecretRealmStage(stageId);return stage?{chapter:null,stage}:null;}
 if(stageId.startsWith('raid-')){const stage=buildRaidStage(stageId);return stage?{chapter:null,stage}:null;}
 for(const ch of CHAPTERS){const st=ch.stages.find(s=>s.id===stageId);if(st)return{chapter:ch,stage:st};}
 return null;
}
export function isChapterUnlocked(chapterIndex,isStageCleared){if(chapterIndex===0)return true;const prevChapter=CHAPTERS[chapterIndex-1];return isStageCleared(finalStageOf(prevChapter).id);} 
// Story Expansion must not silently move the already-live Abyss gate when new story chapters are appended.
export function isAbyssUnlocked(isStageCleared){return CHAPTERS.filter(ch=>ch.num<=25).every(ch=>isStageCleared(finalStageOf(ch).id));}
