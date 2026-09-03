# Blade Vale — Official Roadmap

> **Current:** Core/Foundation ✅ / Content Pack III ✅ / Stage-first Core Loop Rework CLR-12–21 ✅ / Automated RC baseline ✅
>
> **NEXT / ACTIVE:** **UI OVERHAUL (UIX) — Dark Chronicle identity, emoji-free interface, mobile information architecture and live playability.**

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
16. Rendered application UI uses no platform emoji; meaning comes from language, hierarchy and restrained labeled monochrome icons.

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
- `UI_OVERHAUL_ROADMAP.md` — active UIX visual direction, phases, architecture guardrails and acceptance gates
- `CLAUDE.md` — current AI/Claude Code execution handoff

Exact numeric stats remain in code.

## ACTIVE — UI Overhaul

The current priority is a full presentation and information-architecture overhaul while preserving the now-stable Stage-first and gameplay authorities.

Locked direction:

- **Dark Chronicle**: black iron, soot navy, ash white, restrained aged metal, record/ledger/map structure and sharp geometry;
- text-first, dense and readable rather than giant repeated cards;
- no rendered platform emoji in application UI;
- one obvious primary action and visible current Chapter/Stage context;
- mobile-first at 390×844, with 375×667 compact coverage;
- no new gameplay/save/progression authority and no framework rewrite;
- live-browser and screenshot evidence required, not static source tests alone.

Phases UIX-0 through UIX-8 are defined in `UI_OVERHAUL_ROADMAP.md`. The next default task is **UIX-0 — Live UI Inventory and Ownership Audit**.

The existing Release Candidate audit remains the functional regression baseline. UIX may change presentation and navigation structure, but must keep its gameplay, save, mobile-command and endgame gates green.

## PAUSED AFTER PHASE 5 — Gear Overhaul

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
| 0B 77-Affix audit | ✅ |
| 0C Weapon × Job/Fusion × 24 archetype audit | ✅ |
| 1 Option 4.0 canonical data model | ✅ |
| 2 Option Fusion / duplicate feeding | ✅ |
| 3 Greater/Temper/random-roll consolidation | ✅ |
| 4 Equipment UI compact redesign | ✅ |
| 5 Smart Loot 4.0 | ✅ (5C skipped — gate not met, see `GEAR_OVERHAUL_PHASE5_SMART_LOOT.md`) |
| 6 Existing weapon identity strengthening | 🔄 NEXT |
| 7 New weapon-family decision | gated by Phase 6 |
| 8 Unique 2.0 | queued |
| 9 Loot distribution + return to endgame content | queued |

Do not add new mastery weapon families before Phase 6 closes. Equipment 3.0 already contains 24 archetypes including 大剣 / 刀 / 魔導書 / 双短剣 / 弩 / 大斧 etc.

See `GEAR_OVERHAUL_ROADMAP.md` and `GEAR_OVERHAUL_AUDIT.md` before modifying gear code.

## Deferred while UI Overhaul is active

Further Deep Survey expansion / Survey Conditions / Convergence Apex remain valid future directions, but they are intentionally behind Gear Overhaul so the new high-difficulty content has a stronger loot reason to exist.

Story Ch31+ is also not the default next task.

## Development rhythm

```text
STAGE-FIRST CORE LOOP ✅
      ↓
AUTOMATED RC + LIVE PLAYABILITY BASELINE ✅
      ↓
UI OVERHAUL UIX-0..8 ← ACTIVE
      ↓
GEAR OVERHAUL PHASE 6..9 RESUMES
      ↓
LOOT / BUILD PLAYTEST & TUNE
      ↓
DEEP SURVEY / ENDGAME RETURN
      ↓
NEXT STORY EXPANSION WHEN EARNED
```

## AI handoff

For a new ChatGPT / Claude Code session:

1. read `CLAUDE.md`;
2. read `PROJECT_GUIDE.md`;
3. read this file;
4. read `UI_OVERHAUL_ROADMAP.md`;
5. read `RELEASE_CANDIDATE_AUDIT.md` and `docs/MUTATION_OBSERVER_SAFETY.md`;
6. active default work is **UIX**, starting from the first incomplete UIX phase;
7. at roadmap creation, the next task is UIX-0 audit only — do not begin a global CSS rewrite;
8. preserve Stage-first Home → Adventure → Chapter → Stage → Story/Hunt;
9. preserve max-3 Options, seven Option rarities, Option Lv1–100 and existing Gear authorities;
10. preserve Lv99,999, save compatibility, mobile command safety, startup dependency guards and MutationObserver idempotence;
11. do not add emoji replacements through another pictograph set or a broad generic icon library;
12. merge only after full tests, syntax, live-browser checks and both CI workflows are green.
