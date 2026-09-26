/* ============================================================
   Session 8 — Rumor Network 2.0
   ------------------------------------------------------------
   Extends the canonical rumor authority (world2.discoveries +
   state.rumorNotebook() + RUMOR_STATES), following the exact
   multi-entry thread shape established by js/data/ch1RumorThreads.js.
   Nothing here is a quest and nothing here is a new save root:
   records are derived each sync from stage clears, the Codex,
   Species Mastery, witnessed weather/daypart, and other rumors.

   New unlock vocabulary (evaluated in js/patches/rumorNetwork.js):
     {type:'weatherSeen', weatherId}      – world2.weatherSeen[id]
     {type:'daypartSeen', daypartId}      – world2.daypartSeen[id]
     {type:'wildMutation', state:'seen'|'killed'|'recruited', mutationId?}
     {type:'mastery', speciesId, min}     – state.speciesMasteryLevel
     {type:'rumorState', rumorId, state}  – another thread's state id
     {type:'discovered', id}              – world2.discoveries[id] exists
     {type:'clearedCount', min}           – total cleared stages
     …plus all of ch1RumorThreads' vocabulary.

   `reliability` is flavor-declared per thread:
     clear / vague / conditional / exaggerated / fragmentary
   It does not gate mechanics — it colors how much the player should
   trust a line (ambiguous ≠ fake; fake rumors are forbidden).

   `intel` marks threads that sharpen the hunt:
     intel:{mutations:[ids], enemyTypes:[...], regions:[climateId]}
   While a thread is known (unresolved+), mutationRuntime adds
   rumorBoost to matching rolls — knowledge creates agency.

   `converges` marks threads whose resolution DEPENDS on other
   threads reaching 'tracking' or 'resolved' — multi-rumor secrets.
   ============================================================ */

export const RUMOR_RELIABILITY = Object.freeze({
  clear: '確かな話',
  vague: '曖昧な話',
  conditional: '条件つきの話',
  exaggerated: '尾ひれのついた話',
  fragmentary: '断片的な話',
});

export const SESSION8_RUMOR_THREADS = Object.freeze([
  /* ----------------------------------------------------------
     1. 忘鐘の墓道 — multi-rumor convergence target.
     「灰原では夜になると鐘の音がする」×「鐘が三度鳴ると死者は
     東へ歩く」×「東の崖には道などない」→ 夜＋霧/灰＋Grave能力
     = hidden route side8_bellgrave.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'night_bells',
    title: '灰原の夜鐘',
    category: 'location', reliability: 'conditional',
    hint: '灰を被った土地で聞ける話。',
    intel: { climates: ['grave'] },
    entries: [
      Object.freeze({ id: 'bell_heard', type: 'initial', source: '墓守の老女', order: 1, unlock: { type: 'stage', stageId: '11-5' },
        text: '「灰の原っぱでは、夜になると鐘が鳴るんだよ。あそこには塔なんてないのにね」' }),
      Object.freeze({ id: 'bell_thrice', type: 'testimony', source: '旅の祈祷師', order: 2, unlock: { type: 'daypartSeen', daypartId: 'night' },
        text: '「鐘が三度鳴ると、死者は東へ歩くらしい」と祈祷師は言った。「それが本当なら、誰かが葬列を率いていることになる」' }),
      Object.freeze({ id: 'cliff_denial', type: 'testimony', source: '猟師', order: 3, unlock: { type: 'rumorEntryCount', rumorId: 'night_bells', min: 2 },
        text: '「東の崖？　あそこに道などない。獣すら通らんよ」と猟師は断言した。しかしそれなら、死者はどこへ歩いているのか。' }),
      Object.freeze({ id: 'mist_mouth', type: 'field', source: '現地の観察', order: 4, unlock: { type: 'weatherSeen', weatherId: 'mist' },
        text: '霧の立つ夜に戻ると、崖の輪郭が噂と違って見えた。霧が厚い時だけ、崖の腹に「隙間のようなもの」が浮く。' }),
      Object.freeze({ id: 'bell_resolved', type: 'followup', source: '篝火の旅人', order: 5, unlock: { type: 'stage', stageId: 'bg8-3' },
        text: '忘鐘の墓道を踏破した話を聞いて、老女は手を合わせた。「鐘は迎えの音だったのかもしれないね」', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     2. 白い獣 — the mission's example, kept close to spec.
     Storm + high ground → albino/charged mutation hunting intel.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'white_beast',
    title: '嵐の上の白い獣',
    category: 'monster', reliability: 'exaggerated',
    hint: '峰を見上げる者から聞ける話。',
    intel: { mutations: ['albino', 'charged'], climates: ['storm'] },
    entries: [
      Object.freeze({ id: 'first_sighting', type: 'initial', source: '荷運び', order: 1, unlock: { type: 'stage', stageId: '15-5' },
        text: '「雷雨の夜にさ、雷鳥の峰より高いところで、白い獣を見たんだ。いや、白かったかどうかも怪しい。稲光でね」' }),
      Object.freeze({ id: 'sky_shaped', type: 'testimony', source: '帰らない猟師の仲間', order: 2, unlock: { type: 'rumorEntryCount', rumorId: 'white_beast', min: 1 },
        text: '「空を飛ぶ獣だった。いや、空そのものが獣の形をしていた」――本人の言い伝えだそうだ。よく分からない。' }),
      Object.freeze({ id: 'mutation_known', type: 'field', source: 'Codexの知識', order: 3, unlock: { type: 'wildMutation', state: 'seen' },
        text: 'あれは変異個体だったかもしれない。同じ種でも、ごく稀に「違う生き方をした個体」がいる。嵐の夜にだけ姿を見せるのなら、条件を揃えれば探せる。' }),
      Object.freeze({ id: 'white_resolved', type: 'return', source: '自らの観測', order: 4, unlock: { type: 'wildMutation', state: 'killed', mutationId: 'albino' },
        text: '噂の白い獣を討ち取った。空そのもの、というのは言い過ぎだった。だが稲光の中の白は、確かに一瞬、空の輪郭に見えた。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     3. 角の男の露天 — three contradictory sources → hidden merchant.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'horned_merchant',
    title: '角の男の露天',
    category: 'merchant', reliability: 'vague',
    hint: '旧道の噂を聞き集めた者だけが辿り着く。',
    intel: { merchants: ['lantern_broker'] },
    entries: [
      Object.freeze({ id: 'merchant_denial', type: 'initial', source: '行商人', order: 1, unlock: { type: 'clearedCount', min: 10 },
        text: '「北の旧道？　今じゃ誰も通らん。人も住んでいないさ」と行商人は笑った。' }),
      Object.freeze({ id: 'hunter_light', type: 'testimony', source: '猟師', order: 2, unlock: { type: 'clearedCount', min: 15 },
        text: '「だが昨夜、旧道の向こうで灯りを見た」と猟師は言う。誰も住んでいない道に、灯りはつかないはずだ。' }),
      Object.freeze({ id: 'child_sword', type: 'testimony', source: '子供', order: 3, unlock: { type: 'daypartSeen', daypartId: 'dusk' },
        text: '「角のあるおじさんがね、キラキラした剣をいっぱい持ってた！」子供の話はいつも大げさだ。――大げさなだけ、のはずだった。' }),
      Object.freeze({ id: 'dusk_route', type: 'field', source: '篝火の噂', order: 4, unlock: { type: 'discovered', id: 'merchant_lantern_broker' },
        text: '夕から夜に変わる頃、旧道の外れに確かに灯りが点る。角のある男は本当にいて、品物を売っている。噂は三つとも少しだけ間違っていたが、三つ合わせると正しかった。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     4. 沈みゆく離宮 — chain-dungeon foreshadow chain.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'sunken_manse',
    title: '沈みゆく離宮',
    category: 'dungeon', reliability: 'fragmentary',
    hint: '水没した土地の話。',
    intel: { climates: ['water'] },
    entries: [
      Object.freeze({ id: 'drowned_lord', type: 'initial', source: '漁師', order: 1, unlock: { type: 'stage', stageId: 'fg-2' },
        text: '「水没坑道のずっと先、湖の底に、昔の領主の離宮が丸ごと沈んでいる」という話を漁師がした。' }),
      Object.freeze({ id: 'air_pockets', type: 'testimony', source: '潜りの名人', order: 2, unlock: { type: 'rumorEntryCount', rumorId: 'tide_scavenger', min: 2 },
        text: '離宮は水に沈んだが、中に空気の残る部屋がいくつもあるらしい。潜れる仲間がいれば、廊下の先まで辿れるだろう。' }),
      Object.freeze({ id: 'lift_rumor', type: 'testimony', source: '流れ着いた仕立て屋', order: 3, unlock: { type: 'stage', stageId: 'sm8-2' },
        text: '「昇降機が残っているはずよ。動くかどうかは――機械の仲間がいれば分かるでしょうね」' }),
      Object.freeze({ id: 'vault_below', type: 'followup', source: '古い家系図', order: 4, unlock: { type: 'stage', stageId: 'sm8-4' },
        text: '離宮の一番深い間は、領主が「外の誰にも見せなかった部屋」だったという。床の裂け目の先に、宝物庫があるかもしれない。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     5. 歩く死骸 — ghostly/ash ecology.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'walking_corpse',
    title: '灰の中を歩く者',
    category: 'monster', reliability: 'clear',
    hint: '灰の降る土地の噂。',
    intel: { mutations: ['ghostly', 'abyssal'], climates: ['grave', 'ash'] },
    entries: [
      Object.freeze({ id: 'walker_seen', type: 'initial', source: '巡回兵', order: 1, unlock: { type: 'weatherSeen', weatherId: 'ash' },
        text: '「灰降りの晩に墓標の間を歩く影を見た。追うと、灰の中に消えた」と巡回兵は震えていた。' }),
      Object.freeze({ id: 'walker_codex', type: 'field', source: 'Codexの知識', order: 2, unlock: { type: 'mastery', speciesId: 'ash_soldier', min: 3 },
        text: '灰骸兵の生態を知る者なら推測できる――あれは死んだのではない。幽体化した個体が、灰の中でだけ実体を保っている。' }),
      Object.freeze({ id: 'walker_resolved', type: 'return', source: '自らの観測', order: 3, unlock: { type: 'wildMutation', state: 'killed', mutationId: 'ghostly' },
        text: '幽体の個体を斃した。消えたのではなく、灰に溶けていただけだった。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     6. 機械の暴走 — rampage mutation + machine region.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'broken_machine',
    title: '機械の獣の夜泣き',
    category: 'monster', reliability: 'vague',
    hint: '鉄と油の匂いのする噂。',
    intel: { mutations: ['rampage', 'crystallized'], climates: ['machine'] },
    entries: [
      Object.freeze({ id: 'gear_cry', type: 'initial', source: '鍛冶職人', order: 1, unlock: { type: 'stage', stageId: '13-5' },
        text: '「炉の奥で、機械の獣が獣とも機械ともつかない声で鳴いていた」と職人は言った。「暴走しているのか、泣いているのか」' }),
      Object.freeze({ id: 'core_seen', type: 'field', source: '冒険者仲間', order: 2, unlock: { type: 'weatherSeen', weatherId: 'storm' },
        text: '嵐の夜だけ、機械の個体の核が過剰に光るらしい。雷に当たった機械の獣は、元に戻らないことがある。' }),
      Object.freeze({ id: 'machine_resolved', type: 'return', source: '自らの観測', order: 3, unlock: { type: 'wildMutation', state: 'killed', mutationId: 'rampage' },
        text: '暴走核の個体を止めた。泣いていたのかもしれない。止めてからも、核はまだ光り続けていた。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     7. 古血の社 — oldblood at dawn/dusk.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'old_blood',
    title: '古い血の集まる場所',
    category: 'monster', reliability: 'fragmentary',
    hint: '暁の社の噂。',
    intel: { mutations: ['oldblood'], dayparts: ['dawn', 'dusk'] },
    entries: [
      Object.freeze({ id: 'old_shrine', type: 'initial', source: '記録官', order: 1, unlock: { type: 'clearedCount', min: 40 },
        text: '「暁の社には『古い血』が集まる」——古い記録にそうある。古い血とは、系譜のことか、それとも個体のことか。' }),
      Object.freeze({ id: 'dawn_gather', type: 'testimony', source: '夜明けの猟師', order: 2, unlock: { type: 'daypartSeen', daypartId: 'dawn' },
        text: '暁と夕の境目にだけ、どこか見覚えのある獣が「少しだけ違う顔」で群れに混ざるという。' }),
      Object.freeze({ id: 'oldblood_resolved', type: 'return', source: '自らの観測', order: 3, unlock: { type: 'wildMutation', state: 'killed', mutationId: 'oldblood' },
        text: '古血の個体と出会った。あの社に集まっていたのは系譜ではなく、個体だった――生きたまま残った、原初の血。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     8. 嵐鳥の座 — links rumor → existing side_stormroost.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'storm_roost',
    title: '嵐に座する者',
    category: 'roamer', reliability: 'conditional',
    hint: '嵐の日にだけ届く噂。',
    intel: { climates: ['storm'], weathers: ['storm'] },
    entries: [
      Object.freeze({ id: 'roost_silence', type: 'initial', source: '登山者', order: 1, unlock: { type: 'stage', stageId: '24-5' },
        text: '「嵐の日の営巣地は異様に静かだ。嵐が鳥の声を呑んでいるのか、鳥が嵐を静めているのか」' }),
      Object.freeze({ id: 'storm_presence', type: 'testimony', source: '狩人', order: 2, unlock: { type: 'weatherSeen', weatherId: 'storm' },
        text: '嵐の中で名もなき強敵の気配を感じた、という狩人の報告がある。嵐の日こそ、営巣の主が姿を見せるのかもしれない。' }),
      Object.freeze({ id: 'roost_resolved', type: 'return', source: '巣穴の記録', order: 3, unlock: { type: 'stage', stageId: 'sr-2' },
        text: '嵐鳥の営巣の深部を踏破した。嵐は鳥が呼んでいたのではなく、鳥の縄張りそのものが嵐だった。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     9. 月蝕 — eclipse mutation, night hinting.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'eclipse_child',
    title: '昼にいない獣',
    category: 'monster', reliability: 'vague',
    hint: '子供の口に上る噂。',
    intel: { mutations: ['eclipse'], dayparts: ['night', 'dusk'] },
    entries: [
      Object.freeze({ id: 'day_absent', type: 'initial', source: '子供', order: 1, unlock: { type: 'clearedCount', min: 25 },
        text: '「昼に探しに行ってもいないんだ。夜に来ると、あの子だけいるの」子供は「あの子」が何の種かを説明できなかった。' }),
      Object.freeze({ id: 'shadow_thin', type: 'field', source: 'Codexの知識', order: 2, unlock: { type: 'daypartSeen', daypartId: 'night' },
        text: '影の薄い時間にだけ姿を見せる個体――月蝕の適応。夜に戻れば、あるいは。' }),
      Object.freeze({ id: 'eclipse_resolved', type: 'return', source: '自らの観測', order: 3, unlock: { type: 'wildMutation', state: 'killed', mutationId: 'eclipse' },
        text: '月蝕の個体を見つけた。昼にいないのではなく、昼は世界があの子の方を見ていなかっただけだ。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     10. 深淵の適応者 — abyssal mutation at depth.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'deep_adapted',
    title: '深く沈んだ目',
    category: 'monster', reliability: 'fragmentary',
    hint: '深淵から戻った者の噂。',
    intel: { mutations: ['abyssal', 'crystallized'], climates: ['deep'] },
    entries: [
      Object.freeze({ id: 'deep_eyes', type: 'initial', source: '深淵帰り', order: 1, unlock: { type: 'stage', stageId: 'dw-1' },
        text: '「深層で見た獣は、目が深淵の色をしていた。同じ種のはずなのに、あれはもう浅い場所の生き物ではなかった」' }),
      Object.freeze({ id: 'adapted_resolve', type: 'return', source: '自らの観測', order: 2, unlock: { type: 'wildMutation', state: 'killed', mutationId: 'abyssal' },
        text: '深淵適応の個体を斃した。噂は正しかった――深く沈んだ場所は、生き物の形まで変える。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     11. 潮溜まりの拾い手 — second hidden merchant (rain).
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'tide_scavenger',
    title: '潮溜まりの拾い手',
    category: 'merchant', reliability: 'vague',
    hint: '雨の日にだけ姿を見せる者の噂。',
    intel: { merchants: ['tide_scavenger'], weathers: ['rain'] },
    entries: [
      Object.freeze({ id: 'rain_figure', type: 'initial', source: '水門の番人', order: 1, unlock: { type: 'stage', stageId: 'fg-1' },
        text: '「雨の日に限って、潮溜まりに何かを拾い集める影がいる。近づくと消える」と番人は言う。' }),
      Object.freeze({ id: 'trade_offer', type: 'testimony', source: '密売人', order: 2, unlock: { type: 'weatherSeen', weatherId: 'rain' },
        text: '「拾い手は拾うだけじゃない。見せれば、拾ったものを売ってもくれる」' }),
      Object.freeze({ id: 'scavenger_resolved', type: 'return', source: '取引の記録', order: 3, unlock: { type: 'discovered', id: 'merchant_tide_scavenger' },
        text: '潮溜まりの拾い手と会い、物々交換をした。消えるのではなく、雨の中に戻っていただけだった。', resolves: true }),
    ],
  }),

  /* ----------------------------------------------------------
     12. 白い窪み — late secret: mutation-hunt location.
     ---------------------------------------------------------- */
  Object.freeze({
    id: 'white_hollow',
    title: '白い窪みの目撃',
    category: 'location', reliability: 'exaggerated',
    hint: '深層の報告書の余白に書かれた話。',
    intel: { mutations: ['albino', 'crystallized'], climates: ['deep'] },
    entries: [
      Object.freeze({ id: 'hollow_note', type: 'initial', source: '深層の報告書', order: 1, unlock: { type: 'stage', stageId: 'ur-1' },
        text: '未記録の座標の調査報告の余白に、走り書きが残る。「霧の夜、窪みに白い何かが集まる。多すぎる。近づくな」' }),
      Object.freeze({ id: 'hollow_alive', type: 'field', source: '現地の観察', order: 2, unlock: { type: 'weatherSeen', weatherId: 'mist' },
        text: '霧の立つ夜、未記録の座標の外れに窪みがあった。白い個体の抜け殻が、何重にも重なっている。まだ何かが住んでいる。' }),
      Object.freeze({ id: 'hollow_resolved', type: 'return', source: '自らの観測', order: 3, unlock: { type: 'stage', stageId: 'wh8-2' },
        text: '白い窪みの奥まで辿った。抜け殻は群れのものではなく、おそらく一つの個体が脱皮し続けたものだった。それが今もどこかにいる。', resolves: true }),
    ],
  }),
]);

const INDEX = new Map(SESSION8_RUMOR_THREADS.map((r) => [r.id, r]));
export function session8RumorThread(id) { return INDEX.get(id) || null; }

/* ------------------------------------------------------------
   Multi-rumor convergence: secrets that only "exist" once several
   rumor threads converge. Pure rule data; the runtime resolves the
   state and writes a single discovery record when all conditions
   hold. `reveal` names the hidden thing the convergence unlocks.
   ------------------------------------------------------------ */
export const SESSION8_CONVERGENCES = Object.freeze([
  Object.freeze({
    id: 'conv_bellgrave',
    name: '鐘と崖と死者の合点',
    hint: '夜の鐘・東へ歩く死者・ないはずの道――三つの噂が同じ場所を指している。霧か灰の夜、墓の仲間が崖の「隙間」を見つけられるはずだ。',
    needs: [
      { type: 'rumorEntries', rumorId: 'night_bells', min: 3 },
      { type: 'weatherSeenAny', weathers: ['mist', 'ash'] },
      { type: 'daypartSeenAny', dayparts: ['night', 'dusk'] },
    ],
    reveal: { chapterId: 'side8_bellgrave' },
  }),
  Object.freeze({
    id: 'conv_sunken_manse',
    name: '沈んだ離宮の在処',
    hint: '湖底の離宮は実在する。冠水路・昇降機・見えない廟室・裂け目の宝物庫――仲間の数だけ深くまで潜れる。',
    needs: [
      { type: 'rumorEntries', rumorId: 'sunken_manse', min: 2 },
      { type: 'stageCleared', stageId: 'fg-2' },
    ],
    reveal: { chapterId: 'side8_sunkenmanse' },
  }),
  Object.freeze({
    id: 'conv_white_hollow',
    name: '白い窪みの方向',
    hint: '報告書の余白、霧の夜の窪み、そして変異個体の目撃。白い窪みは深層の外れで、霧の夜にだけ「場所」になる。',
    needs: [
      { type: 'rumorEntries', rumorId: 'white_hollow', min: 2 },
      { type: 'wildMutationAny', state: 'seen' },
      { type: 'weatherSeenAny', weathers: ['mist'] },
    ],
    reveal: { chapterId: 'side8_whitehollow' },
  }),
]);
