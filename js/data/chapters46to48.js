/* Story Expansion VI — Ch46–48 / Arc IX 応答層
   ------------------------------------------------------------
   接続端（Ch45）の先。「分岐を観測した圃」を抜けた先は、
   分岐の記録ではなく「応答」そのものの層だった——
   世界が、こちらを見て、答えを返すようになる。

   Session 8 の主題そのもの：噂は一方的な情報ではなく、
   世界からの返答だということが、ここで初めて物語の
   表に出る。だが「誰が答えているのか」はまだ明かさない
   （STORY_CANON: 接続者・観測理由は未解決のまま保持）。

   - ch46 応答の畦道 — 歩くと応える畦。天気が「返事」のように変わる
   - ch47 集音の谷   — 世界中の噂が集まってくる谷。噂はここに届く
   - ch48 囁きの水源 — 応答の源。何かがここで「聞いている」
   ============================================================ */
export const CHAPTER_EXPANSION_46_48 = Object.freeze([
  Object.freeze({
    num:46,id:'ch46',name:'応答の畦道',expanded:true,recLevel:[20500,21800],weaponType:'instrument',
    stageNames:['答える畦','返事の辻','天気の揺らぎ路','二度鳴る空','往復する足跡','問いの続く窪地','畦道の応答端'],
    enemies:{normal:'応答の残響',fast:'返り駆ける跳響',tank:'返礼装甲殻',boss:'応答の司り手アンサラー'},
    midboss:{enemyName:'返事を待つ観測者エコール'},
    items:{
      weapon:'応答の楽器',shield:'返礼の盾',head:'聴き返す額環',body:'答えを待つ装衣',accessory:'応答の残響環',accessoryArchetype:'mag',
      weaponEpic:'応答の楽器レスポンス',named:{name:'呼びかけにだけ応える楽器',slot:'weapon',effect:'haste'},named2:{name:'答えを聴いた外套',slot:'body',effect:'lifesteal'},
    },
    branch:{enemyName:'応答漏れの残響',itemName:'応えられなかった標片'},
    lore:'接続端を越えると、畦が応え始めた。足を踏み入れると、それと同じ形の音が遠くで返る。天気も同じだ——こちらの声に合わせて雲が裂け、霧が立ち、嵐が寄る。この層の世界は記録ではなく、会話だ。だが会話の相手がこちらを見ているのか、それともただ反響に過ぎないのかは、まだ分からない。残響たちは応えるだけで、答えを持っていない。奥でアンサラーが、来るはずのない返事を待ち続けている。',
    climateId:'spirit',
  }),
  Object.freeze({
    num:47,id:'ch47',name:'集音の谷',expanded:true,recLevel:[21800,23200],weaponType:'rod',
    stageNames:['噂の集まる窪み','語り継がれる道','聞き集める谷筋','残響の交差点','三度繰り返す言葉','返事の溜まり場','谷の集音端'],
    enemies:{normal:'集音の噂殻',fast:'伝わりゆく疾響',tank:'集積装甲殻',boss:'集音の司り手ギャザラー'},
    midboss:{enemyName:'噂を束ねる者コレクタ'},
    items:{
      weapon:'集音の錫杖',shield:'集積の盾',head:'集め聴く額環',body:'噂を束ねる装衣',accessory:'集音の環',accessoryArchetype:'def',
      weaponEpic:'集音の錫杖ガザーハート',named:{name:'噂を束ねた錫杖',slot:'weapon',effect:'awaken'},named2:{name:'囁きを集めた外套',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'集音漏れの残噂',itemName:'届かなかった噂'},
    lore:'世界中の噂が、風の通り道のようにこの谷へ集まっている。ここで聞いた噂は、どこか別の場所で本当に起きたことの、少しだけ歪んだ返事だ。噂は正確ではない——だが正確でない分、真実の輪郭だけを残して届く。残噂たちは「聞かれたがった何か」の形をして集まり、ギャザラーはそれを束ねて一つの声にしている。誰のための声かは、まだ分からない。',
    climateId:'deep',
  }),
  Object.freeze({
    num:48,id:'ch48',name:'囁きの水源',expanded:true,recLevel:[23200,24800],weaponType:'axe',
    stageNames:['噂の湧く窪地','水源の入口','囁きの滲む壁','応答の流れ込み','聞く者の前庭','水源の最奥部','囁きの泉'],
    enemies:{normal:'囁きの滲み体',fast:'湧き上がる跳響',tank:'水源装甲殻',boss:'水源の聴き手リスナー'},
    midboss:{enemyName:'泉を守る者スプリングガード'},
    items:{
      weapon:'水源の斧',shield:'湧き水の盾',head:'聴く者の額環',body:'囁きに浸る装衣',accessory:'水源の環',accessoryArchetype:'atk',
      weaponEpic:'水源の斧スプリング',named:{name:'聞き続けた斧',slot:'weapon',effect:'counter'},named2:{name:'泉に浸った外套',slot:'body',effect:'awaken'},
    },
    branch:{enemyName:'水源漏れの残響',itemName:'聞き届けられなかった標片'},
    lore:'全ての応答がここへ流れ込む水源。噂はここから湧き、世界のどこかで誰かの耳に届く——そして届いた噂は、ここへ流れ戻る。リスナーは泉の底で、世界の声をずっと聞き続けている。聞いているのか、聞かれているのか。その区別がつかないまま、この層は応答を続けている。「分岐を始めた者」はここにも居ない。居るのは、聞くことをやめられない何かだ。',
    climateId:'water',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_46_48 = Object.freeze({
  ch46:['spirit','mist'],
  ch47:['water','deep'],
  ch48:['water','spirit'],
});
