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

### Rune 2.1 is locked

Read `RUNE_2_1_SPEC.md` before touching Rune code. Chapters 1–36 each own one
Rune, but chapter completion never grants it: the first real post-battle drop
unlocks Lv1, and later levels use existing Gold + Manastone at the Blacksmith.
The six base stat Runes use +1% per mark with explicit caps. Do not restore the
discarded region-wide two-Rune distribution, repeated mark drops, +5% base
scaling, or the four Observed Branch M5 stat-mult Runes.

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
4. run `npm run test:syntax` (cheap, catches real breakage — every commit, no exceptions);
5. for UI/behavior-class changes, verify by actually exercising the flow (live-browser/gameplay check), per the testing policy below;
6. add a new regression test only when the change touches an important data authority or a hard architecture constraint (see "Testing policy" below) — not reflexively for every fix;
7. run the full `npm test` suite before a PR/merge checkpoint, not after every small commit (see "Testing policy");
8. rebuild and run live-browser smoke flows for anything UI-facing;
9. capture/check required mobile viewports for UI-facing work;
10. open a PR;
11. merge only with Blade Vale Tests green and mergeable state clean (the duplicate Phase 8 Validation workflow was removed in #409);
12. squash merge and record the SHA.

Do not weaken or delete an EXISTING test, add skips, use .only, swallow errors or use hard-coded exceptions merely to obtain green CI. The testing policy below is about not reflexively adding MORE tests — it does not license loosening coverage that already exists.

## Testing policy (personal-project scale, agreed with the user 2026-09-06)

This is a solo hobby project, not a team/commercial codebase, and the full regression suite had grown large enough to become a real cost: 344 files / ~18,900 lines, ~14s per run, almost entirely static `assert.match(source, /pattern/)` checks against raw file text — no jsdom, no real DOM/runtime execution. It does not catch UI/runtime-behavior bugs: two real bugs found this session (a dead-UI race in the Blacksmith Rune tab, and a rune-drop coverage gap for chapters 16–36) were both found by actually playing the game, not by any of the then-1655 existing tests. Given that mismatch between cost and actual bug-catching power for this class of bug, testing rigor here is intentionally scaled down:

- `npm run test:syntax` stays mandatory every commit — cheap, and it does catch real syntax breakage.
- `npm test` (the full suite) runs before a PR/merge checkpoint, not after every small commit.
- Add a new regression test only when the change touches an important data authority or one of the "Hard architecture constraints" above (e.g. a cross-file wiring contract that's easy to silently break, a guarantee like "no new currency") — not reflexively for every UI tweak or minor fix.
- Verify UI/behavior-class changes by actually exercising the flow (live-browser/gameplay check) rather than adding a new static regex assertion that would not have caught the bug in the first place.

## Required completion report

Report:

- root cause or design problem;
- files changed;
- implementation change versus test/documentation change;
- authority reused;
- syntax/full(if run)/live-browser results;
- CI results;
- merge SHA;
- known remaining debt.

## Default next action

**Living World & Discovery (`LIVING_WORLD_DISCOVERY_ROADMAP.md`) is the current active workstream.** C2 (Rumor Threads), C3 (Fishing), C4 (Archaeology), C5 (Treasure Hunt 2.0) and C6-1/C6-4/C6-5/C6-6 of C6 (Companion/Ranch Rework: automatic recruitment, deterministic species grade, what grade mechanically unlocks, Ranch collection UI) have all shipped, each reusing existing region/reward/save/battle/Codex authorities with no new currency or save root — see each feature's own commit message for what was verified live. C6-0's audit (done before touching any behavior) found the existing companion system already deeper than the roadmap's abstract sketch assumed (a real `ranchResearch[speciesId].recruited` counter, a `ranchMemory`/Species Board economy, breeding with individual Talent/Nature inheritance, godRoll scoring) — the agreed direction keeps all of that intact; species grade is an additive display layer computed from the existing counter, not a replacement. C6-2/C6-3/C6-7's concerns are effectively already satisfied by that existing counter (no migration was needed). C6-5 (`js/data/monsterRanch.js`'s `speciesGradeTraitMult`, wired into `companionBattle.js`'s `traitEffect()` and the Ranch/collection UI) scales an existing species' own combat trait's power by grade — 1× through Epic, 1.25× at Legendary, 1.5× at Mythic — deliberately not a flat stat ladder, per the roadmap's own C6-5 table and its warning against "another uncapped vertical power ladder." **Open next steps**, in rough priority: C6-9 (what to do with post-Mythic duplicates — deliberately deferred, not blocking); then C7 onward (Settlement Incidents, Region Identity 2.0, Codex 3.0, Hidden Discovery 2.0, Boss/Nemesis identity, Build Identity 2.0, Endgame Purpose Rework) per the roadmap's own recommended sequence — confirm scope with the user before starting a new C-phase, per that phase's own read-before-changing-code list.

A separate, still-open finding from this same session: a real difficulty/pacing problem was found via direct `BattleEngine` simulation — enemy stat scaling (`ENEMY_SCALING` in `js/data/balance.js`, exponential per chapter, explicitly marked "do not change" by its own calibration comment) grows much faster than the stage reward curve (`chapterMult` in `js/data/chapters.js`, linear). The player's real level falls increasingly behind each stage's `recLevel` starting around Chapter 2-3. Not yet acted on — the user has not yet decided whether/how to rebalance the reward-side curve; do not touch `chapterMult`'s coefficients without that decision.

Three older workstreams remain from before this session, still open:

- **Runtime debug backlog** (`CODEBASE_DEBUG_AUDIT_2026-09-05.md`): DBG-01 (Rift Key entry) merged to main as PR #411 (`a3931a068b9ed32cfe1d3362252450cd629b3a54`) and covered by `tests/rift-entry.test.js`; the audit's own fuller acceptance walk (390×844/375×667/desktop: Adventure → discovered branches → owned Rift key → confirm/back → confirm/start → battle → retreat/result → select another key; verify key count survives reload and no used-key replay) has not been separately re-run end to end. After that, continue the audit's remaining reachability/save-schema/battle-authority/UI-interaction batches.
- **Observed Branches M0–M12, including M9's full continuation: ALL COMPLETE.** No Observed Branches milestone remains queued — any further horizontal content (additional Branch Clusters, deeper per-Branch gear) is a new scope decision, not a carried-over item; check with the user before starting more. See `OBSERVED_BRANCHES_M12_AUDIT.md` and `OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md`'s Decision log for the full closeout record. For Story/canon-facing text, read `STORY_CANON.md` and `WORLD_LORE_BIBLE.md` first.
- **UIX-7 — Motion, Feedback and Accessibility Pass** (`UI_OVERHAUL_ROADMAP.md` §6) — has one open item left: the systemic px→rem/`clamp()` dynamic-text-sizing retrofit, deliberately deferred in Phase 1's audit. Phases 1-3a are complete (reduced-motion, safe-area, the viewport-meta pinch-zoom fix, screen-transition fades, loot/unlock feedback, the shared `showToast()` helper). Before starting further work here, decide with the user whether the remaining retrofit is a real Phase 3b or whether Phase 1 + 3a already close the deliverable — an open scope question, not yet settled.
