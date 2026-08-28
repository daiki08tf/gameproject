# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0–E3 ✅ / E4 REGIONAL EXPANSION COMPLETE CANDIDATE / E5 NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
Human-readable enemy catalog: `ENEMY_2_CONTENT_CATALOG.md`.

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
| E4 | Ch1–30 regional expansion to 7 roles + 1 Rare | ✅ complete candidate |
| E5 | optional Encounter Pool contract + pilot chapter | NEXT |
| E6 | role-first Encounter Templates | queued |
| E7 | Rare / generic Elite / environmental Variant integration | queued |
| E8 | progressive Ch1–30 migration | queued |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | queued |
| E10 | existing Codex discovery polish | queued |

## E0–E2 foundation

- every runtime enemy has visible `baseLevel / level`,
- ordinary enemies roll within 92–108% of the stage anchor,
- Bosses stay authored at the anchor,
- scaling is relative to `level / baseLevel`, so the anchor preserves old stats exactly,
- current `enemy.elite` is still Abyss-specific because its kill path awards Abyss Shards.

## E3 Global Species

12 reusable species exist, led by the true-global slime family:

`スライム / コウモリ / ゴブリン / ウルフ / スケルトン / ゴーレム / ウィスプ / 毒キノコ / 小精霊 / リザード / ミミック / 彷徨う鎧`

Global Species are data candidates only until Encounter Pool rollout. Slime may appear regardless of habitat; the other species remain habitat-aware.

## E4 regional expansion

Every Ch1–30 region now has:

- existing normal
- existing fast
- existing tank
- new attacker
- new caster
- new trickster
- new support
- one authored Rare identity

E4 adds **150 new regional identities** while keeping existing fixed waves unchanged.

Current ordinary/Rare ecology volume before Bosses/special enemies:

- existing regional normal/fast/tank: 90
- new attacker/caster/trickster/support: 120
- new Chapter Rares: 30
- Global Species: 12
- **total: 252 identities**

The four new ordinary roles are not name-only clones: each has a distinct base stat silhouette and stable `role`, `speciesId`, `chapterId`, and `behaviorTags`. Rare identities use the same Chapter scaling anchor, are stronger ordinary enemies, and deliberately do **not** set `boss` or `elite`.

E4 does not insert any of these new IDs into story waves yet.

## Encounter principle

Randomness is role-driven rather than slot-by-slot chaos.

Initial templates remain:

`mixed / pack / frontline / escort / ambush / bulwark / rare_invasion / solo_threat`

The template chooses roles first; regional/global pools resolve species second.

## E5 acceptance gate

E5 introduces the first optional Encounter Pool contract and one pilot region only.

Required:

1. a stage can opt into `encounterPool` while fixed `waves` remain valid fallback,
2. pilot should start in an early Chapter where regressions are easy to observe,
3. pool resolves existing regional roles plus eligible Global Species,
4. Boss identity and Boss wave remain fixed,
5. random encounter generation must be deterministic-testable even if runtime play uses entropy,
6. no Rare dependency for story completion,
7. no generic Elite implementation yet,
8. enemy count and command reachability remain within existing mobile safety limits,
9. no reward/currency/save-system fork.
