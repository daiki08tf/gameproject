# Core Loop Rework — CLR-8

Status: COMPLETE

## Goal
Move Content Pack IV's core discovery chain from battle-entry triggers to deterministic battle-outcome triggers so world revelations are earned through hack-and-slash play.

## Changes
- `cp4:deepgreen:prime-record`, `cp4:deepgreen:survival-record`, and `cp4:deepgreen:no-forest-memory` are recorded only after the matching battle returns `result.cleared === true`.
- `cp4:deepgreen:overlap-coordinate` is still derived from the existing ordered Deep Green evidence chain.
- `cp4:parallax:first-contact` is recorded only after a victory on the ready `2-5` revisit.
- `cp4:branch-sight:active` is recorded only after a later victory on the ready `2-5` revisit.
- Existing Discovery IDs, Rumor synchronization, `world2.discoveries`, and Branch Sight semantics remain authoritative.
- Existing TextBattle callbacks are wrapped rather than replacing BattleEngine or stage progression.

## Resulting loop
Battle -> victory -> authored evidence -> Rumor/Discovery progress -> deeper revisit -> Parallax contact -> later victory -> Branch Sight.

Entering, retreating from, or losing the relevant battle no longer grants the CP4 core revelation.

## Guardrails
- no RNG-only required discovery
- no new save root
- no new currency, reward multiplier, Item Power, level, stamina, or energy system
- no BattleEngine reward changes
- no change to Branch Sight's non-numeric perception-state contract
- no same-victory cascade from final contradiction evidence to Parallax to Branch Sight

## Verification
`tests/core-loop-clr8.test.js` covers ordered Deep Green evidence, separate Parallax/Branch Sight revisits, battle-end callback wiring, victory gating, stable Discovery IDs, and absence of RNG/reward authority.

## Next
CLR-9 — move suitable free-adventure / deep-route investigation and authored clue reveals onto CLR combat-chain milestones (mid-run aftermath, Elite/Boss victory, or successful return) while keeping optional lore compact and preserving existing Investigation/Discovery authority.
