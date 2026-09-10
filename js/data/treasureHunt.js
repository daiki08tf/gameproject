/* ============================================================
   Living World & Discovery C5 — Treasure Hunt 2.0
   ------------------------------------------------------------
   Pure data + pure helpers (no state.js/DOM dependency), matching
   the convention already used by js/data/fishing.js and
   js/data/archaeology.js.

   Design constraints from LIVING_WORLD_DISCOVERY_ROADMAP.md C5:
   - upgrade "obtain map -> collect chest" into a compact
     investigation chain: Rumor -> map fragment/clue -> region
     knowledge -> Codex/Archaeology interpretation -> specific
     exploration action -> hidden location -> reward;
   - use existing reward authorities -- no Treasure currency, no
     separate Treasure level, no new screen.
   This first slice deliberately chains onto Archaeology (C4,
   already shipped this session) as the "interpretation" step --
   exactly the loop-back C4's own Connections list names
   ("Archaeology should feed... Treasure Hunt clues"). A rumor
   appears once the region is reachable, a clue emerges once the
   player has found at least one fragment at that region's
   Archaeology site, and the clue only decodes into a specific,
   claimable location once that site's Reconstructed Record has
   been unlocked (i.e. every fragment found) -- so the chain is a
   genuine payoff for archaeological completion, not a parallel
   grind. First slice covers the same four "mortal" regions Fishing
   and Archaeology already cover -- later regions are a deliberately
   deferred second slice, not attempted here.
   ============================================================ */
import { WORLD3_REGIONS } from './world3Regions.js';

export const TREASURE_HUNT_CHAINS = Object.freeze([
  {
    id: 'frontier_cache', regionId: 'frontier', siteId: 'frontier_cairn',
    name: '開拓辺境・埋もれた蓄え',
    rumorText: '開拓地の誰かが、平原のどこかに何かを隠して姿を消した、という噂を聞く。',
    clueText: '掘り出した欠片の中に、蓄えの場所を示すらしい古い書付が混ざっていた。まだ読み解けていない。',
    decodedText: '開拓碑の記録と照らし合わせると、書付の指す場所が絞り込めた――崩れた碑のすぐ裏手だ。',
    resolutionText: '碑の裏手を掘ると、朽ちた木箱が出てきた。姿を消した開拓者が遺した蓄えだったらしい。',
    reward: { wood: 10, ore: 6, hide: 4, gold: 120 },
  },
  {
    id: 'elemental_cache', regionId: 'elemental', siteId: 'elemental_tower',
    name: '四境連峰・観測者の隠し場',
    rumorText: '崩れた観測塔の近くで、行方の分からない観測者の私物を探す者がいる、という噂を聞く。',
    clueText: '掘り出した記録筒の内側に、私物を隠したらしい走り書きが残っていた。場所までは読み取れない。',
    decodedText: '四色の刻印板の紋様と走り書きを重ねると、示す先が分かった――塔の礎石の下だ。',
    resolutionText: '礎石の下から、観測者の道具箱が見つかった。四境を最後まで見届けようとした跡が残っている。',
    reward: { ore: 10, veilstone: 5, gold: 160 },
  },
  {
    id: 'fracture_cache', regionId: 'fracture', siteId: 'fracture_ruins',
    name: '境界裂域・指揮官の遺した箱',
    rumorText: '古戦場のどこかに、指揮官が最後に遺した箱が眠っている、という噂を聞く。',
    clueText: '掘り出した軍旗の残欠に、箱の隠し場所を示すらしい刺繍が縫い込まれていた。まだ意味は分からない。',
    decodedText: '名を削られた墓標の位置と刺繍の図を重ねると、隠し場所が分かった――墓標のすぐ足元だ。',
    resolutionText: '墓標の足元から、指揮官の箱が見つかった。歪んだ時空のせいか、中身は驚くほど無事だった。',
    reward: { hide: 10, veilstone: 6, gold: 200 },
  },
  {
    id: 'last_mortal_cache', regionId: 'last-mortal', siteId: 'last_mortal_outerworks',
    name: '人界最奥・機城以前の保管庫',
    rumorText: '黒鉄機城の外郭に、機城が建つ前からの保管庫が眠っている、という噂を聞く。',
    clueText: '掘り出した機導板の破片に、保管庫への経路らしい図面の断片が刻まれていた。断片だけでは分からない。',
    decodedText: '封鎖式の刻印と図面を重ねると、保管庫の位置が分かった――外郭遺構の最奥だ。',
    resolutionText: '外郭遺構の最奥で、保管庫が見つかった。機城よりさらに古い時代の品が、静かに眠っていた。',
    reward: { ore: 12, veilstone: 8, gold: 260 },
  },
]);

const CHAIN_INDEX = new Map(TREASURE_HUNT_CHAINS.map((c) => [c.id, c]));
export function getTreasureHuntChain(id) { return CHAIN_INDEX.get(id) || null; }

// A chain's rumor is reachable once its region is reachable -- the exact
// same region-unlock condition Fishing/Archaeology already established
// (any stage cleared in the region's chapters). Duplicated here rather than
// imported from archaeology.js, matching the existing convention of each
// C-series data file carrying its own small copy of this pure check
// (see isFishingSpotUnlocked/isArchaeologySiteUnlocked).
export function isTreasureHuntReachable(chain, ctx = {}) {
  const region = WORLD3_REGIONS.find((r) => r.id === chain.regionId);
  if (!region) return false;
  const hasClearedChapter = typeof ctx.hasClearedChapter === 'function' ? ctx.hasClearedChapter : () => false;
  return region.chapters.some((num) => hasClearedChapter(num));
}

// Pure stage derivation from injected Archaeology progress (fragmentsFound
// at the chain's own siteId, recordUnlocked for that site) plus this
// chain's own resolved flag. No state.js access -- the runtime patch reads
// the real numbers from state.archaeologySites() and passes them in.
export function treasureHuntStage({ reachable = false, fragmentsFound = 0, recordUnlocked = false, resolved = false } = {}) {
  if (!reachable) return 'locked';
  if (resolved) return 'resolved';
  if (recordUnlocked) return 'ready';
  if (fragmentsFound > 0) return 'tracking';
  return 'unresolved';
}

export const TREASURE_HUNT_STAGE_LABEL = Object.freeze({
  locked: '未解禁',
  unresolved: '噂のみ',
  tracking: '手掛かりあり（未解読）',
  ready: '解読済み・発見可能',
  resolved: '発見済み',
});
