/* ============================================================
   Living World & Discovery C4 — Archaeology
   ------------------------------------------------------------
   Pure data + pure helpers (no state.js/DOM dependency), matching
   the convention already used by js/data/fishing.js and
   js/data/ch1RumorThreads.js.

   Design constraints from LIVING_WORLD_DISCOVERY_ROADMAP.md C4:
   - ancient world evidence the player FINDS and RECONSTRUCTS, not
     only exposition delivered by story text;
   - content forms: ruins / tablets / artifact fragments / broken
     machines / inscriptions / buried structures / reconstructed
     records;
   - feeds World Lore, Codex/Field Research and existing reward
     authority -- no new currency, no new stat-multiplier layer
     (unlike Fishing's per-catch stat bonus, Archaeology's payoff
     stays knowledge + existing materials, matching the roadmap's
     own "Connections" list for C4);
   - no real-time/daily FOMO -- a site is simply available once
     discovered, forever.
   First slice covers the same four "mortal" regions/Ch1-15 Fishing
   already covers (frontier/elemental/fracture/last-mortal) --
   later regions are a deliberately deferred second slice, not
   attempted here.
   ============================================================ */
import { WORLD3_REGIONS } from './world3Regions.js';

// One excavation site per Region for this first slice. Unlocking a site is
// driven by existing story progress (any stage cleared in the region),
// exactly the same gate Fishing already established -- "you've been there,
// here's a reason to go back and look closer."
export const ARCHAEOLOGY_SITES = Object.freeze([
  { id: 'frontier_cairn', regionId: 'frontier', name: '開拓辺境・崩れた開拓碑', desc: '今の開拓より前に、この平原へ入ろうとした者たちがいたらしい。碑は崩れ、記録はほとんど土に還っている。' },
  { id: 'elemental_tower', regionId: 'elemental', name: '四境連峰・崩落した観測塔', desc: '火・水・風・魔が交差するこの山域を、かつて誰かが観測しようとした跡。塔はとうに崩れ落ちている。' },
  { id: 'fracture_ruins', regionId: 'fracture', name: '境界裂域・古戦場の地下遺構', desc: '古戦場の地下に、時空の歪みに半ば呑まれた遺構が眠っている。掘り出すたび、記録の一部が欠けていることに気づく。' },
  { id: 'last_mortal_outerworks', regionId: 'last-mortal', name: '人界最奥・黒鉄機城外郭遺構', desc: '黒鉄機城の外周に埋もれた、機城建造よりさらに古い遺構。何のための施設だったのかは、まだ分からない。' },
]);

// rarity is purely a Codex/collection label; it does not gate anything by
// itself -- weight and the region's stage-clear gate do the actual gating.
// Unlike Fishing's FISH_SPECIES, fragments carry no statTarget: Archaeology's
// payoff is knowledge (the Reconstructed Record) + existing materials, not
// another uncapped combat-stat layer stacked on top of Fishing's.
export const ARTIFACT_FRAGMENTS = Object.freeze([
  { id: 'frontier_stone_marker', siteId: 'frontier_cairn', regionId: 'frontier', name: '石碑の欠片', rarity: 'common', weight: 10, difficulty: 1, reward: { wood: 2, ore: 1 }, flavor: '刻まれた文字は風化してほとんど読めないが、地名らしき一部だけが残っている。' },
  { id: 'frontier_rusted_hoe', siteId: 'frontier_cairn', regionId: 'frontier', name: '錆びた鍬の刃', rarity: 'common', weight: 10, difficulty: 1, reward: { ore: 2 }, flavor: '柄はとうに朽ちているが、刃だけが土の中でかたちを保っていた。' },
  { id: 'frontier_burnt_shard', siteId: 'frontier_cairn', regionId: 'frontier', name: '焼け跡の陶片', rarity: 'uncommon', weight: 6, difficulty: 2, reward: { wood: 3, hide: 1 }, flavor: '割れた器の破片。焼け焦げた跡があり、何かが起きた直後に放棄されたように見える。' },
  { id: 'frontier_buried_stake', siteId: 'frontier_cairn', regionId: 'frontier', name: '埋もれた木杭', rarity: 'rare', weight: 3, difficulty: 2, reward: { wood: 4, gold: 30 }, flavor: '区画を示すための杭だったらしい。杭の並びから、失われた集落の輪郭がうっすら見えてくる。' },

  { id: 'elemental_gauge', siteId: 'elemental_tower', regionId: 'elemental', name: '観測儀の残骸', rarity: 'common', weight: 10, difficulty: 1, reward: { ore: 2, veilstone: 1 }, flavor: '針の折れた観測儀。何を測っていたのかは、盤面の焼け具合からは分からない。' },
  { id: 'elemental_plate', siteId: 'elemental_tower', regionId: 'elemental', name: '四色の刻印板', rarity: 'common', weight: 9, difficulty: 1, reward: { ore: 3 }, flavor: '火・水・風・魔、四つの紋様が並んで刻まれている。この山域そのものを表しているようだ。' },
  { id: 'elemental_tube', siteId: 'elemental_tower', regionId: 'elemental', name: '熱で歪んだ記録筒', rarity: 'uncommon', weight: 6, difficulty: 2, reward: { veilstone: 2, ore: 2 }, flavor: '中の紙は炭化しているが、筒の外側には辛うじて日付らしき刻印が残っている。' },
  { id: 'elemental_diagram', siteId: 'elemental_tower', regionId: 'elemental', name: '風化した術式図', rarity: 'rare', weight: 3, difficulty: 3, reward: { veilstone: 3, gold: 50 }, flavor: '観測塔そのものを支えていたらしい術式の図面。塔が崩れた理由の一端が、ここに描かれている。' },

  { id: 'fracture_rod', siteId: 'fracture_ruins', regionId: 'fracture', name: '折れた指揮杖', rarity: 'common', weight: 9, difficulty: 2, reward: { ore: 3, hide: 1 }, flavor: '古戦場の指揮官が持っていたと思われる杖。半分から先が見当たらない。' },
  { id: 'fracture_banner', siteId: 'fracture_ruins', regionId: 'fracture', name: '歪んだ軍旗の残欠', rarity: 'common', weight: 8, difficulty: 2, reward: { hide: 3 }, flavor: '布の繊維が不自然にねじれている。時空の歪みがこの地に残した痕跡の一つだろう。' },
  { id: 'fracture_tablet', siteId: 'fracture_ruins', regionId: 'fracture', name: '記録が飛んだ石板', rarity: 'uncommon', weight: 5, difficulty: 3, reward: { veilstone: 2, hide: 2 }, flavor: '刻まれていたはずの中ほどの記録だけが、きれいに欠落している。歪みのせいか、意図的な欠落かは分からない。' },
  { id: 'fracture_gravestone', siteId: 'fracture_ruins', regionId: 'fracture', name: '名を削られた墓標', rarity: 'rare', weight: 3, difficulty: 3, reward: { veilstone: 3, gold: 60 }, flavor: '刻まれていたはずの名前だけが、後から削り取られている。誰が、なぜ消したのかは記されていない。' },

  { id: 'last_mortal_control_plate', siteId: 'last_mortal_outerworks', regionId: 'last-mortal', name: '機導板の破片', rarity: 'common', weight: 8, difficulty: 2, reward: { ore: 4 }, flavor: '機城のものより明らかに古い意匠の機導板。黒鉄機城は、この遺構の上に建てられたのかもしれない。' },
  { id: 'last_mortal_seal', siteId: 'last_mortal_outerworks', regionId: 'last-mortal', name: '封鎖式の刻印', rarity: 'uncommon', weight: 6, difficulty: 3, reward: { veilstone: 2, ore: 2 }, flavor: '「封鎖」を意味する古い刻印。機城の中枢記録にあった言葉と、同じ系統の文字に見える。' },
  { id: 'last_mortal_log', siteId: 'last_mortal_outerworks', regionId: 'last-mortal', name: '稼働記録の残滓', rarity: 'uncommon', weight: 5, difficulty: 3, reward: { veilstone: 3, gold: 40 }, flavor: 'かろうじて読める範囲に「外部観測」の語が繰り返し現れる。機城の中枢記録と同じ語だ。' },
  { id: 'last_mortal_wiring', siteId: 'last_mortal_outerworks', regionId: 'last-mortal', name: '人界外への配線束', rarity: 'rare', weight: 3, difficulty: 4, reward: { veilstone: 4, gold: 80 }, flavor: '配線は遺構の外へ、人界の外へ向かって伸びたまま途切れている。何につながっていたのかは、まだ分からない。' },
]);

// One authored Reconstructed Record per site, unlocked once every one of
// that site's fragments has been found at least once. Pure flavor/Codex
// completion text -- no stat effect -- plus a one-time existing-materials
// bundle (never a new item tier), matching the roadmap's C4 "Connections"
// list (World Lore / Codex / existing reward authority only).
export const RECONSTRUCTED_RECORDS = Object.freeze([
  { id: 'frontier_record', siteId: 'frontier_cairn', name: '名もなき開拓者たちの記録', text: '碑・鍬・器・杭。四つの欠片を並べると、今の開拓よりずっと前に、この平原へ入ろうとした一団がいたことが分かる。彼らがどうなったのかを示す記録は、どこにも残っていない。', reward: { wood: 6, ore: 4, gold: 40 } },
  { id: 'elemental_record', siteId: 'elemental_tower', name: '四境観測者たちの記録', text: '観測儀・刻印板・記録筒・術式図。この山域を観測しようとした者たちがいたことは分かるが、観測の目的そのものは、崩れた塔と共に失われている。', reward: { ore: 6, veilstone: 3, gold: 60 } },
  { id: 'fracture_record', siteId: 'fracture_ruins', name: '消えた戦の記録', text: '指揮杖・軍旗・石板・墓標。この地で確かに戦があったことは分かる。だが誰と、何のために戦ったのかを示す部分だけが、判で押したように欠け続けている。', reward: { hide: 6, veilstone: 4, gold: 80 } },
  { id: 'last_mortal_record', siteId: 'last_mortal_outerworks', name: '機城建造以前の記録', text: '機導板・封鎖式・稼働記録・配線束。黒鉄機城は、この遺構の上に、その意図を受け継ぐ形で建てられたように見える。「封鎖」「外部観測」――中枢記録にあった言葉の起源が、ここにある。', reward: { ore: 8, veilstone: 6, gold: 120 } },
]);

const SITE_INDEX = new Map(ARCHAEOLOGY_SITES.map((s) => [s.id, s]));
export function getArchaeologySite(id) { return SITE_INDEX.get(id) || null; }
export function fragmentsForSite(siteId) { return ARTIFACT_FRAGMENTS.filter((f) => f.siteId === siteId); }
export function getArtifactFragment(id) { return ARTIFACT_FRAGMENTS.find((f) => f.id === id) || null; }
export function getReconstructedRecord(siteId) { return RECONSTRUCTED_RECORDS.find((r) => r.siteId === siteId) || null; }

// A site is unlocked once any stage in its region's chapters has been
// cleared -- reuses the exact same World3 Region authority Fishing already
// established this session. `ctx.hasClearedChapter` is a single injected
// predicate (chapterNumber -> boolean) so this stays a pure function; the
// runtime patch is the only place that touches state.data.stageProgress
// directly.
export function isArchaeologySiteUnlocked(site, ctx = {}) {
  const region = WORLD3_REGIONS.find((r) => r.id === site.regionId);
  if (!region) return false;
  const hasClearedChapter = typeof ctx.hasClearedChapter === 'function' ? ctx.hasClearedChapter : () => false;
  return region.chapters.some((num) => hasClearedChapter(num));
}

// Weighted random pick among a site's not-yet-completed fragments first (so
// digging keeps making progress toward the Reconstructed Record instead of
// re-rolling fragments already found), falling back to the full pool once
// every fragment has been seen at least once.
export function pickFragmentForSite(siteId, seenIds = new Set(), random = Math.random) {
  const pool = fragmentsForSite(siteId);
  if (!pool.length) return null;
  const unseen = pool.filter((f) => !seenIds.has(f.id));
  const from = unseen.length ? unseen : pool;
  const total = from.reduce((sum, f) => sum + f.weight, 0);
  if (!total) return null;
  let roll = random() * total;
  for (const f of from) {
    roll -= f.weight;
    if (roll <= 0) return f;
  }
  return from[from.length - 1];
}

// The three excavation techniques and their Japanese labels -- a compact
// ACTIVE text interaction (matching Fishing's 合わせる/待つ/糸を緩める
// convention from LIVING_WORLD_DISCOVERY_ROADMAP.md), not an idle timer.
export const EXCAVATION_ACTIONS = Object.freeze(['brush', 'dig', 'brace']);
export const EXCAVATION_ACTION_LABELS = Object.freeze({ brush: '丁寧に払う', dig: '掘り進める', brace: '崩れを支える' });
const CUE_TEXT = Object.freeze({
  brush: '表面が薄く土に覆われているだけのようだ。',
  dig: 'まだ深くに埋まっている手応えがある。',
  brace: '今にも崩れそうな、脆い感触がある。',
});

// Each cue text maps 1:1 to exactly one correct action -- a readable puzzle,
// not a random guess. Derived from the same EXCAVATION_ACTIONS/
// EXCAVATION_ACTION_LABELS/CUE_TEXT the actual round logic uses, so a UI
// legend built from this can never drift out of sync with what
// rollExcavationCue/resolveExcavationRound actually do.
export const EXCAVATION_CUE_GUIDE = Object.freeze(
  EXCAVATION_ACTIONS.map((action) => Object.freeze({ action, label: EXCAVATION_ACTION_LABELS[action], cueText: CUE_TEXT[action] })),
);

// difficulty -> how many correct actions are needed to recover the
// fragment intact, and how many missteps are tolerated before it crumbles.
const DIFFICULTY_PROFILE = Object.freeze({
  1: { roundsNeeded: 2, maxMisses: 3 },
  2: { roundsNeeded: 3, maxMisses: 3 },
  3: { roundsNeeded: 3, maxMisses: 2 },
  4: { roundsNeeded: 4, maxMisses: 2 },
});
export function excavationDifficultyProfile(difficulty) {
  return DIFFICULTY_PROFILE[Math.max(1, Math.min(4, Math.floor(difficulty) || 1))];
}

// One round's cue: the "correct" action this round, plus its display text.
// Exposed separately from resolveExcavationRound so the UI can show the cue
// before the player answers.
export function rollExcavationCue(random = Math.random) {
  const action = EXCAVATION_ACTIONS[Math.floor(Math.min(0.999999999, Math.max(0, random())) * EXCAVATION_ACTIONS.length)];
  return { correctAction: action, cueText: CUE_TEXT[action] };
}

// Pure round resolution: given the current progress/misses and the
// player's chosen action vs. the round's correct action, returns the new
// state and whether the attempt is over (recovered intact or crumbled).
export function resolveExcavationRound({ fragment, progress = 0, misses = 0, correctAction, chosenAction }) {
  const profile = excavationDifficultyProfile(fragment.difficulty);
  const hit = chosenAction === correctAction;
  const nextProgress = hit ? progress + 1 : progress;
  const nextMisses = hit ? misses : misses + 1;
  if (nextProgress >= profile.roundsNeeded) return { progress: nextProgress, misses: nextMisses, hit, outcome: 'recovered' };
  if (nextMisses >= profile.maxMisses) return { progress: nextProgress, misses: nextMisses, hit, outcome: 'crumbled' };
  return { progress: nextProgress, misses: nextMisses, hit, outcome: 'ongoing' };
}

// A recovered fragment's reward, split into `materials` (wood/ore/hide/
// veilstone -- handed to the existing state.addSettlementMaterials) and
// `gold` (only some fragments carry it; addSettlementMaterials does not
// understand a `gold` key, so the runtime applies it separately). First
// find = the full reward; a repeat find of a fragment already seen only
// grants a 30% gold trickle (fragments with no gold reward at all only
// advance the "found" record on a repeat), mirroring Fishing's exact
// repeat-catch convention.
export function computeArchaeologyReward(fragment, first) {
  const materials = {};
  for (const key of ['wood', 'ore', 'hide', 'veilstone']) {
    if (first && fragment.reward?.[key]) materials[key] = fragment.reward[key];
  }
  const gold = fragment.reward?.gold ? Math.round(fragment.reward.gold * (first ? 1 : 0.3)) : 0;
  return { materials, gold };
}

// Whether every fragment of a site has been found at least once (drives
// Reconstructed Record unlock).
export function isSiteFullyExcavated(siteId, seenIds = new Set()) {
  const pool = fragmentsForSite(siteId);
  return pool.length > 0 && pool.every((f) => seenIds.has(f.id));
}
