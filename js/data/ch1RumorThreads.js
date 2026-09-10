/* ============================================================
   Living World & Discovery C2 — Chapter 1 Rumor Threads
   ------------------------------------------------------------
   Pure data + pure helpers, so unlock/state logic can be
   regression-tested without state.js or the DOM (matches the
   existing convention in js/data/systemDeepeningPackC.js).

   A Rumor Thread is ONE rumor that accumulates multiple Entries
   over time (initial line -> testimony -> field discovery ->
   return reaction -> followup) instead of being replaced by a
   new one-off line each time. Nothing here is a quest: there is
   no accept/report step, no kill quota, no currency. Entries only
   ever get ADDED, keyed by existing world2.discoveries + existing
   stageProgress/monsterCodex — no new save root, no new Rumor-only
   progress flags.
   ============================================================ */

// Unlock condition vocabulary. Kept as data (not functions) so it can be
// serialized/inspected/tested plainly.
//   {type:'always'}                      - available from a fresh save
//   {type:'stage', stageId}              - a specific Chapter 1 stage cleared
//   {type:'anyStage', stageIds:[...]}    - any one of a list of stages cleared
//   {type:'codexSeen', enemyId}          - existing Monster Codex "seen" flag
//   {type:'codexKills', enemyId, min}    - existing Monster Codex kill count
export function isEntryUnlocked(unlock, ctx = {}) {
  if (!unlock || unlock.type === 'always') return true;
  const isStageCleared = typeof ctx.isStageCleared === 'function' ? ctx.isStageCleared : () => false;
  const codex = ctx.codex || {};
  if (unlock.type === 'stage') return !!isStageCleared(unlock.stageId);
  if (unlock.type === 'anyStage') return (unlock.stageIds || []).some((id) => isStageCleared(id));
  if (unlock.type === 'codexSeen') return !!codex[unlock.enemyId]?.seen;
  if (unlock.type === 'codexKills') return (Number(codex[unlock.enemyId]?.kills) || 0) >= (unlock.min || 1);
  return false;
}

// id: stable, never renamed once shipped (it is the save key).
// entries are authored in chronological "order" -- unlock conditions decide
// when each one actually becomes readable, but the array order is fixed.
export const CH1_RUMOR_THREADS = Object.freeze([
  {
    id: 'dried_meat',
    title: '減っていく干し肉',
    category: 'village',
    hint: '肉屋の軒先で聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '肉屋の女将', order: 1, unlock: { type: 'always' },
        text: '「夜になると一本ずつなくなるんだ。盗人の仕業に違いないよ」' },
      { id: 'testimony_guard', type: 'testimony', source: '門番', order: 2, unlock: { type: 'always' },
        text: '「旅人の誰かが怪しいと思うがね」と門番は言うが、これといった根拠はなさそうだ。' },
      { id: 'field_footprint', type: 'field', source: '現地の観察', order: 3, unlock: { type: 'stage', stageId: '1-1' },
        text: '肉屋の裏手を見に行くと、人の足跡ではない、小さく軽い足跡がいくつも残っていた。' },
      { id: 'return_rack', type: 'return', source: '肉屋の女将', order: 4, unlock: { type: 'stage', stageId: '1-2' },
        text: '街に戻ると、女将が干す場所を前より高くしていた。「念のためさ」と少し決まり悪そうに言う。' },
      { id: 'followup_creature', type: 'followup', source: '冒険者仲間', order: 5, unlock: { type: 'stage', stageId: '1-4' },
        text: '巣窟の魔物を見てきた冒険者いわく、あの辺りには夜に物を持ち去る小さな影がいるらしい。人の足跡ではなかった理由も、それで説明がつくかもしれない。' },
    ],
  },
  {
    id: 'gate_scar',
    title: '門番の大げさな傷',
    category: 'village',
    hint: '門の前で聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '門番', order: 1, unlock: { type: 'always' },
        text: '「森で大物に襲われたのさ」と門番は腕の傷を見せながら得意げに語る。' },
      { id: 'testimony_doubt', type: 'testimony', source: '別の住民', order: 2, unlock: { type: 'always' },
        text: '「あれは酒を飲んで転んだだけだよ」と別の住民は苦笑いする。二人の話はまるで噛み合わない。' },
      { id: 'testimony_selfrevise', type: 'testimony', source: '門番', order: 3, unlock: { type: 'stage', stageId: '1-1' },
        text: '聞き直すと、門番の話は少し変わっていた。「大物、というか群れだったかもしれん」' },
      { id: 'field_claw', type: 'field', source: '現地の観察', order: 4, unlock: { type: 'stage', stageId: '1-2' },
        text: '丘の斜面に、確かに大きな爪痕らしきものが残っている。ただし門番が指した場所とは、少し位置が違う。' },
    ],
  },
  {
    id: 'shining_one',
    title: '妙に光る個体の目撃談',
    category: 'field',
    hint: '見張り塔で聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '見張り番', order: 1, unlock: { type: 'always' },
        text: '「普通の群れに、一匹だけ様子の違うのが混じっていた気がする」と見張り番は自信なさげに言う。' },
      { id: 'testimony_glow', type: 'testimony', source: '見張り番', order: 2, unlock: { type: 'codexSeen', enemyId: 'ch1_rare' },
        text: '実際に見てきたと話すと、見張り番の表情が変わった。「そう、それだ。金色に光って見えたはずだ」' },
      { id: 'return_hunter', type: 'return', source: '街の噂', order: 3, unlock: { type: 'codexKills', enemyId: 'ch1_rare', min: 1 },
        text: 'あの金色の個体を実際に倒した者がいる、という話が街に広まっている。「本当にいたのか」と誰もが驚いていた。', resolves: true },
    ],
  },
  {
    id: 'wary_puddle',
    title: '魔物が避ける水たまり',
    category: 'field',
    hint: '牧場番から聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '牧場番', order: 1, unlock: { type: 'always' },
        text: '「平原の隅に、獣がなぜか大回りする水たまりがあるんだ」' },
      { id: 'testimony_smell', type: 'testimony', source: '牧場番', order: 2, unlock: { type: 'always' },
        text: '「臭いがきついとかそういう話じゃない。むしろ何も臭わないのが逆に妙だと思う」' },
      { id: 'field_survey', type: 'field', source: '現地の観察', order: 3, unlock: { type: 'stage', stageId: '1-1' },
        text: '水は澄んでいて、底の土質も周りと変わらない。ただ、水面が風もないのにわずかに波立っている。' },
      { id: 'followup_ecology', type: 'followup', source: '冒険者仲間', order: 4, unlock: { type: 'stage', stageId: '1-3' },
        text: '洞窟帰りの冒険者いわく、地下水脈が入り組んでいるあたりでは似た水たまりをいくつか見たという。地形そのものに理由がありそうだ。' },
    ],
  },
  {
    id: 'fixed_signpost',
    title: '誰かが直した道標',
    category: 'village',
    hint: '街道の入口で聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '旅商人', order: 1, unlock: { type: 'always' },
        text: '「あの道標、昨日までは倒れてたはずなんだがな」と旅商人が首をかしげている。' },
      { id: 'testimony_traveler', type: 'testimony', source: '別の旅人', order: 2, unlock: { type: 'stage', stageId: '1-1' },
        text: '「自分が直したわけじゃない」と別の旅人も言う。手を貸した者に心当たりがある様子もない。' },
      { id: 'field_tracks', type: 'field', source: '現地の観察', order: 3, unlock: { type: 'stage', stageId: '1-2' },
        text: '道標の根元に、複数人分の足跡が残っている。少なくとも一人ではなさそうだ。それ以上のことは、まだ分からない。' },
    ],
  },
  {
    id: 'failed_blade',
    title: '鍛冶師の失敗作',
    category: 'village',
    hint: '鍛冶屋で聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '鍛冶師', order: 1, unlock: { type: 'always' },
        text: '「切れ味はまるで駄目だが、妙に頑丈な刃がある」と鍛冶師が作業台の隅を指す。' },
      { id: 'testimony_shrug', type: 'testimony', source: '鍛冶師', order: 2, unlock: { type: 'always' },
        text: '「本当に何を狙って打ったのか、自分でも思い出せない」と鍛冶師は肩をすくめる。' },
      { id: 'field_useful', type: 'field', source: '冒険者仲間', order: 3, unlock: { type: 'stage', stageId: '1-4' },
        text: '巣窟のオーガ相手に試した冒険者いわく、切れなくても叩き潰す分には妙に役立ったという。' },
      { id: 'return_intent', type: 'return', source: '鍛冶師', order: 4, unlock: { type: 'stage', stageId: '1-5' },
        text: 'その話を伝えると、鍛冶師は少し黙ってから言った。「もしかしたら、失敗作ではなかったのかもしれんな」' },
    ],
  },
  {
    id: 'seed_in_pouch',
    title: '採集袋の中の種',
    category: 'field',
    hint: '丘を越えた冒険者から聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '冒険者仲間', order: 1, unlock: { type: 'stage', stageId: '1-2' },
        text: '風吹く丘から戻った冒険者が、採集袋の底から見覚えのない種を見つけたと話している。' },
      { id: 'field_match', type: 'field', source: '現地の観察', order: 2, unlock: { type: 'stage', stageId: '1-3' },
        text: '洞窟の入り口付近にも似た種が落ちている。丘とは違う場所のはずなのに、なぜここにも同じ種があるのか。' },
    ],
  },
  {
    id: 'waiting_beast',
    title: '荷車を見送る魔物',
    category: 'field',
    hint: '巣窟から戻った冒険者から聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '冒険者仲間', order: 1, unlock: { type: 'stage', stageId: '1-4' },
        text: '魔物の巣窟の縁に、荷車を襲わずただ見送るだけの一体がいる、と冒険者が話している。' },
      { id: 'testimony_merchant', type: 'testimony', source: '旅商人', order: 2, unlock: { type: 'stage', stageId: '1-5' },
        text: '「言われてみれば、あの辺りを通っても襲われたことはない」と旅商人も思い当たる節があるようだ。' },
      { id: 'field_pattern', type: 'field', source: '現地の観察', order: 3, unlock: { type: 'stage', stageId: '1-B' },
        text: '隠し谷の様子から見るに、あの一体は縄張りの見張りをしているだけなのかもしれない。何を守っているのかまでは分からない。' },
    ],
  },
  {
    id: 'valley_echo',
    title: '谷から戻る歌',
    category: 'field',
    hint: '洞窟の奥で気づく話。',
    entries: [
      { id: 'initial', type: 'initial', source: '現地の観察', order: 1, unlock: { type: 'stage', stageId: '1-3' },
        text: '洞窟の奥で誰かが歌うと、少し違う節で返ってくることに気づいた。反響にしては、節の変わり方が妙だ。' },
      { id: 'testimony_split', type: 'testimony', source: '住民たち', order: 2, unlock: { type: 'stage', stageId: '1-B' },
        text: '「ただの反響だろう」という者と、「いや、あれは何かの鳴き声だ」という者に話が割れている。' },
      { id: 'field_ritual', type: 'field', source: '現地の観察', order: 3, unlock: { type: 'anyStage', stageIds: ['1-B'] },
        text: '隠し谷の奥、ゴブリンの頭目がいた場所の近くに、歌うような音を出す仕掛けらしきものの跡があった。誰が何のために作ったのかは分からない。' },
    ],
  },
  {
    id: 'extra_bowl',
    title: '使われていない食器',
    category: 'village',
    hint: '焚き火を囲む住民から聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '住民', order: 1, unlock: { type: 'stage', stageId: '1-1' },
        text: '焚き火の脇にいる住民の食器が、いつも一人分多い。理由を尋ねても、はぐらかされるだけだった。' },
      { id: 'return_story', type: 'return', source: '住民', order: 2, unlock: { type: 'stage', stageId: '1-5' },
        text: '何度か顔を合わせるうちに、少しだけ話してくれた。「帰りを待ってる相手がいるんだ。それだけだよ」' },
    ],
  },
  {
    id: 'hidden_valley_signs',
    title: '隠し谷の気配',
    category: 'mystery',
    hint: '洞窟の奥、隠し谷への分岐が見えてから聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '冒険者仲間', order: 1, unlock: { type: 'stage', stageId: '1-3' },
        text: '洞窟の奥に、地図にない横道があるらしい。ゴブリンにしては妙に統率の取れた気配がする、という話も聞く。' },
      { id: 'field_altar', type: 'field', source: '現地の観察', order: 2, unlock: { type: 'stage', stageId: '1-B' },
        text: '隠し谷の頭目を倒した跡地に、粗末だが確かに祭壇のようなものが組まれていた。何を祀っていたのかは、今のところ分からない。' },
    ],
  },
  {
    id: 'orcking_composure',
    title: '巣窟の妙な統率',
    category: 'mystery',
    hint: '巣窟から戻った冒険者から聞ける話。',
    entries: [
      { id: 'initial', type: 'initial', source: '冒険者仲間', order: 1, unlock: { type: 'stage', stageId: '1-4' },
        text: '巣窟の魔物たちの動きが、まるで誰かの指示を受けているように揃っている、と冒険者が気味悪がっていた。' },
      { id: 'return_impression', type: 'return', source: '討伐者の感想', order: 2, unlock: { type: 'stage', stageId: '1-5' },
        text: 'オークキングを実際に倒してみると、動きがオークにしては妙に洗練されていた気がする、という感想が残った。何が違ったのかは、うまく言葉にできない。' },
    ],
  },
]);

const RUMOR_INDEX = new Map(CH1_RUMOR_THREADS.map((r) => [r.id, r]));
export function getCh1RumorThread(id) { return RUMOR_INDEX.get(id) || null; }

// Sort entries by their authored order and evaluate which are unlocked
// against the given context. Never reorders/removes -- callers merge this
// against previously-persisted entries themselves.
export function unlockedEntriesFor(rumor, ctx = {}) {
  return [...rumor.entries]
    .sort((a, b) => a.order - b.order)
    .filter((entry) => isEntryUnlocked(entry.unlock, ctx));
}

// unresolved -> only the opening line(s) are known; tracking -> the player
// has engaged past that (more than one entry, or actively investigating);
// resolved -> an entry explicitly marked `resolves:true` has unlocked.
// Reuses the exact RUMOR_STATES ids from systemDeepeningPackC.js -- callers
// pass the id string in so this file has no import-order dependency.
export function ch1RumorStateId(rumor, unlockedEntries) {
  if (!unlockedEntries.length) return null;
  if (unlockedEntries.some((e) => e.resolves)) return 'resolved';
  if (unlockedEntries.length > 1) return 'tracking';
  return 'unresolved';
}

// Merge newly-unlocked entries onto whatever is already persisted, keyed by
// entry id so a re-run never duplicates or reorders an entry already saved,
// and never drops one that was unlocked previously (even if, hypothetically,
// re-evaluating the condition would no longer return true -- defensive only,
// since stage/codex progress is monotonic in this game).
export function mergeCh1RumorEntries(previousEntries, freshUnlocked) {
  const previousById = new Map((previousEntries || []).map((e) => [e.id, e]));
  const merged = [];
  for (const entry of freshUnlocked) {
    const existing = previousById.get(entry.id);
    if (existing) { merged.push(existing); continue; }
    merged.push({
      id: entry.id, type: entry.type, source: entry.source, text: entry.text,
      order: entry.order, resolves: !!entry.resolves, unlockedAt: Date.now(),
    });
  }
  for (const entry of (previousEntries || [])) {
    if (!merged.some((e) => e.id === entry.id)) merged.push(entry);
  }
  return merged.sort((a, b) => a.order - b.order);
}

// Pure builder for one rumor's world2.discoveries record. `rumorStates` is
// the RUMOR_STATES map from systemDeepeningPackC.js, passed in rather than
// imported so this data file has zero cross-file import-order dependency
// and stays trivially unit-testable.
export function buildCh1RumorRecord(rumor, ctx, previousRecord, rumorStates, now = Date.now()) {
  const unlocked = unlockedEntriesFor(rumor, ctx);
  if (!unlocked.length) return null; // not discovered yet
  const entries = mergeCh1RumorEntries(previousRecord?.entries, unlocked);
  const stateId = ch1RumorStateId(rumor, entries) || 'unresolved';
  const stateInfo = rumorStates?.[stateId] || { id: stateId, label: stateId };
  const latest = entries[entries.length - 1];
  const record = {
    ...(previousRecord || {}),
    rumor: true,
    ch1Thread: true,
    rumorId: `ch1_${rumor.id}`,
    name: `噂：${rumor.title}`,
    hint: latest.text,
    entries,
    rumorState: stateInfo.id,
    rumorStateLabel: stateInfo.label,
    at: previousRecord?.at || entries[0].unlockedAt,
  };
  if (stateInfo.id === 'resolved' && !record.resolvedAt) record.resolvedAt = now;
  return record;
}
