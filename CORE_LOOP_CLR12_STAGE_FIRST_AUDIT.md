# Blade Vale — CLR-12 Stage-First Navigation Audit & Contract

## Status

**COMPLETE — audit/contract only. No gameplay rebalance.**

This phase freezes the player-facing navigation contract before CLR-13 restores Chapter/Stage navigation as the primary Adventure surface.

---

## 1. Canonical player-facing hierarchy

The navigation contract is:

```text
Home
  → 冒険
    → Chapter
      → Stage
        → Story / first-clear or replay
        → Hunt / repeatable combat when eligible
```

Canonical Stage identity such as `1-1`, `1-2`, `2-5` remains visible to the player.

World 4.0 / Region / Route Graph remains a supporting runtime beneath this hierarchy. Route node IDs are not the player's primary Story map.

---

## 2. Existing Stage/Chapter UI worth reusing

### `js/screens/chapterSelect.js`

Keep/reuse:

- canonical `CHAPTERS` iteration,
- `isChapterUnlocked(...)` as the Chapter visibility/unlock authority,
- chapter recommended-level presentation,
- existing `stage-card` visual vocabulary,
- existing World/Branch sections as secondary/special content,
- existing click handoff from Chapter → Stage selection.

Do not reuse as-is:

- Region accordion hierarchy as the main mental model. Region grouping may remain secondary context, but Chapter must become the obvious first-level Story structure.
- long mastery/world-layer information inserted before the ordinary Chapter path when it obscures the next Story action.

### `js/screens/stageSelect.js`

Keep/reuse:

- canonical `chapter.stages` iteration,
- `isStageDiscovered(...)` progression visibility,
- existing `state.isStageCleared(stage.id)` clear authority,
- recommended Lv display,
- boss/branch/bounty distinction,
- existing Stage confirmation surface and canonical battle handoff.

Required CLR-13 correction:

- display `stage.id` visibly in every ordinary Stage row, e.g. `1-1 平原の入口`.
- make clear / next / locked semantics explicit rather than relying mainly on a star or omission.
- preserve secret/branch discovery rules; Stage-first does not mean leaking hidden content.

---

## 3. Existing Story launch path is already valid

`js/main.js` already contains a complete canonical non-Adventure Story path:

```text
goStageBtn
  → goChapterSelect()
  → renderChapterSelect(...)
  → goStageSelect(chapterIndex)
  → renderStageSelect(...)
  → renderStageConfirm(stage)
  → confirmStartBtn
  → startBattle(stage)
  → TextBattleScreen / BattleEngine
  → renderResult(result)
```

This path is the safest basis for CLR-13/14 because it already preserves:

- canonical `stage.id`,
- existing battle authority,
- existing reward authority,
- existing Stage completion authority,
- result handling,
- `nextStageAfter(...)` continuation.

CLR-13 should restore this path to the visible Adventure entry instead of rewriting it through Region-first route navigation.

---

## 4. Why the current World 4.0 entry hides Stage structure

`js/patches/adventureWorld4Ui.js` installs a capture-phase click handler on `#goStageBtn` using `stopImmediatePropagation()` and redirects the normal Adventure button into `renderAdventureWorld()`.

That interception bypasses the existing `goChapterSelect()` handler in `js/main.js`.

Current visible flow therefore becomes:

```text
Home
  → 冒険
    → World/Region cards
      → Adventure route
```

instead of the canonical:

```text
Home
  → 冒険
    → Chapter
      → Stage
```

This is the exact integration point CLR-13 should change.

### Contract

CLR-13 should **remove/replace only the entry interception**, not delete the World 4.0 runtime.

World 4.0 remains reachable as the runtime for Hunt, aftermath, investigation, safe return, and world reaction where appropriate.

---

## 5. Story progression authority

Story navigation must continue to use existing authorities:

- Stage definitions: `CHAPTERS` in `js/data/stages.js`
- Chapter unlock: `isChapterUnlocked(...)`
- Stage clear: `state.isStageCleared(stage.id)` / existing Stage progress data
- next canonical Stage: existing Stage order / `nextStageAfter(...)`

No new Chapter completion root, Stage map state, Story token, or Adventure-only Story progression may be added.

A Stage browser is a **presentation of canonical progression**, not a new progression system.

---

## 6. Story first-clear / replay behavior

Current Stage confirmation and battle path already supports replay by selecting an already-cleared Stage and launching the same canonical stage.

Target CLR-14 behavior:

- uncleared Stage: primary action communicates Story progression / battle start,
- cleared Stage: replay remains available,
- cleared eligible Stage/Region: Hunt becomes an additional action, not a replacement for replay,
- result returns to a sensible Stage/Chapter context,
- next canonical Stage is obvious after first clear.

CLR-6 short aftermath may be reused after a Story victory, but it must not obscure the Stage identity or strand the player inside a route node.

---

## 7. Existing CLR Story/Hunt assets to preserve

CLR-1〜11 remain valid implementation assets:

- CLR-1: multi-battle Adventure session and battle-clear flags,
- CLR-2: post-battle aftermath / steady-pressure branching,
- CLR-3: run summary,
- CLR-4/5: combat-first Region reuse and World Tier cadence,
- CLR-6: battle-first Story aftermath,
- CLR-7/8/9: Investigation / CP4 victory-gated revelations / combat milestones,
- CLR-10: safe-return durable Event Memory,
- CLR-11: Tavern reaction to durable Event Memory.

These systems should be attached beneath Stage/Hunt actions rather than used to replace the Stage browser.

---

## 8. Adventure Session contract

`state.data.adventure4` remains the owner of resumable Adventure-only navigation state.

Existing session fields include:

- `active`
- `suspended`
- `regionId`
- `routeId`
- `currentNodeId`
- `visitedNodeIds`
- `temporaryFlags`
- `pendingEncounter`
- `returnTarget`

Important integration rule for CLR-13/15:

- ordinary Stage browsing must not require an Adventure session,
- starting/replaying a canonical Story battle must not create duplicate Story progress in `adventure4`,
- Hunt may start an Adventure session from Stage/Region context,
- if a Hunt session is active/suspended, the Chapter/Stage browser must show a clear resume affordance without disabling or confusing canonical Story state,
- Suspend and Return remain different operations.

---

## 9. Mobile layout findings

The old Chapter/Stage surfaces are materially closer to the desired mobile interaction than the Region-first route screen because they already use one-card-per-destination selection and direct Stage confirmation.

However CLR-13/16 must explicitly address:

- excessive vertical expansion from Region accordions / world-layer summaries before ordinary Story Chapters,
- Stage rows that show only names without IDs,
- clear state represented only by `★`,
- locked ordinary Stage behavior being represented by omission rather than an understandable next/locked state where canonically safe,
- distinction between current Stage, next Stage, cleared Stage and optional branch content,
- one obvious primary action per detail screen.

Representative narrow-screen target: iPhone portrait widths around 375–430 CSS px.

No fixed desktop-width assumption may be introduced.

---

## 10. Places currently hiding/replacing `stageId`

### Player-facing Stage list

`renderStageSelect(...)` currently renders `stage.name` but not `stage.id` for ordinary canonical stages.

**CLR-13 must fix this.**

### World 4.0 Region presentation

Region cards display Region name, subtitle, recommended range and current route label. They do not provide the canonical `1-1 / 1-2 / ...` progression map.

This is acceptable for Hunt/Region context but not as the primary Story browser.

### Adventure route screen

Current route presentation shows route-node names such as `平原の入口`, `帰還路`, aftermath names, etc. Route node IDs and canonical Stage IDs are not the visible navigation grammar.

This screen remains useful during a Hunt/expedition but must not replace Chapter/Stage selection.

---

## 11. Exact CLR-13 reuse plan

### Reuse directly

- `renderChapterSelect(...)`
- `renderStageSelect(...)`
- `renderStageConfirm(...)`
- existing DOM screens: Chapter select / Stage select / Stage confirm
- existing `startBattle(stage, ...)` path in `js/main.js`
- `CHAPTERS`, `isChapterUnlocked`, `state.isStageCleared`
- existing `stage-card` styling

### Change narrowly

1. Stop `adventureWorld4Ui.js` from replacing the Home Adventure entry with Region-first navigation.
2. Make Chapter selection the primary Adventure destination again.
3. Reorder/simplify Chapter presentation so ordinary Chapter progression is immediately legible.
4. Add visible Stage IDs to canonical Stage rows.
5. Add explicit Stage state presentation (`CLEAR`, `NEXT`, `LOCKED` where safe/known).
6. Keep special World/Branch/Region destinations as secondary sections rather than the Story spine.

### Do not change in CLR-13

- BattleEngine
- reward math
- Stage definitions
- Stage IDs
- Story canon
- World Tier math
- CLR Hunt route internals
- save schema
- endgame systems

---

## 12. Required CLR-13 smoke contract

A representative save must be able to perform:

```text
Home
  → 冒険
  → 第1章
  → 1-1 平原の入口
  → Stage detail
  → 戦闘開始
  → canonical battle
```

and after a clear:

```text
Result
  → next Stage / Stage context
```

The following is a release blocker:

- current Stage exists but no battle action is available,
- only Back / Return / Suspend is available,
- a route node name replaces the canonical Stage identity at the point where Story progression is being selected,
- a hidden/locked Stage is accidentally exposed.

---

## 13. CLR-12 conclusion

The audit finds that Blade Vale does **not** need a new Stage navigation system.

The canonical Chapter/Stage browser and battle launch path already exist and remain wired in `js/main.js`; World 4.0 currently masks them by intercepting the Adventure button.

Therefore the lowest-risk Stage-first rebase is:

> **restore the existing Chapter/Stage UI as the visible Story spine, then attach CLR Hunt/World 4.0 functionality beneath cleared Stage/Region context.**

This preserves all existing gameplay authorities and minimizes migration risk.

## Handoff

Next phase: **CLR-13 — Chapter / Stage Browser Restoration**.
