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
   - reuse existing authority: the first incident (謎の遺物漂着,
     "Mysterious Artifact Arrival") resolves through the exact same
     excavation minigame Archaeology (C4) already shipped --
     resolveExcavationRound/rollExcavationCue/excavationDifficultyProfile/
     computeArchaeologyReward in data/archaeology.js are all pure
     functions of a `{difficulty, reward}`-shaped fragment, not bound
     to ARCHAEOLOGY_SITES/ARTIFACT_FRAGMENTS internally, so this
     incident's own one-off `fragment` reuses them directly instead
     of duplicating the minigame or registering a 5th, oddly-gated
     Archaeology site. No new minigame, no new stat/reward authority.

   C7-3 adds a second incident, 住民失踪 ("Resident Disappearance"),
   `kind: 'investigation'`. Deliberately a DIFFERENT resolution shape
   from the excavation-based one above -- not because Archaeology's
   engine couldn't be stretched to fit, but because two incidents that
   both play identically would undercut the roadmap's own point that
   grade/content "should increasingly express what makes X interesting"
   (the same principle C6-5 already applied to species traits). A
   `leads` array of authored candidates, exactly one `correct: true`;
   picking a wrong lead is a free, repeatable miss (its own `missHint`
   flavor line, no penalty, matching the no-punishment-for-guessing
   tone excavation's crumble+retry already established); picking the
   correct one resolves the incident outright. Still zero new battle/
   loot authority -- the reward is the same addSettlementMaterials()+
   gold split every other incident/site in this session uses.
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
  {
    id: 'residentDisappearance',
    name: '住民失踪',
    kind: 'investigation',
    minHall: 6,
    desc: '昨夜から、家に戻らない住民がいるという届け出があった。近ごろ、森に自生する薬草の効能について、あちこちで尋ね歩いていたという話もある。心当たりのある場所を、順に当たってみるしかない。',
    // Exactly one lead is `correct`; the rest are free, repeatable misses
    // with their own flavor line. No hidden RNG -- a careful reader of
    // `desc` (the薬草/forest mention) has a real, fair shot at picking
    // right the first time; a player who doesn't want to puzzle it out
    // can just try all three with no penalty.
    leads: [
      { id: 'well', text: '古井戸の周りで争ったような跡があった、という証言がある。', correct: false, missHint: '井戸の周りを調べたが、争ったような跡は見当たらなかった。' },
      { id: 'forest', text: '外縁の森へ、薬草を摘みに一人で向かったのではないか。', correct: true },
      { id: 'tavern', text: '酒場で誰かと揉めていたのを見た、という噂がある。', correct: false, missHint: '酒場の主人に聞いても、揉め事の心当たりはないという。' },
    ],
    reward: { hide: 4, gold: 50 },
    record: { name: '住民失踪の記録', text: '森の奥、崖から足を滑らせて動けなくなっていたところを見つけた。薬草を探して踏み込みすぎたらしい。手当てをして、無事に連れ帰った。', reward: { wood: 3, gold: 30 } },
  },
]);

export function settlementIncidentEligible(incident, ctx = {}) {
  return (ctx.hall || 0) >= (incident.minHall || 0);
}
export function getSettlementIncident(id) {
  return SETTLEMENT_INCIDENTS.find((x) => x.id === id) || null;
}
