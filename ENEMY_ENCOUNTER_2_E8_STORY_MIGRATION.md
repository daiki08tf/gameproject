# Enemy 2.0 / Encounter 2.0 — E8 Story Migration Handoff

Status: **E8 COMPLETE CANDIDATE**

## Scope

E8 expands the Encounter 2.0 story rollout from the Ch1 pilot to eligible story stages across **Ch1–30**.

The migration remains metadata-driven. Existing `waves`, counts, Boss ordering, rewards and stage progression remain authoritative.

## What migrates

Eligible story stages receive:

- seven-role regional Encounter Pool core,
- role-first templates from E6,
- explicit Chapter Rare capability from E7,
- generic World Tier Elite behavior from E7,
- bounded environmental Variant context,
- a small chapter-sensitive Global Species roster.

The original `1-1` tutorial remains deterministic.

Branch / hidden-route stages remain fixed and do not receive Encounter Pools in E8.

## Regional core

Every migrated Chapter pool contains the seven regional combat roles:

- normal
- fast
- tank
- attacker
- caster
- trickster
- support

Regional weights remain the majority of the pool. This prevents Enemy 2.0 from flattening every Chapter into the same global ecology.

## Global Species

Global enemies are materialized against each Chapter's own regional anchor stats rather than reusing Ch1 numeric stats.

Rules:

- true-global `slime` is available in every Chapter,
- additional globals are selected from Chapter region tags,
- each Chapter is capped at a small roster of up to four global species,
- generated runtime type IDs are Chapter-specific compatibility types,
- species identity remains global even though numeric anchors are Chapter-local.

Examples:

- fire region: slime / lizard / golem / wisp,
- dark region: slime / skeleton / bat / wandering armor.

This keeps old enemies relevant without making every region identical.

## Boss safety

Boss and MidBoss waves remain authored in the existing `waves` arrays.

Encounter Pool resolution does not include Boss types. On Boss stages, ordinary pre-waves may vary, but the authored Boss remains the final fixed encounter.

No Boss is converted into Rare, generic Elite or environmental Variant through E8.

## Rare / Elite

E8 reuses E7 contracts:

- Chapter Rare: explicit Rare-capable metadata only,
- base Rare encounter presence: 4%,
- bounded World Tier influence,
- Rare Enemy Lv: 115–135%,
- generic Elite Enemy Lv: 120–145%,
- generic Elite never sets historical Abyss `enemy.elite`.

## Environmental Variants

E8 expands the bounded environmental Variant catalog so migrated elemental regions can participate:

- fire → `灰熱の`
- ice → `霜晶の`
- wind → `疾風の`
- poison → `瘴毒の`
- dark → `影蝕の`
- light → `輝界の`
- Ch1 grassland keeps `風渡り`

Variants remain species-preserving overlays with small stat/reward tendencies. They do not create new progression systems or independent scaling layers.

## Fixed-wave preservation

Encounter Pool metadata does **not** rewrite stage `waves`.

Therefore:

- total authored headcounts are unchanged,
- existing group chunking remains unchanged,
- Boss order remains unchanged,
- removing/ignoring `encounterPool` still leaves valid fixed stage data.

## Acceptance coverage

`tests/enemy2-e8-story-migration.test.js` covers:

- all 30 Chapters receiving an eligible migrated field stage,
- tutorial and branches remaining fixed,
- all seven regional roles remaining present,
- Global Species rosters being bounded and region-sensitive,
- Chapter-local global enemy anchoring,
- Boss/MidBoss order preservation,
- environmental Variant activation,
- fixed wave headcount preservation.

## Next: E9

E9 is intentionally separate: curated Enemy 2.0 integration for **Abyss / Rift / Secret Realm / Deep Survey**.

Those activities must preserve their existing route, element, condition and reward identities instead of inheriting the broad story pool automatically.
