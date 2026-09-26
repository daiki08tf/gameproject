/* Monster Ranch 1.0 — regional species expansion.
   Keep legacy companion IDs stable while expanding recruitable species across all regions. */
import { CHAPTER_SPECS } from './chapters.js';
import { CHAPTER_EXPANSION_16_20 } from './chapters16to20.js';
import { CHAPTER_EXPANSION_37_39 } from './chapters37to39.js';
import { CHAPTER_EXPANSION_40_41 } from './chapters40to41.js';
import { PHASE12_RECRUITABLE_SPECIES } from './phase12CompanionPack.js';
import { REGIONAL_ENEMY_EXPANSION } from './regionalEnemies2.js';

const LEGACY_NORMAL_IDS=Object.freeze({ch11:'ash_soldier',ch12:'thunder_beast',ch13:'crystal_bug',ch14:'rot_beast',ch15:'iron_hound'});
const LEGACY_NAMES=new Set(['ゴブリン','コウモリ','灰骸兵','雷羽獣','蒼晶蟲','腐苔獣','鉄歯機兵']);
const TRAITS=Object.freeze({normal:['野生本能','頑健','執念','群生','異界適応'],fast:['先駆け','狩猟眼','幻走','魔力感知','急襲']});
const ICONS=['🐺','🦊','👻','🧚','🦎','🦅','👹','🦋','🦂','🪲','🐗','🦇'];
function slug(ch,role){return`${ch.id}_${role}_companion`;}
function statsFor(num,role){const late=Math.max(0,num-10),scale=1+(num-1)*.11+late*.035;if(role==='fast')return{baseStats:{hp:Math.round(32*scale),mp:Math.round(12*scale),atk:Math.round(9*scale),def:Math.round(5*scale),mag:Math.round(8*scale),spd:Math.round(14*scale)},growth:{hp:4.6+num*.28,mp:1+num*.04,atk:1.5+num*.10,def:.9+num*.07,mag:1.3+num*.10,spd:1.1+num*.06}};return{baseStats:{hp:Math.round(50*scale),mp:Math.round(10*scale),atk:Math.round(12*scale),def:Math.round(8*scale),mag:Math.round(6*scale),spd:Math.round(9*scale)},growth:{hp:5.8+num*.34,mp:.9+num*.04,atk:1.9+num*.12,def:1.4+num*.09,mag:1+num*.08,spd:.8+num*.05}};}
function chanceFor(num,role){const base=role==='fast'?.095:.08;return Math.max(.022,Math.round((base-num*.0026)*1000)/1000);}
function makeSpecies(ch,role,index){const name=ch.enemies[role];if(LEGACY_NAMES.has(name))return null;const id=role==='normal'&&LEGACY_NORMAL_IDS[ch.id]?LEGACY_NORMAL_IDS[ch.id]:slug(ch,role),st=statsFor(ch.num,role),trait=TRAITS[role][(ch.num+index)%TRAITS[role].length];return[id,{id,name,type:'monster',family:role==='fast'?'spirit':'beast',regionId:ch.id,regionName:ch.name,enemyType:`${ch.id}_${role}`,icon:ICONS[(ch.num*2+index)%ICONS.length],...st,recruit:{baseChance:chanceFor(ch.num,role)},traits:[trait],skills:role==='fast'?[{level:1,id:'bite'},{level:12,id:'sonic'}]:[{level:1,id:'body_attack'},{level:14,id:'club_hit'}]}];}
const ALL=[...CHAPTER_SPECS,...CHAPTER_EXPANSION_16_20,...CHAPTER_EXPANSION_37_39,...CHAPTER_EXPANSION_40_41];

// ---- Rare / named-species recruitment (Session 4) --------------------------
// 地域Rare（chN_rare）は Rare として戦った個体そのものが仲間になる。
// 出会うこと自体が難しいので勧誘率は通常種より高め。
const RARE_TRAITS=Object.freeze(['異彩の血筋','威風堂々','金色の毛皮']);
function rareSpeciesFor(ch,index){const set=REGIONAL_ENEMY_EXPANSION[ch.id];const name=set?.rare?.name;if(!name||LEGACY_NAMES.has(name))return null;const st=statsFor(ch.num,'normal'),lift=k=>Math.round(st.baseStats[k]*1.55),liftG=k=>Math.round(st.growth[k]*10*1.45)/10;return[`${ch.id}_rare`,{id:`${ch.id}_rare`,name,type:'monster',family:'beast',regionId:ch.id,regionName:ch.name,enemyType:`${ch.id}_rare`,icon:'◆',baseStats:{hp:lift('hp'),mp:lift('mp'),atk:lift('atk'),def:lift('def'),mag:lift('mag'),spd:lift('spd')},growth:{hp:liftG('hp'),mp:liftG('mp'),atk:liftG('atk'),def:liftG('def'),mag:liftG('mag'),spd:liftG('spd')},recruit:{baseChance:.15},traits:[RARE_TRAITS[(ch.num+index)%RARE_TRAITS.length]],skills:[{level:1,id:'body_attack'},{level:14,id:'dirty_trick'}]}];}
const RARE_SPECIES=Object.freeze(Object.fromEntries(ALL.map((ch,i)=>rareSpeciesFor(ch,i)).filter(Boolean)));

// Roamer（名もなき強敵）：徘徊者そのものが仲間になる。enemyTypeは
// BattleEngineの_spawnRoamerが付ける `roamer:<id>` と一致させる。
// 素体は各RoamerのstatMultの性格をそのまま仲間用の能力値へ写す。
const ROAMER_SPECIES=Object.freeze({
  roamer_gilt_maw:{id:'roamer_gilt_maw',name:'宝喰みの大口・GILT MAW',type:'monster',family:'beast',bondSkillId:'roamer_feast',regionId:'wanderer',regionName:'名もなき強敵',enemyType:'roamer:gilt_maw',icon:'◆',baseStats:{hp:132,mp:8,atk:13,def:20,mag:4,spd:6},growth:{hp:12,mp:.8,atk:1.8,def:3.2,mag:.6,spd:.5},recruit:{baseChance:.12},traits:['宝喰み'],skills:[{level:1,id:'body_attack'},{level:18,id:'club_hit'},{level:30,id:'dirty_trick'}]},
  roamer_glass_step:{id:'roamer_glass_step',name:'鏡歩き・GLASS STEP',type:'monster',family:'spirit',bondSkillId:'roamer_mirror',regionId:'wanderer',regionName:'名もなき強敵',enemyType:'roamer:glass_step',icon:'◆',baseStats:{hp:58,mp:16,atk:15,def:7,mag:9,spd:25},growth:{hp:5.5,mp:1.4,atk:2.2,def:.9,mag:1.4,spd:2.6},recruit:{baseChance:.12},traits:['鏡歩'],skills:[{level:1,id:'bite'},{level:16,id:'sonic'},{level:28,id:'thunder_claw'}]},
  roamer_pale_jailer:{id:'roamer_pale_jailer',name:'白き獄卒・PALE JAILER',type:'monster',family:'undead',bondSkillId:'roamer_ward',regionId:'wanderer',regionName:'名もなき強敵',enemyType:'roamer:pale_jailer',icon:'◆',baseStats:{hp:98,mp:12,atk:11,def:27,mag:8,spd:8},growth:{hp:10,mp:1.1,atk:1.6,def:3.8,mag:1.2,spd:.6},recruit:{baseChance:.12},traits:['白獄'],skills:[{level:1,id:'iron_fang'},{level:20,id:'club_hit'},{level:32,id:'sonic'}]},
  roamer_rust_errant:{id:'roamer_rust_errant',name:'錆びた遍歴騎士・RUST ERRANT',type:'monster',family:'undead',bondSkillId:'roamer_duel',regionId:'wanderer',regionName:'名もなき強敵',enemyType:'roamer:rust_errant',icon:'◆',baseStats:{hp:92,mp:10,atk:19,def:13,mag:5,spd:11},growth:{hp:9.5,mp:.9,atk:2.9,def:1.9,mag:.8,spd:.9},recruit:{baseChance:.12},traits:['遍歴の剣'],skills:[{level:1,id:'club_hit'},{level:18,id:'dirty_trick'},{level:30,id:'iron_fang'}]},
  roamer_null_chant:{id:'roamer_null_chant',name:'名を持たぬ詠唱者・NULL CHANT',type:'monster',family:'spirit',bondSkillId:'roamer_hymn',regionId:'wanderer',regionName:'名もなき強敵',enemyType:'roamer:null_chant',icon:'◆',baseStats:{hp:64,mp:32,atk:9,def:9,mag:21,spd:12},growth:{hp:6.5,mp:2.6,atk:1.2,def:1.1,mag:3.4,spd:1.1},recruit:{baseChance:.12},traits:['無名の唱'],skills:[{level:1,id:'crystal_ray'},{level:18,id:'sonic'},{level:30,id:'slime_heal'}]},
});

// 獣径の主（外伝 獣径の番獣）：倒して勧誘できる名付き強敵。
const DENLORD_SPECIES=Object.freeze({
  bt_denlord:{id:'bt_denlord',name:'獣径の主・DENLORD',type:'monster',family:'beast',bondSkillId:'denlord_call',regionId:'gaiden_beasttrail',regionName:'獣径',enemyType:'bt_denlord',icon:'◆',baseStats:{hp:150,mp:14,atk:20,def:16,mag:6,spd:10},growth:{hp:13,mp:1,atk:3,def:2.4,mag:1,spd:.8},recruit:{baseChance:.18},traits:['獣径の主'],skills:[{level:1,id:'iron_fang'},{level:16,id:'dirty_trick'},{level:26,id:'sonic'},{level:34,id:'club_hit'}]},
  tp_denlord:{id:'tp_denlord',name:'潮径の主・TIDELORD',type:'monster',family:'aquatic',bondSkillId:'tidelord_surge',regionId:'gaiden_tidepath',regionName:'潮径',enemyType:'tp_denlord',icon:'◆',baseStats:{hp:210,mp:20,atk:24,def:30,mag:14,spd:9},growth:{hp:15,mp:1.4,atk:2.6,def:3.4,mag:1.8,spd:.7},recruit:{baseChance:.18},traits:['潮径の主'],skills:[{level:1,id:'body_attack'},{level:18,id:'slime_heal'},{level:30,id:'sonic'}]},
  af_denlord:{id:'af_denlord',name:'灰径の主・ASHLORD',type:'monster',family:'undead',bondSkillId:'ashlord_choir',regionId:'gaiden_ashfield',regionName:'灰径',enemyType:'af_denlord',icon:'◆',baseStats:{hp:260,mp:26,atk:46,def:26,mag:30,spd:14},growth:{hp:16,mp:1.6,atk:4.6,def:2.6,mag:3,spd:1},recruit:{baseChance:.18},traits:['灰径の主'],skills:[{level:1,id:'ash_slash'},{level:18,id:'rot_bite'},{level:30,id:'dirty_trick'}]},
});

/* 外伝「潮径」「灰径」の固有魔物 — Session 5。
   倒した巣の住人そのものが仲間になる。statsFor()で巣の章帯と揃える。 */
const GAIDEN2_SPECIES=Object.freeze((()=>{const t=(id,name,role,num,family,traits,skills,extra={})=>{const st=statsFor(num,role);return{id,name,type:'monster',family,regionId:extra.gaiden,regionName:extra.gname,enemyType:extra.enemyType||id,icon:'◆',baseStats:extra.baseStats||st.baseStats,growth:extra.growth||st.growth,recruit:{baseChance:extra.chance??.06},traits,skills};};
  const tank={hp:Math.round(statsFor(6,'normal').baseStats.hp*1.5),mp:statsFor(6,'normal').baseStats.mp,atk:Math.round(statsFor(6,'normal').baseStats.atk*.9),def:Math.round(statsFor(6,'normal').baseStats.def*2.1),mag:statsFor(6,'normal').baseStats.mag,spd:Math.round(statsFor(6,'normal').baseStats.spd*.7)};
  const g=(s,n,r,num,f,tr,sk,ex)=>[s,t(s,n,r,num,f,tr,sk,ex)];
  return Object.fromEntries([
    g('tp_shambler','淀みの這い寄り','normal',6,'aquatic',['群生'],[{level:1,id:'body_attack'},{level:14,id:'club_hit'}],{gaiden:'gaiden_tidepath',gname:'潮径'}),
    g('tp_skimmer','飛沫駆け','fast',6,'aquatic',['幻走'],[{level:1,id:'bite'},{level:14,id:'sonic'}],{gaiden:'gaiden_tidepath',gname:'潮径'}),
    g('tp_bulwark','甲殻の壁獣','normal',6,'aquatic',['鉄壁'],[{level:1,id:'iron_fang'},{level:16,id:'club_hit'}],{gaiden:'gaiden_tidepath',gname:'潮径',baseStats:tank,chance:.045}),
    g('tp_rare','真珠殻の古亀','normal',6,'aquatic',['威風堂々'],[{level:1,id:'iron_fang'},{level:14,id:'slime_heal'}],{gaiden:'gaiden_tidepath',gname:'潮径',baseStats:{hp:Math.round(tank.hp*1.4),mp:tank.mp,atk:Math.round(tank.atk*1.2),def:Math.round(tank.def*1.3),mag:tank.mag,spd:tank.spd},chance:.15}),
    g('af_revenant','灰の亡兵','normal',11,'undead',['執念'],[{level:1,id:'ash_slash'},{level:18,id:'dirty_trick'}],{gaiden:'gaiden_ashfield',gname:'灰径'}),
    g('af_moth','煤羽の妖蛾','fast',11,'spirit',['幻走'],[{level:1,id:'bite'},{level:16,id:'sonic'}],{gaiden:'gaiden_ashfield',gname:'灰径'}),
    g('af_rare','王墓の大蜘蛛','normal',11,'undead',['狩人'],[{level:1,id:'rot_bite'},{level:20,id:'dirty_trick'}],{gaiden:'gaiden_ashfield',gname:'灰径',baseStats:(()=>{const s=statsFor(11,'normal').baseStats;return{hp:Math.round(s.hp*1.55),mp:s.mp,atk:Math.round(s.atk*1.55),def:Math.round(s.def*1.4),mag:s.mag,spd:s.spd}})(),chance:.15}),
  ]);
})());
export const ROAMER_COMPANION_IDS=Object.freeze(Object.keys(ROAMER_SPECIES));

const MACHINE_SPECIES={machine_iris:{id:'machine_iris',name:'索敵機・アイリス',type:'monster',family:'construct',regionId:'machine_world',regionName:'機界・第一都市圏',enemyType:'machine_scout',icon:'🤖',baseStats:{hp:190,mp:42,atk:38,def:31,mag:34,spd:42},growth:{hp:13.5,mp:2.2,atk:4.2,def:3.4,mag:3.8,spd:2.4},recruit:{baseChance:.024},traits:['自己学習'],skills:[{level:1,id:'iron_fang'},{level:32,id:'sonic'}]}};
export const RANCH_REGION_SPECIES=Object.freeze({...Object.fromEntries(ALL.flatMap((ch,i)=>['normal','fast'].map(role=>makeSpecies(ch,role,i)).filter(Boolean))),...RARE_SPECIES,...ROAMER_SPECIES,...DENLORD_SPECIES,...GAIDEN2_SPECIES,...MACHINE_SPECIES,...PHASE12_RECRUITABLE_SPECIES});
export const RANCH_RECRUIT_BY_ENEMY_TYPE=Object.freeze(Object.fromEntries(Object.values(RANCH_REGION_SPECIES).map(s=>[s.enemyType,s.id])));
export const RANCH_SPECIES_TRAIT_EFFECTS=Object.freeze({
'野生本能':{kind:'lowHpDamage',power:.12,threshold:.50,desc:'HP50%以下の敵へのダメージ +12%'},'頑健':{kind:'physicalMitigation',power:.08,desc:'通常攻撃の被ダメージ -8%'},'執念':{kind:'lowHpDamage',power:.16,threshold:.35,desc:'HP35%以下の敵へのダメージ +16%'},'群生':{kind:'physicalMitigation',power:.06,desc:'通常攻撃の被ダメージ -6%'},'異界適応':{kind:'physicalMitigation',power:.10,desc:'通常攻撃の被ダメージ -10%'},'先駆け':{kind:'initiativeSpd',power:.12,desc:'行動順判定時のSPD +12%'},'狩猟眼':{kind:'lowHpDamage',power:.14,threshold:.50,desc:'HP50%以下の敵へのダメージ +14%'},'幻走':{kind:'initiativeSpd',power:.18,desc:'行動順判定時のSPD +18%'},'魔力感知':{kind:'initiativeSpd',power:.10,desc:'行動順判定時のSPD +10%'},'急襲':{kind:'initiativeSpd',power:.16,desc:'行動順判定時のSPD +16%'},'自己学習':{kind:'initiativeSpd',power:.24,desc:'行動順判定時のSPD +24%'},
// 地域Rare種の特性
'異彩の血筋':{kind:'initiativeSpd',power:.16,desc:'行動順判定時のSPD +16%'},'威風堂々':{kind:'lowHpDamage',power:.18,threshold:.50,desc:'HP50%以下の敵へのダメージ +18%'},'金色の毛皮':{kind:'physicalMitigation',power:.14,desc:'通常攻撃の被ダメージ -14%'},
// Roamer / 獣径の主 固有特性
'宝喰み':{kind:'physicalMitigation',power:.14,desc:'通常攻撃の被ダメージ -14%'},'鏡歩':{kind:'initiativeSpd',power:.22,desc:'行動順判定時のSPD +22%'},'白獄':{kind:'physicalMitigation',power:.22,desc:'通常攻撃の被ダメージ -22%'},'遍歴の剣':{kind:'lowHpDamage',power:.18,threshold:.50,desc:'HP50%以下の敵へのダメージ +18%'},'無名の唱':{kind:'lifesteal',power:.10,desc:'与えたダメージの10%を吸収'},'獣径の主':{kind:'lowHpDamage',power:.22,threshold:.50,desc:'HP50%以下の敵へのダメージ +22%'},
'潮径の主':{kind:'regen',power:.05,desc:'毎行動、最大HPの5%を回復'},'灰径の主':{kind:'lowHpDamage',power:.24,threshold:.55,desc:'HP55%以下の敵へのダメージ +24%'},'再臨':{kind:'lowHpDamage',power:.30,threshold:.70,desc:'再臨の威——HP70%以下の敵へのダメージ +30%'},
// 倒した個体が引き継ぐ特性（Elite Affix / Rare Behavior / 環境変異）
'再生':{kind:'regen',power:.04,desc:'毎行動、最大HPの4%を回復'},'狂乱':{kind:'lowHpDamage',power:.25,threshold:.50,desc:'HP50%以下の敵へのダメージ +25%'},'鉄壁':{kind:'physicalMitigation',power:.20,desc:'通常攻撃の被ダメージ -20%'},'迅速':{kind:'initiativeSpd',power:.25,desc:'行動順判定時のSPD +25%'},
'狩人':{kind:'lowHpDamage',power:.20,threshold:.50,desc:'HP50%以下の敵へのダメージ +20%'},'吸命':{kind:'lifesteal',power:.15,desc:'与えたダメージの15%を吸収'},'窮地':{kind:'physicalMitigation',power:.12,desc:'通常攻撃の被ダメージ -12%'},'急襲':{kind:'initiativeSpd',power:.18,desc:'行動順判定時のSPD +18%'}});
export function ranchSpeciesCount(){return Object.keys(RANCH_REGION_SPECIES).length+8;}
