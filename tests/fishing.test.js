import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FISHING_SPOTS, FISH_SPECIES, isFishingSpotUnlocked, pickFishForSpot,
  resolveFishingRound, fishingDifficultyProfile, FISHING_ACTIONS, FISHING_ACTION_LABELS,
  computeFishingReward, fishCodexBonuses,
} from '../js/data/fishing.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { state } from '../js/state.js';
import '../js/patches/fishing.js';

test('C3 Fishing: several regions ship in this first slice, each with a spot and a named master fish', () => {
  assert.equal(FISHING_SPOTS.length, 4);
  for (const spot of FISHING_SPOTS) {
    assert.ok(WORLD3_REGIONS.some((r) => r.id === spot.regionId), `${spot.id} must reference a real World 3.0 region`);
    const pool = FISH_SPECIES.filter((f) => f.regionId === spot.regionId);
    assert.ok(pool.length >= 3, `${spot.regionId} must have a real regional fish roster`);
    assert.ok(pool.filter((f) => f.master).length === 1, `${spot.regionId} must have exactly one named ヌシ/master fish`);
  }
});

test('Roster expansion: 29 fish across the 4 regions, at least 6 regular fish per region, all ids unique', () => {
  assert.equal(FISH_SPECIES.length, 29);
  const ids = FISH_SPECIES.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate fish ids');
  for (const spot of FISHING_SPOTS) {
    const pool = FISH_SPECIES.filter((f) => f.regionId === spot.regionId);
    assert.ok(pool.filter((f) => !f.master).length >= 6, `${spot.regionId} should have real roster depth beyond the original 3`);
  }
});

test('Fishing spots unlock via existing story progress (region chapters cleared), not a new Settlement-building gate', () => {
  const none = isFishingSpotUnlocked(FISHING_SPOTS[0], { hasClearedChapter: () => false });
  assert.equal(none, false);
  const frontier = FISHING_SPOTS.find((s) => s.regionId === 'frontier');
  const region = WORLD3_REGIONS.find((r) => r.id === 'frontier');
  const cleared = isFishingSpotUnlocked(frontier, { hasClearedChapter: (n) => n === region.chapters[0] });
  assert.equal(cleared, true);
});

test('pickFishForSpot respects weight (master fish is rare, common fish is common)', () => {
  const counts = {};
  for (let i = 0; i < 4000; i++) {
    const fish = pickFishForSpot('frontier_riverbank', Math.random);
    counts[fish.id] = (counts[fish.id] || 0) + 1;
  }
  const master = counts.frontier_nushi || 0;
  const common = counts.silver_carp || 0;
  assert.ok(common > master * 5, 'a common fish must be drawn much more often than the master fish');
  assert.ok(master > 0, 'the master fish must still be reachable');
});

test('resolveFishingRound: enough correct actions catches the fish, running out of misses lets it escape', () => {
  const fish = FISH_SPECIES.find((f) => f.id === 'silver_carp'); // difficulty 1 -> 2 rounds needed, 3 misses tolerated
  let r = resolveFishingRound({ fish, progress: 0, misses: 0, correctAction: 'hook', chosenAction: 'hook' });
  assert.equal(r.outcome, 'ongoing');
  r = resolveFishingRound({ fish, progress: r.progress, misses: r.misses, correctAction: 'wait', chosenAction: 'wait' });
  assert.equal(r.outcome, 'caught');

  let progress = 0, misses = 0, outcome = 'ongoing';
  for (let i = 0; i < 10 && outcome === 'ongoing'; i++) {
    const rr = resolveFishingRound({ fish, progress, misses, correctAction: 'hook', chosenAction: 'wait' });
    progress = rr.progress; misses = rr.misses; outcome = rr.outcome;
  }
  assert.equal(outcome, 'escaped');
  assert.equal(progress, 0, 'no partial materials/progress should carry over from an escape');
});

test('Difficulty profile is bounded and monotonic-ish (higher difficulty is not easier)', () => {
  const profiles = [1, 2, 3, 4, 5, 6].map((d) => fishingDifficultyProfile(d));
  for (const p of profiles) {
    assert.ok(p.roundsNeeded >= 2 && p.roundsNeeded <= 5);
    assert.ok(p.maxMisses >= 2 && p.maxMisses <= 3);
  }
  assert.ok(fishingDifficultyProfile(6).roundsNeeded >= fishingDifficultyProfile(1).roundsNeeded);
});

test('Exactly the three roadmap-named commands exist, each with a Japanese label', () => {
  assert.deepEqual([...FISHING_ACTIONS].sort(), ['hook', 'slack', 'wait']);
  assert.equal(FISHING_ACTION_LABELS.hook, '合わせる');
  assert.equal(FISHING_ACTION_LABELS.wait, '待つ');
  assert.equal(FISHING_ACTION_LABELS.slack, '糸を緩める');
});

test('computeFishingReward: first catch grants the full reward including gold (regression: addSettlementMaterials silently drops gold)', () => {
  const master = FISH_SPECIES.find((f) => f.master && f.regionId === 'frontier'); // { veilstone:2, gold:100 }
  const first = computeFishingReward(master, true);
  assert.deepEqual(first.materials, { veilstone: 2 });
  assert.equal(first.gold, 100, 'the full gold reward must not be lost on the first, full-reward catch');
  const repeat = computeFishingReward(master, false);
  assert.deepEqual(repeat.materials, {}, 'repeat catches grant no materials (matches settlementExploration.js revisit precedent)');
  assert.equal(repeat.gold, 30, 'repeat catches of a master fish trickle 30% of its gold reward');

  const common = FISH_SPECIES.find((f) => f.id === 'silver_carp'); // no gold field
  assert.equal(computeFishingReward(common, false).gold, 0, 'a fish with no gold reward yields no gold on repeat catches either');
});

test('No new currency: every fish reward is only existing materials/gold', () => {
  const knownKeys = new Set(['wood', 'ore', 'hide', 'veilstone', 'gold']);
  for (const fish of FISH_SPECIES) {
    for (const key of Object.keys(fish.reward || {})) assert.ok(knownKeys.has(key), `${fish.id} reward key "${key}" must be an existing currency/material`);
  }
});

test('Runtime reuses the existing __settlement3 meta nesting -- no new save root', () => {
  const runtime = fs.readFileSync(new URL('../js/patches/fishing.js', import.meta.url), 'utf8');
  assert.match(runtime, /__settlement3/);
  assert.match(runtime, /root\[META_KEY\]/);
  assert.doesNotMatch(runtime, /state\.data\.fishing\s*=/);
  assert.doesNotMatch(runtime, /state\.data\.fishingSave\s*=/);
});

test('Fishing UI lives inside the existing Settlement/Monster-Codex screens (no new screen, no new Home button), wired via homeNavigation.js', () => {
  const ui = fs.readFileSync(new URL('../js/patches/fishingUi.js', import.meta.url), 'utf8');
  const codexUi = fs.readFileSync(new URL('../js/patches/fishingCodexUi.js', import.meta.url), 'utf8');
  const nav = fs.readFileSync(new URL('../js/patches/homeNavigation.js', import.meta.url), 'utf8');
  assert.match(ui, /settlementContent/);
  assert.match(codexUi, /monsterCodexContent/);
  assert.doesNotMatch(nav, /goFishingBtn|menu-card.*釣り|釣り.*menu-card/);
  assert.match(nav, /fishing\.js/);
  assert.match(nav, /fishingUi\.js/);
  assert.match(nav, /fishingCodexUi\.js/);
  // idempotent-append DOM safety pattern (no unconditional rewrite inside the observed subtree)
  assert.match(ui, /querySelector\(['"]\[data-fishing\]['"]\)/);
  assert.match(codexUi, /querySelector\(['"]\[data-fish-codex\]['"]\)/);
});

test('fishCodexBonuses: modest, capped, two independent tracks (species % and masters caught)', () => {
  const none = fishCodexBonuses({ seen: 0, total: 29, mastersSeen: 0, mastersTotal: 4 });
  assert.equal(none.allStatMult, 1);
  const quarter = fishCodexBonuses({ seen: 8, total: 29, mastersSeen: 0, mastersTotal: 4 }); // 27.6% -> crosses the 25% bucket
  assert.ok(quarter.allStatMult > 1 && quarter.allStatMult < 1.01, 'crossing the 25% bucket should be a small bump, not a big one');
  const allMasters = fishCodexBonuses({ seen: 0, total: 29, mastersSeen: 4, mastersTotal: 4 });
  assert.equal(Math.round((allMasters.allStatMult - 1) * 10000) / 10000, 0.01, 'all 4 masters caught alone should be exactly +1%');
  const full = fishCodexBonuses({ seen: 29, total: 29, mastersSeen: 4, mastersTotal: 4 });
  assert.ok(full.complete);
  assert.ok(full.allStatMult < 1.04, 'full completion must stay a modest bonus, not a big power source (Monster Codex caps at +2%; this should be comparable, not larger)');
});

test('Fish Codex completion is chained onto getStats()/getStatBreakdown() the same way Rune 2.0 chains onto Codex', () => {
  // Fresh state: no bonus yet.
  assert.equal(state.fishCodexStatMult(), 1);
  const baselineHp = state.getStats().hp;
  // Grant full completion directly through the same __settlement3 meta the runtime itself owns.
  const meta = (state.data.settlementBuildings ??= {})['__settlement3'] ??= {};
  meta.fishing = { codex: Object.fromEntries(FISH_SPECIES.map((f) => [f.id, { seen: true, caught: 1 }])) };
  assert.equal(state.fishCodexSummary().seen, FISH_SPECIES.length);
  assert.ok(state.fishCodexStatMult() > 1.03 && state.fishCodexStatMult() < 1.031);
  assert.ok(state.getStats().hp >= baselineHp, 'full Fish Codex completion must never lower a stat');
  const breakdown = state.getStatBreakdown('hp');
  assert.ok('fish' in breakdown, 'getStatBreakdown must report a separate fish component, like it already does for codex/rune');
  // clean up so this test does not leak state into other tests in the same process
  meta.fishing = { codex: {} };
});

test('No platform emoji introduced by the Fishing feature', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['../js/data/fishing.js', '../js/patches/fishing.js', '../js/patches/fishingUi.js', '../js/patches/fishingCodexUi.js']) {
    const src = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(src, PICTOGRAPH, `${file} must not render platform emoji`);
  }
});
