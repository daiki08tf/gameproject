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

**Living World & Discovery (`LIVING_WORLD_DISCOVERY_ROADMAP.md`) is the current active workstream. C6 (Companion / Ranch Rework) is now fully closed.** C2 (Rumor Threads), C3 (Fishing), C4 (Archaeology), C5 (Treasure Hunt 2.0), and all of C6's sub-items are shipped: C6-1 (automatic recruitment), C6-4 (deterministic species grade), C6-5 (grade scales an existing species trait's power via `speciesGradeTraitMult` — 1× through Epic, 1.25× Legendary, 1.5× Mythic — deliberately not a flat stat ladder), C6-6 (Ranch collection UI), and C6-9 (a post-Mythic duplicate recruit now feeds the existing, itself-capped Species Board memory economy via `POST_MYTHIC_RECRUIT_MEMORY_BONUS`, instead of doing nothing). C6-2/C6-3/C6-7 were already satisfied by the pre-existing `ranchResearch[speciesId].recruited` counter per the C6-0 audit (no migration needed). C6-8 (Discovery integration — species reacting to Treasure Hunt/Fishing/Archaeology/Region/Rumor) is the one C6 sub-item intentionally NOT started: it's a distinct, separately-scoped content pass, not a blocker to calling C6 itself done. Every C6 change reused existing region/reward/save/battle/Codex authorities — no new currency, no new save root, no new battle authority. **C7 (Settlement Incidents) is now in progress.** Before writing any code, a C7-0 audit found more existing depth than the roadmap assumed: `js/data/settlementDefense.js`'s `SETTLEMENT_INVASIONS` is already a real "Incident" system (beast/bandit/Nemesis/Rift raids, market theft, curfew brawls) already satisfying C7's own "no real-time expiry" requirement and already covering several of C7's roadmap examples. The two genuine gaps were a non-combat incident, and Incident↔Rumor cross-referencing (C7's own "Incident = something happening" / "Rumor = what's known about it" distinction was never actually wired for the existing Defense incidents). C7-1 (`js/data/settlementIncidents.js`, `js/patches/settlementIncidents.js`/`settlementIncidentsUi.js`) ships one concrete incident, 謎の遺物漂着 (Mysterious Artifact Arrival), covering both gaps: resolved through Archaeology's (C4) own pure round-resolution engine reused directly (no new minigame), and its resolution writes into the existing Rumor Notebook (`state.data.world2.discoveries`) using the exact shape C2/C5 already established. C7-2 closed the other half of the gap: the 6 pre-existing `SETTLEMENT_INVASIONS` Defense incidents (beast/bandit/Nemesis/Rift raids, market theft, curfew brawl) now write into the same Rumor Notebook too — each got an authored `resolvedHint` (`js/data/settlementDefense.js`) shown once first-cleared, replacing its pre-clear `desc`, via the same sync-on-every-read convention as C7-1/`treasureHunt.js`. **C7-3 shipped a second, genuinely different incident archetype**: 住民失踪 (Resident Disappearance), `kind:'investigation'` — pick the one correct `lead` out of several authored candidates (a wrong pick is a free, repeatable miss with its own `missHint`, no session/busy-guard needed), deliberately NOT another excavation-flavored incident, so Incidents don't converge on one mechanic. Both archetypes now live in the same `settlementIncidents.js`/`settlementIncidentsUi.js` pair, branching on `incident.kind`, sharing one `grantAndResolve()` reward helper. **C6-8 (Discovery integration) is now also shipped** (`js/data/companionDiscoveryReactions.js`): flavor-only reaction lines (never touching reward/odds) attached to a discovery result when a matching-family companion is in the active party — `family:'undead'` reacts to Archaeology (謎の遺物漂着/site digs), `family:'spirit'` reacts to Treasure Hunt claims, both matched honestly to family tags that already exist in the companion roster rather than inventing new categorization data. The roadmap's other 3 example reactions (aquatic/amphibious→Fishing, territorial→Region ecology, social/intelligent→Settlement/Rumor) have no equally clean existing tag to hang off of and are deliberately left as a later continuation. **C8 (Region Identity 2.0) is now in progress — C8-1 shipped.** A C8-0 audit found the pieces of a region's "coherent bundle" already exist for the 4 mortal regions (native companion species, Fishing, Archaeology, Treasure Hunt) but were scattered across separate screens with no unified view — the Chapter Select screen groups by `WORLD3_REGIONS` but only shows chapter name/recLevel/clear state. C8-1 (`js/data/regionCodex.js`, `js/patches/regionCodex.js`/`regionCodexUi.js`) is a pure READ-side aggregation — `state.regionCodexList()` reads straight through the already-existing `state.fishingSpots()`/`state.fishCodex()`/`state.archaeologySites()`/`state.treasureHunts()` plus the existing enemy Codex — no new save data at all. Lives inside the Monster Codex screen as a new 地域 tab. Two real bugs caught before/via verification: companion species' own `regionId` (chapter-scoped, e.g. `'ch1'`) is a different id namespace from `WORLD3_REGIONS` ids (`'frontier'`) and needed resolving through `world3RegionForChapter()`; and `monsterCodexCompactUi.js`'s JS-side `TABS` list alone wasn't enough — `css/monsterCodexCompact.css` has its own separately-hardcoded per-tab show rule, missed until live-browser testing caught the tab staying `display:none` (now locked in with a regression test). Scope: only the 4 mortal regions (the 5 later regions past Ch15 have none of Fishing/Archaeology/Treasure Hunt yet, so are deliberately excluded rather than shown empty). **C8-2 shipped Boss/hidden-threat identity** into the same Region Codex card: `regionBossSummary()` (`js/data/regionCodex.js`) reads the existing `boss:true`/`branch:true` stages from `CHAPTERS` directly — no new content — and withholds a boss/hidden-threat's name (shown as `???`) until its own chapter is individually unlocked, matching `chapterSelect.js`'s own convention exactly, so nothing spoils ahead of the player's own progress. Verified live: clearing chapter 1 correctly revealed chapter 2's boss name in frontier's card while the other 3 regions still showed `???` for their own unreached first chapter. **C8-3 shipped Rare encounter identity**, completing C8's originally-scoped "bundle" (ecology, fish, archaeology, Rumor, boss/hidden threat, rare encounter) for the 4 mortal regions. Reuses the existing Enemy 2.0 rare-role system directly (`enemies.js`'s `rareIdentity:true`, one per chapter) and the existing enemy Codex's `seen` flag — no new rare-enemy authority, no new discovery flag. **C8-4 shipped Rune target per region**, fully closing C8's originally-scoped bundle (ecology, fish, archaeology, Rumor, boss/hidden threat, rare encounter, Rune) for the 4 mortal regions. Reuses Rune 2.1 directly — `RUNE2_DEFS` (`data/runes2.js`) already gives each numbered Story chapter exactly one Rune; `regionCodex.js`'s `runes()` only maps each Rune's `chapter` to its `WORLD3_REGIONS` home and reads the existing `state.rune2OwnedMarks(id) > 0` — no new Rune authority, no new ownership flag. **C8's originally-scoped work is now complete.** **C9 (Codex 3.0 / Field Research) is now in progress — C9-1 shipped.** Per the user's approved proposal, C9-1 connects the EXISTING per-enemy knowledge ladder (`codexEnemyKnowledge.js`'s `state.enemyKnowledge()` — `roleKnown` flips true on a real kill, not a new flag) to Archaeology's Reconstructed Records and Treasure Hunt's resolution text. `js/data/fieldKnowledge.js` (pure: `regionFieldKnowledgeReady()` — ready once at least half a region's native, non-boss enemy types have `roleKnown`; plus the 8 authored field-note texts, 4 per system, one per mortal region) + `js/patches/fieldKnowledge.js` (`state.regionFieldKnowledgeReady(regionId)`/`state.archaeologyFieldNote(recordId)`/`state.treasureHuntFieldNote(chainId)`, all pure reads, no new save data). Wired into `archaeologyCodexUi.js`'s `recordRow()` and `treasureHuntUi.js`'s `huntCard()` (both the initial resolved render and the claim-button re-render) as a flavor line appended after the record/chain's own existing text — same "supplement, never gate" principle C6-8's companion reactions already established: a record/hunt still unlocks/resolves on its own existing condition regardless of field knowledge. Verified live (Playwright, injected save): with frontier's native enemy types' `roleKnown` false, the field note is absent from both the Archaeology Codex record and the Treasure Hunt resolved card; with them true, both show the exact authored note text. **C9-2 shipped Fishing hints**, the third item C9's own goal list names ("Treasure hints; Archaeology interpretation" done in C9-1, "Fishing hints" now done too). `FISHING_FIELD_NOTES` (`js/data/fieldKnowledge.js`) adds one authored note per region's own ヌシ (master fish, `FISH_SPECIES`' `master:true` entry) and `state.fishingFieldNote(fishId)` (`js/patches/fieldKnowledge.js`) mirrors `archaeologyFieldNote()`/`treasureHuntFieldNote()` exactly, gated by the same `regionFieldKnowledgeReady()`. Wired into `fishingCodexUi.js`'s `fishRow()`, appended after the fish's own flavor text — same supplement-never-gate principle, the catch/bonus/discovery state is unaffected either way. Verified live the same way: field note absent with `roleKnown` false, present with the exact authored text once true, for `frontier_nushi`. **C9-3 shipped Rare encounter conditions**, the fourth item C9's own goal list names. Rare encounters (`enemies.js`'s `rareIdentity:true`, one per chapter, already surfaced as a region-level count by C8-3's Region Codex) have no per-item authored text of their own to append to (unlike a Record/chain/ヌシ), so `RARE_ENCOUNTER_FIELD_NOTES` (`js/data/fieldKnowledge.js`) is keyed by region instead, and `state.rareEncounterFieldNote(regionId)` (`js/patches/fieldKnowledge.js`) mirrors the same `regionFieldKnowledgeReady()` gate. Wired into `regionCodexUi.js`'s `regionCard()`, appended after the region's own "レア個体 遭遇 X/Y" summary line, and only looked up once `rareSeen > 0` (the region's own condition — at least one rare type actually encountered — mirroring `f.seen`/`hunt.stage==='resolved'` in C9-1/C9-2). Deliberately does not spell out the numeric spawn-chance mechanic, matching the flavor-only convention of every other hint in this codebase. Verified live: with `roleKnown` false the frontier region card (rareSeen 4/4) shows no note; with it true, the exact authored note is appended after the summary line; the other 3 regions (no rare seen yet) show no note either way, in both cases. **C9-4 shipped Secret clues**, the fifth item C9's own goal list names. A region's own 隠し脅威 (hidden branch stage, C8-2's `regionBossSummary()`) has no per-item authored text either, so `SECRET_CLUE_FIELD_NOTES` (`js/data/fieldKnowledge.js`) mirrors `RARE_ENCOUNTER_FIELD_NOTES` exactly (keyed by region) and `state.secretClueFieldNote(regionId)` mirrors `rareEncounterFieldNote()` exactly. Wired into the same `regionCodexUi.js` `regionCard()`, appended after the region's own "隠し脅威 討伐 X/Y" line (both notes now stack when both conditions are met), only looked up once at least one hidden threat's chapter has actually been unlocked (`hiddenThreats.some(h => h.name)` — never spoiling ahead of `chapterSelect.js`'s own convention). Verified live: with `roleKnown` false, frontier (chapter 1 always-unlocked, so its 1-B hidden threat is already "revealed" by that gate) shows neither the rare nor the secret-clue note; with it true, BOTH authored notes appear stacked in the correct order; the other 3 regions (first chapter not yet unlocked) show neither note either way. **C9's own goal-list items are now 5/7 done** (Archaeology interpretation, Treasure hints, Fishing hints, Rare encounter conditions, Secret clues). The remaining 2 — **enemy weaknesses/behaviors is judged already satisfied**: `codexEnemyKnowledge.js`'s existing `roleKnown`/`behaviorKnown`/`observedSkills`/`affinityKnown`/`observedAffinities` ladder, already rendered in the base Monster Codex (`codexUi.js`'s `knowledgeRows()`), directly IS this goal-list item — no new field-knowledge code needed or shipped for it. **C9-5 shipped Rumor contradictions**, the sixth item C9's own goal list names, closing the design gap flagged above. A C9-0 audit (done with the user, design confirmed via explicit discussion before implementation) found `ch1RumorThreads.js` already contains two genuinely contradicting testimony threads (`gate_scar`/`valley_echo` — two residents' accounts explicitly framed in-fiction as not matching each other), but that thread-with-entries system exists ONLY for Chapter 1/frontier — the other 3 mortal regions have no equivalent. Unlike C9-1..4 (a pure connecting note over EXISTING text), the user explicitly chose to author small NEW content here to keep the same one-per-region symmetry C9-3/C9-4 established: `RUMOR_CONTRADICTIONS` (`js/data/fieldKnowledge.js`) is one new authored pair of conflicting testimony lines (`accountA`/`accountB`, each with a named source) per mortal region, always visible (non-spoiling flavor, same as an unresolved Rumor Notebook entry) — plus a `resolution` line gated behind the same `regionFieldKnowledgeReady()` as every other C9 note. `state.rumorContradiction(regionId)` (ungated) / `state.rumorContradictionFieldNote(regionId)` (gated) in `js/patches/fieldKnowledge.js` mirror the C9-3/C9-4 contract exactly. Wired into the same `regionCodexUi.js` `regionCard()`: the two accounts render as an always-shown "噂の食い違い" line, the resolution stacks after the rare/secret-clue notes once ready. `ch1RumorThreads.js`'s own gate_scar/valley_echo remain untouched in the Rumor Notebook, independent of this. Verified live across all 4 regions (Playwright, injected save): the two accounts show unconditionally in every region regardless of `roleKnown`; the resolution line appears only once `roleKnown` is true, correctly stacked after the C9-3/C9-4 notes where those also apply. **C9's own goal-list items are now 6/7 shipped + 1/7 already-satisfied (enemy weaknesses/behaviors) — C9 is functionally complete.** **Open next steps**: move to C10 (Hidden Discovery / Secret 2.0); address one of the three carried-over decision points (difficulty/reward curve rebalance, UIX-7's px→rem retrofit scope, DBG-01's full acceptance walk); or merge the accumulated C9-1/2/3/4/5 work into `main`. C7/C6-8's remaining continuations (a 3rd Settlement Incident archetype; the 3 deferred C6-8 reaction categories) remain optional follow-ups, not blockers.

A separate, still-open finding from this same session: a real difficulty/pacing problem was found via direct `BattleEngine` simulation — enemy stat scaling (`ENEMY_SCALING` in `js/data/balance.js`, exponential per chapter, explicitly marked "do not change" by its own calibration comment) grows much faster than the stage reward curve (`chapterMult` in `js/data/chapters.js`, linear). The player's real level falls increasingly behind each stage's `recLevel` starting around Chapter 2-3. Not yet acted on — the user has not yet decided whether/how to rebalance the reward-side curve; do not touch `chapterMult`'s coefficients without that decision.

Three older workstreams remain from before this session, still open:

- **Runtime debug backlog** (`CODEBASE_DEBUG_AUDIT_2026-09-05.md`): DBG-01 (Rift Key entry) merged to main as PR #411 (`a3931a068b9ed32cfe1d3362252450cd629b3a54`) and covered by `tests/rift-entry.test.js`; the audit's own fuller acceptance walk (390×844/375×667/desktop: Adventure → discovered branches → owned Rift key → confirm/back → confirm/start → battle → retreat/result → select another key; verify key count survives reload and no used-key replay) has not been separately re-run end to end. After that, continue the audit's remaining reachability/save-schema/battle-authority/UI-interaction batches.
- **Observed Branches M0–M12, including M9's full continuation: ALL COMPLETE.** No Observed Branches milestone remains queued — any further horizontal content (additional Branch Clusters, deeper per-Branch gear) is a new scope decision, not a carried-over item; check with the user before starting more. See `OBSERVED_BRANCHES_M12_AUDIT.md` and `OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md`'s Decision log for the full closeout record. For Story/canon-facing text, read `STORY_CANON.md` and `WORLD_LORE_BIBLE.md` first.
- **UIX-7 — Motion, Feedback and Accessibility Pass** (`UI_OVERHAUL_ROADMAP.md` §6) — has one open item left: the systemic px→rem/`clamp()` dynamic-text-sizing retrofit, deliberately deferred in Phase 1's audit. Phases 1-3a are complete (reduced-motion, safe-area, the viewport-meta pinch-zoom fix, screen-transition fades, loot/unlock feedback, the shared `showToast()` helper). Before starting further work here, decide with the user whether the remaining retrofit is a real Phase 3b or whether Phase 1 + 3a already close the deliverable — an open scope question, not yet settled.
