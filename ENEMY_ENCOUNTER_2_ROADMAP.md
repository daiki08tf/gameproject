# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0–E7 ✅ / E8 COMPLETE CANDIDATE / E9 NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
Human-readable enemy catalog: `ENEMY_2_CONTENT_CATALOG.md`.
E5 handoff: `ENEMY_ENCOUNTER_2_E5_ENCOUNTER_PILOT.md`.
E6 handoff: `ENEMY_ENCOUNTER_2_E6_ROLE_TEMPLATES.md`.
E7 handoff: `ENEMY_ENCOUNTER_2_E7_RANK_VARIANTS.md`.
E8 handoff: `ENEMY_ENCOUNTER_2_E8_STORY_MIGRATION.md`.

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
| E6 | role-first Encounter Templates | ✅ main |
| E7 | Rare / generic Elite / environmental Variant integration | ✅ main |
| E8 | progressive Ch1–30 migration | ✅ complete candidate |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | NEXT |
| E10 | existing Codex discovery polish | queued |

## E0–E4 foundation

- every runtime enemy has visible `baseLevel / level`,
- ordinary enemies roll within 92–108% of the stage anchor,
- Bosses stay authored at the anchor,
- anchor level preserves old stats exactly,
- 12 Global Species exist, led by true-global slime,
- every Ch1–30 region has normal / fast / tank / attacker / caster / trickster / support + one Rare,
- ordinary/Rare ecology volume before Bosses/special enemies is **252 identities**,
- historical `enemy.elite` remains Abyss-specific because its kill path awards Abyss Shards.

## E5 Ch1 Encounter Pool pilot

`1-2` through `1-5` introduced the optional Ch1 field pool while `1-1` tutorial and `1-B` hidden route remained fixed. Existing `waves`, enemy headcounts and Boss order were retained.

## E6 role-first Encounter Templates

Migrated encounters choose a formation identity before species resolution.

| Template | Role pattern |
|---|---|
| mixed | normal → fast → attacker |
| pack | fast → attacker → fast |
| frontline | tank → attacker → normal |
| escort | tank → support → caster |
| ambush | trickster → fast → attacker |
| bulwark | tank → support → tank |

Boss specs bypass template planning and existing encounter group sizes remain unchanged.

## E7 Rare / generic Elite / environmental Variant integration

E7 separated ordinary-content rank semantics from historical Abyss Elite payout behavior.

- generic Elite: `rank='elite'` + `genericElite=true`,
- historical `enemy.elite` remains Abyss reward-eligible semantics,
- Rare Enemy Lv: 115–135%,
- generic Elite Enemy Lv: 120–145%,
- Chapter Rare requires explicit Rare-capable metadata,
- environmental Variants preserve species identity,
- World Tier remains owner of its existing multipliers,
- Bosses bypass generic rank/variant conversion.

## E8 Ch1–30 story migration

Eligible story stages across all 30 Chapters now use Encounter Pool + role-first templates + E7 rank/variant contracts while preserving fixed `waves` as fallback.

Migration rules:

1. `1-1` remains deterministic onboarding,
2. branch/hidden-route stages remain fixed,
3. ordinary encounters and Boss-stage pre-waves may pool,
4. authored Boss/MidBoss types remain fixed in their original wave order,
5. every Chapter pool keeps all seven regional roles as its majority ecology,
6. true-global slime remains available across all Chapters,
7. additional Global Species are selected from Chapter region tags and capped to a small roster,
8. Global Species are materialized against Chapter-local anchor stats rather than reusing Ch1 numbers,
9. Chapter Rare uses explicit 4% base presence with bounded World Tier influence,
10. environmental Variant contexts now cover grassland / fire / ice / wind / poison / dark / light,
11. no stage waves, headcounts, rewards, progression gates, save roots or currencies are rewritten.

## E9 next gate

Integrate Enemy 2.0 into Abyss / Rift / Secret Realm / Deep Survey through **curated activity-specific pools**, not by copying the broad story migration.

Required boundaries:

- Abyss depth / route / pact / challenge scaling remains authoritative,
- historical Abyss Elite payout semantics remain intact,
- Rift pools strongly respect Rift element identity,
- Secret Realm pools remain target-farm curated,
- Deep Survey conditions and Convergence Apex remain authoritative,
- Boss/Apex phases stay authored,
- existing endgame reward identities must not double-count Enemy 2.0 rank/variant bonuses.
