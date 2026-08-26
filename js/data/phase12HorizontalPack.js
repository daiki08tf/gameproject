/* ============================================================
   Phase 12.3-12.6 — Horizontal Expansion Pack I
   Five optional dungeons, authored ecologies, rare spawns and hidden chase
   drops. Reuses Secret Realm / Abyss / Equipment pipelines.
   ============================================================ */
import { abyssRecommendedLevel, abyssTargetItemPower } from './abyssEndgame.js';

function site({id,discoveredName,realmName,discoverDepth,clueDepth,fragmentSources,realmId,baseDepth,rule,rewardHint,inspectText,unlockedText}){
  return {id,hiddenName:'？？？？',discoveredName,realmName,discoverDepth,clueDepth,fragmentSources,fragmentsRequired:3,inspectText,unlockedText,realm:{id:realmId,recLevel:abyssRecommendedLevel(baseDepth),itemPowerTarget:abyssTargetItemPower(baseDepth),rule,rewardHint}};
}

export const PHASE12_HORIZONTAL_PACK=Object.freeze({
  old_king_tomb:{
    site:site({id:'old_king_tomb',discoveredName:'王印の消えた地下墓門',realmName:'古王墓',discoverDepth:450,clueDepth:560,fragmentSources:[640,760,900],realmId:'secret-old-king-tomb',baseDepth:980,rule:'不死近衛 / Guard反撃 / 王骸Bossの構えをBreakで崩す',rewardHint:'防御・反撃・Boss戦向け装備と隠し王冠を狙える。',inspectText:['墓門の王印だけが、削られたのではなく最初から存在しなかったように空白だ。','棺の配置は埋葬ではなく、中央の何かを囲む封印陣になっている。','三枚の墓誌を揃えれば、名を失った王の玄室へ降りられる。'],unlockedText:'墓誌の文字が逆向きに読み上がり、王の名を持たない玄室が開いた。'}),
    baseDepth:980,dropMult:1.32,goldMult:1.24,expMult:1.18,setPrefix:'set_dragon_',tags:['guard','counter','dark','king'],trace:'王の墓誌には「王国」ではなく「観測区画を統べた者」と記されている。',modifier:{id:'realm_old_king_oath',name:'無名王の誓約',desc:'Guard反撃圧力 ／ 高耐久近衛 ／ 古竜装備率UP'},
    enemyArchetypes:{phase12_tomb_guard:{source:'tank',name:'墓守近衛',hpMult:1.10,defMult:1.16,role:'guardian'},phase12_tomb_magus:{source:'normal',name:'葬送司祭',atkMult:1.10,role:'support'},phase12_tomb_king:{source:'boss',name:'無名古王・レグナス',hpMult:1.22,atkMult:1.13,defMult:1.14,boss:true,role:'boss'},phase12_tomb_rare:{source:'fast',name:'金棺の亡霊',hpMult:1.18,atkMult:1.20,speedMult:1.08,role:'rare'}},
    waves:[{type:'phase12_tomb_guard',count:3,interval:1.05},{type:'phase12_tomb_magus',count:2,interval:.92},{type:'phase12_tomb_king',count:1,interval:0}],rareSpawn:{enemyId:'phase12_tomb_rare',chance:.06,dropId:'uq_nameless_crown',label:'金棺の亡霊'},
  },
  phantom_beast_forest:{
    site:site({id:'phantom_beast_forest',discoveredName:'獣道の消える霧森',realmName:'幻獣の森',discoverDepth:820,clueDepth:960,fragmentSources:[1080,1220,1380],realmId:'secret-phantom-beast-forest',baseDepth:1480,rule:'高速獣群 / 属性混成 / 幻獣Bossの分身を優先処理',rewardHint:'速度・属性・仲間ビルド向け装備と幻獣心核を狙える。',inspectText:['同じ足跡が途中から三方向へ分かれ、どれも同じ獣へ戻っている。','木々の年輪には、この森が別々の季節を同時に過ごした痕跡がある。','三つの角片を合わせれば、本来存在しない獣道が浮かぶ。'],unlockedText:'角片が共鳴し、霧の中に一度も踏まれていない獣道が現れた。'}),
    baseDepth:1480,dropMult:1.38,goldMult:1.18,expMult:1.28,setPrefix:'set_star_',tags:['speed','fire','ice','wind','beast'],trace:'森の幻獣は一種ではなく、複数世界の同型生物が重なった生態らしい。',modifier:{id:'realm_phantom_ecology',name:'重層生態',desc:'高速獣群 ／ 属性混成 ／ 星導装備率UP'},
    enemyArchetypes:{phase12_phantom_horn:{source:'normal',name:'霧角獣',speedMult:1.05,role:'frontline'},phase12_phantom_sprite:{source:'fast',name:'季節妖精',speedMult:1.15,atkMult:1.08,role:'caster'},phase12_phantom_lord:{source:'boss',name:'幻獣王・アルシオン',hpMult:1.18,atkMult:1.18,speedMult:1.10,boss:true,role:'boss'},phase12_phantom_rare:{source:'fast',name:'白虹ユニコーン',hpMult:1.15,atkMult:1.24,speedMult:1.20,role:'rare'}},
    waves:[{type:'phase12_phantom_horn',count:4,interval:.88},{type:'phase12_phantom_sprite',count:4,interval:.60},{type:'phase12_phantom_lord',count:1,interval:0}],rareSpawn:{enemyId:'phase12_phantom_rare',chance:.045,dropId:'uq_phantom_heart',label:'白虹ユニコーン'},
  },
  dragonbone_canyon:{
    site:site({id:'dragonbone_canyon',discoveredName:'空を支える巨大竜骨',realmName:'竜骸峡谷',discoverDepth:1180,clueDepth:1340,fragmentSources:[1500,1690,1900],realmId:'secret-dragonbone-canyon',baseDepth:1980,rule:'高火力竜骸 / Armor圧力 / 骨竜BossはBreak後に大きく崩れる',rewardHint:'攻撃・Break・Boss特効装備と竜骸武器を狙える。',inspectText:['峡谷を橋のように渡る骨は、既知の竜より数十倍も大きい。','骨の内側には血管ではなく、規則正しい光の導線が走っている。','三つの髄晶を戻せば、頭蓋へ続く骨道が開く。'],unlockedText:'髄晶が脈動し、死んだ竜骸の内部にもう一度だけ光が流れ始めた。'}),
    baseDepth:1980,dropMult:1.45,goldMult:1.30,expMult:1.25,setPrefix:'set_executioner_',tags:['break','fire','lightning','boss'],trace:'竜骸の骨格は生物よりも境界設備に近く、体内に座標固定用の導線を持つ。',modifier:{id:'realm_dragonbone_pressure',name:'竜骸共振',desc:'高火力 ／ Break報酬大 ／ 処刑者装備率UP'},
    enemyArchetypes:{phase12_bone_drake:{source:'normal',name:'骨甲竜',hpMult:1.12,atkMult:1.12,role:'frontline'},phase12_marrow_knight:{source:'tank',name:'髄晶騎士',defMult:1.18,atkMult:1.08,role:'guardian'},phase12_bone_tyrant:{source:'boss',name:'竜骸帝・ヴァルドレイク',hpMult:1.24,atkMult:1.20,defMult:1.08,boss:true,role:'boss'},phase12_bone_rare:{source:'boss',name:'始祖竜の残骨',hpMult:1.30,atkMult:1.28,defMult:1.16,role:'rare'}},
    waves:[{type:'phase12_bone_drake',count:4,interval:.92},{type:'phase12_marrow_knight',count:2,interval:1.20},{type:'phase12_bone_tyrant',count:1,interval:0}],rareSpawn:{enemyId:'phase12_bone_rare',chance:.035,dropId:'uq_dragonbone_edge',label:'始祖竜の残骨'},
  },
  inverted_library:{
    site:site({id:'inverted_library',discoveredName:'天井へ落ちる書庫入口',realmName:'反転図書館',discoverDepth:1580,clueDepth:1780,fragmentSources:[1980,2200,2440],realmId:'secret-inverted-library',baseDepth:2480,rule:'魔法反応 / 行動順反転 / 書庫主Bossの詠唱を解析して妨害',rewardHint:'魔法・Analysis・行動多様性装備と反転書を狙える。',inspectText:['本は棚から落ちるのではなく、天井へ向かって静かに落ち続けている。','頁番号は未来から過去へ並び、一部にまだ起きていない戦闘記録がある。','三冊の欠番書を戻せば、中央閲覧室の重力が安定する。'],unlockedText:'欠番が埋まった瞬間だけ上下が揃い、中央閲覧室への扉が床へ降りてきた。'}),
    baseDepth:2480,dropMult:1.52,goldMult:1.24,expMult:1.42,healMult:.82,setPrefix:'set_star_',tags:['analysis','magic','light','dark','insight'],trace:'書庫には「観測後に記録した」のではなく「観測前に配布された」戦闘記録がある。',modifier:{id:'realm_inverted_record',name:'因果反転目録',desc:'魔法圧力 ／ 高EXP ／ Analysis・星導装備率UP'},
    enemyArchetypes:{phase12_reverse_scribe:{source:'normal',name:'逆読書記',atkMult:1.14,role:'caster'},phase12_index_wisp:{source:'fast',name:'索引霊',speedMult:1.18,role:'support'},phase12_archive_master:{source:'boss',name:'反転司書・パラドクサ',hpMult:1.18,atkMult:1.22,speedMult:1.08,boss:true,role:'boss'},phase12_library_rare:{source:'fast',name:'未刊の予言者',hpMult:1.18,atkMult:1.30,speedMult:1.16,role:'rare'}},
    waves:[{type:'phase12_reverse_scribe',count:3,interval:.84},{type:'phase12_index_wisp',count:4,interval:.58},{type:'phase12_archive_master',count:1,interval:0}],rareSpawn:{enemyId:'phase12_library_rare',chance:.025,dropId:'uq_inverted_codex',label:'未刊の予言者'},
  },
  black_moon_temple:{
    site:site({id:'black_moon_temple',discoveredName:'月影の落ちない黒石門',realmName:'黒月神殿',discoverDepth:2140,clueDepth:2380,fragmentSources:[2580,2780,2980],realmId:'secret-black-moon-temple',baseDepth:3000,rule:'終盤混成 / 回復抑制 / 神殿Bossは複数局面と短Break窓',rewardHint:'最高IP帯の深淵歩き装備と黒月の超レアを狙える。',inspectText:['空に月がなくても、神殿の床には黒い月影だけが残っている。','祭具は祈りの道具ではなく、外側から来る信号を遮断するための装置に見える。','三つの月蝕片を嵌めれば、最奥の遮断室へ入れる。'],unlockedText:'黒い月影が完全な円を描き、神殿最奥の遮断室が現実側へ接続された。'}),
    baseDepth:3000,dropMult:1.68,goldMult:1.48,expMult:1.46,healMult:.62,setPrefix:'set_abyss_',tags:['dark','light','break','analysis','apex'],trace:'神殿が恐れていたのは神ではなく、境界網の外から同じ周期で届く人工的な信号だった。',modifier:{id:'realm_black_moon',name:'黒月遮断',desc:'回復-38% ／ 高速混成 ／ 最高IP帯 ／ 深淵歩き装備率UP'},
    enemyArchetypes:{phase12_moon_acolyte:{source:'normal',name:'黒月祭徒',atkMult:1.18,defMult:1.08,role:'frontline'},phase12_moon_eye:{source:'fast',name:'蝕眼',speedMult:1.22,atkMult:1.14,role:'controller'},phase12_moon_deity:{source:'boss',name:'黒月神・ノクティル',hpMult:1.28,atkMult:1.24,defMult:1.12,speedMult:1.10,boss:true,role:'boss'},phase12_moon_rare:{source:'boss',name:'月外観測体・ECLIPSE',hpMult:1.32,atkMult:1.34,speedMult:1.18,role:'rare'}},
    waves:[{type:'phase12_moon_acolyte',count:4,interval:.72},{type:'phase12_moon_eye',count:4,interval:.48},{type:'phase12_moon_deity',count:1,interval:0}],rareSpawn:{enemyId:'phase12_moon_rare',chance:.015,dropId:'uq_black_moon_core',label:'月外観測体・ECLIPSE'},
  },
});

export function phase12HorizontalDungeons(){return Object.values(PHASE12_HORIZONTAL_PACK);}
export function phase12RareSpawns(){return phase12HorizontalDungeons().map(x=>x.rareSpawn);}
