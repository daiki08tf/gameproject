# Blade Vale — Official Roadmap

> **Current:** Core/Foundation ✅ / System Deepening ✅ / Content Pack II ✅ / Story Expansion I ✅ / Difficulty + Constraint Unlock ✅ / **Content Pack III A ✅**
>
> **NEXT:** **Content Pack III B — Multi-region Convergence**.

Blade Vale is a personal evolving text-command hack-and-slash RPG.

Preferred rhythm:

**縦を少し伸ばす → 横を大量に増やす → 遊んで直す → また縦を伸ばす**

## Permanent rules

1. Lv cap remains **99,999** unless deliberately changed later.
2. No unnecessary currencies, Home buttons, parallel save roots or FOMO schedules.
3. Reuse Adventure / World / Secret Realm / Codex / Ranch / Equipment / Job / Settlement before creating top-level systems.
4. Mobile battle commands must never become unreachable; the many-enemies regression is permanent.
5. Optional horizontal content must not retroactively gate Ch1–30 story completion.
6. Rare/Unique rewards should create build or collection choices, not universal mandatory BiS.
7. Phase 13.4 Rotating Challenges remains intentionally omitted.
8. SD-4 conditional Boss hidden drops stay deferred.
9. External/Modern World evidence stays restrained; do not casually reveal Japan/Tokyo.
10. Preserve save compatibility and automated regression coverage.
11. Appending story chapters must not silently move already-live endgame unlock gates.
12. Significant named content must update `GAME_CONTENT_CATALOG.md`; canon changes must update `WORLD_LORE_BIBLE.md` / `STORY_CANON.md` as appropriate.

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
| Difficulty / Constraint Unlock redesign | ✅ |
| Content Pack III A — Observation Reflux | ✅ |

## Story Expansion I — COMPLETE

Ch26–30 confirms:
- the Eighth Key is an exception connection outside the Seven Keys architecture
- MOTHER / ARCHITECT are administrators, not absolute creators
- an inhabited external civilization exists
- observation can become bidirectional
- the external side can recognize and answer Blade Vale

Still unresolved:
- exact external-world identity/location
- who created the connection
- why Blade Vale is being observed
- what both observation directions are ultimately measuring

See `STORY_CANON.md` and `WORLD_LORE_BIBLE.md`.

## Difficulty / Constraint Unlock redesign — COMPLETE

| Condition | Story unlock | Meaning |
|---|---:|---|
| Normal | Start | ordinary battle |
| 鋼鉄の誓約 | Ch5 | 戦闘記録 |
| 硝子の進軍 | Ch10 | 上級戦闘記録 |
| 破砕試練 | Ch19 | 境界条件 |
| REMATCH+ | Ch25 | 観測条件 |

All non-Normal conditions also require the target stage to have been cleared once. Runtime enforces the lock; it is not UI-only.

## Content Pack III

Full handoff: `CONTENT_PACK_III_ROADMAP.md`.

### A — Observation Reflux ✅

After Ch30, returned observation begins altering previously explored regions.

Implemented:
- 6 new rumors
- 3 low-frequency Hidden Encounters
- 3 Hidden Routes
- clusters in Ch21 / Ch23 / Ch24
- Ch30 completion gate
- existing `world2.discoveries`, Rumor Notebook and Text Battle only
- no new Home route / currency / save root
- hidden encounters are added as one follow-up encounter, preserving the mobile command safety envelope

Clusters:
- 灰燼の外縁 → 残照追跡体・AFTERIMAGE → 返信炉床
- 天雷墓標群 → 帰還雷標・BACKTRACE → 第九照準廊
- 虚花の庭園 → 外記憶花・OFFWORLD BLOOM → 異記憶根室

### B — Multi-region Convergence ← NEXT

Use the three CP3-A routes as inputs to larger authored chains.

Target one large batch:
- 2–3 multi-region Secret Chains
- 4–6 Hidden Boss / elite encounters
- 5–8 secret/recruitable companions or variants
- deterministic special breeding where it makes ecological sense
- ~10–16 meaningful Unique / Relic rewards
- Codex ecology and persistent Lore fragments
- deterministic signature rewards; SD-4 conditional hidden drops remain deferred

Preferred mystery direction:
- reply marks are acknowledgments/targeting responses, not ordinary writing
- returned lightning and memory roots share a timing signature
- living memory can preserve information that machine/infrastructure records cannot

### C — Final integration

May be folded into B if cohesive:
- close all clues/routes
- compact `NEXT` guidance
- Challenge / REMATCH+ compatibility
- save/startup/import-order audit
- MutationObserver convergence
- mobile battle command regression
- documentation refresh

## Human-readable data references

- `GAME_CONTENT_CATALOG.md` — enemy/Boss/event/companion/hidden-content index
- `WORLD_LORE_BIBLE.md` — detailed setting, chronology, terminology and unresolved mysteries
- `STORY_CANON.md` — high-level narrative guardrails
- `CONTENT_PACK_III_ROADMAP.md` — current horizontal-pack handoff

Exact numeric stats remain in code.

## After Content Pack III

```text
CONTENT PACK III B/C
      ↓
SYSTEM / UI POLISH AS NEEDED
      ↓
PLAY / TUNE / DEEPEN
      ↓
NEXT STORY EXPANSION WHEN EARNED
      ↺
```

## AI handoff

For a new ChatGPT / Claude Code session:
1. read this file
2. read `STORY_CANON.md`
3. read `WORLD_LORE_BIBLE.md`
4. read `GAME_CONTENT_CATALOG.md`
5. read `CONTENT_PACK_III_ROADMAP.md`
6. do not redo Content Pack II, Story Expansion I, Difficulty/Constraint Unlock, or CP3-A
7. next work is **Content Pack III B — Multi-region Convergence**
8. preserve Lv99,999, SD-4 deferral, no rotating challenges, no extra Home route/currency
9. preserve mobile command safety, startup dependency guards, MutationObserver idempotence and save compatibility
