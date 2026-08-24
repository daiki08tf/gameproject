# Blade Vale 3.0 — Official Roadmap

> **Status:** Active roadmap / source of truth for development toward Blade Vale 3.0.
>
> This document supersedes the old feature-addition roadmap. Before starting a large feature, check this roadmap first.

## Goal

Blade Vale already has a large foundation: 15 chapters, text-command combat, Character Lv 99,999, Jobs, Equipment/Affixes, Rune, Companions/Monster Ranch, Codex, Inheritance, Awakening, Artifact/Relic, Abyss, Bounty, Unique Trials, Secret Jobs, and World/Key-Dungeon systems.

The main risk is no longer lack of systems. It is **feature sprawl, weak connections between systems, excessive scrolling, overloaded navigation, inconsistent UI, and an endgame that does not yet fully justify Lv 99,999**.

From this point onward the development order is:

**Audit → UI foundation → compact UI → progression → awakening → combat integration → world integration → equipment/job completion → settlement → endgame → story → content expansion → visual identity → final integration.**

Large new systems should not be added merely because they sound interesting. Prefer connecting and finishing existing systems.

---

## Phase 0 — System & UI Audit

**Priority: Critical**

Freeze non-essential large feature additions and classify every existing system as:

- Complete
- Partially complete
- Legacy / needs redesign
- Implemented but disconnected
- Retirement candidate

Audit Battle, World, Equipment, Job, Companion, Monster Ranch, Rune, Codex, Awakening, Inheritance, Bounty, Unique Trials, Abyss, Secret Jobs, Key Dungeons, save data and progression.

For each system verify the complete route:

**data definition → state/save → UI → gameplay → rewards → cross-system integration → tests**

### UI audit

Record for every screen:

- number of primary actions
- navigation depth
- approximate scroll length
- duplicated information
- excessively long cards/text
- missing filtering/sorting/search
- mobile overflow / controls below the fold
- features exposed as separate home buttons that should be grouped

### Completion criteria

- Current implementation matrix exists.
- No major feature is assumed complete only because files exist.
- UI pain points are documented before further screen growth.

---

## Phase 1 — UI / UX Foundation 3.0

**Priority: Critical**

UI is now a structural concern, not final polish. Fix the navigation model before adding more systems.

### 1-A Home redesign

The home screen must no longer be a growing vertical list of feature buttons.

Target structure:

- Player summary: level, job, HP/MP/EXP, key currencies
- One dominant **Adventure** action
- A small set of grouped destinations such as Character / Companion / Base / Collection
- Secondary systems moved behind appropriate groups
- Major actions visible without long scrolling on a typical phone

### 1-B Persistent navigation

Evaluate a compact bottom navigation such as:

**Home / Adventure / Growth / Companions / Menu**

Do not require returning to Home merely to jump between common systems.

### 1-C Information hierarchy

Adopt a global rule:

- **List/card:** identity + essential numbers + state
- **Detail:** full stats, effects, lore, inheritance, traits, etc.
- Long explanations are collapsed or opened on demand.

### 1-D Shared UI primitives

Create reusable components/patterns for:

- compact cards
- tabs
- segmented filters
- stat rows
- rarity badges
- locked/undiscovered states
- detail drawers/modals
- compare views
- empty states

Avoid each patch inventing a different UI style.

### Completion criteria

- Home does not overflow with top-level feature buttons.
- Common destinations are reachable within roughly 3 taps.
- New systems have an obvious place in the information architecture before implementation.

---

## Phase 2 — Compact UI 3.0

**Priority: Critical**

Remove the current “scroll to read everything” pattern, especially from Equipment and Monster Ranch.

### 2-A Equipment inventory

Inventory cards show only essential information, e.g.:

- item name
- rarity / type
- primary power/stat
- 1–2 important markers
- equipped/favorite/new state

Full Affix, Set, Unique and flavor descriptions belong in a detail view.

Add or standardize:

- rarity/type/stat sorting
- filters
- favorites / lock
- new-item marker
- bulk dismantle
- auto-lock rules where appropriate
- comparison against currently equipped gear

Comparison should emphasize deltas rather than paragraphs.

### 2-B Monster Ranch / Companion lists

A companion card should remain compact even as breeding/genetics systems grow.

List view prioritizes:

- species/name
- level
- rarity
- key stats
- important trait
- Bond / current assignment

Move genetics, mutation detail, inherited traits, research data and long descriptions into detail views.

Split Ranch functions into clear tabs or sections:

**Companions / Eggs / Breeding / Training / Expeditions / Facilities / Research**

### 2-C Jobs, Codex and other large collections

Never present dozens/hundreds of entries as one unstructured text wall.

Use category tabs, filters, discovery state, progress indicators and compact cards.

### UI performance targets

- Home primary actions fit approximately within one phone viewport.
- Large lists remain usable at 100+ items.
- Avoid routine screens requiring ~5 screens of vertical scrolling.
- Full descriptions are not permanently expanded in collection lists.

---

## Phase 3 — Progression 3.0

Make Character Lv 1–99,999 one coherent game rather than a numerical cap.

### Level bands

| Level | Primary progression |
|---|---|
| 1–700 | Main 15-region journey |
| 700–2,999 | Early Abyss / EX Bounty / Hidden Boss / advanced keys |
| 3,000–9,999 | Nemesis / mid-Abyss / advanced build systems |
| 10,000–29,999 | Transcendent regions |
| 30,000–49,999 | Divine regions |
| 50,000–99,999 | Final/end-of-world regions |

### Work

- Rebalance the 15 main regions around Lv1–700.
- Rework EXP so normal play + reasonable side content reaches intended levels.
- Couple enemy HP/ATK/DEF/EXP to the new progression model.
- Map World, Key Dungeons, Bounty, Unique Trials, Secret Jobs, Ranch, Awakening, Equipment tiers and Abyss to meaningful level bands.
- Verify very large HP/damage/EXP values and number formatting.

### Completion criteria

At every major level band the player has a clear answer to:

**“What am I trying to unlock, farm, defeat or build toward now?”**

---

## Phase 4 — Awakening 3.0

Replace/merge legacy Awakening concepts into a long-term progression spine.

Candidate milestone structure:

- First Awakening: Lv90
- Second Awakening: Lv300
- Third Awakening: Lv700
- Fourth Awakening: Lv3,000

Awakening should not be a collection of small percentage bonuses. Use it to unlock meaningful choices such as:

- build/imprint slots
- new mechanics
- high-tier content access
- Secret Job requirements
- advanced Key Dungeons
- endgame progression systems

Migrate or retire obsolete Awakening nodes safely and preserve save compatibility where practical.

---

## Phase 5 — Battle Integration 3.0

Battle 2.0 and later combat patches already provide substantial foundations. Do not restart combat from scratch. Integrate and balance what exists.

Unify:

- elements / weaknesses / resistances
- Break / Stagger
- status interactions
- enemy tactical AI
- boss phases
- formations / groups
- companion AI and commands
- weapon techniques
- job mechanics/resources

### Battle UI

Enemy presentation should expose actionable information compactly:

- HP
- Break
- discovered weakness/resistance
- important status
- readable intent/tell where appropriate

Codex discovery should remain meaningful; unknown information should not automatically be revealed.

### Completion criteria

**Reading the enemy and choosing actions must outperform mindless normal-attack spam.**

---

## Phase 6 — World 3.0

Turn chapter/stage selection into a coherent adventure structure.

### 6-A Regional network

Present the current journey as connected regions rather than an ever-growing flat list.

### 6-B Secret areas

Unlock through combinations such as:

- boss conditions
- companion requirements
- Codex progress
- special keys
- Unique/Trial/Job conditions

### 6-C Key Dungeons

Finish the existing playable key route with richer generation, reward identity and events.

### 6-D Heaven / Underworld

Treat these as high-level worlds reached through progression/story/key conditions, not ordinary menu entries.

### 6-E Modern-world mystery

Rare dimensional anomalies may hint at or connect to a modern world (e.g. Tokyo). This is a late-story mystery, not an immediately explained gimmick.

### 6-F Exploration events

Integrate travelers, shrines, merchants, rumors, hidden paths, companion events and anomalies.

### World UI

Use hierarchical navigation:

**World/Region → local stages/branches**

Avoid one enormous vertical stage list.

---

## Phase 7 — Equipment / Loot 3.0 Final

Finish and normalize the existing Equipment 3.x foundation rather than creating another parallel loot system.

Unify roles:

- normal gear = procedural farming/optimization
- Unique = build-changing rule
- Set = multi-slot build direction
- Relic/Artifact = high-level rule changes

Finalize as needed:

- Affix / Greater Affix
- Legendary / Unique / Set
- Smart Loot
- Reforge / Craft
- dismantling/material loop
- rare endgame tiers (only if they add a real progression role)
- high-rarity drop presentation

A bad Legendary should still have economic/crafting value.

---

## Phase 8 — Job 3.0 Final

Finish the existing Job 3.x and Secret Job work.

Integrate:

- 56-job foundation
- specialization
- legacy/master passives
- job resources where they improve identity
- Ultimates where appropriate
- Secret Jobs
- Job Codex

Secret Jobs should be lateral/specialized playstyles, not simple superior replacements.

### Job UI

Group by tier/category and clearly distinguish:

- mastered
- active/in progress
- discovered but locked
- undiscovered

Do not render all jobs as one long list.

---

## Phase 9 — Settlement 2.0

This is one of the remaining candidates for a genuinely new large system because it can **connect existing systems instead of adding another isolated menu**.

Unify the base around facilities such as:

- Blacksmith
- Monster Ranch
- Magic Research
- Tavern
- Exploration Guild
- Alchemy
- Shop
- Training Grounds

Facility levels should unlock mechanics/services, not merely provide +X% bonuses.

Settlement should also reduce Home clutter: Blacksmith, Ranch, research, etc. can live naturally inside the Base/Settlement structure.

---

## Phase 10 — Endgame 3.0

Make Lv700–99,999 worthwhile.

### 10-A Abyss 3 completion

Integrate Pacts, Challenges, run builds, special floors and long-term rewards.

### 10-B Nemesis

Enemies/bounties that defeat the player can grow/change and become personal targets.

### 10-C World Tier

Post-clear world tiers alter enemy strength, AI and loot tables rather than only multiplying HP.

### 10-D Transcendent regions

Examples: Void, Divine Realm, temporal/dimensional fractures.

### 10-E Raid Bosses

Huge bosses should demand mechanics, Break windows, phase knowledge and build preparation—not merely long HP bars.

### 10-F Challenge Bosses

Use for build tests and prestige rewards such as titles/cosmetics/special artifacts.

---

## Phase 11 — Adventure / Story 3.0

Connect the world structure into one narrative:

**Human Realm → Heaven → Underworld → Dimensional Boundary → Modern World**

Central mystery:

**Why are Blade Vale's world and the modern world connected?**

Seed the answer gradually through Key Dungeons, artifacts, ruins, Secret Jobs, anomalies and environmental text.

Story must support exploration and systems rather than becoming a separate visual-novel layer.

---

## Phase 12 — Content Expansion

Only after the major systems and interfaces stabilize, increase volume.

Long-term targets (guidelines, not quotas):

- Regions: 30–40
- Normal monsters: 150+
- Bosses: 50+
- Recruitable companion species: 80+
- Mutations: 30–50
- Unique equipment: 100+
- Artifact / Relic: 100+
- Key Dungeon variants/content: 50+

Prefer reusable generation rules, archetypes, modifiers and event pools over hand-authoring hundreds of near-identical entries.

Do **not** front-load content production before the systems are stable.

---

## Phase 13 — Visual Identity 3.0

The structural UI work happens in Phases 1–2. This phase gives the finished interfaces a coherent Blade Vale identity.

### 13-A Replace emoji-dependent UI

Gradually replace generic emoji icons with a consistent pixel/icon set.

### 13-B Design tokens

Standardize:

- spacing
- typography scale
- button hierarchy
- card geometry
- borders/shadows
- rarity treatment
- semantic colors

### 13-C Typography and density

Prioritize:

**name/title → important numbers/state → secondary explanation**

Avoid walls of equally weighted text.

### 13-D Battle/drop feedback

Keep the text-RPG identity while improving feedback through restrained:

- screen shake
- flash
- damage number emphasis
- Critical / Break feedback
- boss phase transitions
- high-rarity drop reveals
- SE / music hooks

---

## Phase 14 — Blade Vale 3.0 Final Integration

**Feature freeze. No new large systems.**

### Final audit

1. Cross-system reward loops
2. Lv1–99,999 progression curve
3. Gold/material/Memory/key economy
4. All Job balance
5. Monster/Boss balance
6. Equipment/drop balance
7. Companion/Ranch balance
8. Save compatibility/migrations
9. Monkey-patch/load-order audit
10. Performance
11. Mobile UI/viewport audit
12. New-game full playthrough
13. Postgame/endgame playthrough
14. Very-high-level simulations
15. CI/test suite clean

### Final UI acceptance criteria

- Home primary actions fit roughly within one phone viewport.
- Common functions require no more than ~3 taps from a primary navigation surface.
- Equipment remains manageable at 100+ items.
- Companion/Ranch remains manageable at 100+ monsters.
- Collection screens use categories/filtering instead of giant text lists.
- Detail text is progressive disclosure, not always-expanded content.
- No routine screen requires excessive multi-screen scrolling without a strong reason.
- Mobile one-handed use is treated as the default interaction model.
- Generic emoji are no longer the primary visual language.
- Numeric decision screens and lore/explanation screens have distinct information hierarchy.

When all integration, balance, UX and test gates pass:

# BLADE VALE 3.0

---

# Development Order

```text
CURRENT
  |
  v
Phase 0   System & UI Audit
  |
  v
Phase 1   UI / UX Foundation 3.0
  |
  v
Phase 2   Compact UI 3.0
  |
  v
Phase 3   Progression 3.0
  |
  v
Phase 4   Awakening 3.0
  |
  v
Phase 5   Battle Integration 3.0
  |
  v
Phase 6   World 3.0
  |
  v
Phase 7   Equipment / Loot 3.0 Final
  |
  v
Phase 8   Job 3.0 Final
  |
  v
Phase 9   Settlement 2.0
  |
  v
Phase 10  Endgame 3.0
  |
  v
Phase 11  Adventure / Story 3.0
  |
  v
Phase 12  Content Expansion
  |
  v
Phase 13  Visual Identity 3.0
  |
  v
Phase 14  Final Integration
  |
  v
BLADE VALE 3.0
```

---

# Development Rules for Claude Code / Codex / Contributors

These rules are part of the roadmap, not optional suggestions.

1. **Read this ROADMAP.md before proposing or implementing a major feature.**
2. Do not assume an old roadmap phase is unimplemented; inspect current code/tests first. Several systems have advanced beyond their old version labels.
3. Prefer finishing, connecting, simplifying or retiring existing systems over adding parallel systems.
4. Before adding a new top-level Home button, prove that the feature cannot fit inside an existing navigation group.
5. Do not solve information growth by making cards taller. Use progressive disclosure, tabs, filters, detail views and comparison UI.
6. Mobile is the primary UX target. Check viewport overflow and scroll cost.
7. Preserve save compatibility or provide an explicit migration path.
8. Every large phase follows:
   **implementation → automated tests → balance/simulation where relevant → CI → main → next phase.**
9. A feature is not complete until its gameplay loop, UI, rewards, persistence and cross-system integration are verified.
10. Avoid introducing a new currency/resource unless an existing one cannot serve the role.
11. Avoid unnecessary monkey patches; when touching heavily patched areas, consider consolidation/refactoring.
12. Content quantity comes after system stability.
13. Lv99,999 is a design commitment: new progression/endgame work must be evaluated against the full level curve.
14. UI quality is a completion criterion, not cosmetic cleanup to postpone indefinitely.
15. During Phase 14, feature freeze is strict: fix, balance, optimize and integrate only.

## Core Design Principles

1. Undiscovered content should remain meaningfully undiscovered.
2. Prefer new decisions and playstyles over simple percentage inflation.
3. Connect existing systems; avoid isolated menus.
4. Failure, revisiting areas and collecting should have purpose.
5. Trials should demonstrate mastery, not only time spent grinding.
6. The player should be able to understand the next meaningful goal without consulting source code.
7. A large game does not require a cluttered interface.
8. Text-RPG identity should be preserved while presentation becomes cleaner, faster and more readable.
