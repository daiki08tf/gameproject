# BLADE VALE — Core Loop Rework Roadmap

> Status: **PRIORITY REWORK — STAGE-FIRST NAVIGATION REBASE**
>
> Core thesis: **ハクスラしていたら世界やストーリーが見えてくる。**
>
> Navigation correction: **Chapter / Stage をプレイヤーの主導線として残し、World 4.0 / Region / Route Graph はその裏側でハクスラ体験を支える。**
>
> Observed Branches M3+ remains paused until this navigation/core-loop contract is stable.

---

# 1. Why this roadmap is being rebased

CLR-1〜11 established useful combat-first foundations:

- repeated combat inside one Adventure Session,
- post-battle aftermath,
- route choice,
- World Tier-linked cadence,
- battle-first Story aftermath,
- Investigation / Discovery from combat outcomes,
- CP4 revelations gated by battle victory,
- Elite/Boss accomplishments retained only after safe return,
- Settlement Tavern reactions to those durable memories.

These foundations are valid and should be reused.

However, mobile playtest exposed a larger presentation problem: the Adventure UI made Region/Route the primary visible structure and hid the familiar canonical Story progression represented by `1-1`, `1-2`, `2-1`, etc.

The result was harder to understand than the original Stage structure and even produced a direct Story-battle dead end before PR #375 fixed the immediate bug.

The correction is therefore **not** to remove CLR work. The correction is to put the existing canonical Stage hierarchy back in front of the player and let CLR operate underneath it.

---

# 2. New navigation hierarchy

The preferred player-facing hierarchy is now:

```text
Home
  ↓
冒険
  ↓
Chapter
  ↓
Stage
  例: 1-1 平原の入口
      1-2 ...
      1-3 ...
  ↓
[Story / 物語を進める]
[Hunt / 周回する]  ※条件を満たしたStage/Region
```

## Canonical ownership

- **Chapter / Stage list**: existing `CHAPTERS` and canonical stage definitions.
- **Story completion**: existing `stageProgress` authority.
- **Battle**: existing `TextBattleScreen` / `BattleEngine`.
- **EXP / Gold / Loot / Equipment**: existing reward authorities.
- **World / Region**: existing World 4.0 context and grouping.
- **Hunt / repeated expedition**: existing Adventure Session + CLR route machinery.

No second Story map, Stage progression root, battle engine, loot authority, Hunt Lv, Hunt token, stamina or Gear Score authority may be created.

---

# 3. Player mental model

The player should always be able to answer:

1. **今どの章にいるか**
2. **今どのStageを進めているか**
3. **次にどのStageが開くか**
4. **このStageは初回Storyなのか、周回可能なのか**
5. **周回すると何を狙えるか**

The Stage number is not internal metadata. It is part of the navigation language.

Examples:

```text
第1章
  1-1 平原の入口        CLEAR
  1-2 〇〇              NEXT
  1-3 〇〇              LOCKED
```

and after selecting `1-1`:

```text
1-1 平原の入口
推奨Lv xxx
地域: 開拓辺境

[物語を進める / 再戦する]
[Hunt / 周回する]
```

Exact labels may be refined for mobile clarity, but Stage identity must remain visible.

---

# 4. Story contract

Story remains Stage-first.

```text
Chapter
  ↓
Stage 1-1
  ↓
canonical battle
  ↓
short aftermath / story consequence
  ↓
Stage clear
  ↓
Stage 1-2 becomes the obvious next destination
```

## Story rules

- Canonical `stageId` remains visible and authoritative.
- Story does not require the player to understand World 4.0 node IDs.
- Mandatory Story progression is deterministic.
- Story cannot be gated behind Rare/RNG-only aftermath.
- Long text chains should still be reduced where possible.
- Battle outcomes may reveal Story/Discovery, but they do not replace the Stage map.
- First clear may use authored aftermath; replay should be concise.
- Existing CP4 revisit requirements such as `2-1 → 2-3 → 2-5` remain legible because Stage IDs remain visible.

---

# 5. Hunt contract

Hunt is the repeatable hack-and-slash intent reached **from known Stage/Region context**, not a separate game mode on Home.

Preferred structure:

```text
cleared Stage / Chapter context
  ↓
Hunt
  ↓
Battle
  ↓
Loot / EXP
  ↓
Aftermath
  ↓
Safe / Pressure / Investigation choice
  ↓
Battle
  ↓
Elite / Rare / Boss
  ↓
Return
  ↓
Run summary / Event Memory / world reaction
```

## Hunt rules

- High battle density.
- Shorter text than Story.
- Existing canonical stage battles are reused where appropriate.
- Existing Region identity determines ecology and available encounter context.
- Existing World Tier applies exactly once.
- No Hunt Lv / Hunt currency / daily count / stamina / energy.
- Return and suspend remain distinct.
- Safe return may create durable Event Memory through the existing CLR-10 authority.

---

# 6. World 4.0 role after the rebase

World 4.0 remains important, but it becomes a **supporting structure rather than the primary player-facing Story map**.

Keep:

- Region grouping,
- Route Graph,
- Nodes,
- Scene,
- Discovery,
- Rumor / Trace / Clue,
- Hidden Route,
- Mystery,
- Nemesis,
- Weather / World Event,
- Settlement return loop,
- Adventure Session persistence.

The visible relationship becomes:

```text
Chapter / Stage UI
        ↓
canonical Stage selection
        ↓
World / Region context
        ↓
CLR Adventure / Battle / Aftermath runtime
```

World 4.0 gives repeated combat meaning and variation. It does not hide the canonical Stage progression.

---

# 7. Core hack-and-slash loop

The north-star loop remains:

```text
戦う
  ↓
EXP / Lv
  ↓
装備が落ちる
  ↓
ビルド更新
  ↓
より強いStage / Route / Eliteへ
  ↓
より良いLootを狙う
  ↓
その過程で世界・歴史・秘密が見える
```

Story should feel like a consequence and destination of play, not a replacement for play.

---

# 8. Stage screen information design

Each Stage entry should progressively expose useful information without becoming a wall of text.

Minimum target information:

- `stageId` (`1-1`, `2-5`, etc.)
- Stage name
- clear / next / locked state
- recommended Lv
- Story first-clear status
- Hunt availability if applicable

Later enhancements may include:

- Region identity
- enemy family preview after discovery
- Boss / Elite marker when not secret
- notable drop / Unique target after discovery
- World Tier / danger indication
- Branch anomaly marker only when canonically known

Secret information must remain hidden until its owning Discovery/Research/Codex authority reveals it.

---

# 9. Loot and progression identity

Stage-first navigation must not turn Hunt into simple replay of the exact same fight.

Region/Hunt still needs a reason to repeat:

- different encounter compositions,
- Elite / Rare opportunities,
- optional Boss escalation,
- Region-specific equipment identity,
- existing Unique / fixed identity targets,
- existing Item Power / rarity / Option progression,
- Discovery / Rumor / Nemesis / Branch hooks.

Harder routes should mean more than HP inflation.

Do not add a new rarity or a fourth random Option merely for CLR.

---

# 10. Level and danger presentation

Lv remains the main visible long-form growth axis toward 99,999.

Use soft recommendation rather than arbitrary hard locks where possible.

Example:

```text
1-8 砦門
推奨Lv 220

Hunt
  安定路      Lv 210–230
  危険路      Lv 230–260
  深部        Lv 260+
```

World Tier remains a global pressure/scaling authority and must not become a duplicate danger system.

---

# 11. What CLR-1〜11 already gives us

These completed implementation slices are retained as reusable foundations:

## CLR-1 — Multi-Battle Expedition Foundation
Repeated canonical battles in one Adventure Session; victory/defeat/resume distinguished.

## CLR-2 — Post-Battle Aftermath & Route Choice
Battle → aftermath → next route foundation.

## CLR-3 — Run Summary / intent support
Existing run state can summarize expedition progress without a new progression root.

## CLR-4 — Second Region reuse
Combat-first adapter generalized beyond the first Region.

## CLR-5 — World Tier cadence
Expedition battle count can scale through existing World Tier context without a duplicate reward multiplier.

## CLR-6 — Battle-first Story aftermath
Canonical Story battle remains authoritative; short Story consequence follows battle.

## CLR-7 — Investigation from combat outcomes
Existing Trace / Investigation authority is reused after battle.

## CLR-8 — CP4 victory-gated revelation
Deep Green contradiction / Parallax / Branch Sight progression now respects battle victory and deterministic revisits.

## CLR-9 — Combat milestones → Investigation
Mid-run Investigation can emerge from actual combat progress.

## CLR-10 — Safe-return Event Memory
Elite/Boss achievements become durable only after explicit safe return.

## CLR-11 — Settlement reaction
Existing Event Memory is projected read-only into Tavern rumors.

## Playtest Fix #375
Direct Story battle entry now exposes an actual battle action instead of a return-only dead end.

These are implementation assets, not reasons to preserve the Region-first navigation mistake.

---

# 12. Revised implementation roadmap

## [ ] CLR-12 — Stage-First Navigation Audit & Contract

Freeze the new player-facing hierarchy before more gameplay work.

Audit:

- existing old Stage/Chapter UI and useful presentation pieces,
- current World 4.0 Region entry flow,
- `CHAPTERS` / `stageProgress` navigation authority,
- Story first-clear / replay behavior,
- existing CLR Story/Hunt route construction,
- active/suspended Adventure Session behavior,
- mobile layout on representative iPhone widths,
- all places that currently hide or replace `stageId` presentation.

Deliverable:

- explicit `Home → Adventure → Chapter → Stage → Story/Hunt` contract,
- exact existing UI/runtime pieces to reuse,
- no gameplay rebalance in this phase.

---

## [ ] CLR-13 — Chapter / Stage Browser Restoration

Restore canonical Chapter and Stage progression as the primary Adventure UI.

Requirements:

- show Chapters and their canonical Stages,
- always display stage IDs such as `1-1`,
- clear / next / locked states are obvious,
- recommended Lv visible,
- no new Stage progression root,
- current `stageProgress` remains authoritative,
- mobile layout must not require excessive vertical scrolling to understand one chapter,
- locked/secret content does not leak.

Acceptance smoke path:

```text
Home → 冒険 → 第1章 → 1-1 → battle
```

must be playable from a clean/representative save.

---

## [ ] CLR-14 — Stage Detail & Story Launch

Selecting a Stage opens a compact Stage detail/action surface.

Requirements:

- Stage ID + name + recommended Lv,
- Story action launches the exact canonical stage battle,
- first clear and replay both work,
- battle result returns to a sensible Stage context,
- short CLR-6 aftermath may still appear after victory,
- next canonical Stage is obvious after clear,
- no route-node terminology exposed unless useful to the player.

Critical regression:

A current battle node must never render a return-only dead end again.

---

## [ ] CLR-15 — Hunt from Cleared Stage / Region Context

Attach existing combat-first Hunt loop to the Stage-first browser.

Requirements:

- Hunt appears only where its prerequisites are satisfied,
- same player / equipment / EXP / Loot authorities,
- existing CLR multi-battle route reused,
- Stage selection gives clear context for what area is being hunted,
- Region remains the encounter/ecology owner under the hood,
- no separate Home Hunt button,
- no parallel Hunt progression.

---

## [ ] CLR-16 — Mobile Navigation & Playability Pass

Treat real-device usability as a release criterion, not polish.

Test representative flows on narrow/mobile layout:

```text
Home
→ Chapter
→ Stage
→ Story battle
→ Result
→ next Stage
```

and

```text
Home
→ cleared Stage
→ Hunt
→ multiple battles
→ aftermath choice
→ Elite/Boss
→ safe return
→ Tavern reaction
```

Requirements:

- primary action always visible,
- no ambiguous duplicated tabs/cards,
- current location vs destination visually distinct,
- Back / Suspend / Return semantics clear,
- no unreachable state with only a cancellation action,
- important controls usable without guessing.

Add behavior-oriented smoke/regression tests for these paths where feasible.

---

## [ ] CLR-17 — Stage/Region Loot Identity

Now that navigation is clear, strengthen the reason to replay.

Targets:

- Region-specific enemy/ecology identity,
- Region-specific equipment/drop targeting using existing loot authority,
- Elite / Rare / Boss escalation,
- known Unique targets where canonically appropriate,
- clear danger/reward communication,
- no new loot inventory or rarity system.

The player should be able to say:

> 「この装備を狙うから、このStage/Region周辺を周回する」

---

## [ ] CLR-18 — Story Density Migration by Chapter

Revisit Story pacing with Stage structure preserved.

Approach:

1. early representative Chapter,
2. mid-game Chapter,
3. late-game Chapter,
4. remaining Chapters in batches.

Goals:

- preserve `1-1 → 1-2 → ...` progression,
- combat remains the primary verb,
- move appropriate exposition to victory aftermath,
- preserve important cinematic/emotional scenes,
- replay avoids unnecessary text,
- no canon rewrite.

---

## [x] CLR-19 — Full Region Hunt Generalization ✅ COMPLETE

Generalize proven Hunt contracts across eligible Regions.

Requirements:

- Region-specific data rather than one-off runtime forks,
- no copy-pasted combat authority,
- consistent safe/pressure/return semantics,
- save/resume compatibility,
- World Tier exactly once,
- legacy suspended sessions remain recoverable until migration can safely retire them.

Implemented:

- `js/data/coreLoopClr19.js` — one `CLR19_HUNT_REGION_PROFILES` entry per canonical World3 Region (frontier, elemental, fracture, last-mortal, veil, outer-world, reverse-observation, shared-observation), each `routeKind:'shared-combat-first'`.
- `js/data/adventureWorld4Pilot.js` — replaced the frontier/elemental-only `CLR_COMBAT_FIRST_REGIONS` allowlist with `clr19RegionUsesSharedHunt()`, so every completed Region now routes through the existing `buildClrCombatFirstFreeAdventureRoute()` instead of a one-off per-Region fork.
- Existing `${region.id}-free-adventure` route IDs and legacy node IDs (`crossroads`, `deep-route`, `treasure`, `camp`, `shortcut`, `boss-gate`, `region-boss`) are unchanged, so suspended Adventure4 sessions from any Region remain recoverable.
- `js/data/coreLoopClr9.js`'s frontier-only mid-run Investigation was deliberately left untouched — CLR-19 does not copy that content to other Regions.
- No new combat engine, save root, reward path, World Tier multiplier, Hunt level, currency, stamina, or Home Hunt entry point.
- `tests/core-loop-clr19.test.js` covers all 8 Regions, canonical-Stage-only combat chains, Region-Boss finishers, shared safe/pressure/return topology, legacy node/session compatibility, single World-Tier-cadence tagging without exceeding canonical Stage capacity, and frontier-only CLR-9 Investigation.

Deliverable: PR #389.

---

## [x] CLR-20 — Endgame Alignment ✅ COMPLETE

Verify Stage-first/Region-Hunt flow complements rather than replaces:

- Abyss,
- Rift,
- Secret Realm,
- Machine Realm,
- EX Bounty / Nemesis,
- other existing endgame systems.

Abyss remains a strong vertical push. Region Hunt provides world-based gear/level farming. Neither should duplicate the other.

Implemented:

- Added `tests/core-loop-clr20.test.js` as an explicit boundary audit instead of adding new Endgame integration code.
- Stage-first Hunt remains gated to completed canonical non-Branch/non-Bounty Stages and continues to reuse the existing Adventure4 session authority.
- Generalized Region Hunt routes are verified to contain only Region-owned canonical Stage IDs; Rift / Secret Realm / Machine World / Bounty IDs cannot leak into CLR Hunt routes.
- Abyss keeps its existing independent Home entry (`#goAbyssBtn`) and is not redirected through Stage-first Hunt.
- Rift, Secret Realm, Machine World, EX Bounty and Nemesis retain their existing identity flags, progress/reward authorities and save/runtime ownership.
- Region Hunt imports none of the Endgame builders and adds no bridge save root, Hunt level/currency/stamina, or duplicate World Tier authority.
- Both **Blade Vale Tests** and **Phase 8 Validation** passed on PR and on main after merge.

Deliverable: PR #391.

---

## [ ] CLR-21 — Observed Branches M3/M4 Rebase

Resume Observed Branches only after CLR-12〜20 contracts are stable enough.

First proof remains **王樹領・深緑の森**.

Branch presentation should follow the same player grammar:

```text
Branch / Chapter context
  ↓
visible authored Stage progression
  ↓
combat-first Story
  ↓
Branch clear
  ↓
Branch Hunt
  ↓
Branch ecology / loot / Rare / Elite / Boss replay
```

Observed Branches must become playable combat destinations, not lore-only exhibits.

---

# 13. Required smoke tests going forward

Unit tests alone are insufficient for navigation work.

Every major Adventure navigation PR should preserve at least these behavioral contracts:

### Story start

```text
Home → Adventure → Chapter → available Stage → battle action exists
```

### Story progression

```text
battle victory → canonical stageProgress → next Stage becomes visible/available
```

### Hunt start

```text
cleared Stage/Region → Hunt → first battle action exists
```

### Multi-battle continuation

```text
battle victory → result → Adventure → next valid action
```

### Suspend/resume

```text
active expedition → suspend → Home → resume → same valid state
```

### Safe return

```text
Elite/Boss victory → explicit return → Event Memory → Tavern reaction
```

No screen may leave the player with only `帰還` / `中断` when forward progress is canonically available.

---

# 14. Authority guardrails

Always reuse existing authorities:

- Story: `CHAPTERS` / canonical stages / `stageProgress`
- Battle: `BattleEngine` / `TextBattleScreen`
- Reward: existing EXP / Gold / Loot pipeline
- Equipment: existing Gear / Option / Item Power / Unique / Rune
- World Tier: existing global authority
- Adventure Session: existing `state.data.adventure4`
- Discovery: existing `world2.discoveries`
- Event Memory: existing `world2.eventMemory`
- Rumor / Trace / Clue / Chronicle / Research / Codex: existing owner systems

Never add a duplicate authority merely to simplify UI implementation.

---

# 15. Acceptance criteria for the rework

The rework is successful when all are true:

1. The player can immediately understand Chapter and Stage progression.
2. `1-1`, `1-2`, etc. remain visible and meaningful.
3. Story uses canonical Stage progression without duplicate state.
4. Hunt is accessible from Stage/Region context without a new Home mode.
5. Combat + growth + loot remains the dominant repeatable loop.
6. World 4.0 adds context, routes and consequences without hiding Stage progression.
7. Battle victories can naturally reveal Investigation / Discovery / CP4 / world reactions.
8. Safe return has meaning and remains distinct from suspend.
9. Mobile navigation has no forward-progress dead ends.
10. Regions remain useful after Story through Hunt and loot identity.
11. Observed Branches can later adopt the same Stage-first + Hunt grammar.
12. No duplicate Battle/Loot/EXP/Story/Discovery authority is introduced.

---

# 16. North-star tests

Before approving a feature, ask:

> **プレイヤーは今どのChapter / Stageにいて、次に何をすればいいか一目で分かるか？**

Then ask:

> **これを追加すると「戦う → 強くなる → 装備を掘る → さらに強い相手へ挑む」というハクスラ循環が強くなるか？**

Finally:

> **その循環の結果として、世界やストーリーが自然に見えてくるか？**

If navigation is unclear or the feature tells more story while weakening the hack-and-slash loop, redesign it before implementation.