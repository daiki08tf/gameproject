# Content Pack IV — CP4-2 Implementation Record

Status: **IMPLEMENTED — Parallax Core first contact**

## Runtime path

`CP4-1 overlap coordinate identified → revisit Deep Green 2-5 → overlap-coordinate investigation → 視差核 / Parallax Core contact → temporary three-way perception → collapse to Prime`

Persistent state remains under existing `state.data.world2.discoveries`.

Discovery ID:
- `cp4:parallax:first-contact`

## Presentation

The first contact is discovery-first rather than boss-first:
- sound doubles for a moment,
- Prime terrain remains visible,
- a living root corridor overlaps the same path,
- the same path flashes as a blank Boundary scar,
- one NPC silhouette both exists and does not exist,
- the overlap collapses back to Prime without teleportation.

The event is deliberately separated from CP4-1 completion. The `2-5` run that creates `cp4:deepgreen:overlap-coordinate` cannot also trigger first contact; the player must investigate the already-known coordinate on a subsequent authored revisit.

## Guardrails

- No boss or new combat authority is introduced.
- No new Home entry.
- No new save root.
- No currency / XP / stamina / daily gate.
- No difficulty, World Tier, gear-score or RNG gate.
- No Branch traversal or teleportation.
- Branch Sight is **not active yet**; the discovery records `branchSightActive:false`.
- No `王樹領` / `深緑消失域` reveal.
- No Observed Branch / Transcendent terminology in-world.
- No Japan / Tokyo / Earth reveal.
- Prime Deep Green Forest remains authoritative and replayable.

## Handoff

CP4-3 owns deterministic Branch Sight / 分岐視 activation after this first-contact discovery. It may reinterpret the witnessed overlap, but CP4-2 itself grants no combat bonus and reveals no traversable Branch.
