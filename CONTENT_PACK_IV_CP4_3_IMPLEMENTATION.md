# Content Pack IV — CP4-3 Implementation Record

Status: **IMPLEMENTED — Branch Sight / 分岐視 activation**

## Runtime path

`cp4:parallax:first-contact → revisit Deep Green 2-5 → deliberate Parallax Core resynchronization → incompatible images separate into internally consistent histories → Branch Sight stabilizes`

Persistent state remains under existing `state.data.world2.discoveries`.

Discovery ID:
- `cp4:branch-sight:active`

## State contract

Branch Sight is an authored perception/discovery state only.

The activation discovery explicitly records:
- `branchSight:true`,
- `branchSightActive:true`,
- `numeric:false`,
- `trainable:false`,
- `equippable:false`,
- `battleBonus:false`,
- `revealsAllBranches:false`.

The runtime exposes `state.hasBranchSight()` as a boolean check backed only by the existing discovery ID. No parallel save root is introduced.

## Presentation

Before awakening, the Parallax overlap is experienced as doubled noise and conflicting images.

During the authored resynchronization:
- doubled sound separates into two coherent sources,
- Prime Deep Green and the living-root corridor can be perceived simultaneously without blending,
- the blank Boundary scar is still visible but remains unidentified,
- the impossible NPC silhouette is reinterpreted as belonging to another consistent history rather than being a corrupted image.

After awakening, the player can distinguish a sufficiently observed incompatible history from Prime. This does not reveal every hidden history and does not create traversal by itself.

## Guardrails

- No new Home entry.
- No new save root.
- No XP, level, skill tree, currency, stamina, daily or weekly progression.
- No training, equipment slot or combat bonus.
- No RNG, difficulty, World Tier or gear-score gate.
- No automatic reveal of every Branch.
- No `王樹領` / `深緑消失域` anchor is exposed by CP4-3 itself.
- No Transcendent / Japan / Tokyo / Earth reveal.
- Prime Deep Green Forest remains authoritative and replayable.

## Handoff

CP4-4 may now use the stable boolean Branch Sight state plus explicit authored discovery evidence to reveal exactly one historical overlap anchor in the existing Region presentation: `観測分岐：王樹領`.

CP4-4 must still keep `深緑消失域` and the total Branch count hidden, and it must not implement full Observed Branch traversal.
