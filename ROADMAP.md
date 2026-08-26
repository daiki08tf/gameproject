# Blade Vale — Official Roadmap

> **Current:** Core/Foundation ✅ / System Deepening ✅ / Content Pack II ✅ / **Story Expansion I — Part A (Ch26–29) ✅ IMPLEMENTED**
>
> **NEXT:** **Story Expansion I — Part B: Ch30 + full integration** → Difficulty / Constraint Unlock redesign → Content Pack III.

Blade Vale is a personal evolving text-command hack-and-slash RPG. The preferred rhythm is:

**縦を少し伸ばす → 横を大量に増やす → 遊んで直す → また縦を伸ばす**

## Permanent rules

1. Lv cap remains **99,999** unless deliberately changed later.
2. No unnecessary currencies, Home buttons, parallel save roots or FOMO schedules.
3. Reuse Adventure / World / Secret Realm / Codex / Ranch / Equipment / Job / Settlement before creating top-level systems.
4. Mobile battle commands must never become unreachable; the many-enemies regression is permanent.
5. Optional horizontal content must not gate Ch1–25 story completion.
6. Rare/Unique rewards should create build or collection choices, not universal mandatory BiS.
7. Phase 13.4 Rotating Challenges remains intentionally omitted.
8. SD-4 conditional Boss hidden drops stay deferred.
9. Modern World evidence stays restrained; do not casually reveal Japan/Tokyo.
10. Preserve save compatibility and automated regression coverage.
11. Appending new story chapters must not silently move already-live endgame unlock gates.

### System-sprawl guardrails

- **Do not add a new currency merely to separate a content pack.** Reuse existing progression/economy when it fits.
- **Avoid new Home buttons.** Add content inside existing Adventure / World / Codex / Ranch / Equipment / Job / Settlement surfaces first.
- Prefer **systems talking to each other** over parallel one-off systems.
- Keep these as practical development guardrails, not release bureaucracy.

## Completed foundation

| Area | Status |
|---|---|
| Phase 0–14 | ✅ |
| Lv1–99,999 / Awakening / Abyss endgame | ✅ |
| Text Battle / Combat / Equipment / Jobs / Ranch / Settlement | ✅ |
| Ch1–25 / The Veil / outer-world mystery | ✅ |
| Phase12 horizontal content / Codex / Apex | ✅ |
| Phase13 replay/challenge layer (rotating omitted) | ✅ |
| Phase14 mobile/UI integration | ✅ |
| Automated integrity audit | ✅ |
| System Deepening Pack A–C | ✅ |
| Content Pack II A–E | ✅ |
| Story Expansion I Part A — Ch26–29 | ✅ |

## Content Pack II — COMPLETE

Full handoff: `CONTENT_PACK_II_ROADMAP.md`.

Final connected loop:

```text
Rumor → Tracking → Revisit → Hidden Encounter
      → Hidden Route → multi-region Secret Chain
      → Hidden Boss → Companion / Unique / Breeding
      → Codex ecology / Lore fragment → another lead
```

Delivered:
- 10 CP2 rumors
- 5 rumor-gated Hidden Encounters
- 5 Hidden Routes
- 3 authored multi-region Secret Chains
- 5 Hidden Bosses
- 6 secret companions
- 4 deterministic special hybrids
- 12 fixed mythic Unique rewards
- 10 authored CP2 Codex ecology profiles (5 encounters + 5 bosses)
- 3 world-mystery Lore fragments
- compact `NEXT — ...` revisit guidance inside the existing Rumor Notebook
- route closure text so no CP2 clue ends as a dead end
- all progress remains in existing `world2.discoveries`
- no new Home route, screen, currency or save root

## Story Expansion I — Part A COMPLETE (Ch26–29)

Implemented as one large vertical batch through the existing expanded-chapter pipeline.

### Ch26 — 零外接続域
- continues directly from the Boundary Throne
- the Eighth Key is reclassified from an “eighth member” to an **exception connection** outside the seven-key management architecture
- a weak external verification signal is recovered

### Ch27 — 遠信残響帯
- follows the external signal through ordered lights, tall silhouettes, metallic periodic vibration and thin luminous surfaces
- strongly suggests an inhabited artificial civilization without naming its location
- no Japan/Tokyo confirmation

### Ch28 — 機界監査層
- MOTHER is identified as an operational management system
- ARCHITECT is identified as a design/repair system
- neither holds world-creation authority
- Machine World decisions were themselves reported to an external observation route

### Ch29 — 逆観測門
- Seven Keys = internal world-layer control system
- Eighth Key = external connection point bypassing that control system
- observation is bidirectional
- the unknown external side returns one clear response, but the gate itself remains closed for Ch30

Part A also adds:
- 4 expanded regions
- 32 main stages + 4 optional branches
- normal / fast / tank / midboss / boss / branchboss sets for each chapter
- chapter equipment and named rewards through the existing equipment generator
- regional field rules and exploration events
- regional hierarchy entries for both Ch21–25 and Ch26–29
- regression guard so Story Expansion does not silently move the existing Abyss unlock gate

## NEXT — Story Expansion I Part B (Ch30 + integration)

One final large Story Expansion batch:
- Ch30 climax region and final boss for this arc
- reveal why the connection is being prevented, without forcing the guardian to be simply evil
- briefly expose stronger external-world sensory evidence after the climax
- keep Japan/Tokyo unnamed unless the story deliberately earns that reveal later
- integrate Ch26–30 with CP2 Rumor / Lore / Codex context without making optional content mandatory
- audit Ch26–30 stage/reward/difficulty continuity
- full save / startup / MutationObserver / mobile battle regression sweep
- close Story Expansion I and prepare Content Pack III

## Immediately after Story Expansion I — Difficulty / Constraint Unlock redesign

Current problem: stage difficulty and challenge constraints can appear available before the story has established why the player can alter combat conditions.

Direction already chosen:
- Normal remains available from the beginning
- higher difficulty tiers unlock through story progression
- individual stages may additionally require a first clear before higher tiers are selectable there
- challenge constraints unlock later as in-world **battle-record / boundary-condition / observation-condition** capabilities
- advanced/multiple constraints arrive only after the player has learned enough about the boundary/observation systems
- connect challenge clears to existing Personal Records / Prestige Titles / Build Feats / REMATCH+ rather than a new currency or screen
- locked options should be hidden or compactly explained so early-game UI stays simple

Exact unlock milestones will be inspected against the current difficulty/constraint implementation after Story Expansion I Part B is merged.

## After that

```text
STORY EXPANSION I — Part B / Ch30
      ↓
DIFFICULTY + CONSTRAINT UNLOCK REDESIGN
      ↓
CONTENT PACK III
      ↓
SYSTEM / UI POLISH AS NEEDED
      ↓
PLAY / TUNE / DEEPEN
      ↺
```

## AI handoff

For a new ChatGPT / Claude Code session:
1. read this file
2. read `STORY_CANON.md`
3. read `CONTENT_PACK_II_ROADMAP.md`
4. do **not** redo Content Pack II A–E or Story Expansion I Ch26–29
5. next story work is **Story Expansion I Part B — Ch30 + full integration**
6. after Story Expansion I, immediately perform the **Difficulty / Constraint Unlock redesign** described above
7. preserve Lv99,999, SD-4 deferral, no rotating challenges, no extra Home route/currency
8. preserve the permanent mobile command regression, startup dependency guards, MutationObserver idempotence and save compatibility
9. inspect existing code/tests before adding parallel systems
