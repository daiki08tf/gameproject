# CLAUDE.md — Blade Vale AI Handoff

## Current active program

**Confirmed runtime debug fixes** currently precede further UI Overhaul (UIX) production work. Read `CODEBASE_DEBUG_AUDIT_2026-09-05.md` for the current debug backlog.

- PR #408: mobile Option Fusion fix merged.
- PR #409: audit baseline and duplicate Phase 8 CI removal merged.
- PR #410: Machine World semantic routing merged at `c2d9a88a2cc49922372a560b2cc070062d0760d5`.
- DBG-01 implementation: Rift Key entry / one-time consumption / safe result return implemented; browser acceptance pending. See audit handoff and `tests/rift-entry.test.js`.

UIX-0 through UIX-5 are complete: source implementation and the live-viewport acceptance gate (390×844/375×667/desktop, fresh-save and progressed-save) both. **UIX-6 is now fully complete** — all five batches (Status/Job/Rebirth, Companion/Monster Ranch, Settlement facilities, Codex/Rumor/records, Abyss/Rift/Secret Realm/Machine Realm/Bounty-Nemesis) have closed the same source contract and live-viewport gate. See `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10–§17 for the full record. **UIX-7 (Motion, Feedback and Accessibility) is in progress** — Phase 1 (foundation audit + first fixes), Phase 2 (screen-level transition rules) and Phase 3a (loot/unlock feedback) are all complete; see `UI_OVERHAUL_ROADMAP.md` §6 UIX-7 for the deliverable-by-deliverable status and all phase records.

The stable baseline is main after:

- Stage-first Core Loop Rework CLR-12–21;
- PR #401/#402 roadmap closeout;
- PR #403 live-browser playability and MutationObserver fixes;
- UIX-0–6 (source and live-viewport gate).

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
11. merge only with Blade Vale Tests green and mergeable state clean (the duplicate Phase 8 Validation workflow was removed in #409);
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

Two independent workstreams currently have open next actions:

- **Runtime debug backlog** (`CODEBASE_DEBUG_AUDIT_2026-09-05.md`): DBG-01 (Rift Key entry) is implemented and covered by `tests/rift-entry.test.js`, but its live-browser acceptance (390×844/375×667/desktop: Adventure → discovered branches → owned Rift key → confirm/back → confirm/start → battle → retreat/result → select another key; verify key count survives reload and no used-key replay) is still pending — the debug-session browser attempt was blocked by `net::ERR_BLOCKED_BY_CLIENT`. After that, continue the audit's remaining reachability/save-schema/battle-authority/UI-interaction batches.
- **UIX-7 — Motion, Feedback and Accessibility Pass** (`UI_OVERHAUL_ROADMAP.md` §6) — has one open item left before it can be marked complete: the systemic px→rem/`clamp()` dynamic-text-sizing retrofit named as a deliberately-deferred finding in Phase 1's audit (dozens of files, real separate work). Phase 1 closed reduced-motion support, safe-area handling, the no-animation-blocks-farming check, the highest-leverage readable-dynamic-text-sizing fix (the viewport meta tag was disabling pinch-zoom app-wide — this already substantially addresses the WCAG 1.4.4 leverage point the deferred retrofit would also target), a numeric color/contrast audit, and a keyboard/focus helper (`js/patches/overlayA11y.js`) applied to all three ad-hoc overlays. Phase 2 added a CSS-only short fade-in for every screen transition (`.screen` moved from `display:none` to `visibility:hidden`, so it could be animated at all, using the existing `--dc-motion-base` token) — zero JS changes needed across the dozen+ files that call `showScreen()`. Phase 3a added a short entrance animation plus brass jackpot/special-tier highlighting for Result-screen loot chips, and a new shared `showToast()` helper (`js/patches/toastFeedback.js`) extending visual feedback to five previously sound-only Blacksmith/Rebirth success moments. See `UI_OVERHAUL_ROADMAP.md` §6 UIX-7 for all phase records in full. Before starting further work, decide with the user whether the remaining px→rem retrofit should be pursued as a further Phase 3b or whether UIX-7's dynamic-text-sizing deliverable is adequately closed by Phase 1 + Phase 3a — this is an open scope question, not yet settled. This remains a different shape of phase than UIX-6's per-screen emoji/token migration — read PROJECT_GUIDE.md and RELEASE_CANDIDATE_AUDIT.md per the read-before-changing-code list before each new slice, keep each phase's diff scoped to one coherent concern (not one screen family), add regression tests, and do a live-viewport pass before marking a phase complete. Also keep the found-and-fix habit UIX-6/UIX-7 Phase 1 both relied on: a static scan or a prior phase's claim of "complete" doesn't preclude a live-viewport pass surfacing a real gap (Phase 1 found two more emoji leaks this way, in `abyssRunUi.js` and `battleIntegration3.js`/`combat2Elements.js`) — fix what's found, don't defer it just because it's outside the current slice's original file list. `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10–§17 records the closed UIX-6 program for reference on established conventions (Dark Chronicle tokens, the emoji-free contract, the DOM-safety/MutationObserver idempotency rules) that UIX-7 must continue to respect.

The UIX-0–2 live-viewport paragraph previously here (from `fix/rift-key-entry`'s base) predates this branch's actual UIX progress: UIX-0 through UIX-6 are already source-and-live-viewport complete per §"Current active program" above and `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10–§17 — that older instruction does not apply to this branch's state.
