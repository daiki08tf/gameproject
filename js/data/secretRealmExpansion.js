export const SECRET_REALM_EXPANSION = Object.freeze({
  ancient_dragon_gate: {
    site: {
      id:'ancient_dragon_gate', hiddenName:'？？？', discoveredName:'竜鱗に覆われた石門', realmName:'古竜の巣',
      discoverDepth:540, clueDepth:610, fragmentSources:[700,850,1000], fragmentsRequired:3,
      inspectText:['崩れた岩壁の奥に、巨大な爪痕の残る石門がある。','鍵穴ではなく、三枚の鱗を嵌める窪みが並んでいる。','門の奥から、眠りを妨げられた獣の低い唸り声が響く。'],
      unlockedText:'三枚の竜鱗が石門へ吸い込まれ、灼けた風とともに道が開いた。',
      realm:{id:'secret-ancient-dragon-nest',recLevel:36000,itemPowerTarget:7300,rule:'敵HP+45% / 敵DEF+25% / Boss中心',rewardHint:'古竜Set・耐久/反撃系装備を狙える。'},
    },
    baseDepth:1100, hpMult:1.45, defMult:1.25, dropMult:1.35, goldMult:1.30, expMult:1.25,
    setPrefix:'set_dragon_', tags:['fire','lightning'], modifier:{id:'realm_dragon_pressure',name:'古竜の威圧',desc:'敵HP+45% ／ 敵DEF+25% ／ 古竜装備率UP'},
  },
  sealed_library: {
    site:{id:'sealed_library',hiddenName:'？？？',discoveredName:'文字の消えた封印扉',realmName:'封印図書館',discoverDepth:930,clueDepth:1050,fragmentSources:[1200,1350,1500],fragmentsRequired:3,inspectText:['壁一面を埋める巨大な扉に、読めない文字列が浮かんでいる。','三つの空白だけが不自然に光を失っている。','魔力を近づけると、失われた頁を求めるように文字が脈打つ。'],unlockedText:'三枚の禁書頁が揃うと、文字が再び意味を取り戻し、封印が解けた。',realm:{id:'secret-sealed-library',recLevel:48000,itemPowerTarget:8200,rule:'敵攻撃+25% / EXP+35% / Spell向けDrop',rewardHint:'星導Set・魔法/MP/属性系装備を狙える。'}},
    baseDepth:1550, atkMult:1.25, dropMult:1.40, goldMult:1.20, expMult:1.35, setPrefix:'set_star_',tags:['fire','ice','lightning','wind','light','dark'],modifier:{id:'realm_forbidden_words',name:'禁書の詠唱',desc:'敵攻撃+25% ／ EXP+35% ／ 星導装備率UP'},
  },
  god_grave: {
    site:{id:'god_grave',hiddenName:'？？？？',discoveredName:'名を削られた祭壇',realmName:'神々の墓場',discoverDepth:1420,clueDepth:1600,fragmentSources:[1750,1950,2200],fragmentsRequired:3,inspectText:['崩壊した祭壇に、三つの供物台だけが残っている。','中央には「名を失いし者のみ、死者の王へ至る」と刻まれている。','供物台には、処刑の印と同じ傷が刻まれている。'],unlockedText:'三つの断罪印を捧げると、祭壇の背後に地下へ続く階段が現れた。',realm:{id:'secret-gods-graveyard',recLevel:65000,itemPowerTarget:9000,rule:'回復-35% / 敵ATK+35% / 高会心Boss',rewardHint:'処刑者Set・会心/瀕死特効系装備を狙える。'}},
    baseDepth:2250, atkMult:1.35, healMult:0.65, dropMult:1.45, goldMult:1.35, expMult:1.30,setPrefix:'set_executioner_',tags:['dark','light'],modifier:{id:'realm_divine_grave',name:'神骸の呪い',desc:'回復-35% ／ 敵ATK+35% ／ 処刑者装備率UP'},
  },
  void_corridor: {
    site:{id:'void_corridor',hiddenName:'？？？？？',discoveredName:'音のない亀裂',realmName:'虚無回廊',discoverDepth:1880,clueDepth:2100,fragmentSources:[2300,2600,2900],fragmentsRequired:3,inspectText:['空間そのものが裂けたような、黒い亀裂が浮いている。','近づいても風も音もない。代わりに、自分の足音だけが一拍遅れて返ってくる。','亀裂の縁には、三つの方位を示す羅針盤の刻印がある。'],unlockedText:'三つの虚無座標が重なった瞬間、亀裂が一本の通路へと変わった。',realm:{id:'secret-void-corridor',recLevel:90000,itemPowerTarget:9800,rule:'敵SPD+35% / Drop+60% / 深淵歩き向け',rewardHint:'深淵歩きSet・回避/貫通/速度系装備を狙える。'}},
    baseDepth:2950, speedMult:1.35, dropMult:1.60, goldMult:1.45, expMult:1.40,setPrefix:'set_abyss_',tags:['dark','wind','lightning'],modifier:{id:'realm_void_shift',name:'虚無転位',desc:'敵SPD+35% ／ Drop+60% ／ 深淵歩き装備率UP'},
  },
});

export function expandedExplorationSites(){ return Object.values(SECRET_REALM_EXPANSION).map(x=>x.site); }
export function expandedRealmByStageId(stageId){ return Object.values(SECRET_REALM_EXPANSION).find(x=>x.site.realm.id===stageId)||null; }
