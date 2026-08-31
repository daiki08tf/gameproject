# Core Loop Rework — CLR-6

Status: COMPLETE

## Goal
Move Story back inside the hack-and-slash loop: players should fight first, then read the world from what the battle revealed.

## Result
New Adventure Story sessions now begin directly at the existing canonical Story battle.

After victory:
1. the existing `stageProgress` authority records the canonical stage clear;
2. that clear condition reveals a short `戦いの跡` aftermath scene;
3. the scene presents a concise world/story fragment derived from the place just fought through;
4. the player returns through the existing Adventure route authority.

Before victory, the aftermath is unavailable.

## Compatibility
The historical `entry -> pilot-fork -> story` nodes remain in the route graph with `legacy-entry` tags so suspended sessions from before CLR-6 can still finish. They are no longer the entry point for newly started Story sessions.

## Authority boundaries
CLR-6 adds no:
- Story save root
- Discovery save root
- battle-clear flag for Story
- reward/currency/inventory path
- BattleEngine change

Canonical Story completion remains `stageProgress`. The aftermath node merely tests `{stageCleared: story.stageId}`.

## Design principle
Story is no longer the thing that delays combat. Combat earns the right to see the next piece of Story.

## Next
CLR-7 should apply this battle-first Story cadence to World 4.0 authored investigations/discoveries, so Rumor/Discovery/Branch clues increasingly appear as battle/route outcomes rather than detached pre-combat exposition.
