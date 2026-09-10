import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FISHING_SPOTS, FISH_SPECIES, isFishingSpotUnlocked, pickFishForSpot,
  resolveFishingRound, fishingDifficultyProfile, FISHING_ACTIONS, FISHING_ACTION_LABELS,
  computeFishingReward, fishCodexBonuses, fishStatBonus, FISHING_CUE_GUIDE,
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

test('fishStatBonus: grows with repeat catches of the SAME fish, never caps, and only feeds its own statTarget (user direction: no ceiling, different fish should buff different stats)', () => {
  const master = FISH_SPECIES.find((f) => f.id === 'frontier_nushi');
  const zero = fishStatBonus(master, 0);
  assert.equal(zero.bonusPct, 0);
  const five = fishStatBonus(master, 5);
  const ten = fishStatBonus(master, 10);
  assert.ok(ten.bonusPct > five.bonusPct, 'more catches of the same fish must keep increasing its bonus');
  const huge = fishStatBonus(master, 5000);
  assert.ok(huge.bonusPct > ten.bonusPct * 100, 'there must be no cap -- an extreme catch count keeps paying off proportionally');
  assert.equal(fishStatBonus(master, 20).stat, master.statTarget);
  // Rarer fish are worth more per catch.
  const common = FISH_SPECIES.find((f) => f.id === 'silver_carp');
  assert.ok(fishStatBonus(master, 1).bonusPct > fishStatBonus(common, 1).bonusPct);
});

test('Every one of the 6 stats has real fish coverage, and fish are not all the same stat', () => {
  const stats = new Set(FISH_SPECIES.map((f) => f.statTarget));
  assert.deepEqual([...stats].sort(), ['atk', 'def', 'hp', 'mag', 'mp', 'spd']);
  for (const stat of stats) assert.ok(FISH_SPECIES.filter((f) => f.statTarget === stat).length >= 2, `${stat} should have more than one fish feeding it`);
});

test('fishCodexBonuses: sums every fish\'s own contribution PER STAT (a fish never buffs a stat it does not target); a realistic mid-game investment is a meaningfully large, noticeable bonus', () => {
  const zeroList = FISH_SPECIES.map((f) => ({ ...f, caught: 0 }));
  const zero = fishCodexBonuses(zeroList);
  assert.equal(zero.totalPct, 0);
  for (const stat of Object.keys(zero.byStat)) assert.equal(zero.byStat[stat], 0);
  const midList = FISH_SPECIES.map((f) => {
    if (f.id === 'frontier_nushi') return { ...f, caught: 20 }; // hp
    if (f.id === 'silver_carp' || f.id === 'mud_loach') return { ...f, caught: 100 }; // hp, def
    return { ...f, caught: 0 };
  });
  const mid = fishCodexBonuses(midList);
  assert.ok(mid.totalPct >= 40, 'a realistic focused investment should read as a real, noticeable bonus');
  assert.ok(mid.byStat.hp > 0 && mid.byStat.def > 0, 'the bonus must land on the specific stats those fish target');
  assert.equal(mid.byStat.atk, 0, 'a fish must not contribute to a stat it does not target');
});

test('Fish Codex bonus is chained onto getStats()/getStatBreakdown() the same way Rune 2.0 chains onto Codex, uncapped', () => {
  // Fresh state: no bonus yet.
  assert.deepEqual(Object.values(state.fishStatBonusesByStat()), [0, 0, 0, 0, 0, 0]);
  const baselineHp = state.getStats().hp;
  // Grant a focused investment (one maxed master, targets hp) directly through the same __settlement3 meta the runtime itself owns.
  const meta = (state.data.settlementBuildings ??= {})['__settlement3'] ??= {};
  meta.fishing = { codex: { frontier_nushi: { seen: true, caught: 20 } } };
  assert.ok(state.fishStatBonusesByStat().hp > 19 && state.fishStatBonusesByStat().hp < 21, 'one maxed master fish alone should be a clearly noticeable ~+20% bonus to its own stat');
  assert.equal(state.fishStatBonusesByStat().atk, 0, 'a hp-targeting fish must not touch atk');
  assert.ok(state.getStats().hp > baselineHp, 'the bonus must actually raise stats through the real getStats() pipeline');
  const breakdown = state.getStatBreakdown('hp');
  assert.ok('fish' in breakdown, 'getStatBreakdown must report a separate fish component, like it already does for codex/rune');
  // No cap: a very large catch count keeps growing.
  meta.fishing = { codex: { frontier_nushi: { seen: true, caught: 2000 } } };
  assert.ok(state.fishStatBonusesByStat().hp > 100, 'no ceiling -- an extreme catch count keeps paying off (like Rune 2.0 has no cap on marks)');
  // clean up so this test does not leak state into other tests in the same process
  meta.fishing = { codex: {} };
});

test('FISHING_CUE_GUIDE: one legend entry per action, matching FISHING_ACTIONS/FISHING_ACTION_LABELS exactly (so a UI legend built from it can never drift out of sync)', () => {
  assert.deepEqual(FISHING_CUE_GUIDE.map((g) => g.action), [...FISHING_ACTIONS]);
  for (const g of FISHING_CUE_GUIDE) {
    assert.equal(g.label, FISHING_ACTION_LABELS[g.action]);
    assert.ok(g.cueText && g.cueText.length > 0, `${g.action} must carry real cue text`);
  }
});

test('startFishing rejects starting a second rod while one is already in flight (regression: activeSession was a single unkeyed slot that a second start silently overwrote, desyncing whichever spot card was already mid-round)', () => {
  state.resetAll();
  state.data.stageProgress ??= {};
  state.data.stageProgress['1-1'] = true; // unlocks frontier
  state.data.stageProgress['5-1'] = true; // unlocks elemental
  const first = state.startFishing('frontier_riverbank');
  assert.ok(first.ok, 'first rod should start cleanly');

  // Same spot, mid-round: must not silently reset progress/pick a new fish.
  const sameSpotAgain = state.startFishing('frontier_riverbank');
  assert.equal(sameSpotAgain.ok, false);
  assert.equal(sameSpotAgain.reason, 'busy');
  assert.equal(sameSpotAgain.spotId, 'frontier_riverbank');

  // A different spot, while the first rod is still out: must not clobber it either.
  const otherSpot = state.startFishing('elemental_hotspring');
  assert.equal(otherSpot.ok, false);
  assert.equal(otherSpot.reason, 'busy');
  assert.equal(otherSpot.spotId, 'frontier_riverbank', 'the busy reason must name the spot that actually owns the in-flight round');

  // Resolve the in-flight round (force misses until it escapes) so state
  // does not leak into later tests, then confirm the slot frees up.
  let outcome = 'ongoing';
  for (let i = 0; i < 20 && outcome === 'ongoing'; i++) {
    const wrongAction = FISHING_ACTIONS.find((a) => a !== 'hook'); // never guaranteed correct -> forces misses/escape eventually
    outcome = state.fishingAction(wrongAction).outcome;
  }
  assert.notEqual(outcome, 'ongoing', 'the round must actually resolve within a bounded number of attempts');
  const afterResolve = state.startFishing('elemental_hotspring');
  assert.ok(afterResolve.ok, 'once the first round resolves, a new rod can be cast');
  // Clean up the second rod too.
  let outcome2 = 'ongoing';
  for (let i = 0; i < 20 && outcome2 === 'ongoing'; i++) {
    const wrongAction = FISHING_ACTIONS.find((a) => a !== 'hook');
    outcome2 = state.fishingAction(wrongAction).outcome;
  }
});

test('No platform emoji introduced by the Fishing feature', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['../js/data/fishing.js', '../js/patches/fishing.js', '../js/patches/fishingUi.js', '../js/patches/fishingCodexUi.js']) {
    const src = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(src, PICTOGRAPH, `${file} must not render platform emoji`);
  }
});
