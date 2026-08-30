# Content Pack IV — Contradictory Histories / Branch Sight Awakening

> Parent handoff: `STORY_EXPANSION_II_ROADMAP.md`.
> Canonical multiverse references: `OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md` and `OBSERVED_BRANCHES_ACCESS_AND_TRANSCENDENTS.md`.
>
> Status: **COMPLETE — HANDOFF READY; NEXT OBSERVED BRANCHES M0**

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

## CP4-4 — First visible Branch anchor handoff ✅ COMPLETE

After awakening, Deep Green Forest exposes exactly one authored alternate-history anchor:

**観測分岐：王樹領**

Implemented handoff:
- Branch Sight plus `cp4:deepgreen:survival-record` makes one `歴史的重なり` card recognizable in the existing Chapter 2 Region list,
- `重なりを観測` records `cp4:branch-anchor:tree-sovereign` under existing `world2.discoveries`,
- after observation the card is named `観測分岐：王樹領` and marked `OBSERVED`,
- the card remains non-playable and records `traversable:false`,
- `深緑消失域` and total Branch count remain hidden.

Important:
- displaying the anchor does not implement full traversal.
- full Branch region data, traversal, technology profiles, enemy ecology and gear originate in the Observed Branches roadmap.

This phase ends when the player understands:

> “That record was not false. It belonged to another fixed history.”

Deliverable:
- `CONTENT_PACK_IV_CP4_4_IMPLEMENTATION.md`.

## CP4-5 — Horizontal reaction layer ✅ COMPLETE

Use existing systems to make the awakening feel like a world event without creating a new progression system.

Implemented derived reactions after `cp4:branch-anchor:tree-sovereign`:
- the existing Rumor Notebook contradiction entry is reinterpreted as a confirmed alternate fixed history,
- Codex shows one read-only `歴史的不整合` section without changing points, milestones or completion,
- the existing Chronicle timeline derives the Parallax Core contact and first recognized Branch anchor from their discovery timestamps,
- Settlement Research adds one authored `Prime生態と樹冠史の比較` outlook entry only when the existing Research facility is already unlocked,
- no new mandatory discovery, reaction progress root or side-system completion is introduced.

Ranch / Companion flavor remains optional and is intentionally deferred rather than adding one-off UI coupling solely for CP4-5.

No mandatory side-system completion.

Deliverable:
- `CONTENT_PACK_IV_CP4_5_IMPLEMENTATION.md`.

## CP4-6 — Rewards / identity ✅ COMPLETE

Rewards use existing authorities only.

Implemented identity reward after `cp4:branch-anchor:tree-sovereign`:
- `視差残響章` (`uq_cp4_parallax_echo_emblem`) is registered through the existing Unique Equipment list,
- the existing `mythic` rarity and `accessory` slot are reused,
- the existing `state.addItem()` inventory pipeline grants exactly one copy,
- `cp4:reward:parallax-echo-emblem` records the one-time grant under existing `world2.discoveries`,
- the item uses only the existing `actionDiversityBuff` effect kind,
- old saves with the observed anchor are synchronized on load, while current-session anchor observation grants immediately,
- ownership/equipped checks plus the authored reward discovery prevent duplicate grants.

Identity boundary:
- the item is a Prime-side keepsake made from Parallax Core observation residue,
- it is explicitly not mature `王樹領` technology,
- equipping it is optional and never gates Branch Sight, Branch visibility, CP4-7 or later traversal.

Forbidden systems remain absent:
- no Branch rarity,
- no multiverse token,
- no fourth Option,
- no Item Power override or value above 10,000,
- no mandatory Branch Sight weapon,
- no new Branch currency / XP / level / skill tree / stamina.

Deliverable:
- `CONTENT_PACK_IV_CP4_6_IMPLEMENTATION.md`.

## CP4-7 — Integration audit / handoff ✅ COMPLETE

Verified against the pre-CP4 baseline `4eb99f84981285726c49a5d21c4db018e962bd12`:
- Ch1–35 Story progression files are unchanged; Ch35 / `35-8` is only consumed as the CP4 prerequisite.
- Abyss/Rift/Secret/Machine/Deep Survey implementation files and unlock authorities are unchanged by CP4.
- Branch Sight remains authored boolean discovery state and is not tied to difficulty, World Tier, gear score or combat stats.
- no RNG mandatory gate exists.
- no extra Home entry, save root or currency exists; Home only bootstraps the CP4 patch chain.
- unknown Branch count stays hidden.
- Prime Deep Green Forest remains usable after awakening; the first Branch anchor remains `traversable:false`.
- explicit Branch terminology appears only after the perception-change beat.
- no Japan/Tokyo/Earth or Transcendent reveal exists in CP4 runtime content.
- CP4-6 identity reward remains optional and does not become a progression gate.

Automated final-boundary coverage:
- `tests/content-pack-iv-g.test.js`.

Audit record:
- `CONTENT_PACK_IV_CP4_7_AUDIT.md`.

Handoff:

`OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md` → **M0 — Multiverse / authority audit**

M0–M4 now own the first fully traversable Branch (`王樹領`): Region implementation, divergence ecology, technology profile, equipment identity and indirect Walker encounter.

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
