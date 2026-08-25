/* ============================================================
   Phase 9.1 — World / Region Expansion
   第21〜25章。The Veilの先に広がる「外縁世界」を巡る5地域。
   BGMデータは持たず、地域ルール・探索・敵傾向・ドロップ軸を強化する。
   ============================================================ */

export const CHAPTER_EXPANSION_21_25 = Object.freeze([
  {
    num:21,id:'ch21',name:'灰燼の外縁',expanded:true,recLevel:[700,950],weaponType:'axe',
    stageNames:['灰の国境門','燃え残る街道','煤煙の集落','灰王墓地','焦土の城壁','火葬炉都市','灰冠の外宮'],
    enemies:{normal:'灰喰らい',fast:'燐火の猟犬',tank:'焼鉄の重装兵',boss:'灰燼侯ヴァルカン'},
    midboss:{enemyName:'灰鎧将グレイヴ'},
    items:{weapon:'灰断の戦斧',shield:'焼鉄城壁盾',head:'煤冠の兜',body:'灰燼重鎧',accessory:'残火の黒環',accessoryArchetype:'atk',weaponEpic:'灰侯斧ヴァルカン',named:{name:'灰燼侯の心火',slot:'accessory',effect:'burn'}},
    branch:{enemyName:'墓守アッシュロード',itemName:'王墓の黒印'},
    lore:'始原境界の外側に残された、かつて世界を焼いて閉じた防衛国家。灰の下にはThe Veil以前の道路網が眠る。',
  },
  {
    num:22,id:'ch22',name:'玻璃凍原',expanded:true,recLevel:[950,1250],weaponType:'staff',
    stageNames:['玻璃の雪原','凍結観測路','青玻璃峡谷','永久凍土研究棟','氷晶庭園','反射氷洞','零度王宮'],
    enemies:{normal:'氷玻璃兵',fast:'鏡雪の妖精',tank:'凍晶巨像',boss:'零王クリスタリア'},
    midboss:{enemyName:'氷鏡騎士セレス'},
    items:{weapon:'零晶杖',shield:'玻璃反射盾',head:'零冠',body:'凍界の法衣',accessory:'永久氷晶',accessoryArchetype:'mag',weaponEpic:'零王杖クリスタリア',named:{name:'零王の心晶',slot:'accessory',effect:'awaken'}},
    branch:{enemyName:'凍結した観測者',itemName:'零下記録晶'},
    lore:'時間すら凍りついた透明な大地。氷中の観測記録は、世界が一度ではなく何度も再構築されたことを示している。',
  },
  {
    num:23,id:'ch23',name:'天雷墓標群',expanded:true,recLevel:[1250,1600],weaponType:'bow',
    stageNames:['雷墓の入口','断線した天路','浮遊墓標群','雷神兵工廠','黒雲回廊','天雷昇降塔','雷葬の天壇'],
    enemies:{normal:'雷葬兵',fast:'閃雷翼',tank:'避雷巨兵',boss:'天葬王インドラグ'},
    midboss:{enemyName:'雷墓将ヴォルト'},
    items:{weapon:'墓雷の長弓',shield:'避雷城盾',head:'雷葬冠',body:'黒雲の外套',accessory:'天雷墓標石',accessoryArchetype:'spd',weaponEpic:'天葬弓インドラグ',named:{name:'天葬王の雷核',slot:'accessory',effect:'haste'}},
    branch:{enemyName:'名なき雷神兵',itemName:'落雷座標片'},
    lore:'空に浮く無数の墓標。落雷は偶然ではなく、外界から侵入する何かを撃ち落とす古代防衛網だった。',
  },
  {
    num:24,id:'ch24',name:'虚花の庭園',expanded:true,recLevel:[1600,2000],weaponType:'dagger',
    stageNames:['枯花門','毒蜜の小径','眠り花畑','虚花培養殿','根脈地下路','腐香の宮殿','世界樹の空洞'],
    enemies:{normal:'虚花の従者',fast:'夢喰い蝶',tank:'根鎧の園丁',boss:'虚花妃エルシア'},
    midboss:{enemyName:'園守ベラドンナ'},
    items:{weapon:'虚花双刃',shield:'根脈の盾',head:'夢花冠',body:'毒蜜の外套',accessory:'虚花の香嚢',accessoryArchetype:'spd',weaponEpic:'虚花刃エルシア',named:{name:'虚花妃の種核',slot:'accessory',effect:'lifesteal'}},
    branch:{enemyName:'枯れぬ園丁',itemName:'禁花の種子'},
    lore:'世界の傷口を覆うため作られた人工庭園。花粉は記憶を奪い、奪った記憶を根へ蓄積している。',
  },
  {
    num:25,id:'ch25',name:'境界王座',expanded:true,final:true,recLevel:[2000,2500],weaponType:'sword',
    stageNames:['境界門零号','反転回廊','失われた世界層','七鍵封鎖区','観測者の玉座前','無限境界路','王座核'],
    enemies:{normal:'境界執行体',fast:'位相猟犬',tank:'七鍵守護機',boss:'境界王アルケオン'},
    midboss:{enemyName:'第零観測者'},
    items:{weapon:'境界断剣',shield:'零界封盾',head:'観測王冠',body:'境界王装',accessory:'七鍵環',accessoryArchetype:'def',weaponEpic:'王剣アルケオン',named:{name:'境界王の零核',slot:'accessory',effect:'awaken'},named2:{name:'第八鍵の欠片',slot:'body',effect:'counter'}},
    branch:{enemyName:'記録から消えた王',itemName:'無銘の第八鍵'},
    lore:'外縁世界を束ねる観測中枢。王座の記録はBlade Valeそのものが「閉じた世界」ではなく、巨大な境界網の一ノードだと告げる。',
  },
]);

export const CHAPTER_EXPANSION_REGION_TAGS_21_25 = Object.freeze({
  ch21:['fire','dark'],
  ch22:['ice','light'],
  ch23:['lightning','wind'],
  ch24:['poison','dark'],
  ch25:['light','dark'],
});
