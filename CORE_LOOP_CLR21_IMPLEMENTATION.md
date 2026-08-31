# Core Loop Rework — CLR-21 Observed Branches M3/M4 Rebase (Proof)

## Goal
Resume Observed Branches under the now-stable Stage-first Core Loop (CLR-12–20)
by making the first authored Branch, 王樹領・深緑の森, an actual playable
Stage-first destination instead of a Lore-only discovery card — without
introducing a second game loop or any new authority.

## Scope
This is the first proof, scoped to exactly one Branch as instructed. It does
not generalize to any other `OBSERVED_BRANCHES` entry yet.

## Player grammar delivered
```
Chapter 2 Stage list
  → 観測分岐：王樹領 heading (once the existing CP4 anchor discovery is known)
  → Branch Stage 1/2/Boss cards (locked/next/clear, same visual language as
    ordinary Chapter stages)
  → Stage detail (existing stageConfirmScreen)
  → Battle (existing TextBattleScreen/BattleEngine via findStage())
  → Result / Loot / EXP (existing pipeline)
  → next Branch Stage unlocks
  → Boss clear → Branch clear (derived) → Branch Hunt (周回) replay card
```

## Authority reuse
- **Stage clear**: `state.data.stageProgress` / `state.isStageCleared()` /
  `state.recordStageResult()` — the exact same authority as every other
  Stage. No parallel clear array.
- **Battle**: `js/data/stages.js`'s `findStage()` gained one more ID-prefix
  branch (`observedbranch-`), the same pattern already used for
  `abyss-`/`secret-`/`raid-`. Waves reference the already-registered
  `ch2_normal`/`ch2_fast`/`ch2_tank`/`ch2_boss` enemy archetypes — zero new
  enemy types.
- **Loot/EXP**: `rewards`/`dropTable` reference the existing Chapter 2 item
  pool (`ch2_accessory`, `ch2_shield`, `ch2_weapon`, `ch2_body`,
  `ch2_named_weapon`). No new Loot authority.
- **Story/Battle launch UI**: Branch Stage cards are appended inside the
  existing `renderStageSelect()` (js/screens/stageSelect.js), using the exact
  same `onPick(stage)` contract as every other Stage source in that file
  (Eighth Key, World2 keys, exploration sites) — so `pendingStage`,
  `renderStageConfirm`, and `startBattle` in main.js need no changes at all.
- **World Tier**: not referenced anywhere in the new files; Branch Stages
  carry no Region/World Tier context (`stageFirstHuntContext()` naturally
  returns null for them since they have `chapter:null`), so there is no
  double-application risk.
- **Discovery**: unchanged. `js/data/observedBranchDiscovery.js` and the CP4
  anchor discovery (`cp4:branch-anchor:tree-sovereign`) still gate whether
  the Branch is known at all; `stageIds`/`bossStageId` were added to the
  Branch's own definition (`js/data/observedBranches.js`) as plain ID
  references only — no combat/reward authority moved into that file.

## New authority introduced
None. `js/data/observedBranchStages.js` is derived/read-only: it resolves
Stage IDs into `findStage()`-compatible objects and derives unlock/clear
state from `state.isStageCleared()` — it owns no save key.

## Branch Hunt
Kept intentionally minimal per scope: once the Boss Stage is cleared, an
additional "🔁 Branch Hunt（周回）" card appears that replays the Boss Stage
through the same existing Stage/battle pipeline. It does not create an
Adventure4 session or Region — that CLR-19-style generalization is left for
a later phase once this proof has been played and confirmed.

## Files changed
- `js/data/observedBranches.js` — added `stageIds`/`bossStageId` references.
- `js/data/observedBranchStages.js` (new) — Stage definitions + derived
  progress/clear helpers.
- `js/data/stages.js` — one `findStage()` prefix branch.
- `js/screens/stageSelect.js` — appends Branch Stage cards after a chapter's
  own cards; one added `observedBranch` modifier line in `renderStageConfirm`.
- `js/patches/stageFirstNavigationUi.js` — `canonicalStageById()` and
  `nextCanonicalMainStage()` recognize Branch Stages so Stage detail
  decoration and "next stage" navigation work for them too.
- `tests/core-loop-clr21.test.js` (new) — 13 regression tests.

## Tests
`node --test tests/*.test.js`: 1430/1430 pass. `npm run test:syntax`: clean.
Existing `tests/observed-branches-m1.test.js` / `m2.test.js`: unchanged,
still pass.

## Verification note
A live Playwright smoke test was attempted but the sandbox's headless
Chromium instance is currently hanging on `domcontentloaded` for this
session regardless of branch content (confirmed by reproducing the same
hang against the unmodified, already-merged CLR-11 bundle) — an environment
issue, not a regression from this change. Verification instead relied on
direct Node `findStage()` resolution checks plus the full regression suite.

## Next
Once this proof is played and confirmed stable, generalize the same
data-driven shape (`stageIds`/`bossStageId` on an `OBSERVED_BRANCHES` entry,
resolved through `findStage()`) to the remaining M3/M4 Branches, and revisit
whether Branch Hunt should graduate to reusing a full Adventure4 session
(CLR-19-style) once there is more than one Branch to justify it.
