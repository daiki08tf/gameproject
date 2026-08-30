# Blade Vale — Observed Branches M2 Implementation

> Status: **COMPLETE — READY FOR M3 BRANCH REGION PRESENTATION**
>
> Baseline: `90027ae0fdd7f54d889dad41e0de8485a107f6c6` (M1 Branch data model merged)

## Scope

M2 implements the discovery/secrecy projection required by the roadmap. Existing CP4/Adventure discovery remains authoritative; M2 does not create a second discovery state or mutate save data.

## Existing deterministic discovery route

The first required Branch discovery is already authored by Content Pack IV:

1. Branch Sight/evidence makes the Chapter 2 historical-overlap anchor recognizable.
2. `observeCP4FirstBranchAnchor()` records `cp4:branch-anchor:tree-sovereign` under existing `world2.discoveries`.
3. The M1 王樹領 definition requires that discovery ID and explicitly declares `rngRequired:false`.

M2 reuses this route rather than adding random investigation, rare-event, equipment, World Tier, Job, Companion, Rune or gear-score gates.

## Discovery/secrecy projection

`js/data/observedBranchDiscovery.js` exposes read-only selectors that:

- return only Branch definitions whose existing discovery prerequisites are satisfied,
- filter those known Branches by the existing Prime Region reference,
- build a Region discovery view containing only `branches` that are already known.

The projection intentionally exposes **no**:

- hidden Branch entries,
- `???` placeholder identities,
- unknown Branch count,
- total Branch count,
- Branch menu,
- traversal action,
- currency/progression state.

Before discovery, the Chapter 2 Branch projection is simply an empty `branches` list.

## Authority boundaries

M2 owns no persistent state. Discovery writes remain on existing `world2.discoveries`; Adventure investigation/discovery systems remain the evidence authority. M2 is a pure projection layer for later Region presentation.

No new Home button, save root, Branch currency, Branch level, stamina/energy, daily/weekly rotation or FOMO is added.

## Verification

`tests/observed-branches-m2.test.js` covers:

- no Branch identity/placeholder/count before discovery,
- 王樹領 exposure only after the existing CP4 anchor discovery,
- Prime Region scoping,
- deterministic/RNG-free first required discovery route,
- absence of menu/traversal/currency/progression ownership.

**NEXT: M3 — Branch Region presentation.**
