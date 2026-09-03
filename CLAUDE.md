# CLAUDE.md — Blade Vale AI Handoff

## Current active program

**UI Overhaul (UIX)** is the active default priority.

UIX-0 through UIX-3 are complete: source implementation and the live-viewport acceptance gate (390×844/375×667/desktop, fresh-save and progressed-save) both. See `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10 for the full record. UIX-4 (Text Battle and Result Suite) is next; `UI_OVERHAUL_ROADMAP.md` §10 names its scope and the emoji debt already located at the source level.

The stable baseline is main after:

- Stage-first Core Loop Rework CLR-12–21;
- PR #401/#402 roadmap closeout;
- PR #403 live-browser playability and MutationObserver fixes;
- UIX-0–3 (source and live-viewport gate).

## Read before changing code

1. PROJECT_GUIDE.md
2. UI_OVERHAUL_ROADMAP.md
3. ROADMAP.md
4. RELEASE_CANDIDATE_AUDIT.md
5. docs/MUTATION_OBSERVER_SAFETY.md
6. the authority and integration files for the target screen
7. the relevant regression tests

For Equipment work also read:

- GEAR_OVERHAUL_ROADMAP.md
- GEAR_OVERHAUL_AUDIT.md

For Story/canon-facing labels also read:

- STORY_CANON.md
- WORLD_LORE_BIBLE.md

## Locked product direction

Blade Vale is a text-first hack-and-slash RPG.

Player-facing navigation remains:

~~~text
Home → Adventure → Chapter → Stage → Story / Hunt
~~~

Visual direction is **Dark Chronicle**: black iron, soot navy, ash white, restrained aged metal, record/ledger/map structure, sharp geometry and dense readable information.

**Rendered application UI must contain no platform emoji.**

Do not blindly rewrite authored Story/canon text. Distinguish decorative UI glyphs from content before editing.

Do not replace emoji with a large generic icon library. Prefer text and hierarchy. If an icon is necessary, use a restrained monochrome SVG/CSS icon with a visible label.

## Hard architecture constraints

Do not create:

- new Story progression;
- new Loot/Battle/Equipment authority;
- Hunt Lv or Hunt currency;
- stamina or energy;
- new save root;
- new World Tier authority;
- UI-only progression that can disagree with canonical state.

Reuse existing CHAPTERS/stageProgress, BattleEngine/TextBattleScreen, reward/equipment pipelines, Adventure4 session, World Tier and discovery/Codex authorities.

Preserve save compatibility, DOM/event contracts and Stage-first navigation.

No framework migration or big-bang rewrite.

## DOM safety

The UI is patch-heavy. Before moving or replacing DOM, identify:

- the original renderer;
- all patches that decorate or replace it;
- MutationObservers watching the subtree;
- module import/wrapper order;
- source-pattern regressions and live-browser behavior.

All observer-triggered writes must be idempotent. Use established helpers in js/patches/domSafety.js where applicable. Never rely on unconditional textContent, classList, appendChild, remove/recreate or innerHTML writes inside an observed subtree.

## Work protocol

For each phase:

1. inspect current main and open PRs;
2. reproduce/audit live behavior;
3. keep the diff phase-scoped;
4. add focused behavior regression tests;
5. run focused tests;
6. run npm test;
7. run npm run test:syntax;
8. rebuild and run live-browser smoke flows;
9. capture/check required mobile viewports;
10. open a PR;
11. merge only with Blade Vale Tests and Phase 8 Validation green and mergeable state clean;
12. squash merge and record the SHA.

Do not weaken tests, add skips, use .only, swallow errors or use hard-coded exceptions merely to obtain green CI.

## Required completion report

Report:

- root cause or design problem;
- files changed;
- implementation change versus test/documentation change;
- authority reused;
- focused/full/syntax/live-browser results;
- CI results;
- merge SHA;
- known remaining debt.

## Default next action

Begin UIX-4 — Text Battle and Result Suite (scope and known emoji debt: `UI_OVERHAUL_ROADMAP.md` §10). Follow the same protocol as UIX-3: focused tests, full `npm test`, `npm run test:syntax`, ratchet `scripts/uix-emoji-check.js`'s ceiling down by the exact count removed, and a live-browser pass at 390×844/375×667/desktop (fresh-save and a save with at least one Stage cleared, to see both the victory and a subsequent Result) before checking the phase complete. Do not claim it complete until that live gate is recorded, matching the standard UIX-0–3 set.
