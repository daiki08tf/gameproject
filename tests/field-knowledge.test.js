import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { regionFieldKnowledgeReady, ARCHAEOLOGY_FIELD_NOTES, TREASURE_HUNT_FIELD_NOTES, FISHING_FIELD_NOTES, RARE_ENCOUNTER_FIELD_NOTES } from '../js/data/fieldKnowledge.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { world3RegionForChapter, WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { state } from '../js/state.js';
import '../js/patches/settlementCore.js';
import '../js/patches/fieldKnowledge.js';

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

// ---- C9-1: Field Knowledge --------------------------------------------
// Per LIVING_WORLD_DISCOVERY_ROADMAP.md C9: move Codex toward "knowledge
// that develops through play" -- "Treasure hints; Archaeology
// interpretation" named concretely. This connects the EXISTING per-enemy
// knowledge ladder (codexEnemyKnowledge.js's state.enemyKnowledge(),
// roleKnown flips true on a real kill) to Archaeology's Reconstructed
// Records and Treasure Hunt's resolution text. Deliberately flavor only,
// same principle as C6-8's companion reactions: never a gate.

test('regionFieldKnowledgeReady() (pure): false for an empty list, true once at least half the entries are known', () => {
  assert.equal(regionFieldKnowledgeReady([]), false);
  assert.equal(regionFieldKnowledgeReady([false, false, false]), false);
  assert.equal(regionFieldKnowledgeReady([true, false, false]), false, '1/3 known is below the 50% threshold');
  assert.equal(regionFieldKnowledgeReady([true, false]), true, 'exactly 50% must count as ready');
  assert.equal(regionFieldKnowledgeReady([true, true, false]), true);
  assert.equal(regionFieldKnowledgeReady([true]), true);
});

function nativeEnemyTypesForRegion(regionId) {
  return Object.entries(ENEMY_TYPES)
    .filter(([, e]) => e.chapterId && !e.boss)
    .filter(([, e]) => {
      const m = /^ch(\d+)$/.exec(e.chapterId || '');
      const region = m ? world3RegionForChapter(Number(m[1])) : null;
      return region?.id === regionId;
    })
    .map(([enemyType]) => enemyType);
}

function markRoleKnown(enemyType) {
  state.data.monsterCodex ??= {};
  state.data.monsterCodex[enemyType] = { ...(state.data.monsterCodex[enemyType] || {}), roleKnown: true };
}

test('Runtime: state.regionFieldKnowledgeReady() reads through the REAL existing enemyKnowledge()/roleKnown authority, not a separately-invented flag', () => {
  state.resetAll();
  const types = nativeEnemyTypesForRegion('frontier');
  assert.ok(types.length >= 2, 'frontier must have more than one native enemy type for this to be a real threshold test');
  assert.equal(state.regionFieldKnowledgeReady('frontier'), false, 'nothing known yet on a fresh save');

  const half = Math.ceil(types.length / 2);
  for (let i = 0; i < half - 1; i += 1) markRoleKnown(types[i]);
  if (half - 1 < types.length) assert.equal(state.regionFieldKnowledgeReady('frontier'), false, 'still below the 50% threshold');

  markRoleKnown(types[half - 1]);
  assert.equal(state.regionFieldKnowledgeReady('frontier'), true, 'at/above 50% of the region\'s native enemy types now have roleKnown -- must flip ready');
});

test('Runtime: state.archaeologyFieldNote() is null for an unknown record, null before the region threshold, and returns the authored note once ready -- never a progression gate', () => {
  state.resetAll();
  assert.equal(state.archaeologyFieldNote('not_a_real_record'), null);
  assert.equal(state.archaeologyFieldNote('frontier_record'), null, 'must stay null before the region\'s field knowledge is ready');

  const types = nativeEnemyTypesForRegion('frontier');
  for (const t of types) markRoleKnown(t);
  assert.equal(state.archaeologyFieldNote('frontier_record'), ARCHAEOLOGY_FIELD_NOTES.frontier_record);
});

test('Runtime: state.treasureHuntFieldNote() mirrors the same gate for Treasure Hunt chains', () => {
  state.resetAll();
  assert.equal(state.treasureHuntFieldNote('not_a_real_chain'), null);
  assert.equal(state.treasureHuntFieldNote('frontier_cache'), null);

  const types = nativeEnemyTypesForRegion('frontier');
  for (const t of types) markRoleKnown(t);
  assert.equal(state.treasureHuntFieldNote('frontier_cache'), TREASURE_HUNT_FIELD_NOTES.frontier_cache);
});

test('every Reconstructed Record / Treasure Hunt chain field note maps to a real, existing site/chain id -- no orphaned note', () => {
  const archaeologySrc = read('js/data/archaeology.js');
  for (const recordId of Object.keys(ARCHAEOLOGY_FIELD_NOTES)) {
    assert.match(archaeologySrc, new RegExp(`id:\\s*'${recordId}'`), `${recordId} must be a real Reconstructed Record id`);
  }
  const treasureHuntSrc = read('js/data/treasureHunt.js');
  for (const chainId of Object.keys(TREASURE_HUNT_FIELD_NOTES)) {
    assert.match(treasureHuntSrc, new RegExp(`id:\\s*'${chainId}'`), `${chainId} must be a real Treasure Hunt chain id`);
  }
});

test('C9-1: wired into archaeologyCodexUi.js\'s recordRow() and treasureHuntUi.js\'s huntCard() (and the claim-result re-render) as an appended flavor line, never substituted for the record/chain\'s own text', () => {
  const archaeologyUi = read('js/patches/archaeologyCodexUi.js');
  assert.match(archaeologyUi, /import '\.\/fieldKnowledge\.js';/);
  assert.match(archaeologyUi, /state\.archaeologyFieldNote\?\.\(r\.id\)/);
  assert.match(archaeologyUi, /escapeHtml\(r\.text\)\}\$\{fieldNote/, 'the field note must be appended AFTER the record\'s own text, never replacing it');

  const treasureHuntUi = read('js/patches/treasureHuntUi.js');
  assert.match(treasureHuntUi, /import '\.\/fieldKnowledge\.js';/);
  assert.match(treasureHuntUi, /state\.treasureHuntFieldNote\?\.\(hunt\.id\)/);
  assert.match(treasureHuntUi, /state\.treasureHuntFieldNote\?\.\(result\.chain\.id\)/, 'the claim-button re-render path must also surface the field note, not just the initial resolved render');
});

// ---- C9-2: Fishing hints -------------------------------------------------
// Completes the "Treasure hints; Archaeology interpretation" pair with the
// third item C9's own goal list names: "Fishing hints". Mirrors C9-1
// exactly, one note per region's own ヌシ (master fish).

test('Runtime: state.fishingFieldNote() mirrors the same gate for a region\'s ヌシ (master fish)', () => {
  state.resetAll();
  assert.equal(state.fishingFieldNote('not_a_real_fish'), null);
  assert.equal(state.fishingFieldNote('frontier_nushi'), null, 'must stay null before the region\'s field knowledge is ready');

  const types = nativeEnemyTypesForRegion('frontier');
  for (const t of types) markRoleKnown(t);
  assert.equal(state.fishingFieldNote('frontier_nushi'), FISHING_FIELD_NOTES.frontier_nushi);
});

test('every Fishing field note maps to a real, existing FISH_SPECIES id and specifically its region\'s ヌシ (master:true), never an ordinary fish', () => {
  const fishingSrc = read('js/data/fishing.js');
  for (const fishId of Object.keys(FISHING_FIELD_NOTES)) {
    const line = fishingSrc.split('\n').find((l) => l.includes(`id: '${fishId}'`));
    assert.ok(line, `${fishId} must be a real FISH_SPECIES entry`);
    assert.match(line, /master:\s*true/, `${fishId} must specifically be a ヌシ (master:true), never an ordinary fish`);
  }
});

test('C9-2: wired into fishingCodexUi.js\'s fishRow() as an appended flavor line, never substituted for the fish\'s own flavor text', () => {
  const fishingUi = read('js/patches/fishingCodexUi.js');
  assert.match(fishingUi, /import '\.\/fieldKnowledge\.js';/);
  assert.match(fishingUi, /state\.fishingFieldNote\?\.\(f\.id\)/);
  assert.match(fishingUi, /escapeHtml\(f\.flavor\)\}\$\{fieldNote/, 'the field note must be appended AFTER the fish\'s own flavor text, never replacing it');
});

// ---- C9-3: Rare encounter conditions --------------------------------------
// The fourth item C9's own goal list names ("Rare encounter conditions").
// Rare encounters (enemies.js's rareIdentity:true, one per chapter,
// already surfaced as a region-level count by C8-3) have no per-item
// authored text of their own, so this note is keyed by region and shown
// once at least one of the region's rare types has been seen -- see
// data/fieldKnowledge.js's own comment on RARE_ENCOUNTER_FIELD_NOTES.

test('Runtime: state.rareEncounterFieldNote() mirrors the same gate, keyed by region', () => {
  state.resetAll();
  assert.equal(state.rareEncounterFieldNote('not-a-real-region'), null);
  assert.equal(state.rareEncounterFieldNote('frontier'), null, 'must stay null before the region\'s field knowledge is ready');

  const types = nativeEnemyTypesForRegion('frontier');
  for (const t of types) markRoleKnown(t);
  assert.equal(state.rareEncounterFieldNote('frontier'), RARE_ENCOUNTER_FIELD_NOTES.frontier);
});

test('every Rare Encounter field note is keyed by a real WORLD3_REGIONS id -- no orphaned note', () => {
  const regionIds = new Set(WORLD3_REGIONS.map((r) => r.id));
  for (const regionId of Object.keys(RARE_ENCOUNTER_FIELD_NOTES)) {
    assert.ok(regionIds.has(regionId), `${regionId} must be a real WORLD3_REGIONS id`);
  }
});

test('C9-3: wired into regionCodexUi.js\'s regionCard() as an appended flavor line only once a rare type has actually been seen, never substituted for the region\'s own summary line', () => {
  const regionUi = read('js/patches/regionCodexUi.js');
  assert.match(regionUi, /import '\.\/fieldKnowledge\.js';/);
  assert.match(regionUi, /rareTotal\s*&&\s*rareSeen\s*>\s*0\s*\?\s*state\.rareEncounterFieldNote\?\.\(region\.id\)/, 'must only be looked up once the region\'s own condition (a rare actually seen) is already met');
});

test('No new save root: js/patches/fieldKnowledge.js never writes state.data -- it only reads through existing state functions', () => {
  const src = read('js/patches/fieldKnowledge.js');
  assert.doesNotMatch(src, /state\.data\.\w+\s*(=|\?\?=|&&=)/, 'fieldKnowledge.js must be read-only aggregation, matching regionCodex.js\'s own convention');
  assert.doesNotMatch(src, /localStorage/);
});

test('No new data authority: js/data/fieldKnowledge.js is pure data with no state.js/DOM dependency', () => {
  const src = read('js/data/fieldKnowledge.js');
  assert.doesNotMatch(src, /import .* from '\.\.\/state\.js'/);
  assert.doesNotMatch(src, /document\.|window\./);
});

test('No platform emoji introduced by the C9-1/C9-2/C9-3 field knowledge feature', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/data/fieldKnowledge.js', 'js/patches/fieldKnowledge.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});
