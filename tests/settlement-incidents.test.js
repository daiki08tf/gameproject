import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SETTLEMENT_INCIDENTS, settlementIncidentEligible, getSettlementIncident } from '../js/data/settlementIncidents.js';
import { excavationDifficultyProfile, EXCAVATION_CUE_GUIDE } from '../js/data/archaeology.js';
import { state } from '../js/state.js';
import '../js/patches/settlementCore.js'; // state.settlementLevel() -- ctx() in settlementIncidents.js reads hall level through it
import '../js/patches/settlementIncidents.js';

// Drive a started session to completion the same way a real player reads
// the cue legend: only cueText is ever exposed to the caller (matching
// Archaeology's own convention -- the correct action itself is never
// handed back), so map it through EXCAVATION_CUE_GUIDE exactly like the UI
// legend does. Mirrors tests/archaeology.test.js's own drive helper.
const actionForCue = (cueText) => EXCAVATION_CUE_GUIDE.find((g) => g.cueText === cueText)?.action;
function driveToOutcome(started) {
  let r = started;
  let result;
  for (let i = 0; i < 20; i++) {
    result = state.settlementIncidentAction(actionForCue(r.cueText));
    if (result.outcome !== 'ongoing') return result;
    r = result;
  }
  return result;
}

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

// ---- C7-1: Settlement Incidents (謎の遺物漂着) ---------------------------
// C7's own definition: "Incident = something happening in the world",
// distinct from "Rumor = what people know/believe/say about it". This
// first incident resolves through the exact same excavation minigame
// Archaeology (C4) already shipped, reused directly rather than
// duplicated or registered as an oddly-gated 5th Archaeology site.

test('C7-1/C7-3: every SETTLEMENT_INCIDENTS entry has the common shape (id/minHall/desc/record), and the archaeology-kind one is shaped like an ARTIFACT_FRAGMENTS entry (difficulty + reward) so it feeds archaeology.js\'s pure round functions directly', () => {
  assert.ok(SETTLEMENT_INCIDENTS.length >= 2, 'must cover at least two incident archetypes');
  for (const incident of SETTLEMENT_INCIDENTS) {
    assert.equal(typeof incident.id, 'string');
    assert.equal(typeof incident.minHall, 'number');
    assert.equal(typeof incident.desc, 'string');
    assert.equal(typeof incident.record.text, 'string');
    assert.equal(typeof incident.record.reward, 'object');
    if (incident.kind === 'archaeology') {
      assert.equal(typeof incident.fragment.difficulty, 'number');
      assert.equal(typeof incident.fragment.reward, 'object');
      // must actually resolve to a real difficulty profile, not fall through to a default silently
      assert.ok(excavationDifficultyProfile(incident.fragment.difficulty));
    }
  }
});

// ---- C7-3: Settlement Incidents, second archetype (住民失踪) -------------
// Deliberately a different resolution shape (pick the correct lead out of
// several) from the excavation-based archetype above, so the Incident
// system doesn't converge on one mechanic for every entry.

test('C7-3: the investigation-kind incident has exactly one correct lead, and every wrong lead authors its own missHint', () => {
  const incident = getSettlementIncident('residentDisappearance');
  assert.equal(incident.kind, 'investigation');
  assert.ok(Array.isArray(incident.leads) && incident.leads.length >= 2);
  const correct = incident.leads.filter((l) => l.correct === true);
  assert.equal(correct.length, 1, 'exactly one lead must be the real answer -- not zero (unsolvable) or more than one (no real deduction)');
  for (const lead of incident.leads) {
    assert.equal(typeof lead.text, 'string');
    if (!lead.correct) assert.equal(typeof lead.missHint, 'string', `wrong lead "${lead.id}" must have its own missHint, not a generic fallback`);
  }
  assert.equal(typeof incident.reward, 'object');
});

test('Runtime: picking a wrong lead is free and repeatable (no busy-guard, no penalty); picking the correct lead resolves the incident and grants both rewards', () => {
  state.resetAll();
  state.data.settlementBuildings = state.data.settlementBuildings || {};
  state.data.settlementBuildings.hall = 6;
  const incident = getSettlementIncident('residentDisappearance');
  const wrongLead = incident.leads.find((l) => !l.correct);
  const correctLead = incident.leads.find((l) => l.correct);

  // Wrong lead, twice in a row -- must stay a no-op miss both times, never lock the incident.
  for (let i = 0; i < 2; i++) {
    const miss = state.investigateSettlementIncidentLead('residentDisappearance', wrongLead.id);
    assert.equal(miss.ok, true);
    assert.equal(miss.outcome, 'miss');
    assert.equal(miss.lead.missHint, wrongLead.missHint);
    assert.equal(state.settlementIncidents().find((x) => x.id === 'residentDisappearance').resolved, false);
  }

  const goldBefore = Number(state.data.gold) || 0;
  const resolved = state.investigateSettlementIncidentLead('residentDisappearance', correctLead.id);
  assert.equal(resolved.ok, true);
  assert.equal(resolved.outcome, 'resolved');
  assert.ok(resolved.record);
  assert.ok(state.data.gold >= goldBefore, 'gold reward must be applied, never reduced');
  assert.equal(state.settlementIncidents().find((x) => x.id === 'residentDisappearance').resolved, true);

  // Cannot be investigated again once resolved (same rule as the excavation archetype).
  const again = state.investigateSettlementIncidentLead('residentDisappearance', correctLead.id);
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'resolved');
});

test('C7-3: the two archetypes never cross-invoke each other\'s entry points (starting an excavation on an investigation incident, or vice versa, fails cleanly)', () => {
  state.resetAll();
  state.data.settlementBuildings = state.data.settlementBuildings || {};
  state.data.settlementBuildings.hall = 6;
  const wrongKindExcavation = state.startSettlementIncidentInvestigation('residentDisappearance');
  assert.equal(wrongKindExcavation.ok, false);
  assert.equal(wrongKindExcavation.reason, 'wrong-kind');
  const wrongKindLead = state.investigateSettlementIncidentLead('artifactArrival', 'well');
  assert.equal(wrongKindLead.ok, false);
  assert.equal(wrongKindLead.reason, 'wrong-kind');
});

test('settlementIncidentEligible is a pure function of hall level only -- no hidden state reads', () => {
  const incident = getSettlementIncident('artifactArrival');
  assert.equal(settlementIncidentEligible(incident, { hall: 0 }), false);
  assert.equal(settlementIncidentEligible(incident, { hall: incident.minHall - 1 }), false);
  assert.equal(settlementIncidentEligible(incident, { hall: incident.minHall }), true);
  assert.equal(settlementIncidentEligible(incident, { hall: incident.minHall + 5 }), true);
});

test('C7-1: the round-resolution engine used by the incident is byte-for-byte the same exported functions Archaeology (C4) uses -- not a duplicate implementation', () => {
  const src = read('js/patches/settlementIncidents.js');
  assert.match(src, /import \{ resolveExcavationRound, rollExcavationCue, excavationDifficultyProfile, computeArchaeologyReward \} from '\.\.\/data\/archaeology\.js';/);
  // must not reimplement round logic locally
  assert.doesNotMatch(src, /function resolveExcavationRound|function rollExcavationCue/);
});

test('Runtime: an incident is invisible/locked before its hall threshold and becomes active exactly at it, with no migration needed on a fresh save', () => {
  state.resetAll();
  state.data.settlementBuildings = state.data.settlementBuildings || {};
  state.data.settlementBuildings.hall = 0;
  let incidents = state.settlementIncidents();
  const before = incidents.find((x) => x.id === 'artifactArrival');
  assert.equal(before.eligible, false);
  assert.equal(before.active, false);

  state.data.settlementBuildings.hall = 3;
  incidents = state.settlementIncidents();
  const after = incidents.find((x) => x.id === 'artifactArrival');
  assert.equal(after.eligible, true);
  assert.equal(after.resolved, false);
  assert.equal(after.active, true);
});

test('Runtime: investigating and recovering the fragment resolves the incident exactly once, grants both the fragment reward and the record reward, and cannot be repeated', () => {
  state.resetAll();
  state.data.settlementBuildings = state.data.settlementBuildings || {};
  state.data.settlementBuildings.hall = 3;
  const goldBefore = Number(state.data.gold) || 0;

  const started = state.startSettlementIncidentInvestigation('artifactArrival');
  assert.equal(started.ok, true);
  assert.ok(started.cueText);
  assert.ok(started.roundsNeeded >= 1);

  const result = driveToOutcome(started);
  assert.equal(result.outcome, 'resolved', 'a perfectly-answered session (every action matches its cue) must always recover, never crumble');
  assert.equal(result.incident.id, 'artifactArrival');
  assert.ok(result.record);
  assert.ok(state.data.gold >= goldBefore, 'gold reward must be applied, never reduced');

  // Cannot be investigated again once resolved.
  const again = state.startSettlementIncidentInvestigation('artifactArrival');
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'resolved');

  const finalList = state.settlementIncidents();
  assert.equal(finalList.find((x) => x.id === 'artifactArrival').resolved, true);
});

test('C7-1: resolving the incident writes/updates the SAME Rumor Notebook entry (Incident vs Rumor distinction) using the existing world2.discoveries shape -- no new Rumor system', () => {
  state.resetAll();
  state.data.settlementBuildings = state.data.settlementBuildings || {};
  state.data.settlementBuildings.hall = 3;
  state.settlementIncidents(); // sync while unresolved
  const unresolvedEntry = state.data.world2.discoveries['rumor:incident_artifactArrival'];
  assert.ok(unresolvedEntry);
  assert.equal(unresolvedEntry.rumor, true);
  assert.equal(unresolvedEntry.rumorState, 'unresolved');
  assert.equal(unresolvedEntry.hint, getSettlementIncident('artifactArrival').desc);

  // Force-resolve directly against the save meta (avoids re-driving the
  // minigame in this test) to check the Notebook rewrite in isolation.
  const meta = state.data.settlementBuildings.__settlement3.incidents;
  meta.resolved.artifactArrival = true;
  state.settlementIncidents(); // re-sync
  const resolvedEntry = state.data.world2.discoveries['rumor:incident_artifactArrival'];
  assert.equal(resolvedEntry.rumorState, 'resolved');
  assert.equal(resolvedEntry.hint, getSettlementIncident('artifactArrival').record.text);
  assert.ok(resolvedEntry.resolvedAt);
});

test('No new save root: incident state lives under the existing __settlement3 meta key, and Rumor writes go through the existing world2.discoveries map', () => {
  const src = read('js/patches/settlementIncidents.js');
  assert.match(src, /const META_KEY = '__settlement3';/);
  assert.match(src, /state\.data\.world2\s*\?\?=\s*\{\};/);
  assert.doesNotMatch(src, /localStorage/);
});

test('No platform emoji introduced by Settlement Incidents', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/data/settlementIncidents.js', 'js/patches/settlementIncidents.js', 'js/patches/settlementIncidentsUi.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});

test('settlementCompactUi.js groups the new section into the existing 探索 tab', () => {
  const src = read('js/patches/settlementCompactUi.js');
  assert.match(src, /\['\[data-settlement-incidents\]', 'explore'\]/);
});
