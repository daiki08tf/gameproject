# Phase 10.7 — Full EXP Progression Simulation

## Goal

Validate that the complete Lv1 → 99,999 roadmap behaves as designed instead of only looking correct in isolated tables.

## Story contract

- Chapters 1–15: Lv1 → 700.
- Chapters 16–20: Lv700 → 3,000.
- A canonical **main-route clear** should supply about **85%** of the EXP needed for that chapter's level span.
- The remaining ~15% intentionally comes from branch stages, retries, equipment farming, bounties and other side activity.

### Audit correction

The old Chapter 1–15 code used a single synthetic baseline (`681 EXP`) rather than each chapter's real stage/wave budget. Chapters 16–20 used their real budget, but included optional branch stages in the one-pass denominator.

Phase 10.7 aligns both halves:

1. Measure each chapter from its actual stage rewards + enemy wave EXP.
2. Count only non-branch stages for the canonical one-pass budget.
3. Scale stage and enemy EXP so that the main route lands near 85% of the cumulative EXP span.
4. Keep branch stages scaled, but treat them as optional catch-up content rather than mandatory main-route EXP.

## Abyss contract

- Abyss begins at Lv3,000 / 1F.
- 100F → Lv9,999.
- 500F → Lv29,999.
- 1,000F → Lv49,999.
- 2,000F → Lv74,999.
- 3,000F → Lv99,999.
- `abyssStageExpBudget()` supplies roughly 55% of progression demand; enemy EXP supplies the remaining share.

The regression suite sums all stage-clear budgets from 1F through 2,999F and requires the aggregate to stay within a broad 45–65% corridor of the total Lv3,000 → 99,999 EXP requirement. This catches accidental reward explosions or starvation while preserving the intended enemy-EXP contribution.

## Tooling

`node scripts/phase10-7-exp-simulation.js`

prints the 20 story checkpoints and canonical Abyss checkpoints for balance review.

## Completion criteria

- All 20 chapters remain inside the 83–87% one-pass corridor after integer rounding.
- A canonical story pass never overshoots the chapter target; side-content headroom remains.
- Abyss stage EXP stays finite / positive and contributes the intended partial share.
- Canonical Abyss checkpoints remain monotonic through Lv99,999.
- Existing regression and validation workflows stay green.
