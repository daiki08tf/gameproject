# Blade Vale — Official Roadmap

> **Current:** Core/Foundation ✅ / System Deepening ✅ / Content Pack II ✅ / **Story Expansion I (Ch26–30) ✅ COMPLETE**
>
> **NEXT:** **Difficulty / Constraint Unlock redesign** → Content Pack III.

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
| Story Expansion I — Ch26–30 | ✅ |

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

## Story Expansion I — COMPLETE (Ch26–30)

Implemented through the existing expanded-chapter, Adventure, Equipment, regional exploration and Text Battle story pipelines.

### Ch26 — 零外接続域
- the Eighth Key is reclassified from an “eighth member” to an exception connection outside the seven-key management architecture
- a weak external verification signal is recovered

### Ch27 — 遠信残響帯
- ordered lights, tall silhouettes, metallic periodic vibration and thin luminous surfaces suggest an inhabited artificial civilization
- no Japan/Tokyo confirmation

### Ch28 — 機界監査層
- MOTHER is an operational management system
- ARCHITECT is a design/repair system
- neither holds world-creation authority
- Machine World decisions were themselves externally observed

### Ch29 — 逆観測門
- Seven Keys = internal world-layer control system
- Eighth Key = external connection point bypassing that control system
- observation becomes bidirectional
- the external side returns a clear response

### Ch30 — 外部観測核
- follows the returned response to the closest known external observation node
- confirms that the previously separate sensory clues come from one inhabited civilization
- confirms the external side can recognize and answer Blade Vale
- confirms MOTHER/ARCHITECT never controlled the connection origin
- leaves location name, connection reason and original connector unresolved
- final boss: **外界照合者オブザーバ**, an examiner/guardian rather than a simple evil invader

Story Expansion I also delivers:
- Ch26–30 as 40 main stages + 5 optional branches
- normal / fast / tank / midboss / boss / branchboss sets through existing enemy generation
- chapter equipment and named rewards through existing equipment generation
- regional field rules and exploration events
- `逆観測域` as the existing regional surface for Ch26–30
- canonical arc mapping in `storyCanon.js`
- compact mandatory story beats inside the existing battle log
- no new Home route, screen, currency or save root
- Abyss unlock remains based on Ch1–25 and is not silently pushed back
- final boss encounter density remains inside the permanent mobile battle safety envelope

## NEXT — Difficulty / Constraint Unlock redesign

Current problem: stage difficulty and challenge constraints can appear available before the story has established why the player can alter combat conditions.

Direction already chosen:
- Normal remains available from the beginning
- higher difficulty tiers unlock through story progression
- individual stages may additionally require a first clear before higher tiers are selectable there
- challenge constraints unlock later as in-world **battle-record / boundary-condition / observation-condition** capabilities
- advanced/multiple constraints arrive only after the player has learned enough about the boundary/observation systems
- connect challenge clears to existing Personal Records / Prestige Titles / Build Feats / REMATCH+ rather than a new currency or screen
- locked options should be hidden or compactly explained so early-game UI stays simple

Exact unlock milestones must be derived from the current difficulty/constraint implementation before changing behavior.

## After that

```text
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
4. do **not** redo Content Pack II A–E or Story Expansion I Ch26–30
5. next work is **Difficulty / Constraint Unlock redesign**
6. preserve Lv99,999, SD-4 deferral, no rotating challenges, no extra Home route/currency
7. preserve the permanent mobile command regression, startup dependency guards, MutationObserver idempotence and save compatibility
8. inspect existing code/tests before adding parallel systems
