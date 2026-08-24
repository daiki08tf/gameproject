# Blade Vale 3.0 — Phase 0 System & UI Audit

> Status: **Phase 0 active / initial audit complete enough to start remediation**
>
> Purpose: establish the real current state of the game before more large systems are added. This document should be read together with `ROADMAP.md`.

## Executive summary

Blade Vale is no longer short on systems. The codebase already contains multiple generations of progression, combat, equipment, jobs, companion/ranch, awakening and abyss features. The largest risks are now:

1. **UI growth is outpacing information architecture.**
2. **Several systems are implemented through layered patch/import chains, making completion and ownership difficult to understand.**
3. **Old and new generations of the same feature coexist.**
4. **The Lv99,999 cap exists technically, but the full game loop is not yet mapped cleanly across the entire level range.**
5. **Tests are substantial, but feature-level completion must also include UI, persistence, rewards and cross-system integration.**

The next development work should therefore begin with **UI Foundation / Compact UI and progression integration**, not another unrelated large feature.

---

# 1. Verified runtime architecture

`js/main.js` is the main composition point and loads many patch layers before the screens are initialized.

Verified runtime families include:

- Progression core / Progression 3 / Lv99,999 roadmap
- Status calculation
- Inheritance
- Rune 2
- Equipment 3 (archetypes, instances, Greater, Legendary, blacksmith, gear, sets, smart loot, Abyss endgame)
- Combat 2 (elements, builds, weapon techniques, skill modifiers)
- Combat 3 (battle groups, enemy AI, formation)
- Job 3 specialization / legacy passives
- Companion systems / evolution / synergy / breeding
- Battle 2 tactical completion layer
- Codex
- Awakening cleanup + Awakening 3 imprints
- Abyss 2/3 and run-build systems
- exploration / rift / bounty / unique trials / secret jobs

`homeNavigation.js` also acts as an important integration chain and imports Settlement + Monster Ranch 2 systems and their UI.

## Architectural concern

A significant amount of game behavior is composed through side-effect imports and monkey-patch style extension. This is workable during rapid development, but it makes the following harder:

- knowing which version is authoritative
- reasoning about load order
- removing legacy behavior safely
- understanding which module owns a UI surface
- ensuring one feature does not silently override another

**Phase 14 requires a full monkey-patch/load-order audit, but consolidation should begin opportunistically when heavily patched areas are touched.**

---

# 2. Current system matrix

Legend:

- ✅ Complete enough for normal play / foundation established
- 🟢 Advanced, but still requires integration or finalization
- 🟡 Partial / transitional
- ⚠️ Legacy overlap or structural concern
- ⬜ Not yet a complete player-facing system

| System | Status | Audit notes |
|---|---:|---|
| Text command battle | ✅ | Core battle loop is established and active. |
| Battle 2 tactical layer | ✅/🟢 | Tactical completion layer exists; now needs whole-system balancing rather than another restart. |
| Combat 2 elements/builds | 🟢 | Element/build/weapon-technique/skill-modifier layers are loaded. Needs unified UX and balance. |
| Combat 3 groups/AI/formation | 🟢 | Advanced combat layers exist. Needs integration validation against all enemy/boss content. |
| Character progression | ✅ | Character/Job progression split exists. |
| Lv99,999 support | ✅ technical / 🟡 game design | Technical cap/curve exists. Full Lv1–99,999 content mapping is not yet complete. |
| 15-chapter/main journey | ✅ | Existing main progression foundation. Must be normalized to the Lv1–700 band. |
| Jobs (56-job foundation) | ✅ | Large job base is established. |
| Job 3 specialization/passives | 🟢 | Present in runtime; needs final identity/balance/UI pass. |
| Secret Jobs | 🟢 | Multiple phases are loaded; old roadmap status was outdated. Needs discovery/progression integration. |
| Equipment / weapon instances | ✅/🟢 | Strong foundation; item instances and multiple endgame layers are present. |
| Affixes / Greater Affixes | ✅/🟢 | Implemented enough to support loot farming; UX is too text-heavy. |
| Legendary / Unique / Set | 🟢 | Existing Equipment 3 layers indicate substantial implementation. Needs role/balance consolidation. |
| Smart Loot | ✅/🟢 | Filtering/auto-lock functionality exists; UI is dense and contributes to screen length. |
| Blacksmith | ✅/🟢 | Multiple systems route through it. Needs IA cleanup and compact interaction design. |
| Rune 2 | ✅ | Active permanent-progression layer. |
| Legacy Rune retirement | 🟢 | Retirement/migration layer exists; verify no orphaned UI/data remains. |
| Companion 2 foundation | ✅ | Recruitment/level/evolution/synergy/battle layers exist. |
| Companion 3 breeding | 🟢 | Breeding layer is loaded. Needs integration with Ranch and compact management UI. |
| Monster Ranch 2 | ✅/🟢 | Facilities, training, research, expedition, breeding/economy chain exists. Gameplay is substantial; UI is structurally overlong. |
| Codex | ✅/🟢 | Monster/weapon/job knowledge layers exist. Needs scalable collection UX. |
| Inheritance | ✅ | Core and balance/UI integration exist. |
| Awakening | ⚠️ | Cleanup + newer Imprint system coexist. Needs authoritative Awakening 3 design and retirement/migration plan. |
| Artifact / Relic | ✅/🟢 | Established build-changing/endgame layer. Needs placement in progression bands and loot economy. |
| Abyss | ✅/🟢 | Base Abyss plus Pact/Challenge/run-build extensions exist. Needs endgame progression mapping. |
| Bounty | 🟢 | Foundation/combat/unique layers exist. Nemesis is still a major completion target. |
| Unique Trials | 🟢 | Foundation/combat/UI/branch effects exist. Needs economy/progression placement validation. |
| World / Exploration | 🟢 | Exploration foundation exists; still needs coherent region-level player navigation. |
| Key Dungeons | ✅/🟢 | Playable route exists (forge/use/enter/reward). Needs richer generation/content identity. |
| World Rift | 🟡 | Rift/key foundation exists; not yet treated as a complete endgame pillar. |
| Settlement | 🟡 | Core/UI exists and Home already groups it, but it is not yet the complete connective hub described in the 3.0 roadmap. |
| Story / modern-world mystery | 🟡 concept + hooks | World/key systems provide hooks, but full narrative progression is not yet integrated. |
| Save/local persistence | ✅/🟢 | Existing state/save model supports current game. Migration risk increases as overlapping generations accumulate. |
| CI / regression testing | ✅ foundation | Syntax check + full Node test suite run on PRs and pushes to main. |

---

# 3. UI audit

## 3.1 Home screen — structural problem confirmed

The static home layout still begins from many top-level feature buttons. `homeNavigation.js` already attempts to reduce clutter by grouping them into:

- Adventure
- Settlement
- Growth
- Other

This is a useful transitional patch, but it does **not** solve the fundamental issue: the player still receives a feature directory rather than a compact primary navigation model.

### Current risks

- Growth group contains many destinations.
- Additional systems will continue increasing menu height.
- Major features remain represented as individual Home buttons.
- Group headings + grids still consume vertical space.
- The Home screen has no persistent global navigation model.

### Required Phase 1 direction

Replace the “all systems live on Home” model with:

- player summary
- one dominant Adventure action
- 3–4 grouped high-level destinations
- persistent bottom navigation or equivalent
- secondary systems behind Base / Growth / Collection / Menu

**Do not add another top-level Home button before this redesign.**

---

## 3.2 Equipment — excessive information density confirmed

The equipment screen currently contains a capable but dense filtering layer:

- rarity filters
- minimum item power
- Greater Affix count
- weapon type
- Legendary-only
- Curse-only
- Affix text search
- Smart Loot rules
- auto-lock criteria
- bulk Smart Loot application
- comparison output
- full stat/effect presentation

This functionality is valuable, but too much of it is rendered directly into the same screen flow.

### Main UX problem

The implementation tends to solve complexity by **adding more inline controls and text**. This increases scrolling and makes the main decision—“which item should I equip/keep?”—harder to scan.

### Required Phase 2 direction

Inventory list cards should expose only:

- name
- rarity/type
- primary power / item power
- 1–2 high-value markers
- equipped / favorite / new / locked state

Everything else moves into:

- detail drawer/modal
- comparison view
- advanced filter sheet

Smart Loot belongs in a dedicated advanced filter/settings surface, not permanently expanded in the inventory flow.

---

## 3.3 Monster Ranch — scroll growth confirmed

The Ranch advanced UI currently appends a large `Monster Ranch 2.0 — 育成・研究・派遣` card into `companionContent` containing:

- Training
- focus selection
- Research Lab state
- Expedition buttons
- companion selection
- active expedition status
- claim buttons

This is then layered on top of the existing companion/ranch interface.

### Main UX problem

Ranch functionality grew by **appending entire feature sections vertically**. This guarantees longer screens every time Ranch gains another system.

### Required Phase 2 direction

Ranch becomes a proper multi-surface system:

- Companions
- Eggs
- Breeding
- Training
- Expeditions
- Facilities
- Research

Use tabs/segmented navigation and compact companion cards. Never show the full genetic/research/training detail for every creature in a collection list.

---

## 3.4 Jobs / Codex / collections

These systems will scale poorly if every entry expands fully in a long vertical list.

Required common pattern:

**category → filter → compact list/grid → detail view**

Collection interfaces must remain usable when the game reaches the roadmap targets of 80+ companions, 100+ uniques and 150+ monsters.

---

# 4. Navigation / information architecture findings

## Existing positive work

`homeNavigation.js` shows the project already recognized Home-menu growth and groups existing button IDs without breaking old navigation. This is a useful compatibility bridge.

## Phase 1 architectural target

Recommended top-level model:

### Home

- Character summary
- current goal / progression hint
- Adventure primary CTA
- recent/important notifications

### Persistent destinations

1. **Adventure** — World, stages, Abyss, key routes
2. **Growth** — Character, Job, Awakening, equipment
3. **Companions** — roster and Ranch
4. **Base** — Settlement, blacksmith, research/facilities
5. **Menu/Collection** — Codex, save spell, settings/secondary pages

This is a direction, not a requirement to copy the exact labels. The invariant is: **top-level navigation must describe player goals, not enumerate every system.**

---

# 5. Testing / CI audit

Current `package.json` provides:

- `npm test` → Node regression test suite (`tests/*.test.js`)
- `npm run test:syntax` → JS syntax validation
- `npm run sim:loot` → loot simulation

GitHub Actions runs syntax + regression tests on:

- pull requests
- pushes to `main`

This is a good baseline and should remain mandatory for every major phase.

## Missing/next testing layers

Phase work should progressively add:

- UI behavior tests for compact list/detail flows where practical
- progression simulations for Lv1–700 and high-level bands
- deterministic balance simulations for Battle/Abyss/Bounty
- save migration tests for Awakening/system cleanup
- large collection tests (100 items / 100 companions)
- mobile viewport smoke checks (manual or automated when feasible)

---

# 6. Primary technical debt

## TD-01: Runtime patch layering

Many systems are extended through side-effect imports and prototype/state augmentation.

**Risk:** behavior becomes order-dependent and ownership becomes unclear.

**Action:** do not perform a dangerous full rewrite now. When a Phase touches a heavily patched area, consolidate that area's rules into a clearer authoritative layer and add regression coverage.

## TD-02: Multiple feature generations coexist

Examples include:

- legacy/new Awakening
- Battle 2 + Combat 2 + Combat 3 naming/layers
- Companion 2 + Companion 3 + Monster Ranch 2
- Equipment 3 while older documentation still described Equipment 2

**Risk:** developers/Claude may accidentally implement duplicate systems.

**Action:** ROADMAP + this audit are the source of truth. Inspect runtime imports before adding a “new version.”

## TD-03: UI generated by many patches

Home and Ranch in particular are modified by integration patches.

**Risk:** visual consistency and layout become difficult to control.

**Action:** Phase 1 introduces shared UI primitives and authoritative navigation ownership.

## TD-04: Inline styles and feature-local presentation

Several UI modules construct styles and large HTML strings directly in JS.

**Risk:** difficult global redesign, inconsistent spacing/typography.

**Action:** Phase 1–2 should move reusable layout rules into shared CSS/components while preserving behavior.

---

# 7. Phase 0 decisions

The audit supports the following decisions:

### Decision 1 — Freeze unrelated large systems

Until the initial UI foundation and progression integration are complete, do not start another major standalone system.

### Decision 2 — UI moves before progression implementation

The UI architecture must be stabilized first because every subsequent phase will add or reconnect information.

### Decision 3 — Do not restart already-advanced systems

Battle, Equipment, Job, Companion/Ranch and Abyss already contain later-generation work. Future phases are **integration/finalization**, not clean-slate rewrites.

### Decision 4 — Awakening is a special cleanup target

Awakening should receive a deliberate migration/consolidation phase because old and new concepts overlap and it is intended to become a primary progression milestone system.

### Decision 5 — Lv99,999 is a game-design contract

All endgame systems must eventually map to the full level roadmap. The cap must not remain ornamental.

---

# 8. Immediate implementation queue

These are the recommended first implementation tasks after Phase 0 documentation.

## P0 — UI Foundation

1. Define Blade Vale 3.0 top-level information architecture.
2. Rebuild Home around a compact primary navigation model.
3. Add shared bottom/persistent navigation (or equivalent compact global nav).
4. Create reusable compact-card / detail-panel / tab / filter components.
5. Remove the rule that every feature requires a Home button.

## P0 — Compact Equipment

6. Split equipment into compact inventory list + item detail.
7. Move advanced filters/Smart Loot into collapsible sheet/detail surface.
8. Keep stat delta comparison highly visible.
9. Add/normalize favorite, lock, new and bulk-management states.
10. Verify usability with 100+ generated inventory items.

## P0 — Compact Ranch

11. Split Ranch into functional tabs.
12. Replace long companion blocks with compact cards.
13. Move genetics/research/breeding details behind creature detail.
14. Separate expedition/training/facility management from roster browsing.
15. Verify usability with 100 companions / many eggs / active expeditions.

## P1 — Progression preparation

16. Build an authoritative Lv1–99,999 content mapping table in code/docs.
17. Validate main-story Lv1–700 EXP and enemy scaling.
18. Map Abyss/Key/Bounty/Secret/Unique systems to level bands.
19. Define Awakening 3 migration plan.
20. Add progression/balance simulations before modifying live numbers broadly.

---

# 9. Phase 0 completion gate

Phase 0 can be considered **complete enough to move into Phase 1** when:

- [x] Runtime systems have been classified at a high level.
- [x] Home / Equipment / Ranch UI structural issues have been identified.
- [x] Existing CI/test baseline has been confirmed.
- [x] Main technical-debt categories have been documented.
- [x] Immediate P0 implementation queue has been defined.
- [ ] Major screens receive a final hands-on mobile viewport check during the Phase 1 implementation cycle.
- [ ] Any newly discovered orphan/legacy module is added to this audit when encountered.

**Result: proceed to Phase 1 — UI / UX Foundation 3.0.**

---

# Instructions for Claude Code / Codex

Before implementing the next task:

1. Read `ROADMAP.md`.
2. Read this `PHASE0_AUDIT.md`.
3. Inspect the current runtime path before writing code.
4. Do not create a new parallel UI or system if an existing one can be consolidated.
5. Preserve button/state/save compatibility while migrating UI unless the task explicitly includes a migration.
6. For UI tasks, optimize for mobile and large collections first.
7. Every implementation batch must finish with syntax tests + regression tests; add targeted tests where the behavior is testable.
8. After each Phase 1/2 milestone, update this audit if the authoritative architecture changes.
