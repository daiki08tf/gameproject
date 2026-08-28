# Enemy 2.0 E10 — Codex / Discovery Polish

Status: **COMPLETE CANDIDATE**

## Purpose

Finish Enemy 2.0 on the existing Monster Codex surface without introducing another screen, currency, save root, progression track, or completion bonus source.

## Save compatibility

E10 keeps `state.data.monsterCodex` authoritative. Ecology discovery is stored under the reserved `monsterCodex.__enemy2Ecology` key, so old saves need no migration and existing Codex entries remain valid.

The reserved key is aggregation-only and never participates in Codex milestone completion.

## Ecology identity

### Global Species

Runtime materializations such as:

- `e8_ch5_global_slime`
- `e8_ch30_global_slime`
- `e9_rift_*_slime`
- `e9_abyss_*_slime`

all aggregate to one ecology identity:

`global:slime` → **スライム**

This prevents the same species from appearing as many unrelated Codex species merely because it was materialized against different level/activity anchors.

Generated E8/E9 materialization IDs are excluded from the normal Codex completion denominator and ordinary monster-card list. Their discoveries remain visible through ecology aggregation.

### Regional enemies

Regional Enemy 2.0 identities retain their authored enemy type as the ecology key. Their environmental Variants aggregate back into that base identity.

Bosses are excluded from E10 ecology aggregation and remain governed by the existing authored Codex behavior.

## Recorded discovery dimensions

For each ecology identity E10 records:

- activities encountered: Story / Abyss / Rift / Secret Realm / Deep Survey,
- environmental Variant IDs,
- rank sightings: RARE / generic ELITE / historical ABYSS ELITE,
- observed environment/region tags,
- highest encountered Enemy Lv,
- ecology-level kill count.

No dimension adds Codex completion points. Existing Codex milestones and permanent bonuses remain authoritative.

## Rare milestone reconciliation

Encountering/killing an Enemy 2.0 Rare now also satisfies the existing Codex `Rare個体` milestone. This reuses the pre-existing milestone instead of adding a new E10 reward axis.

Generic Elite and historical Abyss Elite remain visually distinct in ecology history and do not alter Abyss Shard payout semantics.

## UI

The existing Monster Codex gains an **Enemy 2.0 生態記録** section above the legacy monster list.

Each discovered ecology card shows:

- species/base enemy name,
- ecology kill count,
- highest encountered Enemy Lv,
- discovered activities,
- discovered Variants,
- discovered rank types,
- observed environment tags.

Unknown ecology does not create placeholder spam; records appear only after actual observation.

## Safety boundaries

- no new top-level screen,
- no new save root,
- no new currency,
- no new Codex completion points,
- no new permanent bonus source,
- no reward multiplier changes,
- no World Tier/Abyss/Rift/Secret Realm/Deep Survey scaling changes,
- no Boss randomization,
- no migration required for old saves.

## Acceptance coverage

`tests/enemy2-e10-codex-discovery.test.js` verifies:

1. E8/E9 Global Species materializations aggregate to one species ecology identity,
2. activity/Variant/environment/max-level history accumulates across contexts,
3. Rare / generic Elite / historical Abyss Elite remain distinct,
4. Bosses are excluded,
5. generated E8/E9 runtime IDs are recognizable for Codex-denominator exclusion,
6. tracking remains inside the existing `monsterCodex` save root,
7. the existing Codex UI exposes Activity / Variant / Rank / highest Enemy Lv.

When CI is green, E10 closes the Enemy 2.0 / Encounter 2.0 implementation roadmap.
