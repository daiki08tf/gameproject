# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0–E2 ✅ / E3 GLOBAL SPECIES COMPLETE CANDIDATE / E4 NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
E0 handoff: `ENEMY_ENCOUNTER_2_E0_AUDIT.md`.
E1 handoff: `ENEMY_ENCOUNTER_2_E1_LEVEL_FOUNDATION.md`.
E2 handoff: `ENEMY_ENCOUNTER_2_E2_ANCHOR_SCALING.md`.
E3 handoff: `ENEMY_ENCOUNTER_2_E3_GLOBAL_SPECIES.md`.

## Goal

Move Blade Vale from fixed stage-owned enemy lists toward a reusable world ecology:

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
- no new currency
- no new Home screen/button
- fixed `waves` remain fallback during migration
- save compatibility mandatory
- no daily/weekly spawn loop
- generic Elite must not accidentally award Abyss-specific Elite currency
- story progression must never depend on a lucky random encounter
- existing Gear/Abyss/Rift/Secret Realm/Deep Survey reward identities remain authoritative

## Phases

| Phase | Scope | Status |
|---|---|---|
| E0 | current enemy/stat/spawn audit + balance snapshots | ✅ main |
| E1 | visible runtime Enemy Lv foundation | ✅ main |
| E2 | anchor-safe level-relative stat scaling | ✅ main |
| E3 | 10–12 Global Species, led by slime family | ✅ complete candidate |
| E4 | Ch1–30 regional expansion to 7 roles + 1 Rare | NEXT |
| E5 | optional Encounter Pool contract + pilot chapter | queued |
| E6 | role-first Encounter Templates | queued |
| E7 | Rare / generic Elite / environmental Variant integration | queued |
| E8 | progressive Ch1–30 migration | queued |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | queued |
| E10 | existing Codex discovery polish | queued |

## E0–E2 foundation

- story encounters still use fixed `waves`,
- every runtime enemy has visible `baseLevel` / `level`,
- ordinary enemies roll within **92–108%** of stage anchor level,
- Bosses remain authored at the anchor,
- scaling is relative to `level / baseLevel`,
- at `level === baseLevel`, E0 stats are preserved exactly,
- current `enemy.elite` remains coupled to Abyss Shard payout and is not a generic rank flag.

## E3 Global Species

12 canonical reusable species now exist:

`スライム / コウモリ / ゴブリン / ウルフ / スケルトン / ゴーレム / ウィスプ / 毒キノコ / 小精霊 / リザード / ミミック / 彷徨う鎧`

Each has stable species metadata, role, habitat, family and spawn weight.

`slime` is the first **true-global** species and can be selected regardless of habitat. Other Global Species remain habitat-aware so future random encounters retain regional identity.

The catalog spans all seven future ordinary roles:

- normal
- fast
- tank
- attacker
- caster
- trickster
- support

`materializeGlobalSpecies()` derives a reusable species from the destination region/activity anchor rather than treating a low-level template as valid everywhere.

E3 intentionally does not insert these species into story waves yet.

## Content-volume target

- existing Ch1–30 ordinary identities: ~90
- new attacker/caster/trickster/support identities: +120
- new Chapter Rare identities: +30
- Global Species: +12

Target after Enemy Content Pack I: **roughly 240+ ordinary/Rare enemy identities**, excluding Bosses/special enemies.

## Encounter principle

Randomness is role-driven rather than slot-by-slot chaos.

Initial templates:

`mixed / pack / frontline / escort / ambush / bulwark / rare_invasion / solo_threat`

The template chooses roles first. Region/global pools resolve actual species second.

## E4 acceptance gate

E4 expands regional enemy content without randomizing encounters yet.

Required:

1. Ch1–30 each expose identity data for normal/fast/tank/attacker/caster/trickster/support,
2. each Chapter/region has one authored Rare identity,
3. current normal/fast/tank IDs remain valid,
4. new role identities use the current Chapter balance anchors rather than inventing a second scaling system,
5. Rare identity data is added without generic Elite/Abyss Shard collision,
6. story fixed waves remain unchanged until Encounter Pool pilot,
7. no new currency/save root/Home route.
