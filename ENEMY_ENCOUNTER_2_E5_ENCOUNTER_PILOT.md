# Enemy 2.0 E5 — Ch1 Encounter Pool Pilot

Status: **COMPLETE CANDIDATE**

## Scope

E5 proves the live Encounter Pool path without replacing the fixed-wave architecture.

Pilot stages:
- `1-1` — fixed tutorial
- `1-2` — pool enabled
- `1-3` — pool enabled
- `1-4` — pool enabled
- `1-5` — ordinary enemies pooled, authored Boss fixed
- `1-B` — fixed hidden route

## Pool

Safe Ch1 candidates:

- `grunt`
- `fast`
- `tank`
- `ch1_attacker`
- `ch1_caster`
- `ch1_trickster`
- `ch1_support`
- `ch1_global_slime`
- `ch1_global_wolf`

Chapter Rare is intentionally absent until E7. Generic Elite is also absent because the historical `enemy.elite` flag is still coupled to Abyss Shard payout.

## Runtime flow

`battle2RoadmapComplete.js` loads:

```text
enemy2LevelFoundation
  ↓
enemy2LevelScaling
  ↓
enemy2EncounterPilot
  ↓
Battle2 wrappers
```

The Encounter pilot wraps the completed Enemy Lv spawn chain. For an opt-in non-Boss spawn it chooses a weighted safe type and delegates to the existing spawn pipeline, so the resolved species still receives Enemy Lv metadata/scaling and all normal combat integrations.

The runtime enemy also carries ecology metadata from its resolved template: role, speciesId, family/habitat/global flags and behaviorTags where available.

## Preserved contracts

- fixed `waves` stay in stage data,
- total enemy count is unchanged,
- existing encounter-group size is unchanged,
- Boss type/order is unchanged,
- no Rare/Elite runtime rank,
- no new save field,
- no new currency,
- no new reward table,
- no Item Power/Option changes.

## Determinism

`js/data/encounterPools2.js` provides seeded deterministic RNG and pure pool resolution for tests. Runtime play uses normal entropy.

## Next

E6 replaces long-term slot-by-slot randomness with **role-first Encounter Templates** so random parties feel authored rather than noisy.
