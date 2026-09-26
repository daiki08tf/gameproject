/* Story Expansion III — Ch37–39 / Arc VI 分岐航路 続行
   ------------------------------------------------------------
   分岐記録（Ch36）で確立した「同じ座標が複数の歴史を持つ」事実を
   辿り、その発生源へ向かう第六部後半。
   - ch37 淘汰累層 — 選ばれなかった記録が積もる層
   - ch38 双照回廊 — 二つの記録が互いを照らし続ける回廊
   - ch39 分岐核 — 分岐そのものを産み出す核と、それを単一へ
     畳み込もうとする機構
   「分岐を産んだ者が何者か」は本Arcでも明かさない
   （STORY_CANON: 接続者・観測理由は未解決のまま保持）。 */
export const CHAPTER_EXPANSION_37_39 = Object.freeze([
  Object.freeze({
    num:37,id:'ch37',name:'淘汰累層',expanded:true,recLevel:[11200,11900],weaponType:'knuckle',
    stageNames:['棄却棚の入口','残滓堆積路','没収された座標棚','淘汰簿の天井下','系統断片の谷底','取り零された歴史','累層最深部'],
    enemies:{normal:'淘汰残滓体',fast:'秒差跳躍体',tank:'消去装甲殻',boss:'選別廃棄機構カルネル'},
    midboss:{enemyName:'残滓統合官レグレット'},
    items:{
      weapon:'淘汰の拳甲',shield:'棄却棚の盾',head:'残滓読みの額環',body:'消去されなかった衣',accessory:'累層の標片',accessoryArchetype:'def',
      weaponEpic:'淘汰の拳甲プラウン',named:{name:'選ばれなかった腕',slot:'weapon',effect:'awaken'},named2:{name:'棄てられた者の鎧',slot:'body',effect:'lifesteal'},
    },
    branch:{enemyName:'淘汰漏れの残獣',itemName:'残滓の名札'},
    lore:'分岐で選ばれなかった記録は消去されず、層の底へ積もり続けていた。ここに集まるものは「もう一つのありえた結果」の残骸であり、誰かが定期的に棚卸しをしている形跡がある。棚の奥には、まだどの系統にも属さない新しい残滓が流れ着いている —— 分岐は今も続いている。',
  }),
  Object.freeze({
    num:38,id:'ch38',name:'双照回廊',expanded:true,recLevel:[11900,12700],weaponType:'bow',
    stageNames:['二重照明路','鏡合わせの架橋','相互証明の広間','輪郭すれ違い廊下','双写の中庭','記録の舞踏場','回廊終端'],
    enemies:{normal:'双照偏移体',fast:'残光跳躍体',tank:'双写装甲殻',boss:'二系統統合機構コンフルクス'},
    midboss:{enemyName:'照合の舞手ツインシール'},
    items:{
      weapon:'双照の長弓',shield:'鏡合わせの盾',head:'双写照準冠',body:'二つの記録を着る衣',accessory:'双照の標環',accessoryArchetype:'spd',
      weaponEpic:'双照の長弓デュアル',named:{name:'もう一人の自分が持つ弓',slot:'weapon',effect:'counter'},named2:{name:'対になった記録の装衣',slot:'body',effect:'haste'},
    },
    branch:{enemyName:'照合漏れの双獣',itemName:'片割れの照標'},
    lore:'二つの記録が互いを否定せず照らし合う回廊。ここでは同じ事象が二度起きたように記録され、どちらも真として保持される。回廊の終端には二系統を一つへ畳み込もうとする機構の気配があり、その先の核が分岐を産み続けていると推測できる。',
  }),
  Object.freeze({
    num:39,id:'ch39',name:'分岐核',expanded:true,recLevel:[12700,13600],weaponType:'sword',
    stageNames:['核への降下路','単一化圏の縁','記録統合の環','逸脱照査回廊','分岐点の座標台','二つの輪郭の中心','分岐核'],
    enemies:{normal:'統合残響体',fast:'分岐跳躍体',tank:'単一化装甲殻',boss:'単一化中枢ユニタス'},
    midboss:{enemyName:'収束執行官シングル'},
    items:{
      weapon:'分岐核の剣',shield:'単一化圏の盾',head:'収束照準冠',body:'統合されなかった衣',accessory:'分岐点の標環',accessoryArchetype:'atk',
      weaponEpic:'分岐核の剣デュプリケート',named:{name:'二つの歴史を背負う剣',slot:'weapon',effect:'counter'},named2:{name:'統合を拒んだ衣',slot:'body',effect:'awaken'},
    },
    branch:{enemyName:'未統合の残獣',itemName:'分岐点の欠片'},
    lore:'分岐記録の中心。ここでは「どちらか片方だけが真」という機構自体が稼働しており、ユニタスは二系統を一つへ畳み込むためにここへ来た者を選別し続ける。核の奥には更に深い重なりがあるが、その輪郭はまだ二つどころではない —— 誰が分岐を始めたのかは、この層からもまだ見えない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_37_39 = Object.freeze({
  ch37:['dark','poison'],
  ch38:['light','dark'],
  ch39:['dark','light','lightning'],
});
