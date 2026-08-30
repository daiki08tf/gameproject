/* Story Expansion II — Ch32 / 第八鍵の裏面 */
export const CHAPTER_EXPANSION_32 = Object.freeze([
  Object.freeze({
    num:32,id:'ch32',name:'第八鍵裏面層',expanded:true,recLevel:[8200,8800],weaponType:'staff',
    stageNames:['七鍵比較廊','例外署名路','裏面照合室','対向待機機構','外部参照架','反転鍵孔橋','対向同期核前'],
    enemies:{normal:'鍵式走査体',fast:'対向跳躍体',tank:'例外隔壁機',boss:'対向同期機構デュプレクス'},
    midboss:{enemyName:'裏面監査官リバース'},
    items:{
      weapon:'対向参照杖',shield:'例外鍵盾',head:'裏面照合冠',body:'対向同期衣',accessory:'第八例外環',accessoryArchetype:'mag',
      weaponEpic:'裏面杖リバース',named:{name:'対向端点の参照杖',slot:'weapon',effect:'awaken'},named2:{name:'例外接続の同期衣',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'片側だけの鍵守',itemName:'対向端点の欠片'},
    lore:'七鍵の内部認証構造と第八鍵の痕跡を比較する層。第八鍵だけは既知の権限木へ接続せず、外側に存在する未確認の対向端点から応答が返ることを前提に待機している。誰が設計したのか、相手側が同意して作られたのかは分からない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_32 = Object.freeze({
  ch32:['light','dark'],
});
