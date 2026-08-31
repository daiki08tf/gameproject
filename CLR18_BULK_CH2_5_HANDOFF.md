# CLR-18 — Bulk Story Density Batch: Chapters 2–5

Status: IMPLEMENTED ON FEATURE BRANCH

## Goal
Extend the validated Stage-first first-clear Story aftermath cadence beyond the representative Chapters without changing canonical Stage progression or reward authority.

## Scope
Migrated main Stages:
- Chapter 2 `深緑の森`: 2-1 through 2-5
- Chapter 3 `忘れられた遺跡`: 3-1 through 3-5
- Chapter 4 `凍てつく霊峰`: 4-1 through 4-5
- Chapter 5 `灼熱の火山`: 5-1 through 5-5

Branch Stages `2-B` through `5-B` remain outside CLR-18 aftermath.

## Cadence
`Stage detail -> canonical battle -> first victory -> Result/Loot + 戦いの跡 -> next Stage / Stage list`

Replay, defeat and retreat do not show the beat.

## Canon boundary
Chapters 2–5 do not currently carry the richer explicit lore fields used by later Story Expansion Chapters. Their aftermath therefore stays deliberately local and observable:
- enemy movement
- environmental pressure
- guard / territory patterns
- boss-centered local resolution

No new world-history revelation, Veil explanation, Discovery, Branch clue or permanent Story fact is introduced by this batch.

## Authority
Unchanged:
- `stageProgress` / `state.isStageCleared()` remains Stage completion authority
- BattleEngine remains combat authority
- existing Result/Loot/EXP/Gold paths remain reward authority
- no new save root or Story progression root

## Verification
`tests/core-loop-clr18.test.js` checks:
- every canonical main Stage in Chapters 2–5 has exactly one aftermath entry
- branch Stages stay excluded
- beats remain concise
- first-clear-only behavior remains intact
- boss naming stays aligned with canonical Chapter data
- no progression/save/reward authority is added

## Next
Continue CLR-18 bulk migration in another bounded batch, keeping 5-Stage Chapters separate from later 8-Stage expanded Chapters where practical.
