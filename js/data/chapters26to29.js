/* ============================================================
   Story Expansion I — Ch26–29
   ------------------------------------------------------------
   Fourth act: the Eighth Key route leaves the known seven-key management
   architecture and follows an external observation signal toward Ch30.
   ============================================================ */

export const CHAPTER_EXPANSION_26_29 = Object.freeze([
  {
    num:26,id:'ch26',name:'零外接続域',expanded:true,recLevel:[2500,3200],weaponType:'sword',
    stageNames:['王座裏接続路','規格外鍵路','消失座標帯','零外中継殿','逆位相橋','未登録門列','外信号受信核'],
    enemies:{normal:'零外巡回体',fast:'逸脱位相獣',tank:'規格外封鎖機',boss:'例外管理者エクシオン'},
    midboss:{enemyName:'鍵外執行官ノルム'},
    items:{weapon:'零外断剣',shield:'例外封盾',head:'逸脱観測冠',body:'鍵外装甲',accessory:'未登録鍵環',accessoryArchetype:'def',weaponEpic:'例外剣エクシオン',named:{name:'例外管理者の外鍵核',slot:'accessory',effect:'counter'}},
    branch:{enemyName:'座標を持たぬ巡礼者',itemName:'欠番座標片'},
    lore:'境界王座の裏側に隠されていた、七鍵の規格に属さない接続域。ここでは行き先ではなく「接続元」の記録が欠落している。',
  },
  {
    num:27,id:'ch27',name:'遠信残響帯',expanded:true,recLevel:[3200,4000],weaponType:'bow',
    stageNames:['微弱信号路','整列光の断層','金属振動回廊','遠信解析塔','高層影の窓','断続音響区','発光板観測所'],
    enemies:{normal:'信号喰らい',fast:'走査光蝶',tank:'受信殻巨兵',boss:'遠信王レゾナード'},
    midboss:{enemyName:'残響狩りエコーゼロ'},
    items:{weapon:'遠信導弓',shield:'受信殻盾',head:'走査光冠',body:'残響外套',accessory:'信号結晶耳環',accessoryArchetype:'spd',weaponEpic:'共鳴弓レゾナード',named:{name:'遠信王の同期核',slot:'accessory',effect:'haste'}},
    branch:{enemyName:'無音の受信者',itemName:'薄明発光片'},
    lore:'境界の外から周期的に届く信号が地形へ焼き付いた領域。規則的な光、金属の振動、薄い発光面など、既知文明に属さない生活圏の断片が混線する。',
  },
  {
    num:28,id:'ch28',name:'機界監査層',expanded:true,recLevel:[4000,5000],weaponType:'staff',
    stageNames:['機界外部監査門','管理記録庫','観測者照合路','母機非権限区','設計者監査殿','上位照準回廊','被観測中枢'],
    enemies:{normal:'監査端末兵',fast:'照合ドローン',tank:'権限壁機兵',boss:'上位監査体オーディタ'},
    midboss:{enemyName:'非権限守護機ヴェリファ'},
    items:{weapon:'監査演算杖',shield:'権限拒絶盾',head:'照合演算冠',body:'外部監査衣',accessory:'被観測識別子',accessoryArchetype:'mag',weaponEpic:'監査杖オーディタ',named:{name:'上位監査体の照準核',slot:'accessory',effect:'awaken'}},
    branch:{enemyName:'削除された設計補助体',itemName:'外部監査署名'},
    lore:'MOTHERとARCHITECTが管理者であって創造者ではないことを示す監査層。機界の命令系統そのものが、さらに外側から観測・評価されていた痕跡が残る。',
  },
  {
    num:29,id:'ch29',name:'逆観測門',expanded:true,recLevel:[5000,6200],weaponType:'dagger',
    stageNames:['反向照準路','二重観測廊','外挿座標庭','第八接続室','非対称鍵孔','接続元照合区','逆観測門前'],
    enemies:{normal:'逆観測従体',fast:'焦点跳躍獣',tank:'二重視差巨像',boss:'接続監守パラドクス'},
    midboss:{enemyName:'第八鍵照合官オクタ'},
    items:{weapon:'逆観測双刃',shield:'二重焦点盾',head:'外挿冠',body:'非対称観測衣',accessory:'第八焦点環',accessoryArchetype:'atk',weaponEpic:'逆鍵刃パラドクス',named:{name:'接続監守の逆焦点核',slot:'accessory',effect:'lifesteal'},named2:{name:'外挿された第八鍵片',slot:'body',effect:'counter'}},
    branch:{enemyName:'外側を向く門番',itemName:'接続元不明票'},
    lore:'第八鍵は七鍵に追加された八本目ではなく、管理系の外側から差し込まれた接続点だった可能性が高まる。門は行き先よりも「こちらを見ている接続元」を照合している。',
  },
]);

export const CHAPTER_EXPANSION_REGION_TAGS_26_29 = Object.freeze({
  ch26:['light','dark'],
  ch27:['lightning','wind'],
  ch28:['light','ice'],
  ch29:['dark','wind'],
});
