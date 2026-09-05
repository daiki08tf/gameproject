# Blade Vale — Codebase Debug Audit 2026-09-05

> Baseline: `main` at `2e3530080f5193404484ba341f8c714cb1c15235` (PR #408)
>
> Scope: runtime safety, reachability, authority ownership, save compatibility, mobile operability, CI coverage and dead/incomplete code. This document is an audit record, not a license to redesign gameplay while fixing bugs.

## Audit rules

- Reproduce or establish a concrete code path before calling something a bug.
- Preserve existing gameplay authorities and save compatibility.
- Do not add currencies, progression axes, Home routes or parallel save roots as a fix.
- Prefer one focused PR per independent runtime problem.
- Do not weaken tests merely to make CI green.

## Baseline confidence

PR #403 performed the last broad live-browser sweep before UIX-0–2. It fixed multiple real MutationObserver self-loops, a Stage-first navigation race and mobile reachability issues, then recorded a successful full-menu/battle Playwright pass. Since that baseline, production runtime changes are concentrated mainly in UIX-1, UIX-2 and PR #408.

The current CI runs syntax checking and the Node regression suite, but no browser interaction smoke test. Therefore a green PR can still miss listener races, MutationObserver loops, clipped mobile controls and WebView-only interaction failures. PR #403 and PR #408 are direct examples of this gap.

## Findings

| ID | Severity | Status | Finding | Evidence / impact | Action |
|---|---|---|---|---|---|
| DBG-01 | HIGH | IMPLEMENTED / LIVE PENDING | Rift Key had no player-entry or resolver path | `riftKeyCore.js` creates, stores and consumes keys; `stageSelect.js` displays the owned count; `riftStages.js` can build a playable Rift stage. However `findStage()` has no Rift resolver and the UI exposes no key-entry action. `BattleEngine` only starts from `findStage(stageId)`, so the built Rift stage cannot currently enter the canonical text battle path. This was also explicitly left unresolved in PR #403. | Implementation now lists owned keys in discovered branches, resolves them through `findStage(id, ownedKeys)` / `buildRiftStage`, and consumes via the existing `consumeRiftKey` only after BattleEngine initialization. Preview/back never consumes; duplicate start is ignored; used/malformed keys return to selection; result retry selects another key. Stage-first detail clears stale Hunt controls. Node renderer/entry regression is covered; real-browser acceptance remains pending. |
| DBG-02 | MEDIUM | CONFIRMED | Browser/runtime interaction is not covered by CI | `.github/workflows/test.yml` runs syntax + `npm test`; the former legacy Phase 8 workflow ran the same two commands. Neither runs a DOM/browser smoke path. Static/source-contract tests previously passed while live UI was frozen or misrouted. | Add a small browser smoke gate rather than trying to encode every UI behavior as source regex. Keep it bounded: boot, Home, Chapter/Stage, one battle, Equipment, Blacksmith, Ranch/Companion and return navigation. |
| DBG-03 | LOW | FIXED IN #409 | CI was duplicated | `Blade Vale Tests` and `Phase 8 Validation` both ran the same Node version, syntax check and full `npm test` on PR and main push. | PR #409 retired the duplicate Phase 8 workflow; keep one canonical Node regression workflow. |
| DBG-04 | MEDIUM | CONFIRMED / ARCHITECTURE DEBT | UI-only Phase 14 persists a top-level `state.data.ui14` root | `finalIntegrationUi.js` creates `ui14` and saves recent/favorite Stage IDs even though the current roadmap says to avoid parallel save roots and UIX describes presentation work as authority-neutral. It is already live, so deleting or moving it blindly would break saved preferences. | Do not hot-remove. During save-schema review, either formally grandfather it as presentation metadata or migrate it into an approved existing settings/UI metadata owner with backward-compatible read/migration. |
| DBG-05 | LOW | CONFIRMED | `numericSafety.js` is orphaned runtime utility | PR #403 already established that the helper has tests/docs but no runtime consumer. Current production behavior therefore does not benefit from the utility it tests. | Decide per call site during numeric audit: either wire it into the canonical number-presentation boundary or remove it if the active presentation layer already owns equivalent behavior. Do not keep a tested-but-unused “safety” module indefinitely. |
| DBG-06 | REVIEW | NOT A BUG YET | Rune 2.0 remains active after legacy weapon Rune retirement | `legacyRuneRetirement.js` removes old inventory/socket Rune behavior, but `rune2Core.js` still owns persistent Rune 2.0 marks, modifies stats and rolls drops, and `rune2Ui.js` exposes them in Blacksmith. This is not dead code; it is a separate active progression system. | Game-design review must decide whether Rune 2.0 is intended. Do not delete it as technical cleanup because it currently affects character stats and saves. |
| DBG-07 | LOW | CONFIRMED | Emoji-free rule is not globally complete | `ROADMAP.md` now requires rendered application UI to use no platform emoji, while current Stage/World/Rune surfaces still contain pictographic labels. UIX intentionally left feature-body migration incomplete, so this is known presentation debt rather than a runtime defect. | Keep under UIX/design review; do not mix mass emoji cleanup into gameplay bug PRs. |
| DBG-08 | MEDIUM | RISK / NEEDS DATA CHECK | Phase 14 identifies Stage cards by fuzzy display-name matching | `finalIntegrationUi.js::stageFromCard()` strips decoration and resolves with `name.includes(s.name) || s.name.includes(name)` instead of a canonical Stage ID. If two live cards share/subsume names, recent/favorite metadata can attach to the wrong Stage. | Audit current Stage-name collisions. If any exist, fix immediately. Long term, Stage renderers should provide `data-stage-id` and the UI decorator should consume that canonical ID rather than infer identity from text. |
| DBG-09 | HIGH | FIXED IN #410 | Machine World Realm route drifted into Story Ch26 and leaked into Story continuation | `WORLD3_REALM_NODES.modern` still used historical `route:25`, which meant Machine World only while Story ended at Ch25. After Story expanded to Ch35, index 25 is Story Ch26. Separately, `phase9MachineWorldRuntime.js` appends the Machine World pseudo chapter to `CHAPTERS`, so `nextStageAfter()` could make it the automatic successor to Ch35 and Phase 14 could count it as `NEXT STORY`. | Use semantic `route:'machine_world'` and resolve it by chapter id at render time. Story continuation/Home Story scans must identify canonical Story chapters rather than every runtime object appended to `CHAPTERS`. Regression tests inject a pseudo chapter after Ch35 to prove no leakage. |
| DBG-10 | MEDIUM | ARCHITECTURE DEBT | `CHAPTERS` doubles as Story authority and dynamic Stage registry | Machine World appends a pseudo chapter (`id:'machine_world', num:26`) and Settlement Arena appends a hidden pseudo chapter (`id:'settlement_arena', num:999`) so generic Stage lookup/navigation can see generated content. This creates index/`num` collisions and makes Story-wide scans unsafe by default. | Do not refactor in the focused route fix. Future runtime-authority review should define a semantic generated-stage registry/resolver or an explicit chapter-kind contract, while preserving `findStage()` as the single BattleEngine entry authority. |

## Recent-change audit (after PR #403)

### UIX-1 / UIX-2

- Home refresh observer watches only `#homeScreen` class changes, not the subtree it rewrites; no self-loop was found in that path.
- `uiFoundationBootstrap.js` screen observer only mutates the separate persistent nav, so it does not match the previous self-observing subtree failure pattern.
- `finalIntegrationUi.js` Stage-list observer performs bounded decoration: cards are marked before child insertion and the filter strip is only inserted once. It can schedule extra passes but the inspected path is idempotent rather than an infinite self-loop.
- The largest remaining correctness risk in this layer is identity inference by Stage display text (DBG-08), not observer recursion.

### PR #408

- The Option Fusion mobile fix preserves the existing `state.fuseEquipmentOption` authority and material protections.
- Native `confirm()` dependency was removed from that flow and replaced with inline two-step confirmation, eliminating the specific iOS embedded-browser failure reported by live testing.

## Runtime reachability notes

- Story / Abyss / Secret Realm / Raid / Observed Branch have explicit `findStage()` resolution paths or canonical Chapter Stage objects.
- Rift entry is implemented by DBG-01. `findStage` receives the existing owned-key array explicitly, keeping data lookup free of a state import or a second registry; consumed keys cannot resolve again.
- Machine World Stage builders are live and registered through the existing runtime bridge, but their Realm entry had become detached from the pseudo chapter by a stale numeric index (DBG-09).
- Settlement Arena is reachable through its dedicated event and intentionally uses a temporary Stage object, but its registration into `CHAPTERS` is part of DBG-10 architecture debt.

## Next audit batches

1. **Runtime reachability:** validate DBG-01 in a live browser, then audit every generated/endgame Stage builder vs actual selectable/startable path. DBG-09 was merged in #410 (`c2d9a88a2cc49922372a560b2cc070062d0760d5`).
2. **Save-schema audit:** enumerate every `state.data.*` root, owner module, migration/default behavior and whether it is still live.
3. **Battle/reward authority audit:** verify each Story/Hunt/Abyss/Rift/Secret/Observed Branch route enters the same BattleEngine and applies World Tier/reward modifiers exactly once.
4. **UI interaction audit:** all MutationObservers, destructive actions, mobile overflow, fixed-nav overlap and route listener ownership.
5. **Dead-code audit:** imports/exports with no runtime callers, retired legacy systems and duplicate docs/scripts; separate harmless historical files from code still affecting state.
6. **CI hardening:** one canonical Node suite plus a small live-browser smoke gate.

## Do not “fix” automatically

The following require design/authority confirmation before removal or consolidation: Rune 2.0, Awakening, Settlement, Nemesis, Region Mastery and other active progression/content systems. A system being old or complex is not enough evidence that it is dead.

## DBG-01 implementation handoff

- Existing owners retained: `state.data.riftKeys`, `riftKeyCore.js::consumeRiftKey`, `riftStages.js::buildRiftStage`, `stages.js::findStage`, `BattleEngine`, `TextBattleScreen`, and existing reward/save pipelines. No new save root, key inventory, currency, Chapter registration or balance formula.
- Regression coverage: `tests/rift-entry.test.js` exercises real renderer callbacks, confirmation/back without consumption, real TextBattleScreen/BattleEngine entry, persisted one-key consumption, double start, missing/malformed keys, initialization failure, retreat/loss/clear, result retry routing, and Stage-first detail cleanup, and the Fusion wrapper after rejected entry. DOM adapters do not establish browser/layout acceptance.
- Required live check: Adventure → discovered branches → owned Rift key → confirmation/back → confirmation/start → battle → retreat/result → select another key. Verify key count survives reload and no used-key replay is possible. Check 390×844, 375×667 and desktop.
- Browser attempt in this session was blocked at `http://127.0.0.1:8765` with `net::ERR_BLOCKED_BY_CLIENT`; do not mark UIX viewport gates complete.
- Follow-up reward audit: `riftReward.greaterBonus`, `legendaryBonus`, and `ancientBonus` are declared but no consumer was found in the current `js` tree. This entry fix preserves current builder/reward behavior; advertised rarity bonuses need separate verification and a focused fix if confirmed.
