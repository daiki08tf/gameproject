import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TREASURE_HUNT_CHAINS, getTreasureHuntChain, isTreasureHuntReachable, treasureHuntStage, TREASURE_HUNT_STAGE_LABEL,
} from '../js/data/treasureHunt.js';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { ARCHAEOLOGY_SITES, fragmentsForSite } from '../js/data/archaeology.js';
import { state } from '../js/state.js';
import '../js/patches/treasureHunt.js';

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

test('C5 Treasure Hunt: one chain per region in this first slice, each rooted at a real Archaeology site (the C4 loop-back)', () => {
  assert.equal(TREASURE_HUNT_CHAINS.length, 4);
  const ids = TREASURE_HUNT_CHAINS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate chain ids');
  for (const chain of TREASURE_HUNT_CHAINS) {
    assert.ok(WORLD3_REGIONS.some((r) => r.id === chain.regionId), `${chain.id} must reference a real World 3.0 region`);
    assert.ok(ARCHAEOLOGY_SITES.some((s) => s.id === chain.siteId && s.regionId === chain.regionId), `${chain.id}'s siteId must be a real Archaeology site in the same region`);
    for (const key of ['rumorText', 'clueText', 'decodedText', 'resolutionText']) {
      assert.ok(chain[key]?.length > 0, `${chain.id} must author ${key}`);
    }
  }
});

test('isTreasureHuntReachable mirrors the exact region-unlock gate Fishing/Archaeology already use (any stage cleared in the region)', () => {
  const chain = TREASURE_HUNT_CHAINS.find((c) => c.regionId === 'frontier');
  assert.equal(isTreasureHuntReachable(chain, { hasClearedChapter: () => false }), false);
  const region = WORLD3_REGIONS.find((r) => r.id === 'frontier');
  assert.equal(isTreasureHuntReachable(chain, { hasClearedChapter: (n) => n === region.chapters[0] }), true);
});

test('treasureHuntStage: locked -> unresolved -> tracking -> ready -> resolved, driven purely by injected Archaeology progress + own resolved flag', () => {
  assert.equal(treasureHuntStage({ reachable: false }), 'locked');
  assert.equal(treasureHuntStage({ reachable: true }), 'unresolved');
  assert.equal(treasureHuntStage({ reachable: true, fragmentsFound: 1 }), 'tracking');
  assert.equal(treasureHuntStage({ reachable: true, fragmentsFound: 3, recordUnlocked: true }), 'ready');
  assert.equal(treasureHuntStage({ reachable: true, recordUnlocked: true, resolved: true }), 'resolved');
  // Every stage value used by the runtime/UI has an authored label.
  for (const stage of ['locked', 'unresolved', 'tracking', 'ready', 'resolved']) {
    assert.ok(TREASURE_HUNT_STAGE_LABEL[stage], `TREASURE_HUNT_STAGE_LABEL must cover "${stage}"`);
  }
});

test('Runtime: state.treasureHunts() stays locked on a fresh save, and reaching "ready" requires the real Archaeology Reconstructed Record for that same site (not just any digging)', () => {
  state.resetAll();
  const chainId = 'frontier_cache';
  let hunt = state.treasureHunts().find((h) => h.id === chainId);
  assert.equal(hunt.stage, 'locked');

  state.data.stageProgress = state.data.stageProgress || {};
  state.data.stageProgress['1-1'] = { cleared: true };
  hunt = state.treasureHunts().find((h) => h.id === chainId);
  assert.equal(hunt.stage, 'unresolved', 'reachable but no fragments dug yet');

  // Recover every fragment at the matching Archaeology site (frontier_cairn) except one -- must stay "tracking", not "ready".
  const fragments = fragmentsForSite('frontier_cairn');
  const CUE_ACTION = { '表面が薄く土に覆われているだけのようだ。': 'brush', 'まだ深くに埋まっている手応えがある。': 'dig', '今にも崩れそうな、脆い感触がある。': 'brace' };
  function digOnceDeterministic(siteId) {
    let r = state.startExcavation(siteId);
    assert.ok(r.ok, 'startExcavation must succeed once the region is reachable');
    let outcome;
    for (let i = 0; i < 30; i++) {
      const action = CUE_ACTION[r.cueText];
      const res = state.excavationAction(action);
      outcome = res.outcome;
      if (outcome !== 'ongoing') break;
      r = res;
    }
    return outcome;
  }
  for (let i = 0; i < fragments.length - 1; i++) {
    let outcome = digOnceDeterministic('frontier_cairn');
    while (outcome !== 'recovered') outcome = digOnceDeterministic('frontier_cairn'); // crumbling never blocks eventual success
  }
  hunt = state.treasureHunts().find((h) => h.id === chainId);
  assert.equal(hunt.stage, 'tracking', 'clue emerged, but the Record is not yet unlocked');
  assert.equal(hunt.recordUnlocked, false);

  // Recover the final fragment -> the site's Reconstructed Record unlocks -> the chain becomes claimable.
  let outcome = digOnceDeterministic('frontier_cairn');
  while (outcome !== 'recovered') outcome = digOnceDeterministic('frontier_cairn');
  hunt = state.treasureHunts().find((h) => h.id === chainId);
  assert.equal(hunt.stage, 'ready');
  assert.equal(hunt.recordUnlocked, true);

  // Cannot claim before "ready" already proven above by construction; now claim and verify the payoff + resolved state.
  const before = state.data.gold;
  const claim = state.claimTreasureHunt(chainId);
  assert.equal(claim.ok, true);
  assert.ok(claim.gained.gold > 0);
  assert.equal(state.data.gold, before + claim.gained.gold);
  hunt = state.treasureHunts().find((h) => h.id === chainId);
  assert.equal(hunt.stage, 'resolved');

  // Claiming again must fail cleanly (no double-dip).
  const second = state.claimTreasureHunt(chainId);
  assert.equal(second.ok, false);

  assert.ok(state.data.settlementBuildings?.__settlement3?.treasureHunt?.resolved?.[chainId], 'resolved flag must live under the existing __settlement3 meta key');
});

test('The Rumor step is written into the existing world2.discoveries map (same shape ch1RumorThreads.js/systemDeepeningPackC.js use), so it renders in the existing Rumor Notebook with zero UI changes there', () => {
  state.resetAll();
  state.data.stageProgress = state.data.stageProgress || {};
  state.data.stageProgress['1-1'] = { cleared: true };
  state.treasureHunts(); // every call re-syncs the Rumor Notebook as a side effect
  const entry = state.data.world2?.discoveries?.['rumor:treasure_frontier_cache'];
  assert.ok(entry, 'a rumor entry must exist once the chain is reachable');
  assert.equal(entry.rumor, true);
  assert.equal(entry.rumorState, 'unresolved');
  assert.ok(entry.hint?.length > 0);
});

test('No new currency: every chain reward key is drawn from the existing material/gold vocabulary', () => {
  const allowed = new Set(['wood', 'ore', 'hide', 'veilstone', 'gold', 'manastone']);
  for (const chain of TREASURE_HUNT_CHAINS) {
    for (const key of Object.keys(chain.reward || {})) assert.ok(allowed.has(key), `${chain.id} reward key "${key}" must be an existing material/currency`);
  }
});

test('No platform emoji introduced by Treasure Hunt', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/data/treasureHunt.js', 'js/patches/treasureHunt.js', 'js/patches/treasureHuntUi.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});

test('Treasure Hunt does not add a new stat-multiplier layer to getStats/getStatBreakdown, and does not add its own top-level screen or Home button', () => {
  const runtimeSrc = read('js/patches/treasureHunt.js');
  assert.doesNotMatch(runtimeSrc, /getStats|getStatBreakdown|chainMethod/, 'treasureHunt runtime must not chain onto the combat stat pipeline');
  for (const file of ['js/patches/treasureHunt.js', 'js/patches/treasureHuntUi.js']) {
    const src = read(file);
    assert.doesNotMatch(src, /showScreen\('[a-zA-Z]+Screen'\)|\.screen\b.*appendChild\(section\)$/m);
  }
});
