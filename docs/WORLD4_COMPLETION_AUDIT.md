# Adventure / World 4.0 — Completion Audit (W33-W36)

## Status

Adventure / World 4.0 implementation is functionally complete through W36 once this branch passes the required CI.

The final pass intentionally adds no new progression axis, currency, battle engine, reward multiplier, Home entry, or permanent loss rule.

## W33 — Adventure UI 4.0 Final

- Existing `goStageBtn` remains the single Adventure entry; no second Home button is created.
- World → Region → Route → Scene remains the information hierarchy.
- Region status remains compact and uses human-facing names rather than raw route/region IDs.
- Long Adventure card copy is line-clamped on small screens.
- Region secondary copy uses ellipsis rather than growing cards vertically without bound.
- Route trail remains horizontal/scrollable instead of creating a long vertical list.
- Primary route/scene choices stay above the suspend/back action.

## W34 — Save Migration & Compatibility Audit

Canonical Adventure save ownership remains limited to `state.data.adventure4`, whose purpose is resumable navigation/session state only.

`normalizeAdventure4Session()` is the compatibility boundary:

- missing or invalid session → safe default,
- active session without a Region → safe default rather than a dead session,
- duplicate/invalid visited IDs → normalized,
- unknown future fields → ignored,
- missing temporary flags → backfilled,
- interrupted `pendingEncounter` → retained when the session is otherwise valid,
- current version is rewritten through the same normalizer.

Adventure does **not** own Story progression, character level, World Tier, Nemesis, inventory/equipment, Discovery, Settlement, Codex, or reward state.

## W35 — Full Integration Regression & Balance

The completion regression covers the contracts around:

- Story / CHAPTERS / Stage authority,
- existing TextBattle/BattleEngine handoff,
- Unique/endgame gear authority,
- World Tier-derived high-level Region state,
- existing Nemesis state,
- Settlement Chronicle integration,
- no Adventure-side drop/gold/reward/Item Power multiplier assignment.

The wider repository CI remains the authority for Battle / Loot / Job / Companion / Rune / World Event / Rift / Secret Realm / Machine Realm / Settlement regressions.

## W36 — Completion Audit

Late World 4 hooks with confirmed consumers:

- `adventure4HighLevelStateForRegion()` → Adventure Region cards.
- `adventure4ContentPackIScene()` → Adventure entry Scene renderer; Pack II is layered behind this existing facade.
- `adventure4WorldRecords()` / `adventure4WorldRecordSummary()` → existing Settlement Chronicle.
- `adventure4HorizontalGear()` → read-only runtime/catalog API for Adventure/endgame presentation; it does not own equipment.

### Intentional non-features

These remain absent by design:

- Adventure Level / Exploration XP,
- World Token / Adventure currency,
- energy/stamina/daily adventure limits,
- real-time respawn/date gates,
- duplicate BattleEngine,
- duplicate Story progress,
- duplicate Discovery/Codex/Chronicle database,
- World 4 reward multiplier stack,
- second Adventure Home entry.

## Technical debt / follow-up candidates

These are not hidden as completion blockers:

1. Event quantity is still below the long-term aspirational targets (100+ Ambient, 50+ Investigation, etc.). The data-driven content packs prove the extension path but do not attempt to fill the entire long-term catalog in World 4.0.
2. W30 horizontal gear is intentionally a read-only classification of existing Unique/endgame equipment. Future content may add more activity-themed gear through the existing equipment/loot authorities rather than the Adventure layer.
3. The canonical roadmap has historical checkbox drift for some already-merged waves. Implementation/CI/merge history is the factual source until the roadmap checkbox cleanup is applied safely as a documentation-only change; do not rewrite the large roadmap via a truncating API path.
4. UI polish can continue as art direction evolves, but navigation hierarchy and mobile overflow contracts are now regression-tested.

## Completion gate

World 4.0 is complete when:

1. syntax check passes,
2. repository test suite passes,
3. Blade Vale Tests is green,
4. Phase 8 Validation is green,
5. final PR is mergeable and merged to `main`.
