# Enemy 2.0 / Encounter 2.0 — E9 Curated Endgame Handoff

Status: **E9 COMPLETE CANDIDATE**

## Scope

E9 connects Enemy 2.0 to the existing endgame activities without flattening them into the broad story pool.

Integrated activities:

- Abyss
- Rift
- Secret Realm
- Deep Survey

Convergence Apex remains fully authored and is explicitly excluded from Encounter Pool resolution.

## Core rule

Enemy 2.0 supplies **species variety and formation variety**. Existing endgame systems remain the owners of difficulty, rewards and activity identity.

No E9 code introduces:

- a new currency,
- a new save root,
- a new Home route,
- a timed/FOMO loop,
- a parallel endgame reward tier.

## Abyss

`buildAbyssStage()` now decorates the generated stage with a curated E9 pool after all existing depth / route / Pact / Challenge / reward calculations finish.

The pool contains:

- the floor's native non-Boss Abyss enemies,
- a maximum of three high-level Global Species materialized from that floor's own enemy stats,
- a limited Abyss template set.

Abyss keeps:

- existing depth scaling,
- route logic,
- Pact logic,
- Challenge logic,
- modifier logic,
- enemy headcounts,
- Boss floors,
- Abyss Shards,
- historical `enemy.elite === true` reward semantics.

E9 does **not** convert Abyss Elite into generic Elite. Historical Abyss Elite remains the only rank path that is eligible for the existing Abyss Shard kill payout.

A bounded `深淵映しの` environmental Variant can appear in Abyss, but it only adds small stat/reward flavor and does not replace depth scaling.

## Rift

`buildRiftStage()` now adds an element-curated Encounter Pool after Rift key Danger/reward scaling is resolved.

The Rift keeps:

- key-defined recommended level,
- Danger multipliers,
- Rift reward profile,
- Item Power target,
- authored Rift boss.

E9 adds:

- native Rift ordinary enemies as the pool core,
- up to three Global Species selected from the Rift element,
- stronger Variant presence than story content,
- a dedicated `雷光の` lightning Variant so Lightning Rift can produce identities such as `雷光のスライム`.

Boss types never enter the pool.

## Secret Realm

Secret Realm uses a deliberately narrow pool:

- authored ordinary realm enemies remain dominant,
- at most two matching Global Species are mixed in,
- E9 does not add a second Rare roll,
- existing Phase 12 / realm-authored Rare waves remain explicit authored waves,
- target-farm drops, modifiers and reward profiles remain unchanged.

Special authored Rare wave types are excluded from the ordinary pool so an ultra-rare authored enemy cannot become a routine random pool member.

## Deep Survey

Deep Survey receives a high-level curated pool only for ordinary threats.

It keeps:

- Survey Conditions,
- encoded condition stage IDs,
- condition pressure effects,
- Loot3 preferred-affix profiles,
- reward hints,
- the authored Deep Survey Apex wave.

Only up to two contextual Global Species are added, keeping the Survey's authored threats dominant.

## Convergence Apex

Convergence Apex remains a four-phase authored Boss sequence:

1. Ash
2. Ninth
3. Root
4. Convergence

E9 explicitly clears any inherited Encounter Pool metadata from this activity. All four waves remain fixed Boss phases.

## Environmental Variants

E9 adds two context definitions to the existing bounded Variant system:

- `lightning_arc` / `雷光の`
- `abyss_echo` / `深淵映しの`

These preserve the base enemy's species identity and use small bounded multipliers.

## Runtime safety

The existing Encounter 2.0 runtime remains the resolver:

```text
authored endgame stage builder
  ↓
existing activity scaling / rewards / waves
  ↓
E9 curated Encounter Pool metadata
  ↓
role-first template selection
  ↓
species resolution
  ↓
existing spawn / Enemy Lv / battle / reward pipeline
```

Boss types, authored Rare waves and Apex phases are excluded from random pool membership.

## Acceptance coverage

`tests/enemy2-e9-curated-endgame.test.js` covers:

- Abyss activity identity and shard contract retention,
- Abyss Boss exclusion,
- Rift element curation and Boss exclusion,
- lightning/Abyss Variant availability,
- narrow Secret Realm Global Species mix,
- Deep Survey Condition/Apex preservation,
- Convergence Apex remaining four authored Boss phases.

## Next: E10

Polish the existing Codex/discovery surfaces so Enemy 2.0 species, variants, Rare/Elite rank and encounter discovery are readable without adding another top-level screen.
