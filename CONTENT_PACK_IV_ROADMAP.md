# Content Pack IV — Contradictory Histories / Branch Sight Awakening

> Parent handoff: `STORY_EXPANSION_II_ROADMAP.md`.
> Canonical multiverse references: `OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md` and `OBSERVED_BRANCHES_ACCESS_AND_TRANSCENDENTS.md`.
>
> Status: **ACTIVE — CP4-3 COMPLETE; NEXT CP4-4 FIRST VISIBLE BRANCH ANCHOR HANDOFF**

## Theme

Story Expansion II ends with one impossible result: the same Deep Green Forest coordinates return two mutually incompatible contours.

Content Pack IV turns that result into a horizontal discovery arc.

```text
Ch35 shared observation
  ↓
old Region produces contradictory history
  ↓
Rumor / record / living-memory evidence disagree
  ↓
all three observations converge on one location
  ↓
視差核 / Parallax Core contact
  ↓
player perception changes
  ↓
Branch Sight / 分岐視 becomes active
  ↓
a previously invisible historical overlap can be recognized
  ↓
Observed Branches system receives the handoff
```

The key experience is not “a harder mode unlocked.”

> The player becomes able to notice a history that was already present.

## Permanent contracts

- No new Home button.
- No multiverse currency, level, skill tree, stamina, energy, daily portal, weekly reset or FOMO schedule.
- Branch Sight is narrative/perception state, not a combat stat.
- Existing Story clear state owns prerequisite narrative progress.
- Existing Adventure / `world2.discoveries` owns authored evidence and awakening discoveries.
- Existing Rumor / Codex / Chronicle surfaces present clues; they do not become parallel save roots.
- Existing Region navigation is extended in-place; undiscovered Branches are not rendered.
- World Tier can alter difficulty/content inside a discovered Branch later, but never controls Branch visibility.
- No RNG-only mandatory discovery.
- No mandatory Unique, companion, job, rune or gear-score gate.
- Existing Gear / Option / Item Power contracts remain authoritative.
- Japan / Tokyo / Earth stay unrevealed.
- Do not use “multiverse”, “Observed Branch”, “Branch Sight”, or named Branch terminology in-world before the awakening earns it.
- Prime Story consequences remain meaningful; alternate histories are not resurrection coupons.

## CP4-0 — Authority / access audit ✅ COMPLETE

Freeze before implementation:

- Ch35 / `35-8` is the narrative prerequisite.
- Deep Green Forest remains the first authored contradiction location.
- existing Rumor Notebook / Adventure / Discovery / Codex / Chronicle surfaces are reused.
- existing `world2.discoveries` is the preferred discovery authority.
- Branch Sight receives one explicit deterministic awakening discovery/event.
- each future Branch receives its own explicit anchor discovery.
- difficulty clear, player level, World Tier, gear score and RNG are forbidden as sole gates.
- undiscovered Branch count remains hidden.
- no separate Branch save root is introduced by CP4.
- CP4 stops short of implementing the full Observed Branch traversal framework; that belongs to the Observed Branches roadmap.

Deliverable:
- `CONTENT_PACK_IV_C0_AUDIT.md`.

## CP4-1 — Deep Green contradiction chain ✅ COMPLETE

First playable horizontal slice.

Prerequisite:
- Ch35 final Story clear.
- Deep Green Forest / Ch2 already cleared through normal Story progression.

Implemented deterministic revisit sequence:
- `2-1` — confirms the current / Prime record: the Great Tree Spirit was defeated and present ecology follows the known journey.
- `2-3` — recovers an impossible old record where the Great Tree Spirit survived, villages withdrew into the canopy, and living/root architecture developed while metal infrastructure declined.
- `2-5` — reads living-memory evidence in which the forest never formed at all.
- after all three records, `cp4:deepgreen:overlap-coordinate` identifies the one coordinate where all histories have zero positional error.

Three contradictory evidence lines:

1. **Current / Prime record**
   - the Great Tree Spirit was defeated during the known journey.
   - familiar terrain and current ecology remain consistent with Prime history.

2. **Impossible old record**
   - the Great Tree Spirit survived and still rules the forest.
   - villages withdrew into the canopy.
   - metal infrastructure is scarce while living/root architecture appears highly developed.

3. **Living-memory trace**
   - the forest itself never formed.
   - root-memory terminates where the known woodland should exist.
   - the coordinate remains, but “forest” is absent from the biological record.

Required grammar:

`Rumor → old Region revisit → evidence scene → second contradiction → living-memory evidence → overlap coordinate identified`

The chain is authored and deterministic. Optional Codex/Companion/Ranch context may add flavor but cannot block the route.

In-world terminology remains restrained:
- “record conflict”,
- “impossible history”,
- “observation mismatch”,
- “same coordinate / different result”.

Do not yet say:
- 王樹領,
- 深緑消失域,
- 観測分岐世界,
- Branch.

## CP4-2 — Parallax Core investigation ✅ COMPLETE

At the overlap coordinate, the player finds or synchronizes with:

**視差核 / Parallax Core**

It is not a magical multiverse key and does not immediately teleport the player.

Implemented deterministic investigation:
- prerequisite is the authored `cp4:deepgreen:overlap-coordinate` discovery from CP4-1,
- the player revisits Deep Green `2-5` after the coordinate has already been identified,
- `cp4:parallax:first-contact` records the first contact under existing `world2.discoveries`,
- readiness is captured before the existing battle start so the CP4-1 run that creates the overlap coordinate cannot chain directly into CP4-2,
- the event grants no combat reward and explicitly leaves Branch Sight inactive for CP4-3.

Required awakening presentation:
- sound doubles for a moment,
- familiar terrain overlaps with a living root corridor,
- the same path also flashes as a blank Boundary scar,
- one NPC silhouette both exists and does not exist,
- the overlap collapses back to Prime.

No boss is required for the first awakening. The focus is perception and discovery.

If combat is used in the investigation, it must be ordinary existing BattleEngine content representing local instability rather than “multiverse guardians.”

Deliverable:
- `CONTENT_PACK_IV_CP4_2_IMPLEMENTATION.md`.

## CP4-3 — Branch Sight activation ✅ COMPLETE

Working state name:

**Branch Sight / 分岐視**

Implemented deterministic activation:
- prerequisite is `cp4:parallax:first-contact`,
- the player deliberately revisits Deep Green `2-5` to reproduce and stabilize the Parallax Core synchronization,
- `cp4:branch-sight:active` is stored under existing `world2.discoveries`,
- `state.hasBranchSight()` exposes a boolean authored-state check without adding a parallel save root,
- the activation event separates doubled noise and conflicting images into distinguishable internally consistent histories,
- the blank Boundary scar remains unidentified and no Branch traversal occurs.

Implementation contract:
- stored as existing Story/Discovery-compatible authored state,
- not numeric,
- not trainable,
- not equippable,
- no battle bonuses,
- deterministic activation after the Parallax Core event.

Before activation:
- incompatible evidence is presented as corruption/noise,
- Branch-specific Region UI does not exist.

After activation:
- the player can recognize a sufficiently observed incompatible history,
- existing Region presentation may reveal a discovered historical overlap,
- Codex/Chronicle may begin using explicit divergence terminology only after the narrative beat.

Branch Sight does **not** reveal every Branch.

Deliverable:
- `CONTENT_PACK_IV_CP4_3_IMPLEMENTATION.md`.

## CP4-4 — First visible Branch anchor handoff

After awakening, Deep Green Forest may expose exactly one discovered alternate-history anchor:

**観測分岐：王樹領**

Important:
- `深緑消失域` remains hidden.
- total Branch count remains hidden.
- displaying the anchor does not require the full traversal implementation to be owned by CP4.
- full Branch region data, traversal, technology profiles, enemy ecology and gear originate in the Observed Branches roadmap.

This phase ends when the player understands:

> “That record was not false. It belonged to another fixed history.”

## CP4-5 — Horizontal reaction layer

Use existing systems to make the awakening feel like a world event without creating a new progression system.

Candidates:
- Rumor Notebook entries reinterpret older contradictions.
- Codex gains one small “historical inconsistency” field for authored discoveries.
- Chronicle records the Parallax Core event and the first recognized divergence.
- Ranch / Companion reactions may provide optional flavor to doubled ecology signals.
- Research may compare Prime biological data with the impossible canopy record.

No mandatory side-system completion.

## CP4-6 — Rewards / identity

Rewards use existing authorities only.

Preferred reward types:
- authored Unique or Relic with observation / reaction identity,
- existing option-family biases,
- cosmetic/read-only origin metadata only when the Observed Branch equipment model is ready.

Forbidden:
- Branch rarity,
- multiverse token,
- fourth Option,
- Item Power above 10,000,
- mandatory Branch Sight weapon.

CP4 itself should avoid handing out mature Branch-specific technology gear before the player has actually traversed a Branch.

## CP4-7 — Integration audit / handoff

Cross-check:
- Ch1–35 Story progression unchanged except Ch35 prerequisite for CP4.
- Abyss/Rift/Secret/Machine/Deep Survey unlocks unchanged.
- Branch Sight not tied to difficulty or World Tier.
- no RNG mandatory gate.
- no extra Home entry/save root/currency.
- unknown Branch count hidden.
- Prime Deep Green Forest remains usable after awakening.
- explicit Branch terminology appears only after the perception-change beat.
- no Japan/Tokyo/Earth reveal.
- Blade Vale Tests + Phase 8 Validation green.

Then hand off to:

`OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md` → M0–M4

where the first fully traversable Branch (`王樹領`) receives its own Region implementation, divergence ecology, technology profile, equipment identity and indirect Walker encounter.

## Acceptance criteria

Content Pack IV succeeds when the player progression feels like:

```text
“This record is broken.”
        ↓
“These records cannot all be true.”
        ↓
“They are all internally consistent.”
        ↓
“I touched something and saw both.”
        ↓
“The other history was already here; I just could not perceive it.”
```

It must never feel like:

```text
“You cleared Hard Mode, so Multiverse Mode is now unlocked.”
```
