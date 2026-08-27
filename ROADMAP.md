# Blade Vale — Official Roadmap

> **Current:** Core/Foundation ✅ / System Deepening ✅ / Content Pack II ✅ / Story Expansion I ✅ / Difficulty + Constraint Unlock ✅ / **Content Pack III ✅**
>
> **NEXT / ACTIVE:** **GEAR OVERHAUL — loot identity, max-3 Options, Option Lv1–100, weapon/job audit.**

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
13. Gear Overhaul random Options are capped at **3 per item**; Named/Unique fixed effects are separate.
14. Gear Overhaul keeps seven Option rarities and adds **Option Lv1–100** with deterministic duplicate-fusion progress.
15. High difficulty must preserve **No Single Correct Build**: intended builds can clear efficiently, while extreme raw investment may brute-force most soft checks.

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
| Difficulty / Constraint Unlock redesign | ✅ |
| Content Pack III A — Observation Reflux | ✅ |
| Content Pack III B/C — Multi-region Convergence + Integration | ✅ |

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

## Content Pack III — COMPLETE

Full handoff: `CONTENT_PACK_III_ROADMAP.md`.

### A — Observation Reflux ✅

After Ch30, returned observation alters previously explored regions.

Implemented:
- 6 rumors
- 3 low-frequency Hidden Encounters
- 3 Hidden Routes
- clusters in Ch21 / Ch23 / Ch24
- Ch30 completion gate
- existing `world2.discoveries`, Rumor Notebook and Text Battle only
- no new Home route / currency / save root

Clusters:
- 灰燼の外縁 → 残照追跡体・AFTERIMAGE → 返信炉床
- 天雷墓標群 → 帰還雷標・BACKTRACE → 第九照準廊
- 虚花の庭園 → 外記憶花・OFFWORLD BLOOM → 異記憶根室

### B — Multi-region Convergence ✅

Implemented as one cohesive batch:
- 3 multi-region Secret Chains
- 5 Hidden Bosses
- 6 secret companions
- 3 deterministic special-breeding outcomes
- 12 fixed Unique / Relic rewards
- Codex ecology
- 3 persistent Lore fragments

New confirmed lore:
- reply marks are acknowledgments/targeting responses, not ordinary writing
- returned lightning, memory roots and ash share the same returned timing signature
- living memory can preserve information that machine/infrastructure records do not contain
- whether that missing interval was deliberately deleted or is intrinsically machine-unrecordable remains unresolved

### C — Final integration ✅ folded into B

Completed:
- all three CP3-A routes feed authored chains
- compact `NEXT` guidance reuses Rumor Notebook
- CP2 + CP3 Lore share the existing Codex `世界断片` disclosure
- one CP3-B authored boss maximum per run, queued as a follow-up encounter
- canonical equipment registration for all CP3 rewards
- Ranch special breeding reuses the existing egg/breeding pipeline
- save/startup/import-order safety retained
- no new MutationObserver; existing idempotence guard retained
- mobile battle command regression remains release-blocking
- human-readable content/lore documentation refreshed

## Human-readable data references

- `GAME_CONTENT_CATALOG.md` — enemy/Boss/event/companion/hidden-content index
- `WORLD_LORE_BIBLE.md` — detailed setting, chronology, terminology and unresolved mysteries
- `STORY_CANON.md` — high-level narrative guardrails
- `CONTENT_PACK_III_ROADMAP.md` — CP3 implementation/history
- `CONTENT_PACK_III_B_NOTES.md` — compact CP3-B implementation handoff
- `GEAR_OVERHAUL_ROADMAP.md` — active Gear Overhaul design, phases and non-negotiable rules
- `GEAR_OVERHAUL_AUDIT.md` — live equipment/Affix/weapon-job audit and migration decisions

Exact numeric stats remain in code.

## ACTIVE — Gear Overhaul

The current priority is the hack-and-slash core: **finding gear, evaluating three meaningful Options, and making even non-jackpot drops useful through Option growth**.

Core target:

```text
DROP
  ↓
3 meaningful Options
  ↓
use it OR feed matching Option material
  ↓
Option Lv rises
  ↓
build gets stronger
  ↓
higher difficulty / faster farming
  ↺
```

Canonical rules:
- random Options: max 3
- fixed Unique effects: separate
- Option rarity: Common → Uncommon → Rare → Epic → Legendary → Mythic → Ancient
- Option Lv: 1–100
- higher rarity = higher base + stronger per-level growth
- unwanted equipment with the same Option family becomes Option EXP material
- no new Option-level currency
- rarity does not automatically promote through leveling
- low rarity material still contributes reduced EXP
- brute-force progression is intentionally viable

Gameplay philosophy:

> **No Single Correct Build**
>
> A correct counter-build should clear earlier and cheaper. A player who keeps farming and raises offense/defense/sustain far enough should also be allowed to say **「知らん、火力と耐久で押し切る」** and eventually win.

Current phases:

| Gear phase | Status |
|---|---|
| 0A System inventory | ✅ |
| 0B 77-Affix audit | 🔄 |
| 0C Weapon × Job/Fusion × 24 archetype audit | NEXT |
| 1 Option 4.0 canonical data model | queued |
| 2 Option Fusion / duplicate feeding | queued |
| 3 Greater/Temper/random-roll consolidation | queued |
| 4 Equipment UI compact redesign | queued |
| 5 Smart Loot 4.0 | queued |
| 6 Existing weapon identity strengthening | queued |
| 7 New weapon-family decision | gated by audit |
| 8 Unique 2.0 | queued |
| 9 Loot distribution + return to endgame content | queued |

Do not add new mastery weapon families before Phase 0C. Equipment 3.0 already contains 24 archetypes including 大剣 / 刀 / 魔導書 / 双短剣 / 弩 / 大斧 etc.

See `GEAR_OVERHAUL_ROADMAP.md` and `GEAR_OVERHAUL_AUDIT.md` before modifying gear code.

## Deferred while Gear Overhaul is active

Further Deep Survey expansion / Survey Conditions / Convergence Apex remain valid future directions, but they are intentionally behind Gear Overhaul so the new high-difficulty content has a stronger loot reason to exist.

Story Ch31+ is also not the default next task.

## Development rhythm

```text
CONTENT PACK III ✅
      ↓
GEAR OVERHAUL ← ACTIVE
      ↓
LOOT / BUILD PLAYTEST & TUNE
      ↓
DEEP SURVEY / ENDGAME RETURN
      ↓
NEXT STORY EXPANSION WHEN EARNED
      ↓
HORIZONTAL CONTENT AGAIN
      ↺
```

## AI handoff

For a new ChatGPT / Claude Code session:
1. read this file
2. read `GEAR_OVERHAUL_ROADMAP.md`
3. read `GEAR_OVERHAUL_AUDIT.md`
4. read `STORY_CANON.md`
5. read `WORLD_LORE_BIBLE.md`
6. read `GAME_CONTENT_CATALOG.md`
7. do not redo Content Pack II, Story Expansion I, Difficulty/Constraint Unlock, or Content Pack III
8. active default work is **GEAR OVERHAUL**, starting from the first incomplete Gear phase
9. preserve max 3 random Options, seven Option rarities, Option Lv1–100, no new Option currency, and the brute-force route
10. do not add a new mastery weapon family before the Weapon × Job/Fusion × archetype audit
11. preserve Lv99,999, Item Power 10,000, SD-4 deferral, no rotating challenges, no extra Home route/currency
12. preserve mobile command safety, startup dependency guards, MutationObserver idempotence and save compatibility
