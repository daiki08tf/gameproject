/* ============================================================
   Living World & Discovery C3 — Fishing
   ------------------------------------------------------------
   Pure data + pure helpers (no state.js/DOM dependency), matching
   the convention already used by js/data/ch1RumorThreads.js and
   js/data/systemDeepeningPackC.js.

   Design constraints from LIVING_WORLD_DISCOVERY_ROADMAP.md C3:
   - regional fish identity (reuses WORLD3_REGIONS -- no new region
     authority, same reuse this session already did for Rune 2.0);
   - a compact ACTIVE text interaction (合わせる/待つ/糸を緩める),
     not an idle timer;
   - named master fish (ヌシ) as long-term collection targets;
   - existing materials as rewards -- no new fishing currency;
   - no real-time/daily FOMO -- a fishing spot is simply available
     once discovered, forever.
   Rumor/Codex-notebook hooks are intentionally deferred (agreed with
   the user) -- this first slice is fish + spots + Codex only.
   ============================================================ */
import { WORLD3_REGIONS } from './world3Regions.js';

// One fishing spot per Region for this first slice (frontier / elemental /
// fracture / last-mortal -- Ch1-15, the "mortal" tone cluster). Unlocking a
// spot is driven by existing story progress (any stage cleared in the
// region), not a new Settlement-building gate, since the point is "you've
// been there, here's a reason to go back."
export const FISHING_SPOTS = Object.freeze([
  { id: 'frontier_riverbank', regionId: 'frontier', name: '開拓辺境・川辺の釣り場', desc: '平原を抜ける小さな流れ。開拓が進むにつれ、水音を聞きに来る者が増えた。' },
  { id: 'elemental_hotspring', regionId: 'elemental', name: '四境連峰・境の湧水場', desc: '火・水・風・魔が交差する地形のせいか、水温も魚の色も場所ごとに違う。' },
  { id: 'fracture_rift_pool', regionId: 'fracture', name: '境界裂域・裂け目の水溜まり', desc: '時空が歪み始めた地帯に、なぜか澄んだ水場だけが残っている。' },
  { id: 'last_mortal_deep', regionId: 'last-mortal', name: '人界最奥・最果ての淵', desc: '人の世で最も奥まった場所。ここまで釣りに来る者は多くない。' },
]);

// rarity is purely a Codex/collection label; it does not gate anything by
// itself -- weight and the region's stage-clear gate do the actual gating.
export const FISH_SPECIES = Object.freeze([
  { id: 'silver_carp', regionId: 'frontier', name: '銀鯉', rarity: 'common', weight: 10, difficulty: 1, reward: { wood: 3, hide: 1 }, flavor: 'どこの水辺にもいる、開拓地でよく見る魚。' },
  { id: 'mud_loach', regionId: 'frontier', name: '泥鰌', rarity: 'common', weight: 10, difficulty: 1, reward: { hide: 2, ore: 1 }, flavor: '泥の中に潜って隠れるのが得意。' },
  { id: 'river_shrimp', regionId: 'frontier', name: '川蝦', rarity: 'common', weight: 10, difficulty: 1, reward: { hide: 1, wood: 1 }, flavor: '数は多いが、身は小さい。' },
  { id: 'striped_crucian', regionId: 'frontier', name: '縞鮒', rarity: 'common', weight: 8, difficulty: 1, reward: { wood: 2, ore: 1 }, flavor: '縞模様が浅瀬でよく目立つ。' },
  { id: 'stonefin_char', regionId: 'frontier', name: '岩魚', rarity: 'uncommon', weight: 5, difficulty: 2, reward: { ore: 3, hide: 1 }, flavor: '流れの速い場所を好む、警戒心の強い魚。' },
  { id: 'bigjaw_catfish', regionId: 'frontier', name: '大顎鯰', rarity: 'rare', weight: 2, difficulty: 3, reward: { ore: 5, hide: 2 }, flavor: '顎の力が強く、糸を切られることも多いという。' },
  { id: 'frontier_nushi', regionId: 'frontier', name: 'ヌシ・苔髭の主', rarity: 'master', weight: 1, difficulty: 4, reward: { veilstone: 2, gold: 100 }, master: true, flavor: '開拓が始まる前からこの川にいる、と老いた住民は言う。' },

  { id: 'crimson_scale', regionId: 'elemental', name: '紅鱗魚', rarity: 'common', weight: 10, difficulty: 1, reward: { wood: 3, ore: 2 }, flavor: '鱗が炎の照り返しで紅く見える。' },
  { id: 'iceclear_fish', regionId: 'elemental', name: '氷透魚', rarity: 'common', weight: 10, difficulty: 2, reward: { hide: 3, veilstone: 1 }, flavor: '体がわずかに透けて見える、冷たい水を好む魚。' },
  { id: 'hotspring_killifish', regionId: 'elemental', name: '温泉目高', rarity: 'common', weight: 10, difficulty: 1, reward: { hide: 2 }, flavor: '湯気の立つ浅瀬に群れている。' },
  { id: 'windfin_fish', regionId: 'elemental', name: '風鰭魚', rarity: 'common', weight: 8, difficulty: 2, reward: { wood: 3 }, flavor: '大きな鰭で風を受けて泳ぐように見える。' },
  { id: 'sulfur_sweetfish', regionId: 'elemental', name: '硫黄鮎', rarity: 'uncommon', weight: 5, difficulty: 2, reward: { ore: 4 }, flavor: '硫黄の匂いのする湧水でしか見かけない。' },
  { id: 'runemarked_carp', regionId: 'elemental', name: '魔紋鯉', rarity: 'rare', weight: 2, difficulty: 3, reward: { veilstone: 2, ore: 2 }, flavor: '鱗に紋様のような模様が浮かぶ。' },
  { id: 'elemental_nushi', regionId: 'elemental', name: 'ヌシ・四色の主', rarity: 'master', weight: 1, difficulty: 5, reward: { veilstone: 3, gold: 150 }, master: true, flavor: '見る角度で鱗の色が違って見える、と噂される一匹。' },

  { id: 'riftseam_fish', regionId: 'fracture', name: '裂目魚', rarity: 'common', weight: 10, difficulty: 2, reward: { ore: 4, veilstone: 1 }, flavor: '体の側面に、裂け目のような模様が走る。' },
  { id: 'fissure_goby', regionId: 'fracture', name: '亀裂ハゼ', rarity: 'common', weight: 9, difficulty: 2, reward: { ore: 2, hide: 1 }, flavor: '岩の亀裂に潜んで様子をうかがう。' },
  { id: 'battlefield_catfish', regionId: 'fracture', name: '古戦場鯰', rarity: 'uncommon', weight: 6, difficulty: 3, reward: { hide: 4, ore: 2 }, flavor: '古戦場跡の底で動かずじっとしている。' },
  { id: 'warped_trout', regionId: 'fracture', name: '歪み鱒', rarity: 'uncommon', weight: 5, difficulty: 3, reward: { veilstone: 2 }, flavor: '泳ぐ軌跡がわずかに歪んで見える。' },
  { id: 'echo_fish', regionId: 'fracture', name: '残響魚', rarity: 'uncommon', weight: 5, difficulty: 3, reward: { veilstone: 1, wood: 2 }, flavor: '跳ねる音が、少し遅れてもう一度聞こえる気がする。' },
  { id: 'phantom_eel', regionId: 'fracture', name: '虚影ウナギ', rarity: 'rare', weight: 2, difficulty: 4, reward: { veilstone: 3 }, flavor: '姿を捉えたと思っても、次の瞬間には輪郭が揺らいでいる。' },
  { id: 'fracture_nushi', regionId: 'fracture', name: 'ヌシ・裂域の主', rarity: 'master', weight: 1, difficulty: 5, reward: { veilstone: 4, gold: 200 }, master: true, flavor: '境界裂域の水場だけに現れる、姿の定まらない大物。' },

  { id: 'depth_smelt', regionId: 'last-mortal', name: '深淵ワカサギ', rarity: 'common', weight: 8, difficulty: 2, reward: { hide: 2, ore: 1 }, flavor: '深い淵でも群れで泳ぐ、数少ない小魚。' },
  { id: 'azure_crystal_fish', regionId: 'last-mortal', name: '蒼晶魚', rarity: 'uncommon', weight: 6, difficulty: 3, reward: { ore: 5, veilstone: 2 }, flavor: '蒼晶深層の冷気に馴染んだ、透き通る魚。' },
  { id: 'rotrealm_eel', regionId: 'last-mortal', name: '腐界ウナギ', rarity: 'uncommon', weight: 6, difficulty: 3, reward: { hide: 5 }, flavor: '腐緑の樹海に近い水場でしか釣れない。' },
  { id: 'deep_char', regionId: 'last-mortal', name: '深層イワナ', rarity: 'uncommon', weight: 5, difficulty: 3, reward: { ore: 4 }, flavor: '光の届かない深みを好む。' },
  { id: 'machinebone_fish', regionId: 'last-mortal', name: '機骸魚', rarity: 'uncommon', weight: 5, difficulty: 3, reward: { ore: 3, veilstone: 1 }, flavor: '骨格の一部が金属質に見える、黒鉄機城近くの魚。' },
  { id: 'blackiron_shark', regionId: 'last-mortal', name: '黒鉄鮫', rarity: 'rare', weight: 3, difficulty: 4, reward: { ore: 6, veilstone: 2 }, flavor: '黒鉄機城の近くの淵に潜む、小柄だが凶暴な魚。' },
  { id: 'eclipse_fish', regionId: 'last-mortal', name: '蝕月魚', rarity: 'rare', weight: 2, difficulty: 5, reward: { veilstone: 4, gold: 50 }, flavor: '月のない夜にだけ、淵の底から浮かび上がってくる。' },
  { id: 'last_mortal_nushi', regionId: 'last-mortal', name: 'ヌシ・人界最奥の主', rarity: 'master', weight: 1, difficulty: 6, reward: { veilstone: 5, gold: 300 }, master: true, flavor: '人の世で最も深いこの淵の、誰も釣り上げたことのない主。' },
]);

const SPOT_INDEX = new Map(FISHING_SPOTS.map((s) => [s.id, s]));
export function getFishingSpot(id) { return SPOT_INDEX.get(id) || null; }
export function fishSpeciesForRegion(regionId) { return FISH_SPECIES.filter((f) => f.regionId === regionId); }
export function getFishSpecies(id) { return FISH_SPECIES.find((f) => f.id === id) || null; }

// A spot is unlocked once any stage in its region's chapters has been
// cleared -- reuses the exact same World3 Region authority the Rune 2.0
// region-drop rework already established this session. `ctx.hasClearedChapter`
// is a single injected predicate (chapterNumber -> boolean) so this stays a
// pure function; the runtime patch is the only place that touches
// state.data.stageProgress directly.
export function isFishingSpotUnlocked(spot, ctx = {}) {
  const region = WORLD3_REGIONS.find((r) => r.id === spot.regionId);
  if (!region) return false;
  const hasClearedChapter = typeof ctx.hasClearedChapter === 'function' ? ctx.hasClearedChapter : () => false;
  return region.chapters.some((num) => hasClearedChapter(num));
}

// Weighted random pick among a region's fish, given an injectable RNG (for
// deterministic tests).
export function pickFishForSpot(spotId, random = Math.random) {
  const spot = getFishingSpot(spotId);
  if (!spot) return null;
  const pool = fishSpeciesForRegion(spot.regionId);
  const total = pool.reduce((sum, f) => sum + f.weight, 0);
  if (!total) return null;
  let roll = random() * total;
  for (const fish of pool) {
    roll -= fish.weight;
    if (roll <= 0) return fish;
  }
  return pool[pool.length - 1];
}

// The three player commands and their Japanese labels.
export const FISHING_ACTIONS = Object.freeze(['hook', 'wait', 'slack']);
export const FISHING_ACTION_LABELS = Object.freeze({ hook: '合わせる', wait: '待つ', slack: '糸を緩める' });
const CUE_TEXT = Object.freeze({
  hook: '強く糸を引いている。',
  wait: '小さく震えるだけで、動きが読めない。',
  slack: '急に走り出しそうな気配がする。',
});

// difficulty -> how many correct actions are needed to land the fish, and
// how many misses are tolerated before it gets away. Kept as an explicit,
// readable table rather than a formula.
const DIFFICULTY_PROFILE = Object.freeze({
  1: { roundsNeeded: 2, maxMisses: 3 },
  2: { roundsNeeded: 3, maxMisses: 3 },
  3: { roundsNeeded: 3, maxMisses: 2 },
  4: { roundsNeeded: 4, maxMisses: 2 },
  5: { roundsNeeded: 4, maxMisses: 2 },
  6: { roundsNeeded: 5, maxMisses: 2 },
});
export function fishingDifficultyProfile(difficulty) {
  return DIFFICULTY_PROFILE[Math.max(1, Math.min(6, Math.floor(difficulty) || 1))];
}

// One round's cue: the "correct" action this round, plus its display text.
// Exposed separately from resolveFishingRound so the UI can show the cue
// before the player answers.
export function rollFishingCue(random = Math.random) {
  const action = FISHING_ACTIONS[Math.floor(Math.min(0.999999999, Math.max(0, random())) * FISHING_ACTIONS.length)];
  return { correctAction: action, cueText: CUE_TEXT[action] };
}

// Pure round resolution: given the current progress/misses and the
// player's chosen action vs. the round's correct action, returns the new
// state and whether the attempt is over (caught or escaped).
export function resolveFishingRound({ fish, progress = 0, misses = 0, correctAction, chosenAction }) {
  const profile = fishingDifficultyProfile(fish.difficulty);
  const hit = chosenAction === correctAction;
  const nextProgress = hit ? progress + 1 : progress;
  const nextMisses = hit ? misses : misses + 1;
  if (nextProgress >= profile.roundsNeeded) return { progress: nextProgress, misses: nextMisses, hit, outcome: 'caught' };
  if (nextMisses >= profile.maxMisses) return { progress: nextProgress, misses: nextMisses, hit, outcome: 'escaped' };
  return { progress: nextProgress, misses: nextMisses, hit, outcome: 'ongoing' };
}

// A landed catch's reward, split into `materials` (wood/ore/hide/veilstone --
// handed to the existing state.addSettlementMaterials) and `gold` (only the
// master fish carry it; addSettlementMaterials does not understand a `gold`
// key, so the runtime must apply it separately, or it is silently dropped).
// First catch = the full reward; a repeat catch of a fish already seen only
// grants a 30% gold trickle (regular fish have no gold reward at all, so a
// repeat catch of them currently only advances the Codex "caught" count).
export function computeFishingReward(fish, first) {
  const materials = {};
  for (const key of ['wood', 'ore', 'hide', 'veilstone']) {
    if (first && fish.reward?.[key]) materials[key] = fish.reward[key];
  }
  const gold = fish.reward?.gold ? Math.round(fish.reward.gold * (first ? 1 : 0.3)) : 0;
  return { materials, gold };
}
