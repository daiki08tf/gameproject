# Core Loop Rework — CLR-3 Aftermath Summary

## Goal
Make the CLR-2 post-battle checkpoint useful as a decision screen without creating a second result/reward history.

## What the player sees
At CLR-2 aftermath / route-choice checkpoints the Adventure screen now derives and shows:

- battles cleared in the current expedition
- whether the route is still undecided, Steady, or Pressure
- remaining battle count (or range before the midpoint choice)
- short guidance about the current route tradeoff

Examples:

- before choosing: `3戦突破 / ルート未選択 / 残り2〜3戦`
- Steady: `3戦突破 / 安全路を選択 / 残り2戦`
- Pressure: `3戦突破 / 圧力路を選択 / 残り3戦`

## Authority / state contract
`js/data/coreLoopClr3.js` is read-only. It derives the summary from:

- existing CLR-1 clear flags in `adventure4.temporaryFlags`
- existing Adventure `visitedNodeIds`
- the current canonical Adventure route graph

It does not persist another summary object and does not own EXP, Gold, Loot, inventory, equipment, or battle results.

## UI contract
The existing Adventure UI displays the CLR-3 summary only at CLR-2 aftermath / Steady / Pressure nodes. Other Story and Adventure screens retain their previous presentation.

The ordinary Result screen remains the authoritative place for the just-finished battle's exact EXP / Gold / Loot details.

## Next
CLR-4 should evaluate whether the first `frontier` slice now has enough combat density and decision cadence, then either tune the 5-vs-6 fight rhythm or roll the pattern into a second cleared Region without copy-pasting reward/state systems.
