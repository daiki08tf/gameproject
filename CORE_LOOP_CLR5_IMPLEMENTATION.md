# Core Loop Rework — CLR-5

Status: COMPLETE

## Goal
Connect the existing Lv / World Tier climb to a more substantial hack-and-slash expedition without introducing another reward or progression authority.

## Result
Completed `frontier` and `elemental` Free Adventure now derive expedition cadence from the already-selected World Tier rank:

- World Tier rank 0–1: Steady 5 battles / Pressure 6 battles
- rank 2–3: Steady 6 / Pressure 7
- rank 4–6: Steady 7 / Pressure 8

The midpoint route decision remains exactly one optional pressure battle. CLR-3 run summary therefore scales automatically from the actual route graph.

## Authority boundaries
CLR-5 does not add or alter:
- EXP formulas
- Gold or drop multipliers
- Item Power scaling
- World Tier unlock thresholds
- eliteChance
- BattleEngine
- inventory / equipment grant paths
- currency, stamina, Hunt Lv, or save roots

World Tier and `endgameRewardScaling.js` remain authoritative for enemy/reward pressure. CLR-5 changes only how many existing canonical stage battles a cleared-Region expedition can contain.

## Why
Higher World Tiers already increase enemy stats, Elite chance, drop, Gold and Item Power. Adding a second CLR multiplier would double-count progression. Increasing encounter count instead makes higher-level play feel denser and gives players more opportunities to use the existing reward pipeline.

## Scope
Runtime rollout remains limited to the CLR-4 pilot Regions:
- `frontier`
- `elemental`

Story routes and later Regions remain unchanged.

## Next
CLR-6 should bring Story back inside this combat-first rhythm: short discovery/story beats should be earned after battles or route outcomes instead of replacing combat nodes.
