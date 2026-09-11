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
