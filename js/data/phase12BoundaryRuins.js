/* ============================================================
   Phase 12.1 — Boundary Ruins Pack I
   Four optional exploration realms that reuse the existing Abyss /
   exploration / loot infrastructure. No new currency or save layer.
   ============================================================ */
import { abyssRecommendedLevel, abyssTargetItemPower } from './abyssEndgame.js';

function site({id,hiddenName='？？？',discoveredName,realmName,discoverDepth,clueDepth,fragmentSources,realmId,baseDepth,rule,rewardHint,inspectText,unlockedText}){
  return {id,hiddenName,discoveredName,realmName,discoverDepth,clueDepth,fragmentSources,fragmentsRequired:3,inspectText,unlockedText,realm:{id:realmId,recLevel:abyssRecommendedLevel(baseDepth),itemPowerTarget:abyssTargetItemPower(baseDepth),rule,rewardHint}};
}

export const PHASE12_BOUNDARY_RUINS=Object.freeze({
  echo_observatory:{
    site:site({
      id:'echo_observatory',discoveredName:'反響だけが残る観測塔',realmName:'残響観測塔',discoverDepth:380,clueDepth:470,fragmentSources:[520,610,700],realmId:'secret-echo-observatory',baseDepth:850,
      rule:'高速観測体 / 詠唱圧力 / Bossの解析波をBreakで止める',rewardHint:'星導Set・Analysis/Insight寄りの装備を狙える。',
      inspectText:['崩れた塔の内部では、誰もいないのに足音だけが先へ進んでいる。','壁面の観測鏡は、現在ではなく数秒前の自分を映している。','三つの焦点器を合わせれば、塔の最上層へ座標を固定できそうだ。'],
      unlockedText:'三つの焦点器が同期し、過去の残響と現在の塔が一瞬だけ重なった。',
    }),
    baseDepth:850,dropMult:1.28,goldMult:1.16,expMult:1.22,setPrefix:'set_star_',tags:['analysis','light','ice','insight'],
    modifier:{id:'realm_echo_scan',name:'残響走査',desc:'高速観測体 ／ Analysis系Loot率UP ／ BossはBreakで解析を中断'},
    enemyArchetypes:{
      phase12_echo_wisp:{source:'fast',name:'残響灯・ルクス',speedMult:1.10,atkMult:1.06,role:'skirmisher'},
      phase12_echo_scribe:{source:'normal',name:'反響記録官',atkMult:1.10,defMult:1.04,role:'caster'},
      phase12_echo_warden:{source:'boss',name:'観測塔主・クロノグラス',hpMult:1.18,atkMult:1.12,defMult:1.08,boss:true,role:'boss'},
    },
    waves:[{type:'phase12_echo_wisp',count:4,interval:.68},{type:'phase12_echo_scribe',count:3,interval:.92},{type:'phase12_echo_warden',count:1,interval:0}],
  },
  drowned_foundry:{
    site:site({
      id:'drowned_foundry',hiddenName:'？？？？',discoveredName:'水没した鋳造昇降口',realmName:'沈降鋳造所',discoverDepth:760,clueDepth:880,fragmentSources:[960,1100,1250],realmId:'secret-drowned-foundry',baseDepth:1350,
      rule:'重装機兵 / 高DEF / Breakで鋳造装甲を崩す',rewardHint:'古竜Set・耐久/反撃/Break向け装備を狙える。',
      inspectText:['冷えた水路の下で、止まったはずの巨大な鍛造槌が周期的に動いている。','壁には竜鱗と機械部品を同じ炉で加工した記録が残る。','三つの圧力弁を復旧すれば、沈んだ主炉へ降りられる。'],
      unlockedText:'圧力弁が開き、黒い水が引く。赤熱した主炉への階段が姿を現した。',
    }),
    baseDepth:1350,dropMult:1.34,goldMult:1.24,expMult:1.20,setPrefix:'set_dragon_',tags:['fire','fortify','break','construct'],
    modifier:{id:'realm_sunken_forge',name:'沈降鍛圧',desc:'重装機兵 ／ 高DEF ／ Break時に攻略しやすい ／ 古竜装備率UP'},
    enemyArchetypes:{
      phase12_forge_drone:{source:'normal',name:'水圧鍛造機・ボルク',defMult:1.15,hpMult:1.08,role:'guardian'},
      phase12_forge_hammer:{source:'tank',name:'重槌機兵・アンヴィル',defMult:1.18,atkMult:1.08,role:'tank'},
      phase12_forge_titan:{source:'boss',name:'沈炉巨神・タルタロス',hpMult:1.22,defMult:1.20,atkMult:1.10,boss:true,role:'boss'},
    },
    waves:[{type:'phase12_forge_drone',count:3,interval:.95},{type:'phase12_forge_hammer',count:2,interval:1.28},{type:'phase12_forge_titan',count:1,interval:0}],
  },
  memory_orchard:{
    site:site({
      id:'memory_orchard',hiddenName:'？？？？',discoveredName:'記憶果実の根穴',realmName:'記憶果樹園',discoverDepth:1320,clueDepth:1500,fragmentSources:[1650,1850,2050],realmId:'secret-memory-orchard',baseDepth:2100,
      rule:'記憶毒 / 状態異常圧力 / Bossの分身前に短期決着',rewardHint:'処刑者Set・会心/状態異常追撃系装備を狙える。',
      inspectText:['地下根脈に、人の記憶を映す透明な果実が実っている。','果実の中にはBlade Valeでは見覚えのない街路や乗り物の断片も混じる。','三つの記憶核を戻せば、根脈の中心にある母樹へ到達できる。'],
      unlockedText:'記憶核が根へ溶け、失われた果樹園の座標が現在へ固定された。',
    }),
    baseDepth:2100,dropMult:1.42,goldMult:1.30,expMult:1.30,healMult:.78,setPrefix:'set_executioner_',tags:['poison','insight','reaction','dark'],
    modifier:{id:'realm_memory_pollen',name:'記憶花粉',desc:'回復-22% ／ 状態異常圧力 ／ Insight・処刑者装備率UP'},
    enemyArchetypes:{
      phase12_memory_moth:{source:'fast',name:'追憶蛾・メモリア',speedMult:1.12,atkMult:1.08,role:'status'},
      phase12_memory_dryad:{source:'normal',name:'根脈守・ドリアード',hpMult:1.10,defMult:1.08,role:'support'},
      phase12_memory_queen:{source:'boss',name:'忘却母樹・ムネモシュネ',hpMult:1.20,atkMult:1.16,speedMult:1.06,boss:true,role:'boss'},
    },
    waves:[{type:'phase12_memory_moth',count:4,interval:.62},{type:'phase12_memory_dryad',count:3,interval:.88},{type:'phase12_memory_queen',count:1,interval:0}],
  },
  zero_station:{
    site:site({
      id:'zero_station',hiddenName:'？？？？？',discoveredName:'行先表示のない境界ホーム',realmName:'零番境界駅',discoverDepth:2050,clueDepth:2300,fragmentSources:[2450,2700,2950],realmId:'secret-zero-station',baseDepth:2800,
      rule:'高速連戦 / 行動圧力 / 最終Bossは短いBreak窓',rewardHint:'深淵歩きSet・速度/回避/貫通系装備を狙える。',
      inspectText:['平行な二本の金属線と、一定間隔で並ぶ足場が闇の向こうまで続いている。','点滅する表示板には読めない記号の中に「駅」「線」に似た文字が混じる。','三つの接続時刻を重ねれば、行先のない零番ホームへ入れるらしい。'],
      unlockedText:'三つの時刻表示が同時に零を示す。風のない空間を、遠い走行音だけが横切った。',
    }),
    baseDepth:2800,dropMult:1.52,goldMult:1.38,expMult:1.36,healMult:.68,setPrefix:'set_abyss_',tags:['speed','dark','analysis','break'],
    modifier:{id:'realm_zero_timetable',name:'零時運行',desc:'敵SPD+圧力 ／ 回復-32% ／ 短いBreak窓 ／ 深淵歩き装備率UP'},
    enemyArchetypes:{
      phase12_null_hound:{source:'fast',name:'軌道猟犬・NULL',speedMult:1.18,atkMult:1.12,role:'skirmisher'},
      phase12_null_attendant:{source:'normal',name:'無人案内体・00',speedMult:1.08,defMult:1.10,role:'controller'},
      phase12_null_conductor:{source:'boss',name:'零番車掌・NO DESTINATION',hpMult:1.16,atkMult:1.20,speedMult:1.12,boss:true,role:'boss'},
    },
    waves:[{type:'phase12_null_hound',count:5,interval:.54},{type:'phase12_null_attendant',count:3,interval:.74},{type:'phase12_null_conductor',count:1,interval:0}],
  },
});

export function phase12BoundaryRuins(){return Object.values(PHASE12_BOUNDARY_RUINS);}
