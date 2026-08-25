/* ============================================================
   Phase 9.3 — Regional Exploration
   Chapters 21–25 gain three optional investigation routes each.
   Completing all three reveals the region's hidden boss route.
   ============================================================ */

export const PHASE9_REGIONAL_EXPLORATION = Object.freeze({
  ch21:{
    reward:'灰燼の道標',
    routes:[
      {id:'ash_grave',name:'灰に埋もれた王墓',unlockAfter:'21-2',levelT:.22,kind:'lore',rewardTag:'dark',desc:'灰の下に沈んだ旧王朝の墓道。古い防衛国家の終末記録を追う。'},
      {id:'ember_forge',name:'消えない鍛炉',unlockAfter:'21-4',levelT:.48,kind:'loot',rewardTag:'fire',desc:'今も火が落ちない地下鍛炉。焼鉄兵の装備供給源を断つ。'},
      {id:'border_survivor',name:'境界の生存者',unlockAfter:'21-6',levelT:.72,kind:'choice',rewardTag:'break',desc:'灰嵐を生き延びた者の痕跡を追い、墓守へ続く黒い道を特定する。'},
    ],
  },
  ch22:{
    reward:'零下観測記録',
    routes:[
      {id:'frozen_record',name:'凍結記録体',unlockAfter:'22-2',levelT:.22,kind:'lore',rewardTag:'analysis',desc:'再構築前の世界を記録した観測体を氷中から回収する。'},
      {id:'mirror_cache',name:'反射氷庫',unlockAfter:'22-4',levelT:.48,kind:'loot',rewardTag:'ice',desc:'攻撃を反射する玻璃壁の奥に残された封鎖物資庫。'},
      {id:'zero_observer',name:'停止した観測者',unlockAfter:'22-6',levelT:.72,kind:'choice',rewardTag:'insight',desc:'時が止まった観測者を再起動し、消された観測路を復元する。'},
    ],
  },
  ch23:{
    reward:'天雷座標核',
    routes:[
      {id:'fallen_marker',name:'落雷墓標',unlockAfter:'23-2',levelT:.22,kind:'lore',rewardTag:'lightning',desc:'雷が落ち続ける墓標から古代防衛網の照準記録を読む。'},
      {id:'storm_armory',name:'雷神兵工廠跡',unlockAfter:'23-4',levelT:.48,kind:'loot',rewardTag:'speed',desc:'暴走した雷神兵が守る兵工廠跡。高速戦闘向けの残骸が眠る。'},
      {id:'broken_skyrail',name:'断線天路',unlockAfter:'23-6',levelT:.72,kind:'choice',rewardTag:'evade',desc:'空中で途切れた天路を渡り、名なき雷神兵の座標を確定する。'},
    ],
  },
  ch24:{
    reward:'根脈記憶標本',
    routes:[
      {id:'memory_flower',name:'記憶を咲かせる花',unlockAfter:'24-2',levelT:.22,kind:'lore',rewardTag:'insight',desc:'触れた者の記憶を花弁へ写す危険な花を調査する。'},
      {id:'poison_hive',name:'毒蜜の巣',unlockAfter:'24-4',levelT:.48,kind:'loot',rewardTag:'poison',desc:'夢喰い蝶が集めた毒蜜の巣。状態異常資源を奪い返す。'},
      {id:'root_archive',name:'根脈記憶庫',unlockAfter:'24-6',levelT:.72,kind:'choice',rewardTag:'reaction',desc:'奪われた記憶が流れ込む地下根脈を辿り、禁花区画を発見する。'},
    ],
  },
  ch25:{
    reward:'第八鍵観測片',
    routes:[
      {id:'seventh_key',name:'七鍵封鎖端末',unlockAfter:'25-2',levelT:.22,kind:'lore',rewardTag:'fusion',desc:'七つの鍵が何を封じていたのか、端末の断片ログを復元する。'},
      {id:'world_layer',name:'失われた世界層',unlockAfter:'25-4',levelT:.48,kind:'loot',rewardTag:'dark',desc:'王座の下に折り畳まれた消失世界層へ侵入する。'},
      {id:'eighth_key',name:'存在しない第八鍵',unlockAfter:'25-6',levelT:.72,kind:'choice',rewardTag:'fate',desc:'記録上存在しない鍵の残響を追い、消された王への道を開く。'},
    ],
  },
});

export function regionalExplorationFor(chapterId){return PHASE9_REGIONAL_EXPLORATION[chapterId]||null;}
export function regionalExplorationRoutes(chapterId){return regionalExplorationFor(chapterId)?.routes||[];}
