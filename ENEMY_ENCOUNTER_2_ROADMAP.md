# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0–E5 ✅ / E6 ROLE-FIRST TEMPLATES COMPLETE CANDIDATE / E7 NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
Human-readable enemy catalog: `ENEMY_2_CONTENT_CATALOG.md`.
E5 handoff: `ENEMY_ENCOUNTER_2_E5_ENCOUNTER_PILOT.md`.
E6 handoff: `ENEMY_ENCOUNTER_2_E6_ROLE_TEMPLATES.md`.

## Goal

```text
Species
  × Enemy Lv
  × Region / activity
  × Variant
  × Rare / Elite rank
  ↓
Encounter Pool
  ↓
coherent random party
```

Bosses remain authored by default.

## Permanent rules

- Enemy Lv cap: 99,999
- no new currency / Home route / save root / FOMO loop
- fixed `waves` remain fallback during migration
- save compatibility mandatory
- generic Elite must not accidentally award Abyss-specific Elite currency
- story progression never depends on a lucky random encounter
- existing Gear / Abyss / Rift / Secret Realm / Deep Survey reward identities remain authoritative

## Phases

| Phase | Scope | Status |
|---|---|---|
| E0 | current enemy/stat/spawn audit + balance snapshots | ✅ main |
| E1 | visible runtime Enemy Lv foundation | ✅ main |
| E2 | anchor-safe level-relative stat scaling | ✅ main |
| E3 | 12 Global Species, led by true-global slime | ✅ main |
| E4 | Ch1–30 regional expansion to 7 roles + 1 Rare | ✅ main |
| E5 | optional Encounter Pool contract + Ch1 pilot | ✅ main |
| E6 | role-first Encounter Templates | ✅ complete candidate |
| E7 | Rare / generic Elite / environmental Variant integration | NEXT |
| E8 | progressive Ch1–30 migration | queued |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | queued |
| E10 | existing Codex discovery polish | queued |

## E0–E4 foundation

- every runtime enemy has visible `baseLevel / level`,
- ordinary enemies roll within 92–108% of the stage anchor,
- Bosses stay authored at the anchor,
- anchor level preserves old stats exactly,
- 12 Global Species exist, led by true-global slime,
- every Ch1–30 region now has normal / fast / tank / attacker / caster / trickster / support + one Rare,
- ordinary/Rare ecology volume before Bosses/special enemies is **252 identities**,
- current historical `enemy.elite` remains Abyss-specific because its kill path awards Abyss Shards.

## E5 Ch1 Encounter Pool pilot

`1-2` through `1-5` use the optional Ch1 field pool while `1-1` tutorial and `1-B` hidden route remain fixed. Existing `waves`, enemy headcounts and Boss order are retained. Chapter Rare and generic Elite remain absent from live pool resolution.

E5 proves that re-entering the same stage can produce different ordinary species without a new stage/reward/save system.

## E6 role-first Encounter Templates

Ch1 pooled encounters now choose a **formation identity before species resolution**.

Implemented templates:

| Template | Role pattern |
|---|---|
| mixed | normal → fast → attacker |
| pack | fast → attacker → fast |
| frontline | tank → attacker → normal |
| escort | tank → support → caster |
| ambush | trickster → fast → attacker |
| bulwark | tank → support → tank |

For encounters of one or two enemies, the pattern is truncated to the existing group count. No encounter is enlarged.

Runtime flow:

```text
existing encounterQueue spec
  ↓
choose weighted template
  ↓
choose role sequence
  ↓
resolve each role from safe regional/global pool candidates
  ↓
existing Enemy Lv / spawn / Combat2 pipeline
```

This is implemented as a thin wrapper around `beginNextEncounter()` plus the existing E5 spawn bridge; BattleEngine's queue construction is not replaced.

Safety:

- Boss specs bypass template planning,
- every resolved type must match the requested role when that role exists in the pool,
- no Rare / generic Elite yet,
- fixed waves/headcounts/group sizes remain unchanged,
- Global Species can naturally fill matching role slots,
- deterministic seeded planning is regression-tested,
- no save/currency/reward/IP/Option fork.

## E7 acceptance gate

E7 may introduce Rare / generic Elite / environmental Variant runtime behavior only after separating generic rank semantics from historical Abyss Elite payout.

Required:

1. generic Elite uses a rank/flag that does **not** trigger Abyss Shards,
2. historical Abyss Elite behavior/rewards stay unchanged,
3. Chapter Rare can appear only through explicit Rare-capable encounter rules and is never story-required,
4. Rare/Elite Enemy Lv bands follow the authored design bounds rather than ordinary 92–108%,
5. environmental Variants reuse base species/family identity instead of multiplying unrelated species IDs,
6. rank/variant stat and reward bonuses are bounded and cannot double-count existing Abyss/World Tier scaling,
7. Bosses are excluded from generic Rare/Elite conversion,
8. seeded acceptance tests cover spawn rates and safety,
9. no new currency/save root/Home route or timed spawn loop.
