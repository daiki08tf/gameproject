# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0–E4 ✅ / E5 CH1 ENCOUNTER PILOT COMPLETE CANDIDATE / E6 NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
Human-readable enemy catalog: `ENEMY_2_CONTENT_CATALOG.md`.
E5 handoff: `ENEMY_ENCOUNTER_2_E5_ENCOUNTER_PILOT.md`.

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
| E5 | optional Encounter Pool contract + Ch1 pilot | ✅ complete candidate |
| E6 | role-first Encounter Templates | NEXT |
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

Slime is true-global. Other reusable species retain habitat identity.

## E4 regional expansion

Every Ch1–30 region now has the existing normal / fast / tank plus new attacker / caster / trickster / support and one authored Rare.

E4 added **150 new regional identities**. Current ordinary/Rare ecology volume before Bosses/special enemies is **252 identities**.

Rares remain stronger ordinary identities and deliberately do **not** set `boss` or the current Abyss-specific `elite` flag.

## E5 Ch1 Encounter Pool pilot

The first live Encounter Pool is deliberately narrow:

- `1-1` remains fully fixed as the tutorial,
- `1-2` / `1-3` / `1-4` / `1-5` opt into `ch1-field-pilot`,
- `1-B` remains fixed,
- existing `waves` remain present as fallback,
- the existing wave headcount and encounter grouping are not increased,
- the authored `boss_orcking` type can never be replaced.

Pilot ordinary candidates include existing Ch1 normal/fast/tank, the four E4 ordinary roles, and actual Global Species materializations including **スライム** and **ウルフ**.

E5 runtime selection is intentionally the smallest possible bridge: each non-Boss spawn in an opt-in stage can resolve to a safe weighted pool candidate, then flows through the existing Enemy Lv and Combat2 patch chain. Runtime enemies retain their ecology metadata (`role`, `speciesId`, `behaviorTags`, etc.).

Safety:

- no Chapter Rare in the live pool yet,
- no generic Elite,
- no Boss replacement,
- no new reward table / Item Power / Option rule,
- no new save data,
- no enemy-count inflation,
- deterministic pure selection helpers exist for regression tests.

This means E5 proves **“re-enter the same stage and ordinary enemies may differ”** without yet trying to author coherent party formations.

## Encounter principle

Randomness must become role-driven rather than permanent slot-by-slot chaos.

Initial template vocabulary:

`mixed / pack / frontline / escort / ambush / bulwark / rare_invasion / solo_threat`

E5 proves the pool plumbing. **E6 is responsible for moving from individual pool swaps to coherent role-first Encounter Templates.**

## E6 acceptance gate

E6 may add role-first Encounter Templates when:

1. a template chooses a coherent role pattern before species resolution,
2. Ch1 pilot can produce at least `mixed / pack / frontline / escort / ambush / bulwark`,
3. template output never exceeds the existing encounter-group/mobile safety limits,
4. Boss encounter remains authored and fixed,
5. Regional Species and eligible Global Species can fill compatible role slots,
6. Support/Caster/Trickster are not guaranteed in every encounter,
7. Rare invasion remains deferred to E7 runtime reward/rank work,
8. deterministic seeded generation remains testable,
9. fixed `waves` remain fallback and no save/currency/reward fork is added.
