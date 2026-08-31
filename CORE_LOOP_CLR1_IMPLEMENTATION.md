# Blade Vale — CLR-1 Multi-Battle Expedition Foundation

## Status

CLR-1 implements the first combat-first Adventure vertical slice without replacing BattleEngine, Story progression, EXP/Lv, Loot, Gear, World Tier, or save ownership.

## Scope

The first slice is deliberately narrow:
- Region: `frontier`
- availability: already-cleared Free Adventure only
- one active Adventure Session
- six distinct canonical stage battles
- existing canonical Region Boss as the final battle
- exit remains available after each battle

Uncleared Story routes and other Regions retain their previous topology in CLR-1.

## Route

New sessions enter:

```text
entry
 -> battle 1
 -> result / canonical EXP + Loot
 -> battle 2
 -> result / canonical EXP + Loot
 -> battle 3
 -> result / canonical EXP + Loot
 -> battle 4
 -> result / canonical EXP + Loot
 -> battle 5
 -> result / canonical EXP + Loot
 -> canonical Region Boss
 -> return
```

The entry, six combat nodes and return produce a 75% combat-node vertical slice before CLR-2 adds short post-battle aftermath/event nodes.

## Battle authority

Each node references an existing canonical `stageId` and launches through the existing `TextBattleScreen` / `BattleEngine` boundary.

CLR-1 does not:
- calculate combat stats,
- grant EXP/Gold/items itself,
- roll a second equipment drop pipeline,
- change stage-clear ownership,
- apply World Tier a second time,
- add Hunt Lv/currency/stamina.

## Per-run progression gate

Previously cleared Story progress cannot answer whether the player won the current Hunt battle. CLR-1 therefore uses Adventure-session-local flags only:

```text
clr1:cleared:<battle-node-id>
```

On a CLR-1 victory:
- the current `pendingEncounter` is cleared;
- the current battle clear flag is written to `adventure4.temporaryFlags`;
- the next battle becomes available through the existing route-condition system.

On retreat/defeat:
- no clear flag is written;
- `pendingEncounter` remains;
- the next battle stays locked;
- the current encounter can be resumed/retried.

These flags are expedition navigation state, not permanent progression.

## Legacy suspended-session compatibility

The historical Free Adventure node IDs remain present in the route graph, but new sessions no longer link to them from `entry`.

This lets a save suspended on an old node continue to resolve that node instead of invalidating the active Adventure Session.

## Presentation secrecy

Route preview now receives the already-filtered `availableNext` list. A condition-locked next battle therefore is not previewed before the current battle has been cleared.

## Files

- `js/data/coreLoopClr1.js`
- `js/data/adventureWorld4Pilot.js`
- `js/patches/adventureWorld4Ui.js`
- `tests/core-loop-clr1.test.js`

## Verification focus

Tests cover:
- deterministic per-run clear flags,
- victory-only unlock,
- retreat/defeat retry behavior,
- six distinct canonical battle stages,
- canonical final Region Boss reuse,
- next-battle condition chain,
- locked preview secrecy,
- legacy route-node retention,
- no CLR-1 mutation of Story/non-frontier route topology.

## Next

**CLR-2 — Post-Battle Aftermath / Branch Routing**

Insert concise data-driven aftermath between canonical battles so combat results reveal world/story/route changes without replacing the combat-first backbone.
