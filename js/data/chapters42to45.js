/* Story Expansion V — Ch42–45 / Arc VIII 未踏座標
   ------------------------------------------------------------
   分流圃（Ch41）の中央亭の奥、「誰の記録にも載っていない座標」
   へ続く畦を辿った先。第八部。
   - ch42 未踏座標域 — どの帳簿にも存在しないはずの領域
   - ch43 黙録棚 — 書かれたが一度も読まれなかった記録の棚
   - ch44 囲いの外 — 圃の囲いの外側、植えられなかった分岐の野
   - ch45 接続端 — 全ての畦が静かに一点へ寄る端部
   「分岐を始めた者」は本Arcでも明かさない。接続端には
   「何かへ繋がっている」形跡だけがある（STORY_CANON:
   接続者・観測理由は未解決のまま保持）。 */
export const CHAPTER_EXPANSION_42_45 = Object.freeze([
  Object.freeze({
    num:42,id:'ch42',name:'未踏座標域',expanded:true,recLevel:[15500,16600],weaponType:'staff',
    stageNames:['座標なき窪地','帳簿の抜け殻','読まれない道標','座標の合い間','空白の記述群','名のない分岐点','座標域の果て'],
    enemies:{normal:'未記述の残片',fast:'座標外の跳梁',tank:'帳外装甲殻',boss:'未記録の綴じ手バインダー'},
    midboss:{enemyName:'空白頁の観測者ページレス'},
    items:{
      weapon:'座標外の杖',shield:'帳簿外の盾',head:'未記述の額環',body:'どこにも属さない衣',accessory:'座標なき標環',accessoryArchetype:'mag',
      weaponEpic:'座標外の杖アンライト',named:{name:'帳簿に載らなかった杖',slot:'weapon',effect:'awaken'},named2:{name:'座標を失った外套',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'座標漏れの残獣',itemName:'記述されなかった標片'},
    lore:'畦を辿った先は、どの帳簿にも座標として存在しない領域だった。地図にないから無いのではなく、ここは「記すこと」そのものが追いついていない。残片たちは誰の記録にも属さず、だからこそ倒れても欠けない——残るのは出会った記憶だけだ。奥では綴じ手が、載せられるはずだった頁をまだ拾い集めている。',
  }),
  Object.freeze({
    num:43,id:'ch43',name:'黙録棚',expanded:true,recLevel:[16600,17800],weaponType:'knuckle',
    stageNames:['棚の入口','読み手なき段','黙した書庫路','背表紙の回廊','閉じた頁の棚','読み捨ての窪み','棚の最奥'],
    enemies:{normal:'黙録の頁影',fast:'捲られない疾頁',tank:'装丁装甲殻',boss:'黙録の守架ライブラリアン'},
    midboss:{enemyName:'黙読の検索者インデクサ'},
    items:{
      weapon:'黙録の拳具',shield:'装丁の盾',head:'黙読の額環',body:'書庫番の外套',accessory:'黙録の栞環',accessoryArchetype:'def',
      weaponEpic:'黙録の拳具アンリード',named:{name:'誰にも読まれなかった拳',slot:'weapon',effect:'haste'},named2:{name:'開かれなかった装衣',slot:'body',effect:'lifesteal'},
    },
    branch:{enemyName:'棚漏れの残頁',itemName:'読まれなかった栞'},
    lore:'書かれたが一度も読まれなかった記録の棚。分岐は起きた。だがその出来事を知る者はいない——記録は作られたあと、誰にも届かず棚へ挿された。ライブラリアンは読み手を待っているのではなく、「読まれないこと」を守っている。読まれると、頁は少しずつ薄れていくという。',
  }),
  Object.freeze({
    num:44,id:'ch44',name:'囲いの外',expanded:true,recLevel:[17800,19100],weaponType:'bow',
    stageNames:['囲いの裂け目','野生の分岐原','植えられなかった野','剪定の届かぬ丘','誰の圃でもない斜面','外縁の水場','囲いの外の果て'],
    enemies:{normal:'野生の分岐獣',fast:'外縁の疾駆獣',tank:'荒野装甲殻',boss:'囲い外の獣王ワイルドマーク'},
    midboss:{enemyName:'未管理の徘徊者ノーマード'},
    items:{
      weapon:'荒野の長弓',shield:'囲い外の盾',head:'野生の額環',body:'どの圃にも植えられなかった外套',accessory:'野外の標環',accessoryArchetype:'spd',
      weaponEpic:'荒野の長弓フェラル',named:{name:'植えられなかった者の弓',slot:'weapon',effect:'counter'},named2:{name:'剪定を知らない外套',slot:'body',effect:'awaken'},
    },
    branch:{enemyName:'囲い漏れの残獣',itemName:'管理されなかった標片'},
    lore:'圃の囲いの外側。ここの分岐は植えられたのでも剪定されたのでもなく、ただ生えた。管理された分岐と野生の分岐——同じ構造のはずなのに、野生の分岐は記録のどれよりも「うるさい」。ノーマードは管理者にも分岐にも属さない。囲いの外側がこれほど広いことを、圃の管理手順は知らない。',
  }),
  Object.freeze({
    num:45,id:'ch45',name:'接続端',expanded:true,recLevel:[19100,20500],weaponType:'sword',
    stageNames:['畦の集まる窪み','端部の踏み込み口','合流する記述','端に寄る分岐','繋がる形跡','接続端の前庭','端部の最奥'],
    enemies:{normal:'接続の残端体',fast:'端走りの跳躍体',tank:'終端装甲殻',boss:'接続端の守り手ターミナス'},
    midboss:{enemyName:'繋がりの観測者リンケージ'},
    items:{
      weapon:'接続端の大剣',shield:'終端の盾',head:'接続の額環',body:'端に至った装衣',accessory:'接続端の標環',accessoryArchetype:'atk',
      weaponEpic:'接続端の大剣ターミナル',named:{name:'どこかへ繋がる剣',slot:'weapon',effect:'awaken'},named2:{name:'端を越えた外套',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'接続漏れの残端',itemName:'繋がらなかった標片'},
    lore:'全ての畦が静かに一点へ寄る端部。分岐が「始められた」なら、その起点はもう少し先にある——だがここにあるのは接続の形跡だけで、接続先も、接続者も、接続の意味も、まだどの記録にもない。ターミナスは端を守る者ではなく、「端の先はまだ書かれていない」ことを伝えているだけかもしれない。分岐を始めた者は、ここには居ない。居るのは、繋がろうとしている形跡だけだ。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_42_45 = Object.freeze({
  ch42:['dark','spirit'],
  ch43:['light','spirit'],
  ch44:['wind','earth'],
  ch45:['lightning','dark'],
});
