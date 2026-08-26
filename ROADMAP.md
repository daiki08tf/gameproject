# Blade Vale 3.0 — Official Roadmap

> **Status:** Feature development complete / release-candidate audit active.
>
> **Current:** Phase 14 complete. Blade Vale 3.0 is in feature freeze; remaining work is release-readiness verification, bug fixing, balance corrections and asset polish.
>
> Before changing a large area, inspect current code/tests and this roadmap first. This document is the source of truth and supersedes older feature-addition roadmaps.

## Goal

Blade Vale is a text-command hack-and-slash RPG built around one connected journey rather than a pile of unrelated menus:

**Main Story → optional world exploration → build/loot/companions → endgame → horizontal side content → replay challenges**

The game supports Character Lv1–99,999, 25 story chapters, Jobs, Equipment/Affixes, Companions/Monster Ranch, Codex, Awakening, Artifact/Relic, Abyss, Bounty/Nemesis, Unique Trials, Settlement, World/Key-Dungeon systems, Secret Realms, horizontal Optional Dungeons and replay challenges.

The main release risk is no longer lack of content. It is **regression, balance drift, save compatibility, mobile usability, performance and presentation consistency**.

Development rule from this point forward:

**Do not add another large progression system, currency, top-level Home route or parallel endgame.**

---

## Implementation status

| Phase | Status | Notes |
|---|---|---|
| 0 System & UI Audit | ✅ | targeted audits continue when touching legacy areas |
| 1 UI / UX Foundation 3.0 | ✅ | compact grouped navigation |
| 2 Compact UI 3.0 | ✅ core | collection-scale progressive disclosure |
| 3 Progression 3.0 | ✅ | coherent Lv1–99,999 curve |
| 4 Awakening 3.0 | ✅ | milestone/imprint foundation |
| 5 Battle Integration 3.0 | ✅ | text battle + Combat 3 integration |
| 6 World 3.0 | ✅ | regions/branches/world foundation |
| 7 Equipment / Loot 3.0 Final | ✅ core | procedural + Unique/Set/Artifact/Relic loops |
| 8 Job 3.0 Final | ✅ core | 56-job/Secret Job foundation |
| 9 Settlement 2.0 | ✅ core | Ranch/Settlement cross-system foundation |
| 10 Endgame 3.0 | ✅ | Abyss/Nemesis/World Tier/Raid; see `PHASE10_FINAL_AUDIT.md` |
| 11 Adventure / Story 3.0 | ✅ | Story Canon + Ch1–25 + Modern World tease |
| 12 Horizontal Content Expansion | ✅ | dungeons/ecology/rare loot/lore/apex; see `PHASE12_CONTENT_STATUS.md` |
| 13 Replayability / Challenge Expansion | ✅ | 13.4 Rotating Challenges intentionally omitted; see `PHASE13_REPLAY_STATUS.md` |
| 14 Final Integration / Mobile Safety | ✅ | navigation/loadouts/visual density/mobile regression gates; see `PHASE14_FINAL_INTEGRATION_STATUS.md` |

`LEVEL_ROADMAP_99999.md` remains the canonical Lv99,999 progression/endgame tuning sub-roadmap.

---

# Phase definitions

## Phase 0 — System & UI Audit ✅

For every major system verify:

**data → state/save → UI → gameplay → rewards → cross-system integration → tests**

Files alone are never proof of completion. UI audits include action count, navigation depth, scroll cost, duplicated information, missing filters/search and mobile overflow.

## Phase 1 — UI / UX Foundation 3.0 ✅

- Home is not a growing vertical feature-button list.
- One dominant **Adventure** route.
- Related systems live under grouped destinations.
- Common destinations target roughly ≤3 taps.
- Shared compact cards, tabs, badges, filters, detail disclosure and comparison patterns.

Global information rule:

**Overview/list = identity + essential numbers + state → Detail = full stats/effects/lore/traits/history.**

## Phase 2 — Compact UI 3.0 ✅

Equipment, Ranch, Jobs and Codex remain manageable as entry counts grow.

- compact list cards
- category/filter/search where appropriate
- favorite/lock/new states
- bulk actions where safe
- progressive disclosure
- delta-focused Item Compare
- never solve information growth by making every card taller

## Phase 3 — Progression 3.0 ✅

Character Lv1–99,999 is one coherent progression rather than a decorative cap. Canonical EXP/chapter/Abyss targets live in progression code and `LEVEL_ROADMAP_99999.md`.

Connected-play improvements now include:

- **Global NEXT Goal** on Home
- **Recent / Favorites / Uncleared** Adventure filters
- existing stage progress as the canonical source

## Phase 4 — Awakening 3.0 ✅

Awakening is a long-term spine, not a pile of small percentages. Canonical milestone foundation includes Lv90 / 300 / 700 / 3,000. Preserve save compatibility when retiring legacy concepts.

## Phase 5 — Battle Integration 3.0 ✅

Integrated battle vocabulary includes:

- elements / weakness / resistance
- Break / Stagger
- statuses
- tactical AI
- boss phases and telegraphs
- formations/groups
- companion AI/commands
- weapon techniques
- job mechanics/resources

Major bosses should rely on recognizable mechanics—guards, summons, phase rules, resource pressure and Break timing—not HP-only inflation.

### Permanent mobile battle regression gate

A historical bug allowed large enemy lists to push the command area off-screen. Phase 14 makes this a permanent acceptance condition:

- enemy list owns a bounded independent scroll area
- battle log owns the flexible remaining area
- command grid stays reachable at the bottom
- command buttons keep at least a 44px tap target
- `こうげき` is disabled only when battle is over or no living enemy exists
- short viewports reduce enemy/log density before command usability

Regression coverage: `tests/phase14-mobile-command-regression.test.js`.

## Phase 6 — World 3.0 ✅

Use one connected regional structure:

**World/Region → local stages/branches → hidden/optional discoveries**

Key Dungeons, Secret areas, Heaven/Underworld, dimensional anomalies, rumors and exploration events live inside this structure rather than becoming separate menu piles.

## Phase 7 — Equipment / Loot 3.0 Final ✅

Roles remain:

- normal gear = procedural optimization
- Unique = build-changing rule
- Set = multi-slot direction
- Relic/Artifact = high-level rule change

Safety/QoL includes favorite/lock behavior, smart loot foundations, comparison deltas, compact inventory presentation and safe target-farm loops.

Phase 14 adds **three lightweight equipment presets** inside the existing Equipment screen. Presets store only the six equipment slots, validate missing items and restore the previous snapshot if application fails. Job/Artifact state is deliberately not overwritten by these presets.

## Phase 8 — Job 3.0 Final ✅

Maintain the 56-job foundation, specialization, legacy/master passives, resources, Secret Jobs and Job Codex. Secret Jobs are lateral/specialized, not strictly superior replacements.

## Phase 9 — Settlement 2.0 ✅

Settlement connects Blacksmith, Ranch, research, Tavern and exploration services while reducing Home clutter.

Monster Ranch/Companion presentation includes tabs, search, favorites, role readability and progressive individual detail rather than one enormous vertical list.

---

## Phase 10 — Endgame 3.0 ✅ COMPLETE

Full audit: `PHASE10_FINAL_AUDIT.md`.

### Abyss / Nemesis / World Tier

Abyss 3, evolving Nemesis targets and World Tier are integrated into existing Adventure/endgame routes rather than parallel difficulty menus.

### Raid

**RAID：境界王アルケオン・零界再臨**

- unlock: Abyss 10F
- recommended Lv3,000 / target IP3,000
- Guard escorts + four phases + shrinking Break windows
- existing economy; no raid-only currency
- existing stage progress

---

## Phase 11 — Adventure / Story 3.0 ✅ COMPLETE

Canonical world progression:

**Human Realm → Heaven → Underworld → Dimensional Boundary → Machine/Observation layers → Modern World tease**

Central unresolved mystery:

**Why are Blade Vale's world and the external modern world connected?**

### 11.1–11.6 complete

- Story Canon
- Ch1–15 narrative pass
- Ch16–20 The Veil
- world mystery integration
- Ch21–25 outer-world arc
- controlled Modern World sensory tease

Optional content may deepen evidence, but must not reveal the core answer before the main story does.

Full evidence: `PHASE11_STORY_STATUS.md` and `STORY_CANON.md`.

---

## Phase 12 — Horizontal Content Expansion ✅ COMPLETE

Phase 12 widened the game instead of extending only the vertical level/story ladder.

### Completed packs

- **Boundary Ruins:** 残響観測塔 / 沈降鋳造所 / 記憶果樹園 / 零番境界駅
- recruitable species expansion and breeding hybrids
- five Optional Dungeons: 古王墓 / 幻獣の森 / 竜骸峡谷 / 反転図書館 / 黒月神殿
- authored enemy ecologies
- rare spawns and hidden Mythic Unique chase drops
- signature multi-phase bosses
- optional Lore Fragments / World Traces
- Rumor and World Event integration
- regional horizontal mastery and Codex grouping
- Apex Secret Realm **収束観測界** / **五界観測体・PENTARCH**
- compact horizontal-progress UI inside existing surfaces

Horizontal design rule:

**Optional content gives gameplay rewards and additional evidence, but does not become mandatory for main-story comprehension.**

Detailed evidence: `PHASE12_CONTENT_STATUS.md`.

---

## Phase 13 — Replayability / Challenge Expansion ✅ COMPLETE

Phase 13 turns completed content into repeatable goals without adding daily-service pressure.

### 13.1 Challenge Modifiers ✅

Optional difficulty modifiers raise enemy pressure and existing EXP/Gold/Drop rewards. No challenge-only currency.

### 13.2 Personal Records ✅

Per-stage records include clear count, best turns, maximum damage, remaining HP and Challenge/REMATCH+ clears.

### 13.3 Prestige Titles / Build Feats ✅

Titles and build feats recognize accomplishments but grant no mandatory combat power.

### 13.4 Rotating Challenges — intentionally omitted

No daily/weekly rotation, login schedule or FOMO loop is part of Blade Vale 3.0.

### 13.5 REMATCH+ ✅

Previously cleared Boss/Secret content can expose a harder replay option through the same Challenge selector rather than a new menu.

### 13.6 Rare Hunt Expansion ✅

Phase 12 Optional Dungeons gain ultra-low-frequency chase variants that reuse existing rare rewards and ecology.

### 13.7 Build Challenge ✅

Existing Job/equipment/Artifact decisions can produce prestige build feats without a new build-rule subsystem.

### 13.8 Replay UI ✅

Challenge, records and prestige remain inside Stage Confirm, Result, Character and Codex surfaces.

Detailed evidence: `PHASE13_REPLAY_STATUS.md`.

---

## Phase 14 — Blade Vale 3.0 Final Integration ✅ COMPLETE

**Feature freeze. No new large systems.**

### 14.1 Home / Navigation ✅

- grouped Home hubs retained
- compact NEXT GOAL
- progress chips
- no new Home button

### 14.2 Adventure shortcuts ✅

- recent stages
- favorites
- uncleared filter
- Phase 13 BEST metadata

### 14.3 Equipment / Loadout / Compare ✅

- existing Compact Equipment UI and comparison deltas retained
- three safe equipment presets
- missing-item validation
- swap-safe unequip/apply flow
- full rollback on failure

### 14.4 Ranch / Companion UI ✅

Existing Ranch tabs, search, favorites and progressive disclosure were audited and retained. No second Ranch/capture surface.

### 14.5 Collection / Records ✅

Phase 13 records remain integrated into existing Character/Codex/Stage surfaces.

### 14.6 Visual Identity ✅ core

- Home uses the existing pixel-icon layer
- stage identity is text-first with semantic `RAID / BOUNTY / BOSS / SECRET / SIDE` tags
- standardized compact spacing, card radius and tap hierarchy
- decorative emoji may still exist, but are not required to understand primary stage identity

### 14.7 Mobile Polish ✅

- command interaction regression gate
- short-height viewport handling
- minimum tap targets
- independent enemy/log scrolling

### 14.8 Final Integration Audit ✅ code/UI gate

Dedicated coverage:

- `tests/phase14-final-integration.test.js`
- `tests/phase14-mobile-command-regression.test.js`

Latest Phase 14 code verification before closure:

- Blade Vale Tests #518 ✅
- Phase 8 Validation #109 ✅

Detailed evidence: `PHASE14_FINAL_INTEGRATION_STATUS.md`.

---

# Release Candidate Audit — CURRENT

This is **not Phase 15** and must not become another feature phase. It is the final release-readiness gate before calling the build Blade Vale 3.0.

Required checks:

1. Cross-system reward loops
2. Lv1–99,999 progression curve
3. economy/material/key balance
4. Job balance
5. Monster/Boss/Raid balance
6. Equipment/drop/Loot Filter safety
7. Companion/Ranch/Expedition balance
8. save compatibility and old-save loading
9. patch/load-order audit
10. performance / excessive DOM growth
11. small-phone and short-viewport UI
12. representative new-game progression path
13. representative postgame/endgame path
14. high-level simulations
15. full CI
16. NEXT Goal validity across early/mid/postgame
17. recent/favorite route usability
18. Titles/Records consistency
19. battle commands remain reachable with maximum on-screen enemy pressure
20. no new feature is introduced to solve an audit failure unless strictly necessary

### Final UI acceptance

- Home primary decisions fit roughly in one phone viewport.
- Common functions require roughly ≤3 taps from a primary navigation surface.
- Equipment and Ranch remain manageable at 100+ entries.
- Collection screens use categories/filter/search as needed.
- Detail text uses progressive disclosure.
- Routine screens avoid excessive scrolling.
- Mobile one-handed use is the default interaction model.
- Text/pixel/semantic tags carry primary identity; generic emoji are optional decoration.
- Overview → Detail is the default information pattern.
- Enemy count/log length can never make battle commands unreachable.

When the release-candidate audit passes:

# BLADE VALE 3.0

---

# Development Order

```text
COMPLETED
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14

CURRENT
Release Candidate Audit / bug fixes / balance verification / asset polish
   |
   v
BLADE VALE 3.0
```

---

# Development Rules for Claude Code / Codex / Contributors

1. **Read this ROADMAP.md before proposing or implementing a major change.**
2. Inspect current code/tests before assuming an old phase is missing.
3. Prefer finishing, connecting, simplifying or retiring existing systems over parallel systems.
4. Do not add another top-level Home button during feature freeze.
5. Do not solve information growth by making cards taller. Use Overview → Detail, filters, tabs and comparisons.
6. Mobile is the primary UX target.
7. Preserve save compatibility or provide an explicit migration.
8. Fix regressions with automated coverage whenever practical.
9. A feature is not complete until gameplay, UI, rewards, persistence and cross-system integration are verified.
10. Avoid a new currency unless an existing one fundamentally cannot serve the role; during feature freeze, default to no new currency.
11. Avoid unnecessary monkey patches; consolidate heavily patched areas where practical.
12. Lv99,999 is a design commitment; do not create a second uncapped progression ladder.
13. UI quality and command reachability are release criteria.
14. Phase 14 feature freeze is strict.
15. Release-candidate failures should produce bug fixes/audits, not new feature phases.

## Core Design Principles

1. Undiscovered content remains meaningfully undiscovered.
2. Prefer decisions/playstyles over percentage inflation.
3. Connect existing systems; avoid isolated menus.
4. Failure, revisiting and collecting should have purpose.
5. Trials demonstrate mastery, not only grind time.
6. The player can understand the next meaningful goal without source code.
7. A large game does not require a cluttered interface.
8. Preserve text-RPG identity while becoming cleaner, faster and more readable.
9. Reuse canonical progression/reward sources; do not invent conflicting parallel tables.
10. A battle UI regression that makes commands unreachable is a release blocker.
