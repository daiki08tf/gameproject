/* ============================================================
   Living World & Discovery C9-1 — Field Knowledge runtime
   ------------------------------------------------------------
   No new save data at all: reads straight through the existing
   per-enemy knowledge ladder (state.enemyKnowledge(), roleKnown
   becomes true on a real kill via codexEnemyKnowledge.js) -- this
   file only aggregates it per region and looks up the matching
   field note, it never writes state.data.
   ============================================================ */
import { state } from '../state.js';
import './codexEnemyKnowledge.js'; // guarantees state.enemyKnowledge() exists
import { ENEMY_TYPES } from '../data/enemies.js';
import { world3RegionForChapter } from '../data/world3Regions.js';
import { getArchaeologySite } from '../data/archaeology.js';
import { getTreasureHuntChain } from '../data/treasureHunt.js';
import { getFishSpecies } from '../data/fishing.js';
import { regionFieldKnowledgeReady as pureRegionFieldKnowledgeReady, ARCHAEOLOGY_FIELD_NOTES, TREASURE_HUNT_FIELD_NOTES, FISHING_FIELD_NOTES } from '../data/fieldKnowledge.js';

// Same 'ch1'/'ch5'-prefixed chapterId -> WORLD3_REGIONS resolution
// js/patches/regionCodex.js already established -- duplicated here rather
// than imported, matching the existing convention of each C-series file
// carrying its own small copy of this pure check (see treasureHunt.js's
// own comment on isTreasureHuntReachable()).
function chapterNumFromChapterId(chapterId) {
  const m = /^ch(\d+)$/.exec(chapterId || '');
  return m ? Number(m[1]) : null;
}

// Every native (non-boss) enemy type this region's chapters define,
// regardless of whether the player has fought it yet -- the roleKnown
// check below is what actually reflects real progress.
function nativeEnemyTypesForRegion(regionId) {
  return Object.entries(ENEMY_TYPES)
    .filter(([, e]) => e.chapterId && !e.boss)
    .filter(([, e]) => {
      const chapterNum = chapterNumFromChapterId(e.chapterId);
      const region = chapterNum ? world3RegionForChapter(chapterNum) : null;
      return region?.id === regionId;
    })
    .map(([enemyType]) => enemyType);
}

state.regionFieldKnowledgeReady = function regionFieldKnowledgeReady(regionId) {
  const types = nativeEnemyTypesForRegion(regionId);
  const known = types.map((enemyType) => !!this.enemyKnowledge?.(enemyType)?.roleKnown);
  return pureRegionFieldKnowledgeReady(known);
};

// Reconstructed Record ids and Archaeology site ids are linked 1:1 in
// this first slice (one record per site, one site per region).
const RECORD_SITE_ID = Object.freeze({
  frontier_record: 'frontier_cairn',
  elemental_record: 'elemental_tower',
  fracture_record: 'fracture_ruins',
  last_mortal_record: 'last_mortal_outerworks',
});

state.archaeologyFieldNote = function archaeologyFieldNote(recordId) {
  const note = ARCHAEOLOGY_FIELD_NOTES[recordId];
  if (!note) return null;
  const site = getArchaeologySite(RECORD_SITE_ID[recordId]);
  if (!site) return null;
  return this.regionFieldKnowledgeReady(site.regionId) ? note : null;
};

state.treasureHuntFieldNote = function treasureHuntFieldNote(chainId) {
  const note = TREASURE_HUNT_FIELD_NOTES[chainId];
  if (!note) return null;
  const chain = getTreasureHuntChain(chainId);
  if (!chain) return null;
  return this.regionFieldKnowledgeReady(chain.regionId) ? note : null;
};

// C9-2: mirrors archaeologyFieldNote()/treasureHuntFieldNote() exactly,
// but for a region's ヌシ (master fish) -- see FISHING_FIELD_NOTES.
state.fishingFieldNote = function fishingFieldNote(fishId) {
  const note = FISHING_FIELD_NOTES[fishId];
  if (!note) return null;
  const fish = getFishSpecies(fishId);
  if (!fish) return null;
  return this.regionFieldKnowledgeReady(fish.regionId) ? note : null;
};
