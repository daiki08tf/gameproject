/* Story Expansion I — Ch30 finale */
export const CHAPTER_EXPANSION_30 = Object.freeze([
  Object.freeze({
    num:30,id:'ch30',name:'外部観測核',expanded:true,recLevel:[6200,7600],weaponType:'sword',
    stageNames:['応答座標路','外部同期回廊','生活圏残響層','双方向照合殿','未知文字記録庫','観測境界橋','外部観測核前'],
    enemies:{normal:'外部照合従体',fast:'応答走査獣',tank:'観測隔壁巨兵',boss:'外界照合者オブザーバ'},
    midboss:{enemyName:'双方向監査官リプライ'},
    items:{
      weapon:'外部照合剣',shield:'観測隔壁盾',head:'応答焦点冠',body:'外信観測衣',accessory:'双方向同期環',accessoryArchetype:'atk',
      weaponEpic:'応答剣リプライ',named:{name:'外界照合者の観測核',slot:'weapon',effect:'awaken'},named2:{name:'双方向接続の残響衣',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'名を返さない観測者',itemName:'未解読生活圏記録'},
    lore:'第八鍵の接続元に最も近い観測核。外側の文明圏はBlade Valeを一方的に見ているだけではなく、こちらからの接触を認識し、限定的に応答している。接続理由と相手の正体はまだ確定しない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_30 = Object.freeze({
  ch30:['light','dark'],
});
