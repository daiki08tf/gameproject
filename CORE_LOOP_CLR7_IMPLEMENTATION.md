# Core Loop Rework — CLR-7

Status: COMPLETE

## Goal
Make investigation knowledge emerge from combat outcomes instead of detached pre-combat exposition.

## Result
The existing `frontier-pilot-fresh-tracks` investigation trace is now also awarded by the CLR-6 post-combat Story aftermath scene in `frontier`.

New Story flow therefore becomes:

`canonical Story battle -> victory -> 戦いの跡 -> existing Investigation trace -> return`

The trace continues to be owned by the existing `ADVENTURE4_INVESTIGATION_CATALOG` and `recordAdventure4TraceById()` runtime. CLR-7 creates no new clue/discovery save model.

## Compatibility
The old `pilot-fork` route remains for suspended legacy sessions and can still resolve its historical investigation consequence. Newly started CLR-6 Story sessions bypass that fork, so their normal path earns the trace after combat.

## Scope
This first vertical slice applies only to the existing `frontier-pilot-fresh-tracks` trace. Unrelated Regions do not receive it.

## Design principle
Battle first. Then inspect what the battle changed or exposed. The resulting clue can feed Investigation/Rumor/Discovery systems without turning them into pre-combat reading screens.

## Next
CLR-8 should audit the existing CP4 / Rumor / Discovery chain and migrate suitable authored evidence triggers onto post-battle or route-outcome hooks while preserving deterministic mandatory discovery and existing authorities.
