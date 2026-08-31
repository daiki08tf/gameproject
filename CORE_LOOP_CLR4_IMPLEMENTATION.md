# Core Loop Rework — CLR-4 Second Region Rollout

## Goal
Validate that the CLR-1 through CLR-3 combat-first Adventure loop can be reused beyond the first vertical slice without copying reward/state/combat authorities.

## Rollout
The shared cleared-Free-Adventure combat loop now applies to:

- `frontier` / 開拓辺境
- `elemental` / 四境連峰

All other Regions retain the previous Free Adventure topology for now.

## Elemental contract
`elemental` derives six combat candidates from its existing chapter/stage data:

- five canonical route/boss references
- the existing final Region Boss as the sixth finisher

The same CLR-2 route choice is reused:

- Steady: 5 battles
- Pressure: 6 battles

The same CLR-3 summary is derived from the current Adventure session. No Region-specific summary or reward state is introduced.

## Why this is safe
The rollout reuses the same adapter function for both Regions. Region identity only changes which canonical `stageId` values are selected.

No duplicated:

- BattleEngine
- EXP / Job EXP
- Gold / Loot
- Item Power / equipment
- World Tier modifier
- Adventure save root
- route-choice currency or reward table

Legacy Free Adventure nodes remain embedded for suspended-session compatibility.

## Scope limit
CLR-4 deliberately does not convert all completed Regions at once. Two Regions are enough to prove reuse while keeping the blast radius small.

## Next
CLR-5 should use this two-Region baseline to compare combat cadence against later/higher-level Regions and decide whether the same 5-vs-6 shape should stay universal or scale by Region/endgame state.
