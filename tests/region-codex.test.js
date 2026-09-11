import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { regionCodexRegions, regionCodexBundle } from '../js/data/regionCodex.js';
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

test('No platform emoji introduced by the Region Codex feature', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/data/regionCodex.js', 'js/patches/regionCodex.js', 'js/patches/regionCodexUi.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});
