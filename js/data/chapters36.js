/* Story Expansion II — Ch36 / Arc VI 分岐記録 開幕 */
export const CHAPTER_EXPANSION_36 = Object.freeze([
  Object.freeze({
    num:36,id:'ch36',name:'分岐記録',expanded:true,recLevel:[10600,11200],weaponType:'rod',
    stageNames:['二重輪郭の残滓','生体照合圃場','境界照合塔','淘汰仲裁回廊','二系統保持室','欠落区間の輪郭','分岐核前'],
    enemies:{normal:'分岐残響体',fast:'二重像跳躍体',tank:'選別装甲殻',boss:'淘汰選別機構アービトレータ'},
    midboss:{enemyName:'単一化官モノリス'},
    items:{
      weapon:'分岐測定桿',shield:'二系統盾',head:'分岐照準冠',body:'二重輪郭衣',accessory:'分岐標の環',accessoryArchetype:'mag',
      weaponEpic:'分岐測定桿パラドクス',named:{name:'両側を計る測定桿',slot:'weapon',effect:'counter'},named2:{name:'二重の記録を纏う衣',slot:'body',effect:'haste'},
    },
    branch:{enemyName:'選別漏れ体',itemName:'未淘汰の欠片'},
    lore:'深緑の森に残った二重輪郭を、正史の誤差として上書きせず、生体側と境界側それぞれの記録として並行して保持し続ける層。二つの整合した記録は互いを否定せず、同じ座標が複数の歴史へ分岐しうるという性質そのものを示している。記録されない一拍の一部が、生体側にだけ痕跡として残っていたことも確認された。接続者・観測理由はまだ何も分かっていない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_36 = Object.freeze({
  ch36:['light','dark'],
});
