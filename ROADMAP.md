# Blade Vale 3.0 — Official Roadmap

> **Status:** Active roadmap / source of truth for development toward Blade Vale 3.0.
>
> **Current:** Official Phase 10 final closure — Raid Boss integration is the remaining material gap.
>
> This document supersedes old feature-addition roadmaps. Before starting a large feature, inspect current code/tests and check this roadmap first.

## Goal

Blade Vale already has a large foundation: text-command combat, Character Lv99,999, 25 chapter data sets (Ch1–15 core journey, Ch16–20 The Veil, Ch21–25 expansion arc), Jobs, Equipment/Affixes, Rune, Companions/Monster Ranch, Codex, Inheritance, Awakening, Artifact/Relic, Abyss, Bounty, Unique Trials, Secret Jobs, Settlement and World/Key-Dungeon systems.

The main risk is no longer lack of systems. It is **feature sprawl, weak connections between systems, excessive scrolling, overloaded navigation, inconsistent UI, and endgame/story layers that do not yet feel like one coherent game**.

Development order:

**Audit → UI foundation → compact UI → progression → awakening → combat integration → world integration → equipment/job completion → settlement → endgame → story → content expansion → visual identity → final integration.**

Large new systems should not be added merely because they sound interesting. Prefer connecting, finishing, simplifying or retiring existing systems.

---

## Implementation status snapshot

- Phase 0 System & UI Audit — ✅ foundation complete; continue targeted audits when touching old systems.
- Phase 1 UI / UX Foundation 3.0 — ✅ foundation implemented; preserve compact navigation rules.
- Phase 2 Compact UI 3.0 — ✅ core Equipment/Ranch work implemented; continue collection-scale polish.
- Phase 3 Progression 3.0 — ✅ Lv1–99,999 progression foundation and simulation complete.
- Phase 4 Awakening 3.0 — ✅ milestone/imprint foundation implemented.
- Phase 5 Battle Integration 3.0 — ✅ integration foundation complete.
- Phase 6 World 3.0 — ✅ world/realm/branch foundation complete.
- Phase 7 Equipment / Loot 3.0 Final — ✅ major foundation complete; QoL extensions remain scheduled.
- Phase 8 Job 3.0 Final — ✅ major foundation complete.
- Phase 9 Settlement 2.0 — ✅ foundation/UI/runtime implemented; deeper cross-system links remain scheduled.
- Phase 10 Endgame 3.0 — 🟡 **Raid Boss integration remains before official closure.** See `PHASE10_FINAL_AUDIT.md`.
- Phase 11 Adventure / Story 3.0 — ⏭ next major phase after Phase 10 closure.
- Phases 12–14 — planned.

The completed Phase 10.1–10.7 items in `LEVEL_ROADMAP_99999.md` are the **Lv99,999 progression/endgame tuning sub-roadmap**. They do not replace the capability checklist in Official Phase 10 below.

---

## Phase 0 — System & UI Audit

**Priority: Critical**

Classify existing systems as Complete / Partial / Legacy / Disconnected / Retirement candidate and verify:

**data → state/save → UI → gameplay → rewards → cross-system integration → tests**

UI audits record primary actions, navigation depth, scroll cost, duplicated information, missing filters/search and mobile overflow.

### Completion criteria

- Current implementation matrix exists.
- Files alone are never treated as proof of completion.
- UI pain points are documented before screen growth.

---

## Phase 1 — UI / UX Foundation 3.0

UI is structural, not final polish.

### Home / navigation

- Player summary: level, job, HP/MP/EXP, key currencies.
- One dominant **Adventure** action.
- Group destinations such as Character / Companion / Base / Collection.
- Do not grow a vertical list of top-level feature buttons.
- Common destinations should be reachable within roughly 3 taps.

### Information hierarchy

Global rule:

- **Overview/list:** identity + essential numbers + state.
- **Detail:** full stats/effects/lore/traits/history.
- Long explanations open on demand.

Reusable UI primitives: compact cards, tabs, segmented filters, stat rows, rarity badges, locked states, detail drawers/modals, compare views and empty states.

---

## Phase 2 — Compact UI 3.0

Remove “scroll to read everything”.

### Equipment

Compact inventory cards show item name, rarity/type, primary power, 1–2 key markers and equipped/favorite/new state. Full Affix/Set/Unique/flavor text belongs in detail.

Standardize sorting, filters, favorites/lock, new marker, bulk dismantle, auto-lock and **delta-focused item comparison**.

### Monster Ranch / Companion

Compact cards prioritize species/name, level, rarity, key stats, primary role/trait, Bond and assignment. Genetics/mutations/inheritance/research belong in detail.

Use tabs such as **Companions / Eggs / Breeding / Training / Expeditions / Facilities / Research**.

### Collections

Jobs, Codex and large collections require categories, filters, discovery states and progress indicators. They must remain usable at 100+ entries.

---

## Phase 3 — Progression 3.0

Make Character Lv1–99,999 one coherent game rather than a numerical cap.

Current canonical progression is defined by the current progression files and `LEVEL_ROADMAP_99999.md`; do not revive stale level-band assumptions from older docs.

### Connected-play improvement: Global NEXT Goal

Extend the existing endgame guidance idea across the full game. Surface **one most meaningful next objective** rather than a wall of suggestions, e.g. next story target, Awakening, Job unlock, equipment threshold or endgame route.

The player should always have a compact answer to:

**“What am I trying to unlock, farm, defeat or build toward now?”**

### Connected-play improvement: Continue / Recent / Favorites

Adventure should support:

- Continue from the most relevant route.
- Recently played stages.
- Favorite farming locations.

These are shortcuts inside Adventure, not new Home buttons.

---

## Phase 4 — Awakening 3.0

Use Awakening as a long-term progression spine, not a pile of small percentage nodes.

Canonical milestones currently include Lv90 / 300 / 700 / 3,000. Meaningful unlocks can include imprint/build slots, mechanics, high-tier access, Secret Job requirements and advanced Key content.

Migrate/retire obsolete concepts safely and preserve save compatibility.

---

## Phase 5 — Battle Integration 3.0

Do not restart combat. Integrate and balance existing foundations:

- elements / weaknesses / resistances
- Break / Stagger
- status interactions
- tactical AI
- boss phases
- formations/groups
- companion AI/commands
- weapon techniques
- job mechanics/resources

### Enemy Intent / Tell

Readable enemy intent should become a stronger decision tool where appropriate. The goal is not to reveal every secret, but to let players respond to dangerous attacks with defense, Break, status control, companion commands or other build tools.

### Boss Signature Mechanics

Major bosses should each have at least one memorable rule or pressure pattern. Prefer mechanics such as phase changes, summons/guards, resource pressure, Break timing or behavior changes over pure HP inflation.

**Completion criterion:** reading the enemy and choosing actions must outperform mindless normal-attack spam.

---

## Phase 6 — World 3.0

Present the journey as a coherent regional network rather than an ever-growing flat stage list.

- Secret areas unlock through meaningful conditions.
- Key Dungeons have reward identity/events.
- Heaven/Underworld/other realms are progression/story destinations, not loose menu entries.
- Dimensional anomalies can foreshadow the modern-world mystery.
- Exploration events integrate travelers, shrines, merchants, rumors, hidden paths and companion events.

### World UI

Use **World/Region → local stages/branches**.

### Connected-play improvement: Region Mastery

Make regional completion readable at a glance: story, boss, secret area, Codex, Unique, companion and hidden-event progress. Preserve unknown entries as meaningful `?` states.

### Connected-play improvement: Rumors

Settlement/Tavern rumors may point to World events, hidden bosses, routes or anomalies. Rumors are a bridge between existing systems, not a new isolated menu.

---

## Phase 7 — Equipment / Loot 3.0 Final

Normalize the existing Equipment 3.x foundation.

- normal gear = procedural farming/optimization
- Unique = build-changing rule
- Set = multi-slot direction
- Relic/Artifact = high-level rule change

Continue to use existing Affix/Greater/Legendary/Unique/Set/Smart Loot/Crafting foundations.

### Connected-play improvement: Loot Filter / Auto Dismantle

Provide understandable rules for showing/keeping/dismantling drops by rarity, upgrade value, Codex-new state, Greater/Unique status and lock/favorite state. Never destroy protected items silently.

### Connected-play improvement: Build Loadouts

Allow a small number of presets for existing build components (Job, equipment and compatible build-layer selections such as Artifact/Companion where safe). Switching must validate unavailable/locked items and remain save-compatible.

This is QoL for existing systems, not a second equipment system.

---

## Phase 8 — Job 3.0 Final

Maintain the existing 56-job foundation, specialization, legacy/master passives, resources, Secret Jobs and Job Codex.

Secret Jobs are lateral/specialized playstyles, not strictly superior replacements.

Job UI distinguishes mastered, active, locked/discovered and undiscovered states without rendering all jobs as one long list.

Build Loadout integration from Phase 7 must respect Job unlock/mastery rules.

---

## Phase 9 — Settlement 2.0

Use Settlement as a connective base for systems such as Blacksmith, Monster Ranch, Magic Research, Tavern, Exploration Guild, Alchemy, Shop and Training Grounds.

Facility levels should unlock services/mechanics, not only +X% bonuses. Settlement should reduce Home clutter by housing related functions naturally.

### Connected-play improvement: Expeditions

Companion/Ranch expeditions should return value to existing loops: region materials, Artifact/Relic fragments, mutation/breeding resources, discovery clues or endgame information. Avoid a disconnected timer-only reward screen.

### Companion role readability

Show a concise primary role/readiness summary (for example damage, Break, support, defense, sustain, farming) without hiding the deeper trait/build system.

---

## Phase 10 — Endgame 3.0

Make Lv700–99,999 worthwhile.

### 10-A Abyss 3 completion — ✅

Pacts, Challenges, route/run-build layers, long-term progression/reward scaling and target-farm foundations exist. Continue to use their existing sources of truth.

### 10-B Nemesis — ✅

Nemesis 3.0 provides personal evolving targets and has regression coverage.

### 10-C World Tier — ✅

World Tier is implemented in the Adventure/stage flow with difficulty/reward behavior. Do not create a parallel difficulty selector.

### 10-D Transcendent regions — ✅ mapped to existing world stack

World3 Realms, Secret Realms, dimensional/rift content and Machine World collectively satisfy this role. Expand those structures when needed instead of creating another region framework.

### 10-E Raid Bosses — 🟡 CURRENT

Implement a distinct endgame raid route by **reusing** Combat 3 Boss Encounter, Enemy Intent, Break/phase foundations and current endgame reward scaling.

Raid requirements:

- preparation information before battle
- danger/mechanic hints without revealing every secret
- meaningful Break windows
- multiple phases or encounter-state changes
- build preparation matters
- reusable rewards using existing economies
- no HP-sponge-only design
- no new top-level Home button
- mobile-compact presentation
- regression tests + CI

See `PHASE10_FINAL_AUDIT.md`.

### 10-F Challenge Bosses — ✅ mapped

Unique Trials plus Boss Encounter conditions already fill the build-test/mastery role. Future prestige rewards can extend Titles/Records, but do not create a duplicate challenge-boss system.

### Official Phase 10 completion gate

Close Phase 10 only after Raid Boss has a verified route:

**data → state/save where needed → UI/navigation → gameplay → rewards → tests/CI**.

---

## Phase 11 — Adventure / Story 3.0

Connect existing worlds into one narrative:

**Human Realm → Heaven → Underworld → Dimensional Boundary → Modern World**

Central mystery:

**Why are Blade Vale's world and the modern world connected?**

### 11.1 Story Canon

Define the relationship among Human/Heaven/Underworld/Boundary/Machine/Modern worlds and establish what the player is actually pursuing.

### 11.2 Ch1–15 Story Pass

Add concise dialogue, boss lines, discoveries and environmental text. Avoid visual-novel-length walls.

### 11.3 The Veil — Ch16–20

Make the second major arc legible and connect its progression to the post-Ch15 world/endgame transition.

### 11.4 World Mystery Integration

Give Key Dungeons, Secret Realms, Nemesis, Machine World, Unique Trials, relics and anomalies narrative meaning.

### 11.5 Ch21–25 Integration

Use the already-existing chapter data as the next arc rather than inventing a parallel story route.

### 11.6 Modern World Tease

Seed restrained clues—architecture, signals, sounds, writing, devices or date fragments—without immediately explaining the mystery.

### Connected-play improvement: Codex Lore

Codex knowledge can unlock in layers from identity/weakness to ecology/lore/secret information. Use late Codex entries to connect monsters, artifacts and worlds to the central mystery.

Story supports exploration/systems rather than becoming a separate VN layer.

---

## Phase 12 — Content Expansion

Only after major systems/interfaces stabilize, increase volume.

Long-term guidelines:

- Regions: 30–40
- Normal monsters: 150+
- Bosses: 50+
- Recruitable companion species: 80+
- Mutations: 30–50
- Unique equipment: 100+
- Artifact / Relic: 100+
- Key Dungeon content: 50+

Prefer reusable generation rules, archetypes, modifiers and event pools over near-identical hand-authored entries.

### Titles / Personal Records

Add lightweight long-term recognition without turning titles into mandatory stat inflation. Candidate records include deepest Abyss, largest damage, fastest boss clear, highest Item Power, collection milestones and other meaningful feats.

Use these for prestige, history and challenge feedback rather than another required power ladder.

---

## Phase 13 — Visual Identity 3.0

Give stabilized interfaces a coherent Blade Vale identity.

- Replace emoji-dependent UI with a consistent pixel/icon set.
- Standardize spacing, typography, button hierarchy, card geometry, borders/shadows, rarity and semantic colors.
- Prioritize **name/title → important state/numbers → secondary explanation**.
- Improve battle/drop feedback with restrained shake/flash/damage emphasis/Critical/Break/boss-phase/high-rarity/SE hooks.

---

## Phase 14 — Blade Vale 3.0 Final Integration

**Feature freeze. No new large systems.**

Final audit:

1. Cross-system reward loops
2. Lv1–99,999 progression curve
3. Gold/material/Memory/key economy
4. Job balance
5. Monster/Boss/Raid balance
6. Equipment/drop balance and Loot Filter safety
7. Companion/Ranch/Expedition balance
8. Save compatibility/migrations/loadouts
9. Monkey-patch/load-order audit
10. Performance
11. Mobile UI/viewport audit
12. New-game full playthrough
13. Postgame/endgame playthrough
14. Very-high-level simulations
15. CI/test suite clean
16. NEXT Goal validity across progression
17. Recent/favorite route usability
18. Titles/records consistency

### Final UI acceptance criteria

- Home primary actions fit roughly within one phone viewport.
- Common functions require no more than ~3 taps from a primary navigation surface.
- Equipment remains manageable at 100+ items.
- Companion/Ranch remains manageable at 100+ monsters.
- Collection screens use categories/filtering instead of giant text lists.
- Detail text uses progressive disclosure.
- No routine screen requires excessive multi-screen scrolling without a strong reason.
- Mobile one-handed use is the default interaction model.
- Generic emoji are no longer the primary visual language.
- Numeric decision screens and lore/explanation screens have distinct hierarchy.
- Overview → Detail is the default pattern for information-heavy systems.

When all integration, balance, UX and test gates pass:

# BLADE VALE 3.0

---

# Connected-play improvement priority

These items are already assigned to phases above; this list is for implementation priority, **not a new parallel roadmap**.

### S — high impact

- Global NEXT Goal
- Build Loadouts
- Loot Filter / safe auto dismantle
- Continue / Recent / Favorite stages

### A — strong integration polish

- Enemy Intent strengthening
- Boss Signature Mechanics
- Item Compare deltas
- Region Mastery UI
- Companion role readability
- Codex Lore

### B — long-term depth / recognition

- Rumors
- Expedition integration
- Titles
- Personal Records

---

# Development Order

```text
COMPLETED FOUNDATION
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

CURRENT
Phase 10-E  Raid Boss integration
   |
   v
Phase 10    Official Endgame 3.0 closure
   |
   v
Phase 11    Adventure / Story 3.0
   |
   v
Phase 12    Content Expansion + long-term recognition
   |
   v
Phase 13    Visual Identity 3.0
   |
   v
Phase 14    Final Integration / feature freeze
   |
   v
BLADE VALE 3.0
```

---

# Development Rules for Claude Code / Codex / Contributors

1. **Read this ROADMAP.md before proposing or implementing a major feature.**
2. Do not assume an old roadmap phase is unimplemented; inspect current code/tests first.
3. Prefer finishing, connecting, simplifying or retiring existing systems over adding parallel systems.
4. Before adding a new top-level Home button, prove the feature cannot fit inside an existing navigation group.
5. Do not solve information growth by making cards taller. Use Overview → Detail, progressive disclosure, tabs, filters and comparison UI.
6. Mobile is the primary UX target. Check viewport overflow and scroll cost.
7. Preserve save compatibility or provide an explicit migration path.
8. Every large phase follows **implementation → automated tests → balance/simulation where relevant → CI → main → next phase**.
9. A feature is not complete until gameplay loop, UI, rewards, persistence and cross-system integration are verified.
10. Avoid a new currency/resource unless an existing one cannot serve the role.
11. Avoid unnecessary monkey patches; consolidate heavily patched areas when practical.
12. Content quantity comes after system stability.
13. Lv99,999 is a design commitment; progression/endgame work is evaluated against the full curve.
14. UI quality is a completion criterion, not cleanup to postpone indefinitely.
15. During Phase 14, feature freeze is strict: fix, balance, optimize and integrate only.

## Core Design Principles

1. Undiscovered content should remain meaningfully undiscovered.
2. Prefer new decisions/playstyles over percentage inflation.
3. Connect existing systems; avoid isolated menus.
4. Failure, revisiting areas and collecting should have purpose.
5. Trials should demonstrate mastery, not only grinding time.
6. The player should understand the next meaningful goal without consulting source code.
7. A large game does not require a cluttered interface.
8. Preserve the text-RPG identity while presentation becomes cleaner, faster and more readable.
9. Reuse canonical progression/reward sources; never solve one feature by inventing a conflicting parallel table.
