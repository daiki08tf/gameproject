/* Story Expansion II — Ch35 / 共観測点 */
export const CHAPTER_EXPANSION_35 = Object.freeze([
  Object.freeze({
    num:35,id:'ch35',name:'共観測点',expanded:true,recLevel:[10000,10600],weaponType:'staff',
    stageNames:['同時観測路','第八鍵安定架','共有異常照合室','同期臨界回廊','共観測橋','二重輪郭帯','共同焦点核前'],
    enemies:{normal:'同期漂移体',fast:'共焦点跳躍体',tank:'観測固定殻',boss:'同期破綻機構ディソナンス'},
    midboss:{enemyName:'参照断絶官スプリット'},
    items:{
      weapon:'共観測杖',shield:'同期安定盾',head:'共同焦点冠',body:'二域照合衣',accessory:'共観測標環',accessoryArchetype:'mag',
      weaponEpic:'共観測杖シンクロナ',named:{name:'二域を結ぶ観測杖',slot:'weapon',effect:'analysis'},named2:{name:'共有焦点の同期衣',slot:'body',effect:'guard'},
    },
    branch:{enemyName:'二重輪郭残響獣',itemName:'二重輪郭の欠片'},
    lore:'Blade Vale側と外側が独立に同じ境界異常を指し、第八鍵を短時間だけ共通参照点として安定させる層。同期の終端では、深緑の森の同一座標が「巨大な樹冠に覆われた輪郭」と「森林反応そのものが存在しない輪郭」の二通りで一瞬だけ重なる。原因も意味もまだ説明できない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_35 = Object.freeze({
  ch35:['light','dark'],
});
