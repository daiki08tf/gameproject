# CLR-18 — Story Density Migration / Chapter 1 Representative Slice

Status: IMPLEMENTED

## Goal
Preserve the visible canonical Stage spine (`1-1 -> 1-2 -> ...`) while moving Story density to the combat outcome rather than placing exposition before combat.

## Representative slice
Chapter 1 (`1-1` through `1-5`) now has one concise post-combat `戦いの跡` beat per canonical Stage.

Contract:

`Stage detail -> canonical battle -> first victory -> Result + short aftermath -> next Stage / Stage list`

Replay contract:

`cleared Stage -> replay -> canonical battle -> Result only`

The aftermath is intentionally skipped on replay, defeat and retreat.

## Why this bridge exists
CLR-6 made Adventure4 Story routes battle-first, but CLR-13/14 restored the canonical Stage-first player path. That path launches the canonical battle directly and therefore did not traverse the Adventure4 CLR-6 aftermath node. CLR-18 reconnects the design intent at the actual player-facing Stage-first Result surface.

## Authority boundaries
No new:
- Story progression root
- Stage clear flag
- save root
- reward/drop path
- EXP/Gold path
- BattleEngine authority
- canon unlock requirement

`stageProgress` / `state.isStageCleared()` remains the Story completion authority. CLR-18 only snapshots whether the selected Stage was already cleared before battle and decides whether to render a presentation card afterward.

## Content boundary
This PR migrates only Chapter 1 as the early-game representative slice. It does not batch-convert Chapters 2-35.

The Chapter 1 beats stay observational and local to the existing Stage names/enemy pressure. They do not introduce a new faction, character, item, unlock, or hidden canon dependency.

## Next
Continue CLR-18 with a mid-game representative Chapter, then a late-game representative Chapter. Compare pacing before bulk migration.
