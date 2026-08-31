# CLR-18 — Story Density Migration: Chapter 18 midgame slice

Status: IMPLEMENTED IN THIS PR

## Why Chapter 18

Chapter 18 `星骸の砂海` is the mid-game representative slice because it uses the expanded 8-Stage structure, includes a midboss and final boss, and already carries canon lore about an intrusion from `世界の外側` punching into The Veil.

## Player contract

The visible canonical Stage spine remains:

`18-1 → 18-2 → 18-3 → 18-4 → 18-5 → 18-6 → 18-7 → 18-8`

On the first clear of each main Stage only:

`Stage battle → Result/Loot → 戦いの跡 → next Stage / Stage list`

Replay remains:

`Stage replay → Result/Loot`

`18-B` stays outside this representative Story-density slice.

## Story cadence

The eight short aftermath beats build from physical evidence of a non-natural impact, through research records and boundary distortion, to confirmation that the Chapter's existing `世界の外側` language is literal rather than metaphorical.

No canon source data in `chapters16to20.js` is rewritten.

## Authority boundaries

No new:
- Stage completion flag
- Story progression root
- save root
- reward/drop path
- EXP/Gold path
- BattleEngine authority
- unlock condition

The UI bridge continues to arm against existing `state.isStageCleared()` before battle and only renders a presentation card after a first victory.

## Verification

`tests/core-loop-clr18.test.js` now checks:
- canonical 18-1 through 18-8 order,
- 18-4 remains the midboss Stage,
- 18-8 remains the boss Stage,
- representative aftermath text stays concise,
- 18-B and neighboring Chapters remain untouched,
- first-clear-only behavior,
- Story text stays aligned with existing Chapter 18 world-outside / The Veil lore,
- no parallel progression/save/reward authority.

## Next

CLR-18 late-game representative Chapter, then bulk migration only after early/mid/late cadence is proven.
