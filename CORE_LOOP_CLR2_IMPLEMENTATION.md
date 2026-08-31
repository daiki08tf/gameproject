# Core Loop Rework — CLR-2 Aftermath / Branching

## Goal
Turn the CLR-1 frontier expedition from a flat battle chain into a small decision loop without adding another combat, reward, level, or save authority.

## Player loop
1. Fight a canonical Stage through the existing BattleEngine.
2. See the existing Result screen and receive the existing EXP / Gold / Loot.
3. Return to a short Adventure aftermath checkpoint.
4. Continue, return safely, or at the midpoint choose how aggressively to hunt.
5. Re-enter another canonical Stage battle.

## Mid-run choice
After battle 3 the cleared `frontier` Free Adventure exposes two routes:

- **Steady route** — skips the optional fourth battle and moves toward the deep section. A successful run contains 5 canonical battles.
- **Pressure route** — fights the optional fourth canonical battle before converging on the deep section. A successful run contains 6 canonical battles.

The pressure route has no bespoke bonus. Its extra value is exactly one more normal battle's canonical EXP / Gold / Loot and the corresponding extra combat risk/time.

## Authorities reused
- Battle / retreat / defeat: existing TextBattleScreen / BattleEngine
- EXP / Character Lv / Job Lv: existing progression pipeline
- Gold / Loot / Item Power / equipment: existing battle result pipeline
- Stage identity and Region Boss: `CHAPTERS` / existing Region endpoint
- Adventure-local clear state: existing `adventure4.temporaryFlags`
- Route availability: existing Adventure route graph condition engine
- Suspended-session compatibility: legacy Free Adventure node IDs remain in the graph

## New CLR-2 data only
`js/data/coreLoopClr2.js` contains deterministic node/tag identifiers. It owns no mutable state.

No CLR-2 currency, stamina, Hunt Lv, equipment score, reward table, permanent progression root, or second battle result pipeline is introduced.

## Failure / retreat contract
CLR-1 remains authoritative: only a cleared battle records its Adventure-local clear flag and clears `pendingEncounter`. Retreat/defeat leaves the encounter retryable and does not unlock the aftermath/next route.

## Scope
CLR-2 applies only to **cleared `frontier` Free Adventure**. Story routes and every other Region keep their previous topology.

## Next
CLR-3 should make the post-battle checkpoint more informative using data the existing result/progression systems already expose (e.g. run progress, remaining route risk, useful loot summary) without creating a second inventory/reward authority.
