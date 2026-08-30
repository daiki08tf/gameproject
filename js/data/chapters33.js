/* Story Expansion II — Ch33 / 記録されない一拍 */
export const CHAPTER_EXPANSION_33 = Object.freeze([
  Object.freeze({
    num:33,id:'ch33',name:'欠落観測層',expanded:true,recLevel:[8800,9400],weaponType:'bow',
    stageNames:['欠落時標回廊','無記録走査路','根脈残響庫','生体記憶照合室','空白同期架','一拍補正橋','盲点観測核前'],
    enemies:{normal:'欠落走査体',fast:'一拍跳躍体',tank:'空白補正殻',boss:'欠落補正機構ブラインドスポット'},
    midboss:{enemyName:'無記録監査官ヌル'},
    items:{
      weapon:'残響観測弓',shield:'空白補正盾',head:'生体照合冠',body:'欠落時標衣',accessory:'一拍記憶環',accessoryArchetype:'spd',
      weaponEpic:'残響弓メモリア',named:{name:'記録外の残響弓',slot:'weapon',effect:'reaction'},named2:{name:'盲点越しの観測衣',slot:'body',effect:'guard'},
    },
    branch:{enemyName:'忘却を拒む残響獣',itemName:'記録されない一拍の欠片'},
    lore:'機械・端末・境界設備の記録から同じ一拍だけが反復して欠落する層。一方で根脈、生体反応、残留記憶にはその一拍が存在した痕跡が残る。削除されたのか、現行機械には表現できないのかはまだ判別できない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_33 = Object.freeze({
  ch33:['dark','wind'],
});
