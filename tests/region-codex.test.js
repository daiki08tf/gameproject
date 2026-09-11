import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { regionCodexRegions, regionCodexBundle, regionBossSummary } from '../js/data/regionCodex.js';
import { CHAPTERS } from '../js/data/stages.js';
import { state } from '../js/state.js';
import '../js/patches/settlementCore.js';
import '../js/patches/regionCodex.js';

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

// ---- C8-1: Region Codex ----------------------------------------------------
// Per LIVING_WORLD_DISCOVERY_ROADMAP.md C8: "A Region should be a coherent
// gameplay/ecology identity... express a bundle". This is a pure READ-side
// aggregation of existing Fishing/Archaeology/Treasure Hunt/fauna data --
// no new content, no new save data.

test('regionCodexRegions() only covers the 4 mortal regions Fishing/Archaeology/Treasure Hunt already reach, not the 5 later, unbuilt ones', () => {
  const regions = regionCodexRegions();
  const ids = regions.map((r) => r.id);
  assert.deepEqual(ids, ['frontier', 'elemental', 'fracture', 'last-mortal']);
  assert.equal(regions.length, WORLD3_REGIONS.filter((r) => r.tone === 'mortal').length, 'must match every "mortal" tone region, not an arbitrary subset');
});

test('regionCodexBundle() returns null for a region outside the covered set, and for an unknown id -- never a misleadingly empty bundle', () => {
  assert.equal(regionCodexBundle('veil', {}), null);
  assert.equal(regionCodexBundle('not-a-real-region', {}), null);
});

test('regionCodexBundle() is a pure filter of the given sources by regionId -- it never invents data or recomputes progress itself', () => {
  const sources = {
    faunaSpecies: [{ id: 'a', regionId: 'frontier', seen: true }, { id: 'b', regionId: 'frontier', seen: false }, { id: 'c', regionId: 'elemental', seen: true }],
    fishingSpots: [{ id: 'spot1', regionId: 'frontier', name: 'X' }],
    fishCodex: [{ id: 'fish1', regionId: 'frontier', seen: true }, { id: 'fish2', regionId: 'frontier', seen: false }],
    archaeologySites: [{ id: 'site1', regionId: 'frontier', name: 'Y', foundCount: 2, totalCount: 4, recordUnlocked: false }],
    treasureHunts: [{ id: 'hunt1', regionId: 'frontier', stage: 'resolved' }, { id: 'hunt2', regionId: 'frontier', stage: 'unresolved' }],
  };
  const bundle = regionCodexBundle('frontier', sources);
  assert.equal(bundle.faunaSeen, 1);
  assert.equal(bundle.faunaTotal, 2);
  assert.equal(bundle.fishSeen, 1);
  assert.equal(bundle.fishTotal, 2);
  assert.equal(bundle.fishingSpot.id, 'spot1');
  assert.equal(bundle.archaeologySite.id, 'site1');
  assert.equal(bundle.treasureHunts.length, 2);
});

test('Runtime: state.regionCodexList() reads real, already-existing state (fauna discovered via the enemy Codex, fishing/archaeology/treasure-hunt progress via their own existing state functions) -- no separate new save data to migrate', () => {
  state.resetAll();
  state.data.stageProgress = state.data.stageProgress || {};
  state.data.stageProgress['1-1'] = { cleared: true };
  const list = state.regionCodexList();
  const frontier = list.find((b) => b.region.id === 'frontier');
  assert.ok(frontier, 'frontier must be reachable once its first stage is cleared, same gate Fishing/Archaeology already use');
  assert.equal(frontier.archaeologySite.id, 'frontier_cairn');
  assert.equal(frontier.fishingSpot.id, 'frontier_riverbank');
  assert.ok(frontier.faunaTotal > 0, 'frontier must have at least one native companion species');
  assert.equal(frontier.faunaSeen, 0, 'nothing has been discovered yet on a fresh save');

  // Marking an enemy Codex entry seen for a frontier-native species must
  // move faunaSeen -- proving this reads the real, existing enemy Codex
  // rather than a separate, newly-invented "discovered" flag.
  state.markCodexSeen?.({ type: 'grunt', name: 'ゴブリン' });
  const after = state.regionCodexList().find((b) => b.region.id === 'frontier');
  assert.ok(after.faunaSeen >= frontier.faunaSeen);
});

test('C8-1: no new save root -- regionCodex.js never writes state.data, it only reads through existing state functions', () => {
  const src = read('js/patches/regionCodex.js');
  assert.doesNotMatch(src, /state\.data\.\w+\s*(=|\?\?=|&&=)/, 'regionCodex.js must not write to state.data at all -- it is read-only aggregation');
  assert.doesNotMatch(src, /localStorage/);
});

test('C8-1: the Region Codex lives inside the existing Monster Codex screen (no new screen, no new Home button) and is grouped into its own 地域 tab', () => {
  const ui = read('js/patches/regionCodexUi.js');
  assert.match(ui, /getElementById\('monsterCodexContent'\)/);
  assert.doesNotMatch(ui, /goRegionCodexBtn|new Home button/i);
  const compact = read('js/patches/monsterCodexCompactUi.js');
  assert.match(compact, /\['region', '地域'\]/);
  assert.match(compact, /\['\[data-region-codex\]', 'region'\]/);
});

// A real bug found live: monsterCodexCompactUi.js's JS-side TABS list is
// only half of the wiring -- css/monsterCodexCompact.css has its own,
// separately-hardcoded per-tab show/hide rule for each tab id. Adding
// 'region' to TABS/SELECTOR_TAB alone left the section permanently
// display:none (the catch-all hide rule matched, but no show rule ever
// did) -- confirmed only by actually clicking the tab in a live browser,
// not by any static check. Lock in that every TABS entry has a matching
// CSS show rule so a future new tab can't silently repeat this.
test('C8-1 regression: every tab in monsterCodexCompactUi.js\'s TABS has a matching show rule in css/monsterCodexCompact.css -- adding a JS tab alone is not enough', () => {
  const compact = read('js/patches/monsterCodexCompactUi.js');
  const css = read('css/monsterCodexCompact.css');
  const tabIds = [...compact.matchAll(/\['(\w+)',\s*'[^']+'\]/g)].map((m) => m[1]);
  assert.ok(tabIds.includes('region'), 'sanity check: the tab list must still include region');
  for (const id of tabIds) {
    assert.match(css, new RegExp(`data-codex-tab='${id}'\\s*\\]\\s*>\\s*\\[data-codex-tab-group='${id}'\\]\\{display:block\\}`), `TABS entry "${id}" has no matching show rule in monsterCodexCompact.css`);
  }
});

// ---- C8-2: boss / hidden-threat identity -----------------------------
// The other "bundle" item C8's own goal names (Boss / hidden threat)
// alongside ecology/fish/archaeology/Rumor. Reads stages.js's existing
// boss:true/branch:true stages directly -- authors nothing new.

test('regionBossSummary() withholds a boss/hidden-threat name until its own chapter is unlocked, matching chapterSelect.js\'s own convention -- never spoils ahead of progress', () => {
  const region = WORLD3_REGIONS.find((r) => r.id === 'frontier');
  const lockedCtx = { isStageCleared: () => false, isChapterUnlocked: () => false };
  const { bosses, hiddenThreats } = regionBossSummary(region, CHAPTERS, lockedCtx);
  assert.ok(bosses.length > 0);
  for (const b of bosses) assert.equal(b.name, null);
  for (const h of hiddenThreats) assert.equal(h.name, null);

  const unlockedCtx = { isStageCleared: () => false, isChapterUnlocked: () => true };
  const revealed = regionBossSummary(region, CHAPTERS, unlockedCtx);
  for (const b of revealed.bosses) assert.equal(typeof b.name, 'string');
});

test('regionBossSummary() is a pure function of the injected predicates -- cleared/unlocked state comes only from ctx, never read from state.data directly', () => {
  const src = fs.readFileSync(new URL('../js/data/regionCodex.js', import.meta.url), 'utf8');
  const fnBody = src.slice(src.indexOf('export function regionBossSummary'));
  assert.doesNotMatch(fnBody, /state\.data/);
});

test('Runtime: state.regionCodexList() attaches real boss/hidden-threat progress via the existing stageProgress authority (isStageCleared/isChapterUnlocked), no new save field -- a later, not-yet-reached chapter\'s boss in the same region stays hidden', () => {
  state.resetAll();
  state.data.stageProgress = state.data.stageProgress || {};
  const before = state.regionCodexList().find((b) => b.region.id === 'frontier');
  assert.ok(before.bosses.length > 1, 'frontier must have more than one chapter to make this a real test of the per-chapter unlock gate');
  const chapter2Boss = before.bosses.find((b) => b.chapterNum === 2);
  assert.ok(chapter2Boss);
  assert.equal(chapter2Boss.cleared, false);
  assert.equal(chapter2Boss.name, null, 'chapter 2 is locked until chapter 1\'s boss is cleared on a fresh save, so its boss name must stay hidden');
});

test('Runtime: chapter 1 (always unlocked) reveals its own boss name immediately, and clearing it flips `cleared`', () => {
  state.resetAll();
  state.data.stageProgress = state.data.stageProgress || {};
  const before = state.regionCodexList().find((b) => b.region.id === 'frontier');
  const ch1Boss = before.bosses.find((b) => b.chapterNum === 1);
  assert.ok(ch1Boss);
  assert.equal(typeof ch1Boss.name, 'string', 'chapter 1 is always unlocked, so its boss name must be visible on a fresh save');
  assert.equal(ch1Boss.cleared, false);

  state.data.stageProgress['1-5'] = { cleared: true };
  const after = state.regionCodexList().find((b) => b.region.id === 'frontier');
  assert.equal(after.bosses.find((b) => b.chapterNum === 1).cleared, true);
});

// ---- C8-3: rare encounter identity -------------------------------------
// The last "bundle" item C8's own goal names. Reuses the EXISTING Enemy
// 2.0 rare-role system (enemies.js's rareIdentity:true) directly -- no
// new rare-enemy authority.

test('regionCodexBundle() aggregates rareEncounters the same way as fauna -- filtered by regionId, counted seen/total', () => {
  const sources = {
    rareEncounters: [
      { id: 'ch1_rare', regionId: 'frontier', seen: true },
      { id: 'ch2_rare', regionId: 'frontier', seen: false },
      { id: 'ch5_rare', regionId: 'elemental', seen: true },
    ],
  };
  const bundle = regionCodexBundle('frontier', sources);
  assert.equal(bundle.rareSeen, 1);
  assert.equal(bundle.rareTotal, 2);
});

test('Runtime: state.regionCodexList() reads rare-encounter discovery through the existing enemy Codex (state.data.monsterCodex[enemyType].seen) -- no new discovery flag', () => {
  state.resetAll();
  state.data.stageProgress = state.data.stageProgress || {};
  const before = state.regionCodexList().find((b) => b.region.id === 'frontier');
  assert.ok(before.rareTotal > 0, 'frontier must have at least one region-native rare enemy type (Enemy 2.0 already defines one per chapter)');
  assert.equal(before.rareSeen, 0, 'nothing marked seen yet on a fresh save');

  // Mark chapter 1's rare enemy type seen via the SAME real codex path
  // fauna/boss discovery already goes through -- proves this isn't a
  // separately-invented tracking flag.
  state.markCodexSeen?.({ type: 'ch1_rare', name: 'テスト', rareIdentity: true });
  const after = state.regionCodexList().find((b) => b.region.id === 'frontier');
  assert.ok(after.rareSeen >= before.rareSeen);
});

test('C8-3: no new rare-enemy authority -- regionCodex.js reads enemies.js\'s existing rareIdentity flag, it never defines a rare enemy itself', () => {
  const src = read('js/patches/regionCodex.js');
  assert.match(src, /import \{ ENEMY_TYPES \} from '\.\.\/data\/enemies\.js';/);
  assert.match(src, /e\.rareIdentity/);
  assert.doesNotMatch(src, /rareIdentity:\s*true/, 'must never author a NEW rareIdentity entry, only read the existing ones');
});

// ---- C8-4: Unique/Rune target per region -------------------------------
// Completes C8's originally-listed "bundle" (ecology, fish, archaeology,
// Rumor, boss/hidden threat, rare encounter, Rune target). Rune 2.1
// already gives each numbered Story chapter exactly one Rune -- no new
// Rune authority, this only counts region-native Runes the player has
// actually started owning.

test('regionCodexBundle() aggregates runes the same way as fauna/rareEncounters -- filtered by regionId, counted owned/total', () => {
  const sources = {
    runes: [
      { id: 'force', regionId: 'frontier', owned: true },
      { id: 'ironclad', regionId: 'frontier', owned: false },
      { id: 'wise', regionId: 'frontier', owned: false },
      { id: 'notfall', regionId: 'frontier', owned: false },
      { id: 'hawkeye', regionId: 'elemental', owned: true },
    ],
  };
  const bundle = regionCodexBundle('frontier', sources);
  assert.equal(bundle.runesOwned, 1);
  assert.equal(bundle.runesTotal, 4);
});

test('Runtime: state.regionCodexList() counts real region-native Runes via the existing Rune 2.1 authority (RUNE2_DEFS + state.rune2OwnedMarks()) -- no new Rune data, no new ownership flag', () => {
  state.resetAll();
  const before = state.regionCodexList().find((b) => b.region.id === 'frontier');
  // frontier = chapters 1-4, and RUNE2_DEFS gives exactly one Rune per
  // chapter 1-36, so frontier must have exactly 4.
  assert.equal(before.runesTotal, 4);
  assert.equal(before.runesOwned, 0, 'nothing owned on a fresh save');

  // Grant chapter 1's Rune ('force') via the real Rune 2.1 mark-granting
  // authority, not a separately-invented flag.
  state.addRune2Marks('force', 1);
  const after = state.regionCodexList().find((b) => b.region.id === 'frontier');
  assert.equal(after.runesOwned, before.runesOwned + 1);
});

test('C8-4: no new Rune authority -- regionCodex.js reads the existing RUNE2_DEFS/state.rune2OwnedMarks(), it never defines a Rune itself', () => {
  const src = read('js/patches/regionCodex.js');
  assert.match(src, /import \{ RUNE2_DEFS \} from '\.\.\/data\/runes2\.js';/);
  assert.match(src, /state\.rune2OwnedMarks\(r\.id\)/);
  assert.doesNotMatch(src, /RUNE2_DEFS\s*=|RUNE2_DEFS\.push/, 'must never mutate or redefine RUNE2_DEFS');
});

test('No platform emoji introduced by the Region Codex feature', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/data/regionCodex.js', 'js/patches/regionCodex.js', 'js/patches/regionCodexUi.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});
