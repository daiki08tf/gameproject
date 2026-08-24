/* Story Expansion — 第16〜20章
   15章「黒鉄機城」後、壊れ始めた世界境界（The Veil）の真相へ近づく5章。
   各章は8ステージ＋隠し道を前提に stages.js が展開する。 */

export const CHAPTER_EXPANSION_16_20 = [
  {
    num:16,id:'ch16',name:'沈みゆく聖海',expanded:true,recLevel:[260,330],weaponType:'spear',
    stageNames:['潮騒の廃港','沈没街道','青白き海底回廊','忘れられた聖堂','水没した王墓','海神の祭壇','沈都最深部'],
    enemies:{normal:'深海亡者',fast:'泡影の海妖',tank:'珊瑚の守護兵',boss:'溺神ネレイオス'},
    midboss:{enemyName:'深海騎士ヴォルガ'},
    items:{weapon:'深潮の槍',shield:'珊瑚城壁盾',head:'深海巡礼の冠',body:'海淵の祭衣',accessory:'青潮の聖珠',accessoryArchetype:'def',weaponEpic:'海神槍ネレイオス',named:{name:'溺神の心珠',slot:'accessory',effect:'lifesteal'}},
    branch:{enemyName:'忘潮の司祭',itemName:'沈都の秘印'},
    lore:'黒鉄機城の停止と同時に海底から浮上した、歴史から抹消された聖都。七つの窪みを持つ石版が眠る。',
  },
  {
    num:17,id:'ch17',name:'白夜の聖都',expanded:true,recLevel:[330,410],weaponType:'sword',
    stageNames:['白夜の城門','無人の巡礼路','光なき礼拝堂','聖都地下墓所','禁じられた聖典庫','白耀回廊','光神の玉座'],
    enemies:{normal:'白耀騎士',fast:'聖鐘の幻霊',tank:'断罪の聖盾兵',boss:'偽神アウレリア'},
    midboss:{enemyName:'断罪騎士レムナント'},
    items:{weapon:'白夜の聖剣',shield:'断罪の大盾',head:'白耀の輪冠',body:'巡礼王の聖鎧',accessory:'永昼の聖印',accessoryArchetype:'mag',weaponEpic:'偽神剣アウレリア',named:{name:'偽神の光核',slot:'accessory',effect:'awaken'}},
    branch:{enemyName:'盲目の大司教',itemName:'背徳の聖章'},
    lore:'夜の存在しない無人都市。残された聖典は「天より来る者」が人間界を裁こうとしていた記録を示す。',
  },
  {
    num:18,id:'ch18',name:'星骸の砂海',expanded:true,recLevel:[410,500],weaponType:'bow',
    stageNames:['星降りの荒野','黒硝子の砂丘','星骸の谷','墜星研究所','異星生命培養区','重力断層','星核クレーター'],
    enemies:{normal:'星蝕蟲',fast:'無貌の飛翔体',tank:'星核寄生巨獣',boss:'星喰獣アステリオン'},
    midboss:{enemyName:'星喰いワーム'},
    items:{weapon:'墜星の長弓',shield:'星骸障壁盾',head:'観測者の星冠',body:'黒硝子の外套',accessory:'隕星核ペンダント',accessoryArchetype:'spd',weaponEpic:'星弓アステリオン',named:{name:'星喰獣の重核',slot:'accessory',effect:'haste'}},
    branch:{enemyName:'異星観測体ノヴァ',itemName:'星外文明の欠片'},
    lore:'天から落ちた異物の研究跡。古文書には「世界の外側」から何かがThe Veilへ穴を穿ったと記される。',
  },
  {
    num:19,id:'ch19',name:'月蝕の境界',expanded:true,recLevel:[500,600],weaponType:'dagger',
    stageNames:['歪んだ街道','反転する森','時間の止まった村','鏡世界','崩壊する時空','境界観測塔','月蝕の門'],
    enemies:{normal:'境界の亡影',fast:'時喰いの影獣',tank:'鏡界守護体',boss:'虚界王ノクティス'},
    midboss:{enemyName:'境界獣クロノス'},
    items:{weapon:'月蝕の双刃',shield:'鏡界反射盾',head:'時環の頭冠',body:'境界歩きの外套',accessory:'欠けた月輪',accessoryArchetype:'spd',weaponEpic:'虚界刃ノクティス',named:{name:'ノクティスの虚眼',slot:'accessory',effect:'counter'}},
    branch:{enemyName:'逆行する旅人',itemName:'止まった月時計'},
    lore:'世界と世界の境目そのもの。時間・空間・記憶が混ざり始め、The Veilという言葉が初めて明確に現れる。',
  },
  {
    num:20,id:'ch20',name:'始原の深淵',expanded:true,final:true,recLevel:[600,700],weaponType:'sword',
    stageNames:['深淵門','名もなき地下道','捨てられた神殿','七柱の間','封印の回廊','世界の底','始原境界'],
    enemies:{normal:'始原の眷属',fast:'深淵を這う影',tank:'封印守護者',boss:'原初の獣アビス'},
    midboss:{enemyName:'門番アルカナ'},
    items:{weapon:'始原断ち',shield:'七柱の封盾',head:'世界底の冠',body:'深淵境界装',accessory:'原初の鍵環',accessoryArchetype:'atk',weaponEpic:'境界剣アビス',named:{name:'原初の獣核',slot:'accessory',effect:'awaken'},named2:{name:'七柱の残片',slot:'body',effect:'counter'}},
    branch:{enemyName:'名を失った第八守護者',itemName:'空白の鍵片'},
    lore:'世界の底にある封印領域。最奥で倒した存在こそ、深淵を閉じ込めていた最後の門番だったと判明する。',
  },
];

export const CHAPTER_EXPANSION_REGION_TAGS = Object.freeze({
  ch16:['ice','light'],
  ch17:['light'],
  ch18:['lightning','dark'],
  ch19:['dark','light'],
  ch20:['dark','light'],
});
