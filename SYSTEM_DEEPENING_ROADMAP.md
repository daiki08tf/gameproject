# System Deepening Pack — Implementation Roadmap

> **Status: CURRENT — Pack A ✅ / Pack B ✅ / Pack C NEXT**
>
> Purpose: deepen existing Blade Vale systems before Content Pack II. This is not a new numbered Phase and must not create a parallel progression ladder.
>
> Parent source of truth: `ROADMAP.md`.

## Current handoff

**Completed**
- Pack A: SD-1 Unique/Relic Build Identity, SD-2 Job Synergy Deepening, SD-8 Enemy Intent
- Pack B: SD-3 Companion Individuality, SD-5 Codex Field Guide, SD-11 Rare Encounter Presentation

**Next implementation batch**
- Pack C: **SD-6 automatic Rumor Notebook → SD-7 Region Mastery Benefits → SD-10 Treasure Maps / Clue Items → SD-9 Secret Chains**

**Deferred**
- SD-4 Boss conditional Hidden Drops. Do not implement unless explicitly re-enabled.

## Permanent rules

- no new level cap
- no daily/weekly rotating challenges
- no new mandatory currency
- reuse existing Ranch / Codex / Adventure / World / Equipment / Job surfaces
- no new Home button when an existing grouped destination works
- no giant stat-inflation-only progression layer
- preserve old saves through lazy/default-safe data
- mobile battle commands must remain reachable regardless of enemy count/log length
- hints should guide without exposing exact secret spawn formulas
- prefer lateral choices and cross-system links over another vertical progression bar

---

# Pack A — BUILD / COMBAT ✅ COMPLETE

## SD-1 — Unique / Relic Build Identity ✅

Reusable lateral build vocabulary was added using existing combat concepts.

Representative live identities:
- **始祖竜骸刃 — BREAK / 竜骸破断**: Break-window payoff with a small neutral tradeoff
- **無名王冠 — GUARD / 王墓の反勢**: post-Guard normal-attack momentum
- **反転目録・未刊 — ANALYSIS / 既知反転**: stronger against analyzed targets with an unknown-target tradeoff

Implementation source:
- `js/data/systemDeepeningPackA.js`
- `js/patches/systemDeepeningPackA.js`

Future equipment should reuse these tags/hooks when practical instead of growing one-off BattleEngine branches.

## SD-2 — Job Synergy Deepening ✅

Existing Job 3.0 Specialization / MASTER remains authoritative. No second mastery ladder was created.

Live links:
- **剣聖 MASTER → BREAK**
- **護剣 MASTER → GUARD**
- **秘術師 MASTER → ANALYSIS**

Synergy requires the active route to be MASTERed. Existing Job Legacy/inherited MASTER systems remain intact.

## SD-8 — Enemy Intent ✅

Combat3 normal-enemy tactical actions are reserved before resolution and the UI reads the same reservation, so displayed Intent cannot be replaced by a second random decision.

Intent vocabulary:
- ATTACK
- GUARD
- CAST
- SUPPORT
- DISRUPT
- DANGER

UI contract:
- one compact line inside an existing enemy card
- no separate Intent panel
- existing bounded enemy scroller remains authoritative
- sticky command grid / 44px tap target regression remains release-blocking

Pack A runtime is explicitly wired through `homeNavigation.js`.

---

# Pack B — COLLECTION ✅ COMPLETE

## SD-3 — Companion Individuality ✅

The existing Companion nature/talent system remains the base. Pack B adds only a light identity layer rather than an IV grind.

### Rare Trait

New recruits have a low chance to receive one modest trait:
- **破砕感覚** — ATK +6%
- **鉄皮** — DEF +6%
- **疾風脚** — SPD +6%
- **魔力感応** — MAG +6%
- **早熟** — Companion EXP +8%

Rules:
- Rare Trait is exciting, not required
- bonuses remain in the 6–8% class
- normal companions remain fully viable
- old companions lazily receive `rareTrait: null` and are **never rerolled on load/read**
- recruitment/breeding save compatibility remains intact

### Epithet

A very low-frequency cosmetic title may be attached to a new individual. It is prestige/flavor only and creates no mandatory power chase.

Existing Ranch/Companion cards surface Trait + title compactly via progressive disclosure conventions; no new collection screen is added.

Implementation:
- `js/data/systemDeepeningPackB.js`
- `js/patches/systemDeepeningPackB.js`

## SD-5 — Codex Field Guide ✅

Existing `monsterCodex` data remains authoritative. A derived knowledge layer now turns the Codex into an in-game field guide without a second database or screen.

Knowledge ladder:
1. **Seen** — first encounter
2. **Observed** — behavior/role begins to appear
3. **Studied** — tactical information expands
4. **Known** — exploration/habitat guidance becomes available
5. **Mastered** — advanced ecological clue layer

The level is derived automatically from existing `seen`, `kills`, `behaviorKnown`, and `analyzed` records. Exact secret spawn formulas remain hidden.

UI:
- existing Monster Codex only
- compact `FIELD GUIDE — <level>` details block
- information appears progressively instead of dumping a full wiki entry immediately

Future Pack C systems should consume this derived knowledge rather than create another observation counter.

## SD-11 — Rare Encounter Presentation ✅

Existing Phase12 `phase12RareSpawnId` metadata remains the source of truth. No spawn formula or reward table was replaced.

When a real rare wave appears:
- first sighting gets a short ecology-flavored prelude + `RARE ENCOUNTER`
- repeat sightings collapse to one fast line
- the same existing Codex record gets `rareEncounterSeen`

Presentation is injected into the existing **bounded battle log** only. It does not add a panel below the enemy list and therefore cannot push combat commands away.

Ecology variants currently cover:
- 古王墓
- 幻獣の森
- 竜骸峡谷
- 反転図書館
- 黒月神殿
- generic boundary fallback

### Pack B validation

Validated before roadmap handoff:
- Blade Vale Tests **#533 ✅**
- Phase 8 Validation **#124 ✅**
- old-save no-reroll regression ✅
- five-stage Codex derivation ✅
- Rare first/repeat presentation ✅
- Pack A + Pack B runtime bootstrap wiring ✅
- permanent many-enemies / attack-button regression remains active ✅

---

# Pack C — EXPLORATION INTELLIGENCE ⏭ NEXT

## SD-6 — Rumor Notebook — CENTRAL FEATURE

The player should automatically accumulate useful rumors without maintaining external notes.

### Persistence

Prefer extending/reusing existing World 2 discovery/rumor records or a tightly attached lazy subrecord. Avoid a second unrelated lore database.

A rumor should have:
- stable id
- diegetic title/text
- source/provenance when useful
- state
- optional related region/site once known
- clue progression
- resolution information

States:
- `unresolved`
- `tracking` / `clued`
- `resolved`

Automatic sources:
- World Events
- NPC/event outcomes
- Lore Fragments
- region discoveries
- Secret Realm discovery/clear
- rare encounter observation
- Codex knowledge thresholds
- Treasure Map / clue acquisition

UI:
- **no Home button**
- use an existing Adventure / World / Codex-adjacent surface
- compact entry such as `RUMORS 12/38`
- filters: 未解決 / 追跡中 / 解決済み
- rows compact, details disclosed on demand

Writing standard:
- bad: `黒月神殿3Fに0.3%でECLIPSEが出る`
- good: `月の光が最も弱い場所で、白い影を見た者がいる`

Existing compatible Phase12 rumors must bridge automatically.

## SD-7 — Region Mastery Benefits

Region Mastery should represent local knowledge rather than only a checklist.

Candidate small benefits:
- tiny **relative** rare-encounter bonus
- extra wording for unresolved rumor hints
- modest local recruitment knowledge bonus
- slightly clearer treasure/secret clues

Example: +5% relative means 1.00% → ~1.05%, **not** 6.00%.

Existing mastery completion cannot be revoked and unfinished mastery must not feel punitive.

## SD-10 — Treasure Maps / Clue Items

Turn textual items into exploration gameplay:
- torn maps
- coordinate fragments
- damaged survey notes
- encoded routes
- symbolic directions

Player-facing text remains interpretive even if the engine knows the exact destination.

Rewards should reuse existing Gold/material/equipment/Lore/Rumor/Companion/Secret systems. **No treasure-map currency.**

## SD-9 — Secret Chains

Connect discoveries across existing locations to make revisits meaningful.

Representative architecture target:

**古王墓の石板 → 反転図書館で解読 → 竜骸峡谷の座標 → Hidden route / encounter / secret**

Requirements:
- each step changes existing exploration/discovery state
- clues remain understandable in-game
- no arbitrary checklist chain
- never mandatory for main-story completion
- may deepen The Veil / outside-observer mystery without prematurely answering the central reveal

At least one representative multi-location chain must work end-to-end before Content Pack II begins.

---

# SD-4 — DEFERRED ⛔

Boss conditional Hidden Drop objectives remain deliberately postponed.

Until explicitly re-enabled:
- no timed-kill Hidden Drop requirements
- no no-death / Break-finisher special-drop conditions
- do not hide equivalent mechanics inside Content Pack II

Existing ordinary/rare/hidden loot behavior remains unchanged.

---

# Target cross-system loop

```text
World Event / Lore
      ↓
Rumor automatically enters Notebook
      ↓
Region / Codex knowledge narrows the clue
      ↓
Explore / revisit location
      ↓
Rare encounter / clue item / Secret
      ↓
Companion / Unique / Relic / Codex discovery
      ↓
Job + equipment build changes
      ↓
Try harder content / revisit another lead
      ↺
```

# Implementation order

```text
Pack A ✅
  SD-1 → SD-2 → SD-8
      ↓
Pack B ✅
  SD-3 → SD-5 → SD-11
      ↓
Pack C ← NEXT
  SD-6 → SD-7 → SD-10 → SD-9
      ↓
SYSTEM DEEPENING COMPLETE
      ↓
CONTENT PACK II
```

## Claude / new-chat handoff

When resuming development with no conversation history:
1. read `ROADMAP.md`
2. read this file
3. **do not redo Pack A or Pack B**
4. start with **SD-6 Rumor Notebook** and reuse existing World2 / Phase12 rumor-discovery records
5. then batch SD-7 + SD-10 + SD-9 when shared exploration architecture makes it safe
6. keep SD-4 deferred
7. run both CI workflows and the permanent mobile battle-command regression before merge
8. update this handoff after each merged batch

# Final completion gate

System Deepening is complete when:
- Unique/Relic identities create real build choices ✅
- MASTER Jobs provide lateral tactical synergies ✅
- Enemy Intent is actionable and truthful ✅
- companions have light non-punishing individuality ✅
- Codex works as a progressive field guide ✅
- rare encounters feel special ✅
- Rumor Notebook automatically accumulates/resolves clues
- Region Mastery gives small local knowledge/convenience benefits
- Treasure Maps use textual exploration
- at least one multi-location Secret Chain works end-to-end
- SD-4 remains absent
- rotating challenges remain absent
- battle commands remain reachable under maximum enemy pressure
- save compatibility and both CI workflows pass
