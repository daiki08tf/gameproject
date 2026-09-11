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
  return {
    region,
    faunaSeen: fauna.filter((s) => s.seen).length,
    faunaTotal: fauna.length,
    fishingSpot,
    fishSeen: regionFish.filter((f) => f.seen).length,
    fishTotal: regionFish.length,
    archaeologySite,
    treasureHunts,
  };
}
