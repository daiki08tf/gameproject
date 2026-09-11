/* ============================================================
   Living World & Discovery C8-1 — Region Codex
   ------------------------------------------------------------
   Pure aggregation (no state.js/DOM dependency), matching the
   convention already used by js/data/archaeology.js and
   js/data/treasureHunt.js.

   C8's own goal: "A Region should be a coherent gameplay/ecology
   identity... express a bundle [of] local ecology, fish/waterside
   identity, archaeology type, Rumor flavor, local materials..." --
   every one of those pieces already exists (C3 Fishing, C4
   Archaeology, C5 Treasure Hunt, native companion species per
   region), but each lives on its own screen with no place a player
   can see them together as ONE region's identity. This file is
   purely a READ-side aggregation of those existing sources -- no new
   content, no new save data, no new gameplay system. Every field
   here is already real: fishingSpots/archaeologySites/treasureHunts
   are the exact objects state.fishingSpots()/state.archaeologySites()/
   state.treasureHunts() already return; fauna is the existing
   COMPANION_SPECIES roster filtered by the same `regionId` Fishing/
   Archaeology already key on.

   First slice covers only the 4 regions Fishing/Archaeology/Treasure
   Hunt already reach (frontier/elemental/fracture/last-mortal, Ch1-15
   -- the "mortal" tone cluster) -- a region with none of those systems
   simply doesn't get a bundle entry yet, rather than showing a
   misleadingly empty card.
   ============================================================ */
import { WORLD3_REGIONS } from './world3Regions.js';

// Regions with at least one of Fishing/Archaeology already built for
// them -- see the file header for why later regions are excluded rather
// than shown empty.
const COVERED_REGION_IDS = Object.freeze(['frontier', 'elemental', 'fracture', 'last-mortal']);

export function regionCodexRegions() {
  return WORLD3_REGIONS.filter((r) => COVERED_REGION_IDS.includes(r.id));
}

// `sources` are the already-computed runtime lists (state.fishingSpots(),
// state.archaeologySites(), state.treasureHunts(), the companion species
// roster with a `seen` flag attached) -- this function only filters and
// groups them by regionId, it never recomputes progress itself.
export function regionCodexBundle(regionId, sources = {}) {
  const region = WORLD3_REGIONS.find((r) => r.id === regionId);
  if (!region || !COVERED_REGION_IDS.includes(regionId)) return null;
  const fauna = (sources.faunaSpecies || []).filter((s) => s.regionId === regionId);
  const fishingSpot = (sources.fishingSpots || []).find((s) => s.regionId === regionId) || null;
  const regionFish = (sources.fishCodex || []).filter((f) => f.regionId === regionId);
  const archaeologySite = (sources.archaeologySites || []).find((s) => s.regionId === regionId) || null;
  const treasureHunts = (sources.treasureHunts || []).filter((h) => h.regionId === regionId);
  // C8-3 -- Rare encounter identity, the last "bundle" item this slice
  // covers. Reuses the EXISTING Enemy 2.0 rare-role system (enemies.js's
  // rareIdentity:true / REGIONAL_ENEMY_ROLES 'rare' role, one per
  // chapter) -- no new rare-enemy authority, this only surfaces which of
  // a region's already-defined rare types (`sources.rareEncounters`,
  // built in the runtime patch) have been discovered.
  const rareEncounters = (sources.rareEncounters || []).filter((r) => r.regionId === regionId);
  return {
    region,
    faunaSeen: fauna.filter((s) => s.seen).length,
    faunaTotal: fauna.length,
    fishingSpot,
    fishSeen: regionFish.filter((f) => f.seen).length,
    fishTotal: regionFish.length,
    archaeologySite,
    treasureHunts,
    rareSeen: rareEncounters.filter((r) => r.seen).length,
    rareTotal: rareEncounters.length,
  };
}

// C8-2 — Boss / hidden threat identity, the other "bundle" item C8's own
// goal names alongside ecology/fish/archaeology/Rumor. Every chapter
// already carries a boss stage (stages.js's `boss:true`) and, for most
// chapters, a hidden branch stage (`branch:true`) -- this only reads
// those, it authors nothing new. `ctx.isStageCleared`/`ctx.isChapterUnlocked`
// are injected predicates (same shape js/screens/chapterSelect.js already
// uses) so this stays a pure function -- the runtime patch is the only
// place that touches state.data.stageProgress directly. A boss/hidden-
// threat name is withheld (`name: null`) until its own chapter is
// unlocked, matching chapterSelect.js's own `unlocked?journeyName(ch):'？？？'`
// convention -- this never reveals story content ahead of the player's
// own progress.
export function regionBossSummary(region, chapters, ctx = {}) {
  const isStageCleared = typeof ctx.isStageCleared === 'function' ? ctx.isStageCleared : () => false;
  const isChapterUnlocked = typeof ctx.isChapterUnlocked === 'function' ? ctx.isChapterUnlocked : () => false;
  const bosses = [];
  const hiddenThreats = [];
  for (const num of region.chapters) {
    const idx = num - 1;
    const ch = chapters[idx];
    if (!ch) continue;
    const unlocked = isChapterUnlocked(idx);
    const bossStage = ch.stages.find((s) => s.boss);
    if (bossStage) bosses.push({ chapterNum: num, name: unlocked ? bossStage.name : null, cleared: isStageCleared(bossStage.id) });
    const branchStage = ch.stages.find((s) => s.branch);
    if (branchStage) hiddenThreats.push({ chapterNum: num, name: unlocked ? branchStage.name : null, cleared: isStageCleared(branchStage.id) });
  }
  return { bosses, hiddenThreats };
}
