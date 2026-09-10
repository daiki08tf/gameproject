import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ARCHAEOLOGY_SITES, ARTIFACT_FRAGMENTS, RECONSTRUCTED_RECORDS,
  isArchaeologySiteUnlocked, pickFragmentForSite, resolveExcavationRound,
  excavationDifficultyProfile, EXCAVATION_ACTIONS, EXCAVATION_ACTION_LABELS, EXCAVATION_CUE_GUIDE,
  computeArchaeologyReward, isSiteFullyExcavated, getReconstructedRecord, fragmentsForSite,
} from '../js/data/archaeology.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { state } from '../js/state.js';
import '../js/patches/archaeology.js';

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

test('C4 Archaeology: one site per region in this first slice, each with a real fragment roster and exactly one Reconstructed Record', () => {
  assert.equal(ARCHAEOLOGY_SITES.length, 4);
  for (const site of ARCHAEOLOGY_SITES) {
    assert.ok(WORLD3_REGIONS.some((r) => r.id === site.regionId), `${site.id} must reference a real World 3.0 region`);
    const pool = fragmentsForSite(site.id);
    assert.ok(pool.length >= 4, `${site.regionId} must have a real fragment roster`);
    assert.ok(getReconstructedRecord(site.id), `${site.id} must have exactly one Reconstructed Record`);
  }
  const ids = ARTIFACT_FRAGMENTS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate fragment ids');
  assert.equal(RECONSTRUCTED_RECORDS.length, ARCHAEOLOGY_SITES.length);
});

test('Archaeology sites unlock via existing story progress (region chapters cleared), not a new Settlement-building gate', () => {
  const none = isArchaeologySiteUnlocked(ARCHAEOLOGY_SITES[0], { hasClearedChapter: () => false });
  assert.equal(none, false);
  const frontier = ARCHAEOLOGY_SITES.find((s) => s.regionId === 'frontier');
  const region = WORLD3_REGIONS.find((r) => r.id === 'frontier');
  const cleared = isArchaeologySiteUnlocked(frontier, { hasClearedChapter: (n) => n === region.chapters[0] });
  assert.equal(cleared, true);
});

test('pickFragmentForSite prioritizes not-yet-seen fragments, and falls back to the full pool once every fragment has been seen', () => {
  const siteId = 'frontier_cairn';
  const pool = fragmentsForSite(siteId);
  const allButOne = new Set(pool.slice(1).map((f) => f.id));
  // With every-but-one already seen, the pick must always be the unseen one.
  for (let i = 0; i < 30; i++) {
    const picked = pickFragmentForSite(siteId, allButOne, Math.random);
    assert.equal(picked.id, pool[0].id);
  }
  // With everything seen, the pool falls back to any fragment (not null).
  const allSeen = new Set(pool.map((f) => f.id));
  const picked = pickFragmentForSite(siteId, allSeen, () => 0.5);
  assert.ok(pool.some((f) => f.id === picked.id));
});

test('resolveExcavationRound: enough correct actions recovers the fragment, running out of misses lets it crumble', () => {
  const fragment = ARTIFACT_FRAGMENTS.find((f) => f.id === 'frontier_stone_marker'); // difficulty 1 -> 2 rounds needed, 3 misses tolerated
  let r = resolveExcavationRound({ fragment, progress: 0, misses: 0, correctAction: 'brush', chosenAction: 'brush' });
  assert.equal(r.outcome, 'ongoing');
  r = resolveExcavationRound({ fragment, progress: r.progress, misses: r.misses, correctAction: 'dig', chosenAction: 'dig' });
  assert.equal(r.outcome, 'recovered');

  let miss = resolveExcavationRound({ fragment, progress: 0, misses: 0, correctAction: 'brush', chosenAction: 'dig' });
  miss = resolveExcavationRound({ fragment, progress: miss.progress, misses: miss.misses, correctAction: 'brush', chosenAction: 'brace' });
  miss = resolveExcavationRound({ fragment, progress: miss.progress, misses: miss.misses, correctAction: 'brush', chosenAction: 'dig' });
  assert.equal(miss.outcome, 'crumbled');
});

test('EXCAVATION_CUE_GUIDE stays in sync with EXCAVATION_ACTIONS/EXCAVATION_ACTION_LABELS (UI legend cannot drift from real round logic)', () => {
  assert.equal(EXCAVATION_CUE_GUIDE.length, EXCAVATION_ACTIONS.length);
  for (const entry of EXCAVATION_CUE_GUIDE) {
    assert.equal(entry.label, EXCAVATION_ACTION_LABELS[entry.action]);
    assert.ok(entry.cueText.length > 0);
  }
});

test('computeArchaeologyReward: first find grants the full materials+gold, a repeat find only trickles 30% gold (no materials)', () => {
  const fragment = ARTIFACT_FRAGMENTS.find((f) => f.id === 'frontier_buried_stake'); // reward: {wood:4, gold:30}
  const first = computeArchaeologyReward(fragment, true);
  assert.deepEqual(first.materials, { wood: 4 });
  assert.equal(first.gold, 30);
  const repeat = computeArchaeologyReward(fragment, false);
  assert.deepEqual(repeat.materials, {});
  assert.equal(repeat.gold, 9); // round(30 * 0.3)
});

test('isSiteFullyExcavated is true only once every fragment of that site has been seen', () => {
  const siteId = 'frontier_cairn';
  const pool = fragmentsForSite(siteId);
  const allButOne = new Set(pool.slice(1).map((f) => f.id));
  assert.equal(isSiteFullyExcavated(siteId, allButOne), false);
  const all = new Set(pool.map((f) => f.id));
  assert.equal(isSiteFullyExcavated(siteId, all), true);
});

test('Runtime: excavating a site through state.startExcavation/excavationAction updates the Codex and saves under the existing __settlement3 meta key, no new save root', () => {
  state.resetAll();
  const siteId = 'frontier_cairn';

  // A fresh save has no chapters cleared -- must fail cleanly, not throw.
  const blocked = state.startExcavation(siteId);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'locked');

  // Force-clear stage 1-1 the same way other regression tests do, then retry.
  state.data.stageProgress = state.data.stageProgress || {};
  state.data.stageProgress['1-1'] = { cleared: true };
  const started = state.startExcavation(siteId);
  assert.ok(started.ok, 'startExcavation must succeed once the region has a cleared stage');
  assert.equal(started.site.id, siteId);

  // Drive the round to completion the same way a real player reads the cue
  // legend: only cueText is ever exposed to the caller (matching Fishing's
  // convention -- the correct action itself is never handed back), so map
  // it through EXCAVATION_CUE_GUIDE exactly like the UI's legend does.
  const actionForCue = (cueText) => EXCAVATION_CUE_GUIDE.find((g) => g.cueText === cueText)?.action;
  let r = started;
  let outcome;
  for (let i = 0; i < 20; i++) {
    const res = state.excavationAction(actionForCue(r.cueText));
    outcome = res.outcome;
    if (outcome !== 'ongoing') break;
    r = res;
  }
  assert.equal(outcome, 'recovered');

  const codex = state.archaeologyCodex();
  assert.ok(codex.some((f) => f.seen), 'at least one fragment must be marked seen after a successful dig');

  assert.ok(state.data.settlementBuildings?.__settlement3?.archaeology, 'archaeology data must live under the existing __settlement3 meta key');
  assert.equal(typeof state.data.__archaeologyRoot, 'undefined', 'must not introduce a new top-level save root');
});

test('No new currency: every fragment/record reward key is drawn from the existing material/gold vocabulary', () => {
  const allowed = new Set(['wood', 'ore', 'hide', 'veilstone', 'gold']);
  for (const fragment of ARTIFACT_FRAGMENTS) {
    for (const key of Object.keys(fragment.reward || {})) assert.ok(allowed.has(key), `${fragment.id} reward key "${key}" must be an existing material/currency`);
  }
  for (const record of RECONSTRUCTED_RECORDS) {
    for (const key of Object.keys(record.reward || {})) assert.ok(allowed.has(key), `${record.id} reward key "${key}" must be an existing material/currency`);
  }
});

test('No platform emoji introduced by Archaeology', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/data/archaeology.js', 'js/patches/archaeology.js', 'js/patches/archaeologyUi.js', 'js/patches/archaeologyCodexUi.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});

test('Archaeology does not add a new stat-multiplier layer to getStats/getStatBreakdown (unlike Fishing, its payoff stays knowledge + existing materials)', () => {
  const runtimeSrc = read('js/patches/archaeology.js');
  assert.doesNotMatch(runtimeSrc, /getStats|getStatBreakdown|chainMethod/, 'archaeology runtime must not chain onto the combat stat pipeline');
});
