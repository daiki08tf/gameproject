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
