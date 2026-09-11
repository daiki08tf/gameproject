/* ============================================================
   Living World & Discovery C9-1 — Field Knowledge
   ------------------------------------------------------------
   Pure data + pure helpers (no state.js/DOM dependency), matching
   the convention already used by js/data/archaeology.js and
   js/data/treasureHunt.js.

   C9's own goal: move Codex from "things already found" toward
   "knowledge that develops through play", and names concretely what
   that knowledge should "reveal or clarify": "...Treasure hints;
   Archaeology interpretation..." among others. This connects the
   EXISTING per-enemy knowledge ladder (codexEnemyKnowledge.js's
   state.enemyKnowledge() -- `roleKnown` becomes true on a real kill,
   not a new flag) to Archaeology's Reconstructed Records and Treasure
   Hunt's resolution text, both already shipped (C4/C5). Deliberately
   FLAVOR ONLY, same principle C6-8's companion reactions already
   established: a record/hunt still unlocks on its own existing
   condition regardless of field knowledge -- this never gates
   anything, it only supplements the text once the player has
   genuinely fought their way through a region's own creatures.

   `regionFieldKnowledgeReady` takes a plain array of booleans (one per
   the region's native enemy types' roleKnown flag, built by the
   runtime patch) so it stays trivially testable -- "ready" once at
   least half of a region's native species have had their role
   learned through a real kill.
   ============================================================ */

export function regionFieldKnowledgeReady(known = []) {
  if (!known.length) return false;
  return known.filter(Boolean).length / known.length >= 0.5;
}

// One field note per Archaeology Reconstructed Record (data/archaeology.js's
// RECONSTRUCTED_RECORDS ids) -- shown appended to the record's own text
// once regionFieldKnowledgeReady() is true for that record's region.
export const ARCHAEOLOGY_FIELD_NOTES = Object.freeze({
  frontier_record: 'この地に潜む魔物たちの気性を知ってから読み返すと、開拓者たちが何と戦いながら記録を残したのかが、行間からうっすら見えてくる。',
  elemental_record: '四境に棲む獣たちの性質を知ってから見直すと、観測者たちが測ろうとしていたものの輪郭が、より鮮明に浮かび上がる。',
  fracture_record: 'この地で戦う敵の癖を知ってから読むと、指揮官が率いていた戦がどれほど過酷だったか、記録の余白からも伝わってくる。',
  last_mortal_record: '人界最奥の魔物たちと渡り合ってから見返すと、機城建造以前の記録に刻まれた「封鎖」の意味が、以前より重く感じられる。',
});

// One field note per Treasure Hunt chain (data/treasureHunt.js's
// TREASURE_HUNT_CHAINS ids) -- shown appended to the chain's own
// resolutionText once regionFieldKnowledgeReady() is true for that
// chain's region.
export const TREASURE_HUNT_FIELD_NOTES = Object.freeze({
  frontier_cache: 'この地の魔物たちの気性を知ったうえで見ると、開拓者が木箱をここに隠した理由が、なんとなく分かる気がする。',
  elemental_cache: '四境の獣たちの性質を知ったうえで見ると、観測者がここに道具箱を隠した意図が、より腑に落ちる。',
  fracture_cache: 'この地の敵の戦い方を知ったうえで見ると、指揮官がこの場所を選んだ理由が、より納得できる。',
  last_mortal_cache: '人界最奥の魔物たちを知ったうえで見ると、保管庫がここまで人目を避けて隠されていた理由が分かる気がする。',
});

// C9-2: one field note per region's own ヌシ (master fish, data/fishing.js's
// FISH_SPECIES `master:true` entry) -- the "Fishing hints" item from C9's
// own goal list. Shown appended to the ヌシ's own flavor text once
// regionFieldKnowledgeReady() is true for that fish's region, same gate
// and same "supplement, never gate the catch itself" principle as the
// Archaeology/Treasure Hunt notes above.
export const FISHING_FIELD_NOTES = Object.freeze({
  frontier_nushi: 'この地の魔物たちの気性を知ってから話を聞き直すと、老いた住民が語る「開拓前からいる主」の話が、ただの言い伝え以上に思えてくる。',
  elemental_nushi: '四境の獣たちの性質を知ってから見ると、見る角度で色が違って見えるという話が、この山域そのものの性質と重なって見えてくる。',
  fracture_nushi: 'この地の敵の戦い方を知ってから見ると、姿の定まらないという噂が、境界裂域の歪みそのものを映しているように思えてくる。',
  last_mortal_nushi: '人界最奥の魔物たちを知ってから見ると、誰も釣り上げたことがないという主の話が、この淵の深さをより実感させる。',
});

// C9-3: one field note per region (data/world3Regions.js's WORLD3_REGIONS
// ids) -- the "Rare encounter conditions" item from C9's own goal list.
// Rare encounters (enemies.js's `rareIdentity:true`, one per chapter,
// already surfaced as a region-level count by C8-3's Region Codex) have
// no per-item authored text of their own to append to the way a Record/
// Treasure Hunt chain/ヌシ does, so this note is keyed by region and shown
// appended to the Region Codex's own "レア個体 遭遇" line once at least one
// of that region's rare types has actually been encountered (the caller's
// own condition, mirroring `f.seen`/`hunt.stage==='resolved'` above) AND
// regionFieldKnowledgeReady() is true for that region. Deliberately does
// not spell out the underlying spawn-chance mechanic (no other flavor
// text in this codebase leaks a numeric drop/spawn rate) -- it only
// confirms, in-fiction, that persistence is what it takes.
export const RARE_ENCOUNTER_FIELD_NOTES = Object.freeze({
  frontier: 'この地の魔物たちの気性を知ってから見ると、稀にまぎれ込むという話にも見当がつく。狩りを重ねるほど、そういう機会も巡ってくるのだろう。',
  elemental: '四境の獣たちの性質を知ってから見ると、稀な個体の話も、この山域の気まぐれな性質の延長のように思えてくる。',
  fracture: 'この地の敵の戦い方を知ってから見ると、稀な個体も境界裂域の歪みが生んだ産物なのだろうと、自然に納得できる。',
  'last-mortal': '人界最奥の魔物たちを知ってから見ると、稀な個体もまた、この地の深さが生んだ異質さの一つなのだと分かってくる。',
});

// C9-4: one field note per region -- the "Secret clues" item from C9's own
// goal list. A region's own 隠し脅威 (hidden branch stage, C8-2's
// regionBossSummary()'s `hiddenThreats`, `branch:true` stages read
// straight from CHAPTERS) has no per-item authored text of its own the way
// a Record/chain/ヌシ does either, so this mirrors RARE_ENCOUNTER_FIELD_NOTES
// exactly: keyed by region, appended to the Region Codex's own "隠し脅威
// 討伐" line, once at least one of the region's hidden threats has had its
// chapter individually unlocked (its name revealed -- the caller's own
// condition, mirroring `rareSeen > 0` above) AND regionFieldKnowledgeReady()
// is true. Never spoils WHICH stage hides the threat or how to reach it --
// only confirms, in-fiction, that the region's own creatures were the
// signal the player had already been seeing.
export const SECRET_CLUE_FIELD_NOTES = Object.freeze({
  frontier: 'この地の魔物たちの気性を知ってから振り返ると、平原の外れで感じていた違和感にも、思い当たる節が出てくる。',
  elemental: '四境の獣たちの性質を知ってから振り返ると、山域のどこかに紛れていた「らしくないもの」の気配にも、説明がつく気がする。',
  fracture: 'この地の敵の戦い方を知ってから振り返ると、境界裂域の歪みの奥に潜んでいたものの輪郭が、以前より掴めるようになる。',
  'last-mortal': '人界最奥の魔物たちを知ってから振り返ると、黒鉄機城の奥に潜んでいたものの気配にも、納得がいくようになる。',
});

// C9-5: "Rumor contradictions" -- the sixth item C9's own goal list names.
// Unlike C9-1..4 (a connecting note appended to EXISTING content), this is
// deliberately new small authored content, by explicit user decision: a
// C9-0 audit found data/ch1RumorThreads.js already contains two genuinely
// contradicting testimony threads (`gate_scar`, `valley_echo` -- two
// residents' accounts explicitly framed in-fiction as "not matching each
// other"), but that thread-with-entries system exists ONLY for Chapter 1/
// frontier -- the other 3 mortal regions have no equivalent to reuse. To
// keep the same one-per-region symmetry C9-3/C9-4 established rather than
// leaving 3 regions uncovered, the user chose to author one NEW, small,
// self-contained contradicting-testimony pair per region here instead of
// building a second ch1RumorThreads-style entries system. `accountA`/
// `accountB` are always shown (two short conflicting lines, non-spoiling
// flavor); `resolution` is gated behind regionFieldKnowledgeReady() the
// same as every other C9 note, and -- like C9-1..4 -- never confirms which
// account was "right" via any mechanic, only in-fiction. ch1RumorThreads'
// own gate_scar/valley_echo remain untouched in the Rumor Notebook,
// independent of this.
export const RUMOR_CONTRADICTIONS = Object.freeze({
  frontier: {
    accountA: { source: '猟師', text: '夜になると、動物たちがみな北へ逃げていくのを見た' },
    accountB: { source: '行商人', text: '南の道はいつも通りだった。何もおかしくはなかったよ' },
    resolution: 'この地の魔物たちの気性を知った今なら、動物たちが北へ逃げたのは、縄張りを荒らす何かがそちら側にいたからだと見当がつく。南の道が平穏だったという話も、食い違いではなく、単に方向が違っていただけなのだろう。',
  },
  elemental: {
    accountA: { source: '観測者', text: '湧水場の温度が、この数日で明らかに上がっている' },
    accountB: { source: '山案内人', text: 'いつも通りの温度だ。何も変わってはいない' },
    resolution: '四境の獣たちの性質を知った今なら、温度の変化は火・水・風・魔が交差するこの山域ならではの偏りによるものだと分かる。観測者と案内人は、同じ湧水場の違う場所を見ていただけなのだろう。',
  },
  fracture: {
    accountA: { source: '斥候', text: '古戦場の同じ場所を二度通ったのに、景色が違って見えた' },
    accountB: { source: '別の斥候', text: 'そんなことはない。景色はずっと同じだったはずだ' },
    resolution: 'この地の敵の戦い方を知った今なら、景色が違って見えたという話も、境界裂域の歪みが生む一時的な錯覚だったのだろうと納得できる。二人の斥候は、同じ場所を違う瞬間に見ていただけなのかもしれない。',
  },
  'last-mortal': {
    accountA: { source: '機城の技師', text: '外郭遺構の奥から、機械音のようなものが聞こえた' },
    accountB: { source: '別の技師', text: 'あの奥に、今も動く機構なんて残っていないはずだ' },
    resolution: '人界最奥の魔物たちを知った今なら、機械音のように聞こえたものの正体にも見当がつく。遺構そのものではなく、そこに潜む何かが立てた音だったのだろう。',
  },
});
