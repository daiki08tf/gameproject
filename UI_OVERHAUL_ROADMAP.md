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

### [x] UIX-0 — Live UI Inventory and Ownership Audit ✅ COMPLETE

Source/ownership audit: complete in `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md`.

Live-viewport gate: complete. See `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10 for the full record (390×844/375×667/desktop, fresh-save and progressed-save, every required path below except the deep-endgame and safe-return-wording residuals it names). One real navigation bug (Stage IDs/LOCKED cards missing on first entry to a Chapter's Stage list) was found and fixed by this pass.

The user authorized UIX-1 source work to proceed on 2026-09-03 while this environment remains unable to open the local runtime. This does not waive the live acceptance gate.

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

### [x] UIX-1 — Design System and Emoji Removal Foundation ✅ COMPLETE

Source implementation: complete in `css/darkChronicle.css`, `UI_DESIGN_SYSTEM.md` and the shared UI foundation. Live viewport acceptance: complete, see `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10 — the shell (title, header, nav, focus/disabled/pressed states) rendered correctly and emoji-free across all three required viewports in both save states.

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

### [x] UIX-2 — Application Shell and Home Command Center ✅ COMPLETE

Source implementation: complete in the shared navigation, Home organizer and final-integration Home renderer. Live viewport acceptance: complete, see `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10 — fresh-save, cleared-Stage and suspended-Adventure Home states, the Character/Equipment/Records hub accordion (opens one at a time; a second click on an already-open hub's own toggle closes it) and the persistent nav strip all verified at 390×844/375×667/desktop with zero rendered emoji and zero new console/page errors.

The user authorized UIX-2 source work to proceed on 2026-09-03 while this environment remains unable to open the local runtime. The live acceptance gate above closes this authorization's condition.

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

Implemented source contract:

- the context ledger reads existing `CHAPTERS`, `stageProgress` and Adventure4 session state;
- the existing `goStageBtn` remains the only primary Adventure action;
- the context ledger itself is informational, not a competing click target;
- Home and persistent navigation share Home / Adventure / Character / Equipment / Records ownership;
- Character owns Status, Job, Companion and Rebirth; Equipment owns inventory and Blacksmith; Records owns Codex, Abyss, Settlement and restoration;
- build, Story-clear and Abyss signals are derived from existing equipment/progression state;
- Home refresh watches only the screen's active-class transition and does not observe the subtree it rewrites;
- the Home/shared-shell emoji regression scan covers the context ledger, summary and endgame guidance.

### [x] UIX-3 — Stage-first Adventure Suite ✅ COMPLETE

Source implementation: complete in `js/screens/chapterSelect.js`, `js/screens/stageSelect.js`, `js/patches/stageFirstNavigationUi.js`, `js/patches/coreLoopClr17LootIdentityUi.js` and `css/style.css`. Live viewport acceptance: complete, see `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10.

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

Implemented source contract:

- removed every rendered platform-emoji glyph from Chapter selection, World-layer nodes, the Stage ledger, Stage confirm (including 8th Key, Rift/Secret Realm discovery and Observed Branch cards) and the CLR-17 loot-identity panel — the emoji regression scan for these files now asserts zero `\p{Extended_Pictographic}` matches, and `scripts/uix-emoji-check.js`'s application-wide migration ceiling is ratcheted down from 446 to 425;
- stopped rendering the presentation-only `node.icon` (World-layer realm nodes) and `stage.abyssRoute.icon` data fields at their point of render, per `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §5's migration decision — the underlying data fields are untouched;
- replaced bare `★`/`?`/blank state glyphs with explicit `CLEAR` / `LOCKED` / `OPEN` / `BOSS` / `NEW` text across Chapter cards, World-layer nodes, the 8th Key gate, Rift/Secret Realm discovery rows and Observed Branch Stage/Hunt cards — Stage IDs, `stageFirstNavigationUi.js`'s existing `CLEAR`/`NEXT`/`OPEN` labeling and the CLR-13 LOCKED-card contract are unchanged;
- gave `.stage-card`, `.stage-card .cleared`, `.section-heading`, the new `.world3-badge` and `.clr17-loot-identity` a Dark Chronicle treatment (`--dc-ink`/`--dc-iron`/`--dc-brass`/`--dc-observe`/`--dc-danger` tokens, a left-accent bar instead of a full bright border, a text badge instead of a bare colored star) in place of the old per-feature bright rgba borders — inline per-node `style="color:var(--accent)"` badges/notes were moved to `.world3-badge`/`.accent-note` classes;
- verified live at 390×844 (title → Home → Adventure → Chapter → Stage → Stage confirm) with zero rendered emoji, zero new console/page errors and no change to the pre-existing benign `favicon.ico` 404;
- `tests/uix3-stage-first-adventure.test.js` locks the emoji-free contract, the CLEAR/LOCKED/BOSS text states, the data-field-icon migration and the token-based CSS; `tests/core-loop-clr13.test.js`'s locked-card assertion was updated to match (same behavior, emoji dropped).

Live-viewport pass (390×844/375×667/desktop, fresh-save and progressed-save): clean-save Chapter → Stage → Story → Result → next Stage; cleared-Stage → Hunt (Adventure Route) → suspend → Home (`SUSPENDED EXPEDITION`) → resume; Chapter 2 → Observed Branch → Branch Battle → Result; Abyss (locked-on-fresh-save, unlocked-after-progress). Zero rendered emoji on every UIX-3-owned screen in either save state at any viewport; zero new console/page errors. Found and fixed one real pre-existing bug in the same pass: a Chapter card click never queued `stageFirstNavigationUi.js`'s Stage-list enhancement, so a first-ever visit to a Chapter's Stage list showed no Stage ID and no LOCKED cards for undiscovered stages (fixed; regression-tested in `tests/core-loop-clr13.test.js`). Not walked: Rift/Secret Realm/Machine Realm/EX Bounty as additional endgame entries (Abyss stood in), and the Hunt loop's specific `安全に帰還する` wording (only reachable a few waves into a session; the generic suspend action was exercised at the same call site instead). See `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10 for the full record.

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

UIX-0 through UIX-3 are complete, source and live-viewport gate both. See `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10 for the full live-viewport record (390×844/375×667/desktop, fresh-save and progressed-save).

The next default task is **UIX-4 — Text Battle and Result Suite**. Its scope is `js/screens/textBattle.js`, `js/screens/result.js`, `js/patches/fusionBattleUi.js`, `js/patches/combat2SkillModifierUi.js` and Battle/Result selectors in `css/style.css` and mobile CSS. The UIX-3 live pass already located this phase's emoji debt at the source level: the Battle screen's default companion-recruitment icon (`js/patches/companionRecruitment.js`'s `candidate.icon||'🐾'`, out of that file's UIX-6 Companion scope but rendered on the Battle screen) and the Result screen's reward icon (⚙). Follow the same protocol as UIX-3: focused tests, full `npm test`, `npm run test:syntax`, `node scripts/uix-emoji-check.js` with the ceiling ratcheted down by the exact count removed, and a live-browser pass at all three required viewports before checking the phase complete.
