/* ============================================================
   Living World & Discovery C7-1 — Settlement Incidents
   ------------------------------------------------------------
   Pure data + pure helpers (no state.js/DOM dependency), matching
   the convention already used by js/data/archaeology.js and
   js/data/treasureHunt.js.

   Design constraints from LIVING_WORLD_DISCOVERY_ROADMAP.md C7:
   - "Incident = something happening in the world", distinct from
     Rumor ("what people know/believe/say about it") -- the runtime
     patch (js/patches/settlementIncidents.js) is what actually
     writes the Rumor Notebook entry, but the two-stage shape (an
     unresolved "something is happening" hint before resolution, a
     resolved "here's what it turned out to be" hint after) is
     decided here, in the incident's own data;
   - no real-time/daily expiry -- an eligible, unresolved incident
     just stays available until the player investigates it;
   - reuse existing authority: this first incident (謎の遺物漂着,
     "Mysterious Artifact Arrival") resolves through the exact same
     excavation minigame Archaeology (C4) already shipped --
     resolveExcavationRound/rollExcavationCue/excavationDifficultyProfile/
     computeArchaeologyReward in data/archaeology.js are all pure
     functions of a `{difficulty, reward}`-shaped fragment, not bound
     to ARCHAEOLOGY_SITES/ARTIFACT_FRAGMENTS internally, so this
     incident's own one-off `fragment` reuses them directly instead
     of duplicating the minigame or registering a 5th, oddly-gated
     Archaeology site. No new minigame, no new stat/reward authority.
   ============================================================ */

// hall level reuses the exact context shape settlementDefense.js's own
// SETTLEMENT_INVASIONS eligibility already established (minHall, read via
// state.settlementLevel('hall')) -- not a new growth axis.
export const SETTLEMENT_INCIDENTS = Object.freeze([
  {
    id: 'artifactArrival',
    name: '謎の遺物漂着',
    kind: 'archaeology',
    minHall: 3,
    desc: '川縁に、これまで見たことのない意匠の遺物が流れ着いたという報告が届いた。放っておけば、また流されてしまうかもしれない。',
    // Structurally identical to an ARTIFACT_FRAGMENTS entry (difficulty +
    // reward) so it can be fed straight into archaeology.js's pure round
    // functions -- see the runtime patch.
    fragment: { name: '漂着した遺物', difficulty: 2, reward: { veilstone: 3, gold: 60 } },
    record: { name: '漂着遺物の記録', text: '掘り出した遺物を清め終えると、どの地方のものとも異なる意匠が浮かび上がった。この街の外――まだ見ぬどこかから、川を伝って流れ着いたものらしい。', reward: { veilstone: 2, gold: 40 } },
  },
]);

export function settlementIncidentEligible(incident, ctx = {}) {
  return (ctx.hall || 0) >= (incident.minHall || 0);
}
export function getSettlementIncident(id) {
  return SETTLEMENT_INCIDENTS.find((x) => x.id === id) || null;
}
