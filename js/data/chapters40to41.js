/* Story Expansion IV — Ch40–41 / Arc VII 重層帯
   ------------------------------------------------------------
   分岐核（Ch39）を単一へ畳み込もうとする機構を抜いた先に、
   二つどころではない数の歴史が重なり合う帯がある。第七部。
   - ch40 重層帯 — 三つ以上の記録が同時に真として保持される層
   - ch41 分流圃 — 新しい分岐の種が「植えられ」「剪定される」庭
   「分岐を始めた者」は本Arcでも明かさない。圃には管理者の
   形跡があるが、それが起源なのか代行者なのかは記録されて
   いない（STORY_CANON: 接続者・観測理由は未解決のまま保持）。 */
export const CHAPTER_EXPANSION_40_41 = Object.freeze([
  Object.freeze({
    num:40,id:'ch40',name:'重層帯',expanded:true,recLevel:[13600,14500],weaponType:'dagger',
    stageNames:['帯への踏み込み口','三重影の段','記録が重なる丘','同時点の氾濫原','輪郭過密路','真が増える座標群','重層核前庭'],
    enemies:{normal:'重層残響体',fast:'重複跳躍体',tank:'重畳装甲殻',boss:'多重畳み込み機構プルーラル'},
    midboss:{enemyName:'三系統調停官トライアド'},
    items:{
      weapon:'重層の短刃',shield:'重畳の盾',head:'多重照準の額環',body:'三つの記録を帯びる衣',accessory:'重層の標環',accessoryArchetype:'spd',
      weaponEpic:'重層の短刃トリプレット',named:{name:'三つ目の自分の刃',slot:'weapon',effect:'haste'},named2:{name:'重なりを受け止めた装衣',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'重層漏れの残獣',itemName:'三重の標片'},
    lore:'分岐核の先。ここでは「どちらか片方」ですらなく、三つ四つの記録が同時に真として保持されている。層の壁は薄く、隣の履歴の音が時折こちらへ漏れて聞こえる。奥の機構は畳み込みではなく「重ねたまま運ぶ」ことを目的としており、この世界の分岐は誰かに数えられ、運ばれ、どこかへ蓄えられている。',
  }),
  Object.freeze({
    num:41,id:'ch41',name:'分流圃',expanded:true,recLevel:[14500,15500],weaponType:'axe',
    stageNames:['圃の囲い','植え付け床の畦','剪定済みの径','芽吹き待ちの棚','分流の水場','摘まれた芽の丘','圃の中央亭'],
    enemies:{normal:'分流の芽体',fast:'間引き跳躍体',tank:'培養装甲殻',boss:'分流の剪定者セヴァランス'},
    midboss:{enemyName:'圃の巡回者ロウワー'},
    items:{
      weapon:'剪定の大斧',shield:'圃の囲い盾',head:'芽読みの額環',body:'園丁の外套',accessory:'分流の芽環',accessoryArchetype:'def',
      weaponEpic:'剪定の大斧セカンドカット',named:{name:'摘まれなかった芽の斧',slot:'weapon',effect:'awaken'},named2:{name:'剪定を逃れた外套',slot:'body',effect:'lifesteal'},
    },
    branch:{enemyName:'摘み漏れの芽獣',itemName:'流されなかった芽'},
    lore:'分岐の芽が植えられ、育ち、剪定される庭。ここに置かれた記録は「誰が植えたか」を一切持たない——持つのは管理者の手順だけだった。セヴァランスは芽を摘む者であって蒔いた者ではない。中央亭の奥、まだ誰の記録にも載っていない座標へ続く畦がある。そこに居るものが起源なのか、それとも更に先へ続く扉なのかは、まだ分からない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_40_41 = Object.freeze({
  ch40:['light','lightning'],
  ch41:['dark','fire'],
});
