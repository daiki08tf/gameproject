/* ============================================================
   Living World & Discovery C8-1 — Region Codex runtime
   ------------------------------------------------------------
   No new save data at all: every field state.regionCodex() returns
   is read straight from existing state functions/objects
   (state.fishingSpots(), state.archaeologySites(), state.treasureHunts(),
   COMPANION_SPECIES + the existing enemy Codex's `seen` flag). This
   file only aggregates; it never writes state.data.
   ============================================================ */
import { state } from '../state.js';
import './fishing.js'; // guarantees state.fishingSpots() exists
import './archaeology.js'; // guarantees state.archaeologySites() exists
import './treasureHunt.js'; // guarantees state.treasureHunts() exists
import { COMPANION_SPECIES } from '../data/companions.js';
import { world3RegionForChapter } from '../data/world3Regions.js';
import { CHAPTERS, isChapterUnlocked } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { regionCodexRegions, regionCodexBundle, regionBossSummary } from '../data/regionCodex.js';

// Companion species' own `regionId` (data/companions.js) is chapter-scoped
// ('ch1', 'ch11', ...), a DIFFERENT id namespace from the WORLD3_REGIONS
// ids Fishing/Archaeology/Treasure Hunt key on ('frontier', 'elemental',
// ...) -- resolve through the existing world3RegionForChapter() mapping
// rather than assuming they already match. A species whose regionId isn't
// a plain chapter number (e.g. MACHINE_SPECIES' 'machine_world') simply
// has no WORLD3_REGIONS home and is excluded, not force-mapped.
function chapterNumFromSpeciesRegionId(regionId) {
  const m = /^ch(\d+)$/.exec(regionId || '');
  return m ? Number(m[1]) : null;
}
function faunaSpecies() {
  const codex = state.data.monsterCodex || {};
  return Object.values(COMPANION_SPECIES)
    .map((s) => {
      const chapterNum = chapterNumFromSpeciesRegionId(s.regionId);
      const region = chapterNum ? world3RegionForChapter(chapterNum) : null;
      if (!region) return null;
      return { id: s.id, name: s.name, regionId: region.id, seen: !!codex[s.enemyType]?.seen };
    })
    .filter(Boolean);
}

// ENEMY_TYPES entries carry `chapterId` in the same 'ch1'/'ch5' shape
// faunaSpecies() already resolves -- reuse chapterNumFromSpeciesRegionId()
// rather than a second parsing rule. `enemyType` (the object key, not the
// enemy's own display name) is what the enemy Codex is keyed by
// (state.data.monsterCodex[enemyType]), same as every other Codex read in
// this file.
function rareEncounters() {
  const codex = state.data.monsterCodex || {};
  return Object.entries(ENEMY_TYPES)
    .filter(([, e]) => e.rareIdentity && e.chapterId)
    .map(([enemyType, e]) => {
      const chapterNum = chapterNumFromSpeciesRegionId(e.chapterId);
      const region = chapterNum ? world3RegionForChapter(chapterNum) : null;
      if (!region) return null;
      return { id: enemyType, name: e.name, regionId: region.id, seen: !!codex[enemyType]?.seen };
    })
    .filter(Boolean);
}

state.regionCodexList = function regionCodexList() {
  const sources = {
    faunaSpecies: faunaSpecies(),
    fishingSpots: this.fishingSpots?.() || [],
    fishCodex: this.fishCodex?.() || [],
    archaeologySites: this.archaeologySites?.() || [],
    treasureHunts: this.treasureHunts?.() || [],
    rareEncounters: rareEncounters(),
  };
  const isStageCleared = (id) => this.isStageCleared(id);
  const bossCtx = { isStageCleared, isChapterUnlocked: (idx) => isChapterUnlocked(idx, isStageCleared) };
  return regionCodexRegions()
    .map((r) => {
      const bundle = regionCodexBundle(r.id, sources);
      return bundle ? { ...bundle, ...regionBossSummary(r, CHAPTERS, bossCtx) } : null;
    })
    .filter(Boolean);
};

state.regionCodex = function regionCodex(regionId) {
  return this.regionCodexList().find((b) => b.region.id === regionId) || null;
};
