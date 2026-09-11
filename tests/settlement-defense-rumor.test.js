import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SETTLEMENT_INVASIONS } from '../js/data/settlementDefense.js';
import { state } from '../js/state.js';
import '../js/patches/settlementCore.js'; // state.settlementLevel()/addSettlementMaterials() -- context()/resolveSettlementDefense() read/write through it
import '../js/patches/settlementDefense.js';

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

// ---- C7-2: wire the EXISTING Settlement Defense incidents into the same --
// Rumor Notebook cross-reference C7-1 established for the new incident.
// Same two-stage shape: unresolved -> desc, cleared -> resolvedHint,
// written into the same world2.discoveries map.

test('C7-2: every SETTLEMENT_INVASIONS entry authors a resolvedHint -- none are left with only the pre-clear desc', () => {
  for (const incident of SETTLEMENT_INVASIONS) {
    assert.equal(typeof incident.resolvedHint, 'string', `${incident.id} must have a resolvedHint`);
    assert.ok(incident.resolvedHint.length > 0);
    assert.notEqual(incident.resolvedHint, incident.desc, `${incident.id}'s resolvedHint must actually describe an outcome, not repeat the pre-clear desc`);
  }
});

test('C7-2: settlementDefense.js writes into the SAME world2.discoveries Rumor authority C7-1 used -- no new Rumor system, no new save root', () => {
  const src = read('js/patches/settlementDefense.js');
  assert.match(src, /rumor:\s*true/);
  assert.match(src, /rumorId:\s*`defense_\$\{incident\.id\}`/);
  assert.match(src, /state\.data\.world2\s*\?\?=\s*\{\};/);
  assert.doesNotMatch(src, /localStorage/);
});

test('Runtime: an incident not yet available writes no Rumor Notebook entry', () => {
  state.resetAll();
  state.data.settlementBuildings = state.data.settlementBuildings || {};
  state.data.settlementBuildings.hall = 0;
  state.data.settlementBuildings.watch = 0;
  state.settlementDefenseIncidents();
  assert.equal(state.data.world2?.discoveries?.['rumor:defense_beastRaid'], undefined);
});

test('Runtime: an available, unresolved incident shows its own desc as the Rumor hint; clearing it once flips the SAME entry to resolvedHint', () => {
  state.resetAll();
  state.data.settlementBuildings = state.data.settlementBuildings || {};
  state.data.settlementBuildings.hall = 5;
  state.data.settlementBuildings.watch = 5;

  const before = state.settlementDefenseIncidents().find((x) => x.id === 'beastRaid');
  assert.equal(before.available, true);
  assert.equal(before.cleared, false);
  const unresolvedEntry = state.data.world2.discoveries['rumor:defense_beastRaid'];
  assert.ok(unresolvedEntry);
  assert.equal(unresolvedEntry.rumor, true);
  assert.equal(unresolvedEntry.rumorState, 'unresolved');
  assert.equal(unresolvedEntry.hint, before.desc);

  const started = state.startSettlementDefense('beastRaid');
  assert.equal(started.ok, true);
  const resolved = state.resolveSettlementDefense('beastRaid', true);
  assert.equal(resolved.ok, true);
  assert.equal(resolved.cleared, true);

  const resolvedEntry = state.data.world2.discoveries['rumor:defense_beastRaid'];
  assert.equal(resolvedEntry.rumorState, 'resolved');
  assert.equal(resolvedEntry.rumorStateLabel, '解決済み');
  assert.equal(resolvedEntry.hint, before.resolvedHint);
  assert.ok(resolvedEntry.resolvedAt);

  // The incident itself stays re-triggerable (existing behavior, unchanged
  // by this Rumor wiring) -- the Rumor entry must stay at 'resolved', not
  // bounce back to 'unresolved' on a repeat run.
  const restarted = state.startSettlementDefense('beastRaid');
  assert.equal(restarted.ok, true);
  state.resolveSettlementDefense('beastRaid', true);
  assert.equal(state.data.world2.discoveries['rumor:defense_beastRaid'].rumorState, 'resolved');
});

test('No platform emoji introduced by the C7-2 Rumor wiring itself (pre-existing icon fields in SETTLEMENT_INVASIONS are untouched, out of this slice\'s scope)', () => {
  const src = read('js/patches/settlementDefense.js');
  const addedRegion = src.slice(src.indexOf('function ensureWorld'), src.indexOf('state.settlementDefenseProjects'));
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  assert.doesNotMatch(addedRegion, PICTOGRAPH);
});
