/* Story Expansion II — Ch34 / 向こう側の窓 */
export const CHAPTER_EXPANSION_34 = Object.freeze([
  Object.freeze({
    num:34,id:'ch34',name:'共通参照窓',expanded:true,recLevel:[9400,10000],weaponType:'dagger',
    stageNames:['窓辺照合路','非言語配列帯','境界図重ね室','共通参照回廊','外部標識架','一致座標橋','共有異常点前'],
    enemies:{normal:'参照ずらし体',fast:'配列跳躍体',tank:'座標固定殻',boss:'共通参照拒絶機構アラインメント'},
    midboss:{enemyName:'座標監査官オーバーレイ'},
    items:{
      weapon:'参照線短剣',shield:'座標固定盾',head:'窓辺照合冠',body:'共通参照衣',accessory:'一致点標環',accessoryArchetype:'spd',
      weaponEpic:'参照短剣アライン',named:{name:'同一点を指す参照刃',slot:'weapon',effect:'reaction'},named2:{name:'共通座標の照合衣',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'地図に載らない標識獣',itemName:'共通参照点の欠片'},
    lore:'外側から返された点・線・順序・間隔だけの非言語構造をBlade Vale側の境界地図と重ねる層。互いの世界そのものは理解できなくても、双方が同じ不安定点を指していることだけは再現できる。外側の正体や位置はまだ特定できない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_34 = Object.freeze({
  ch34:['light','wind'],
});
