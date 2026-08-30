# Content Pack IV — CP4-4 Implementation Record

Status: **IMPLEMENTED — first visible Branch anchor handoff**

## Runtime path

`Branch Sight active + authored Deep Green survival evidence → open Chapter 2 Region list → historical overlap becomes recognizable → observe overlap → 観測分岐：王樹領 becomes named`

Persistent state remains under existing `state.data.world2.discoveries`.

Discovery ID:
- `cp4:branch-anchor:tree-sovereign`

## Region presentation

CP4-4 extends the existing Chapter 2 stage list in-place.

Before Branch Sight:
- no Branch anchor card is rendered.

After Branch Sight and the authored survival record:
- one non-playable `歴史的重なり` card appears in the existing Chapter 2 Region presentation,
- the player can choose `重なりを観測`,
- observation records the explicit anchor discovery,
- the card is then named `観測分岐：王樹領` and marked `OBSERVED`.

The card has no traversal action. It does not call stage selection, teleportation, Secret Realm construction or a new battle authority.

## State contract

The anchor discovery records:
- `branchAnchor:true`,
- `observedBranchAnchor:true`,
- `traversable:false`,
- `deepGreenAbsentHidden:true`,
- `totalBranchCountHidden:true`.

Only one authored anchor is exposed by CP4-4.

## Narrative result

The player can now conclude:

> The old survival record was not false. It belongs to another fixed, internally consistent history occupying the same observed coordinates.

This is the first point where the authored name `観測分岐：王樹領` is earned.

Still hidden:
- `深緑消失域`,
- total Branch count,
- full Observed Branch traversal rules,
- Branch technology / ecology / gear implementation,
- Transcendents,
- Japan / Tokyo / Earth.

## Architecture guardrails

- No new Home entry or screen.
- No new save root.
- No Branch currency, XP, level, stamina or skill tree.
- No RNG, difficulty, World Tier or gear-score gate.
- No combat reward or battle bonus.
- Prime Chapter 2 remains fully playable and authoritative.
- No teleportation or Branch traversal.

## Handoff

CP4-5 owns horizontal reactions to the awakening and first recognized divergence using existing Rumor / Codex / Chronicle / Ranch / Companion / Research surfaces.

The full traversable `王樹領` Region remains owned by `OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md` M0–M4.
