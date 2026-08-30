# Content Pack IV — CP4-5 Implementation Record

Status: **IMPLEMENTED — Horizontal Reaction Layer**

## Purpose

CP4-4 made the first fixed alternate-history anchor (`観測分岐：王樹領`) observable. CP4-5 makes that discovery feel like a world-level event by letting existing record and research surfaces reinterpret the evidence.

No new progression system is introduced.

## Activation authority

The reaction layer is derived from the existing authored discovery:

- `cp4:branch-anchor:tree-sovereign`

If that discovery is absent, CP4-5 reactions remain hidden.

CP4-5 creates no new mandatory discovery, save root, currency, level, XP, stamina or completion gate.

## Integrated surfaces

### Rumor Notebook

The existing `rumor:cp4:deep-green-record-conflict` entry is reused.

After the first Branch anchor is observed it is reinterpreted as:
- the contradictory records were not transcription errors,
- `王樹領` is a separate fixed history sharing the observed coordinates,
- the next investigation should compare the observation through existing record/research authorities.

No parallel rumor system is added.

### Codex

The existing Codex UI gains one read-only `歴史的不整合` presentation section.

It reads `state.cp4CodexHistoricalInconsistencies()` and displays only authored, already-confirmed history differences.

It does **not**:
- add enemy entries,
- add Codex points,
- add milestones,
- alter completion percentage,
- reveal unobserved abilities/species/regions.

### Settlement Chronicle

The existing `state.settlementChronicleTimeline()` is wrapped as a derived view.

When source discoveries exist, it can display:
- `視差核との接触`, backed by `cp4:parallax:first-contact`,
- `観測分岐：王樹領`, backed by `cp4:branch-anchor:tree-sovereign`.

The rows reuse the timestamps already stored on those discoveries. No Chronicle save root or independent event log is created.

### Settlement Research

The existing `state.settlementResearchOutlook()` receives one read-only authored research candidate after the Branch anchor is observed and the Research facility is already unlocked:

- `Prime生態と樹冠史の比較`

The comparison is limited to confirmed history differences. Research does not infer unseen enemy capabilities, future Branch content or undiscovered regions.

No research tier, reward, faction progress or mandatory review is created by CP4-5.

## Optional surfaces intentionally deferred

Ranch and Companion reactions remain optional roadmap candidates. CP4-5 does not modify them because the current canonical Ranch/Companion UIs do not provide a small existing read-only reaction slot; adding one only for this phase would create unnecessary UI coupling and a larger diff.

They may receive flavor later through a general-purpose reaction surface if one becomes canonical.

## Guardrails

- No new Home entry or screen.
- No new save root.
- No new currency / XP / level / stamina / skill tree.
- No RNG / difficulty / World Tier / gear-score gate.
- No combat bonus or reward.
- No Codex completion change.
- No mandatory Settlement Research interaction.
- No Ranch or Companion progression change.
- `深緑消失域` remains hidden.
- Total Branch count remains hidden.
- No Branch traversal or teleportation.
- No Transcendent / Japan / Tokyo / Earth reveal.

## Handoff

CP4-6 owns **Rewards / Identity**.

Any CP4-6 reward must reuse existing item/reward authorities and must not create a Branch rarity, multiverse token, fourth Option, Item Power above the canonical cap, or a mandatory Branch Sight weapon.
