# Enemy 2.0 E4 — Regional Expansion

Status: **COMPLETE CANDIDATE**

## What changed

- Added `js/data/regionalEnemies2.js` with five authored identities for every Ch1–30 region:
  - attacker
  - caster
  - trickster
  - support
  - rare
- Registered all 150 identities in the canonical `ENEMY_TYPES` registry.
- Existing Ch2–30 normal/fast/tank enemies now expose role/chapter metadata; historical Ch1 IDs remain unchanged and receive compatibility metadata.
- Added distinct E4 stat silhouettes using the existing Chapter scaling functions.
- Added `ENEMY_2_CONTENT_CATALOG.md` as the human-readable Enemy 2.0 catalog.
- Existing stage `waves` are untouched.

## Counts

Before Bosses/special enemies:

- regional normal/fast/tank: 90
- new regional attacker/caster/trickster/support: 120
- new regional Rare: 30
- Global Species: 12
- total ecology identities: **252**

## Safety decisions

- `rareIdentity` is not `boss`.
- `rareIdentity` is not `elite` because current `enemy.elite` awards Abyss Shards.
- No new reward path, currency, save field, Home route, or encounter RNG was introduced.
- Dedicated caster/support/trickster action behavior can deepen later, but E4 already gives them stable role/behavior metadata and distinct stat silhouettes.

## Next

E5 introduces an optional Encounter Pool contract with one early-story pilot while keeping fixed waves as fallback and keeping Boss waves authored.
