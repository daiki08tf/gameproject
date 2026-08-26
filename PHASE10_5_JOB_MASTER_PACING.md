# Phase 10.5 — Job MASTER Pacing Audit

## Goal

Revalidate Job MASTER speed after the Lv99,999 / Abyss / World Tier reward expansion so late-game rewards do not instantly erase Job progression.

## Result

The existing Progression 3.0 design is retained.

- Job EXP remains a tiered share of common EXP rewards:
  - Basic: 30%
  - Advanced: 20%
  - Special: 15%
  - Hero: 10%
- One reward can advance at most 3 Job levels.
- MASTER requirements remain:
  - Basic Lv15
  - Advanced Lv30
  - Special Lv50
- Therefore, even when an endgame reward is large enough to hit the cap every time, a fresh Job needs at least:
  - Basic: 5 capped rewards
  - Advanced: 10 capped rewards
  - Special: 17 capped rewards

This keeps switching Jobs lightweight while preventing a single Abyss / World Tier / EX reward from instantly completing a fresh Job.

## Why no multiplier retune was needed

Phase 10.3 intentionally increased Gold / loot / Item Power progression without accelerating Abyss EXP beyond its existing roadmap. Job EXP already has a separate tier share and a hard per-reward level cap. Those two protections remain sufficient after the endgame reward expansion.

Changing the Job EXP shares here would risk making early and midgame Job progression unnecessarily slow. The safer Phase 10.5 outcome is to formalize and regression-test the current contract.

## Regression contract

`tests/phase10-5-job-master-pacing.test.js` verifies:

1. MASTER levels remain aligned with `JOB_TIER`.
2. Fresh Basic / Advanced / Special Jobs cannot MASTER from one oversized reward.
3. Higher tiers retain intentionally slower Job EXP shares.
4. Near-MASTER Jobs still complete in a small number of clears.
5. Runtime still applies the 3-level reward cap after Character EXP processing.

## Roadmap impact

`LEVEL_ROADMAP_99999.md` target 3, “Job MASTER速度の再検証”, is complete.

Next target: Lv10,000+ numeric display and combat arithmetic digit-safety audit.
