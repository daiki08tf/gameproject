# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0–E9 ✅ main / E10 COMPLETE CANDIDATE**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
Human-readable enemy catalog: `ENEMY_2_CONTENT_CATALOG.md`.
E5 handoff: `ENEMY_ENCOUNTER_2_E5_ENCOUNTER_PILOT.md`.
E6 handoff: `ENEMY_ENCOUNTER_2_E6_ROLE_TEMPLATES.md`.
E7 handoff: `ENEMY_ENCOUNTER_2_E7_RANK_VARIANTS.md`.
E8 handoff: `ENEMY_ENCOUNTER_2_E8_STORY_MIGRATION.md`.
E9 handoff: `ENEMY_ENCOUNTER_2_E9_ENDGAME_INTEGRATION.md`.
E10 handoff: `ENEMY_ENCOUNTER_2_E10_CODEX_DISCOVERY.md`.

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
  ↓
existing Codex ecology discovery
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
| E8 | progressive Ch1–30 migration | ✅ main |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | ✅ main |
| E10 | existing Codex discovery polish | ✅ complete candidate |

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

- generic Elite: `rank='elite'` + `genericElite=true`,
- historical `enemy.elite` remains Abyss reward-eligible semantics,
- Rare Enemy Lv: 115–135%,
- generic Elite Enemy Lv: 120–145%,
- Chapter Rare requires explicit Rare-capable metadata,
- environmental Variants preserve species identity,
- World Tier remains owner of its existing multipliers,
- Bosses bypass generic rank conversion.

## E8 Ch1–30 story migration

Eligible story stages across all 30 Chapters use Encounter Pool + role-first templates + E7 rank/variant contracts while preserving fixed `waves` as fallback.

Migration rules:

1. `1-1` remains deterministic onboarding,
2. branch/hidden-route stages remain fixed,
3. ordinary encounters and Boss-stage pre-waves may pool,
4. authored Boss/MidBoss types remain fixed in their original wave order,
5. every Chapter pool keeps all seven regional roles as its majority ecology,
6. true-global slime remains available across all Chapters,
7. additional Global Species are selected from Chapter region tags and capped to a small roster,
8. Global Species are materialized against Chapter-local anchor stats,
9. Chapter Rare uses explicit 4% base presence with bounded World Tier influence,
10. environmental Variant contexts cover grassland / fire / ice / wind / poison / dark / light,
11. no stage waves, headcounts, rewards, progression gates, save roots or currencies are rewritten.

## E9 curated endgame integration

Enemy 2.0 decorates dynamically generated endgame stages **after** each activity has resolved its existing difficulty/reward contract.

### Abyss

- depth / route / Pact / Challenge / modifier scaling remains authoritative,
- native Abyss enemies remain the pool core,
- at most three high-level Global Species are mixed in,
- historical `enemy.elite === true` and Abyss Shard payout remain unchanged,
- Boss floors remain authored,
- bounded `深淵映しの` Variant adds flavor without replacing depth scaling.

### Rift

- key Danger/reward/IP contracts remain authoritative,
- native Rift enemies remain the pool core,
- up to three Global Species are selected from the Rift element,
- Variant presence is intentionally stronger than story content,
- `雷光の` lightning Variant completes elemental coverage,
- Rift Boss remains authored and excluded from pool resolution.

### Secret Realm

- target-farm drops/modifiers/reward profiles remain authoritative,
- authored ordinary realm threats stay dominant,
- Global Species mix is capped at two,
- E9 adds no second Rare roll,
- existing authored realm Rare waves are excluded from ordinary pool membership.

### Deep Survey

- Survey Conditions, encoded IDs, pressure effects and Loot3 profiles remain authoritative,
- ordinary threats receive a narrow curated pool with at most two contextual Global Species,
- Deep Survey Apex wave remains authored.

### Convergence Apex

- no Encounter Pool,
- four authored Boss phases remain fixed: Ash → Ninth → Root → Convergence.

## E10 Codex / discovery polish

Enemy 2.0 discovery now lands on the **existing Monster Codex** instead of creating a parallel bestiary.

- existing `state.data.monsterCodex` remains the only save root,
- ecology aggregation is stored under reserved `monsterCodex.__enemy2Ecology`,
- Global Species materialized for different Chapters/endgame activities collapse to one species identity,
- generated `e8_*` / `e9_*` materialization IDs no longer inflate the normal Codex completion denominator,
- regional enemies preserve their authored identity while Variant sightings aggregate back to the base enemy,
- observed Story / Abyss / Rift / Secret Realm / Deep Survey activity is recorded,
- environmental Variant history is recorded,
- RARE / generic ELITE / historical ABYSS ELITE sightings remain distinct,
- highest encountered Enemy Lv and environment tags are recorded,
- Bosses remain on the existing authored Codex path and are excluded from ecology aggregation,
- actual Enemy 2.0 Rare encounters satisfy the already-existing `Rare個体` Codex milestone,
- ecology discovery adds **zero** new Codex points or permanent bonuses.

## Closeout gate

E10 is the final implementation phase. Merge only when:

1. legacy Codex tests remain green,
2. E10 ecology aggregation tests remain green,
3. generated Global Species IDs do not inflate completion,
4. no new save root/currency/reward multiplier is introduced,
5. full Blade Vale regression and validation workflows are green.

After that merge, **Enemy 2.0 / Encounter 2.0 is implementation-complete**.
