# Blade Vale — UI Overhaul Roadmap

> **Status: ACTIVE / PLANNING LOCKED**
>
> Program ID: UIX
>
> Baseline: main at PR #403, after Stage-first Core Loop Rework CLR-12–21 and the live-browser playability fixes.
>
> Product direction: **Dark Chronicle — a dense, text-first record of a dangerous world, not a generic rounded-card mobile dashboard.**

## 1. Why this program exists

Blade Vale has a strong text-command hack-and-slash core, but accumulated feature patches have produced a visually generic interface: repeated rounded cards, emoji-led labels, inconsistent hierarchy, long vertical walls, and screen-specific styling. Functional density also makes important actions hard to distinguish from secondary information.

UIX is a full presentation and information-architecture overhaul. It is not a new game mode, a gameplay rebalance, or a framework migration.

The north-star experience remains:

~~~text
Home
→ Adventure
→ Chapter
→ Stage
→ Story / Hunt
→ Battle
→ Result / Loot
→ Build update
→ stronger Stage / Route / Endgame
~~~

World 4.0, Region, Route Graph, Adventure Session and other systems remain supporting runtime authorities behind the player-facing Stage-first grammar.

## 2. Non-negotiable visual direction

### Dark Chronicle

The interface should feel like an expedition record, field dossier, old map, observatory ledger and worn tactical instrument.

Use:

- black iron, soot navy, ash white and restrained aged-metal accents;
- sharp or lightly cut panel geometry instead of soft pill/card repetition;
- rules, coordinates, record numbers, chapter/stage notation and seals as structural detail;
- typography, spacing, borders and contrast as the primary hierarchy;
- restrained cyan/teal for Observation or Branch anomalies;
- restrained red for danger and failure;
- restrained brass for important progression or authored rarity;
- dense but calm text-first composition;
- deliberate negative space around the single primary action.

Avoid:

- generic gradient-heavy fantasy/mobile-game surfaces;
- every feature presented as the same large rounded card;
- bright multicolor icon menus;
- decorative glassmorphism;
- excessive glow, particles or constant animation;
- icon-only navigation;
- oversized headings that push actions below the fold;
- a terminal imitation that sacrifices Japanese readability.

### Emoji prohibition

**Rendered application UI must not use platform emoji glyphs.**

This includes Home, navigation, buttons, tabs, headers, badges, Stage cards, Battle, Result, Equipment, Blacksmith, Ranch, Settlement, Codex and Endgame surfaces.

Rules:

1. Remove emoji prefixes and suffixes from UI labels.
2. Do not replace emoji with a different emoji or Unicode pictograph.
3. Prefer plain language, typography, borders and state labels.
4. Where a visual symbol is necessary, use a small consistent monochrome SVG/CSS icon with an accessible text label.
5. Do not introduce a broad third-party icon library merely to replace emoji.
6. Story prose and canonical names are not to be rewritten blindly; audit whether a glyph is authored content or UI decoration before changing it.
7. Final acceptance includes a static UI-string scan and live rendered-screen audit.

Preferred states:

~~~text
CLEAR
NEXT
LOCKED
BOSS
NEW RECORD
TARGET DROP
~~~

State meaning must never rely on color or an icon alone.

## 3. Product principles

1. **Text-first, not text-wall.** Progressive disclosure, compact summaries and expandable detail.
2. **One obvious primary action.** Secondary actions must not compete visually.
3. **Current context is always visible.** Chapter, Stage, Region/Hunt intent, danger and return destination.
4. **Dense lists beat giant cards.** Equipment, Codex, Ranch and Stage browsing must support scanning.
5. **Gameplay authority stays untouched.** UI reads existing state and calls existing actions.
6. **Mobile is the primary constraint.** Design first for 390×844 and verify 375×667.
7. **Desktop is an expansion, not a different product.**
8. **No dead ends.** A canonically available forward action must remain reachable.
9. **Motion explains state change.** Motion is short, optional and never decorative noise.
10. **Accessible by construction.** 44px touch targets, visible focus, sufficient contrast, reduced-motion support.

## 4. Authority and architecture guardrails

UIX must preserve:

- Story/Stage: CHAPTERS, canonical Stage definitions and stageProgress;
- Battle: TextBattleScreen and BattleEngine;
- rewards: existing EXP, Gold, Loot and Equipment pipelines;
- Hunt: existing Stage/Region context and Adventure4 session;
- World Tier: existing global authority, applied exactly once;
- Discovery/Codex/Event Memory: existing owner systems;
- save compatibility and existing top-level save shape;
- existing DOM IDs and event contracts unless a phase explicitly proves a safe migration.

UIX must not create:

- a new Story progression;
- a second navigation state authority;
- a second Battle, Loot, Equipment or Codex authority;
- Hunt Lv, Hunt currency, stamina or energy;
- a new save root;
- a new World Tier authority;
- UI-only progression flags that can diverge from gameplay state.

Implementation constraints:

- no React/Vue/framework rewrite;
- no big-bang replacement of every screen in one PR;
- no unrelated source formatting;
- avoid screen-wide innerHTML replacement when a smaller render change works;
- all MutationObserver writes must be idempotent and use the established domSafety helpers where applicable;
- inspect renderer ownership and patch order before moving DOM;
- preserve current boot, menu and battle contracts throughout migration.

## 5. Target information architecture

### Home

Home is a command center, not a catalogue of every feature.

Above the fold:

- current Chapter / Stage or active expedition;
- one primary Continue Adventure action;
- concise player Level / Job / build signal;
- meaningful new information only: new loot, record, discovery or available upgrade;
- four stable destinations: Adventure, Character, Equipment, Records.

Secondary systems live inside their owning hub:

- Character: Status, Job, Companion, Ranch, Rebirth;
- Equipment: loadout, inventory, comparison, Blacksmith, Codex;
- Records: Codex, Rumor, discoveries, challenge records;
- Settlement remains an in-world hub rather than another pile of Home buttons.

### Adventure

~~~text
Chapter index
→ compact Stage ledger
→ Stage dossier
→ Story / Replay / Hunt action
~~~

Every Stage surface must expose:

- Stage ID and name;
- CLEAR / NEXT / LOCKED;
- recommended Level;
- first-clear/replay state;
- Region identity when relevant;
- target loot only when canonically known;
- one primary action.

### Battle and Result

Battle prioritizes commands, target state and readable cause/effect.

- command grid remains reachable at all times;
- enemy list and log remain independently bounded;
- Stage context stays visible;
- damage/status text uses consistent hierarchy;
- no emoji status markers;
- Result shows what changed: Level, loot, unlock, record and next action;
- Next Stage is primary when available;
- retry/Hunt continuation and return remain distinct.

### Inventory-heavy surfaces

Equipment, Blacksmith, Ranch, Codex and records use compact rows, comparison panels, filters and expandable details. They must not render every property as a full-width card.

## 6. Implementation phases

### [ ] UIX-0 — Live UI Inventory and Ownership Audit

Source/ownership audit: complete in `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md`.

Remaining gate: live screenshots and rendered-screen inventory at the required viewports. UIX-0 stays unchecked until that gate is completed.

Goal: establish evidence before redesign.

Deliverables:

- capture representative screenshots at 390×844, 375×667 and desktop;
- inventory every reachable screen, entry point, renderer, CSS owner and patch owner;
- locate all rendered emoji/pictographs in HTML, JavaScript and CSS-generated content;
- map MutationObserver ownership and known fragile DOM contracts;
- record scroll depth, unreachable actions, duplicated labels and information walls;
- identify visual components that can be consolidated without changing runtime authority;
- produce UIX-0 audit document and exact phase file list.

Required live paths:

- title → Home;
- Home → Chapter → Stage → Stage confirm → Battle → Result → next Stage;
- cleared Stage → Hunt → battle → aftermath → return;
- Equipment → comparison/filter → Blacksmith;
- Character → Job → Companion/Ranch → Rebirth;
- Settlement and Records/Codex;
- Abyss and representative endgame entries;
- Chapter 2 → Observed Branch → Branch Battle/Hunt.

No production visual rewrite in UIX-0.

### [ ] UIX-1 — Design System and Emoji Removal Foundation

Goal: create one visual language and remove platform-emoji dependence from the shared shell.

Deliverables:

- semantic color, type, spacing, border, radius, elevation and motion tokens;
- Japanese-readable typography stack with tabular numerals for levels/stats;
- component contracts for header, section, row, badge, tab, action and notice;
- shared focus, disabled, pressed, loading and locked states;
- reduced-motion behavior;
- emoji prohibition regression scan;
- initial replacement of shared navigation/header emoji;
- design-system reference document with good/bad examples.

Do not restyle every feature here. Build the foundation and prove it on the shell.

### [ ] UIX-2 — Application Shell and Home Command Center

Goal: make the first screen distinctive and immediately actionable.

Deliverables:

- Dark Chronicle shell;
- current-run/current-Stage context;
- one Continue Adventure primary action;
- stable four-destination hierarchy;
- secondary systems grouped under their existing owners;
- no clipped or unreachable Home action;
- no duplicate Adventure entry;
- compact notification/record treatment without noisy badges.

Acceptance: within three seconds, a player can identify current location and the next primary action.

### [ ] UIX-3 — Stage-first Adventure Suite

Goal: make Chapter → Stage → Story/Hunt the clearest part of the game.

Scope:

- Chapter selection;
- Stage ledger;
- Stage dossier/confirm;
- Story, replay and Hunt actions;
- Observed Branch presentation;
- safe return/suspend/resume context.

Acceptance:

- Stage IDs remain visible;
- NEXT/CLEAR/LOCKED are unambiguous;
- secret information does not leak;
- no World4 node terminology is required for Story progression;
- the entire clean-save 1-1 route is operable at narrow mobile width.

### [ ] UIX-4 — Text Battle and Result Suite

Goal: give combat a distinctive tactical-record identity without harming speed.

Scope:

- combat header and Stage context;
- HP/MP/resources;
- enemy roster and target states;
- battle log hierarchy;
- command grid and submenus;
- victory/defeat/result;
- loot reveal and next action.

Permanent release blockers:

- commands pushed off-screen;
- active combat with no usable attack/action;
- only Return/Cancel when forward progress exists;
- observer loops or repeated DOM rebuild;
- result screen with no sensible destination.

### [ ] UIX-5 — Equipment, Build and Blacksmith Workbench

Goal: turn high-volume loot evaluation into fast scanning and meaningful comparison.

Scope:

- loadout/paperdoll;
- inventory rows;
- filters and Smart Loot;
- current vs candidate comparison;
- three random Options and fixed Unique effects;
- Option Lv1–100/fusion progress;
- Blacksmith actions;
- weapon/item Codex.

Acceptance:

- common comparisons need no long page scroll;
- rarity, Option family, Option level and equipped state remain distinct;
- no new calculation authority is introduced in UI code;
- destructive actions are explicit and protected;
- existing Gear Overhaul contracts remain unchanged.

### [ ] UIX-6 — Character, Ranch, Settlement, Records and Endgame

Goal: bring all secondary surfaces into the same system without flattening their identities.

Batches:

1. Status / Job / Rebirth;
2. Companion / Monster Ranch;
3. Settlement facilities;
4. Codex / Rumor / records;
5. Abyss / Rift / Secret Realm / Machine Realm / Bounty/Nemesis.

Each batch is a separate PR unless the audit proves it is genuinely small.

### [ ] UIX-7 — Motion, Feedback and Accessibility Pass

Goal: make interaction feel authored and responsive.

Deliverables:

- short transition rules;
- damage, loot, unlock and discovery feedback;
- reduced-motion support;
- keyboard/focus behavior where applicable;
- color/contrast audit;
- readable dynamic text sizing;
- safe-area handling;
- no animation that delays repeated farming actions.

### [ ] UIX-8 — Real-device Release Readiness

Goal: close the program only after live play, not source-pattern confidence.

Required viewport/device coverage:

- 390×844 primary;
- 375×667 compact;
- one modern desktop viewport;
- iPhone Safari hands-on pass when available.

Required complete flows:

- fresh save through multiple Story clears;
- Stage replay and Hunt;
- suspend/resume and safe return;
- equipment acquisition/comparison/equip/forge;
- Ranch and Settlement;
- representative endgame;
- Observed Branch;
- long enemy list, long combat log and large inventory;
- old-save import and recovery.

Exit requires zero P0/P1 UI defects, all automated suites green, syntax clean and both GitHub Actions workflows green.

## 7. PR slicing and completion protocol

Every implementation phase follows:

1. read PROJECT_GUIDE.md, this roadmap, CLAUDE.md and relevant authority files;
2. inspect current main, open PRs and live UI;
3. create a phase branch from current main;
4. change one coherent screen family;
5. add behavior/regression coverage;
6. run focused tests;
7. run the complete test suite;
8. run syntax checks;
9. rebuild and perform live browser smoke paths;
10. inspect screenshots at required viewports;
11. open a PR with files, rationale, authority reuse and test evidence;
12. merge only when Blade Vale Tests and Phase 8 Validation are green and the PR is mergeable;
13. squash merge;
14. verify main and update the phase record.

Never weaken, skip or hard-code around a test to make CI pass.

## 8. Definition of done

UIX is complete only when all are true:

1. no rendered platform emoji remains in application UI;
2. Home presents one obvious Continue Adventure action;
3. Chapter and Stage progression is immediately legible;
4. Battle commands are always reachable;
5. Result makes the next meaningful action obvious;
6. dense systems can be scanned without excessive card stacking;
7. every major screen shares the Dark Chronicle visual language;
8. icons are restrained, monochrome, labeled and non-authoritative;
9. no duplicate gameplay/save/progression authority exists;
10. old saves remain compatible;
11. live browser and iPhone-width flows have no P0/P1 defect;
12. full tests, syntax and both CI workflows are green.

## 9. Deferred until UIX closes

Unless needed to repair a UIX regression, defer:

- new Story chapters;
- new Observed Branch content;
- new mastery weapon families;
- new currencies or top-level modes;
- major balance retuning;
- unrelated World expansion;
- broad code cleanup.

Gear Overhaul Phase 6 and later remain valid and resume after UIX-8. UIX-5 may improve presentation of existing Gear Overhaul behavior, but must not change its gameplay rules.

## 10. Handoff summary

The next default task is **UIX-0 — Live UI Inventory and Ownership Audit**.

Do not start by globally deleting emoji or rewriting CSS. First identify every rendered source, its owning renderer, its observer/patch dependencies and the live player path. The first production visual implementation begins in UIX-1 after the audit is merged.
