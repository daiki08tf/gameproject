# CLAUDE.md — Blade Vale AI Handoff

## Current active program

**UI Overhaul (UIX)** is the active default priority.

UIX-0 through UIX-5 are complete: source implementation and the live-viewport acceptance gate (390×844/375×667/desktop, fresh-save and progressed-save) both. UIX-6 batch 1 (Status/Job/Rebirth), batch 2 (Companion/Monster Ranch), batch 3 (Settlement facilities) and batch 4 (Codex/Rumor/records) are also complete, same gate. See `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §10–§16 for the full record. UIX-6 batch 5 — Abyss/Rift/Secret Realm/Machine Realm/Bounty-Nemesis — is next and is the final UIX-6 batch; `UI_OVERHAUL_ROADMAP.md` §10 names its known emoji debt (Abyss: 15 glyphs). UIX-7 (Motion, Feedback and Accessibility) follows once it closes.

The stable baseline is main after:

- Stage-first Core Loop Rework CLR-12–21;
- PR #401/#402 roadmap closeout;
- PR #403 live-browser playability and MutationObserver fixes;
- UIX-0–5 (source and live-viewport gate).

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

Continue UIX-6 — Character, Ranch, Settlement, Records and Endgame, with batch 5 (Abyss/Rift/Secret Realm/Machine Realm/Bounty-Nemesis) next — the final UIX-6 batch (scope and known emoji debt: `UI_OVERHAUL_ROADMAP.md` §10; Abyss: 15 glyphs, confirmed still present and untouched through every prior batch's live pass). Once it closes, move to UIX-7 (Motion, Feedback and Accessibility). Follow the same protocol as UIX-3–6b4: run a full static source scan for ground-truth emoji counts across every file that renders into the target screen's container, not just the files a prior note named, and check every file — even ones with zero emoji literals of their own — for data-object `icon`-field consumption (see `UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md` §13–§16: every batch so far has found at least one such blind spot; batch 4 found `ENEMY_ROLES` icons leaking into three separate Codex render sites this way, on top of the Battle-screen instance batch 3 had already flagged and this batch then fixed with a `【role name】` text tag rather than dropping the reward signal outright), focused tests, full `npm test`, `npm run test:syntax`, ratchet `scripts/uix-emoji-check.js`'s ceiling down by the exact count removed, and a live-browser pass at 390×844/375×667/desktop before checking a batch complete. Do not claim a batch complete until that live gate is recorded, matching the standard UIX-0–6b4 set.
