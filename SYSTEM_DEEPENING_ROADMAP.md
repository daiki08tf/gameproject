# System Deepening Pack — Implementation Roadmap

> **Status: ✅ SYSTEM DEEPENING COMPLETE — Content Pack II NEXT**
>
> Purpose: deepen existing Blade Vale systems before Content Pack II without creating a parallel progression ladder.
>
> Parent source of truth: `ROADMAP.md`.

## Current handoff

**Completed**
- Pack A: SD-1 Unique/Relic Build Identity, SD-2 Job Synergy Deepening, SD-8 Enemy Intent
- Pack B: SD-3 Companion Individuality, SD-5 Codex Field Guide, SD-11 Rare Encounter Presentation
- Pack C: SD-6 Rumor Notebook, SD-7 Region Mastery Knowledge, SD-10 Treasure Maps / Clue Items, SD-9 Secret Chains

**Next:** Content Pack II.

**Deferred:** SD-4 Boss conditional Hidden Drops. Do not implement unless explicitly re-enabled.

## Permanent rules

- no new level cap
- no daily/weekly rotating challenges
- no new mandatory currency
- reuse existing Ranch / Codex / Adventure / World / Equipment / Job surfaces
- no new Home button when an existing grouped destination works
- no giant stat-inflation-only progression layer
- preserve old saves through lazy/default-safe data
- mobile battle commands must remain reachable regardless of enemy count/log length
- hints guide without exposing exact secret spawn formulas
- main story remains optional relative to horizontal exploration goals

---

# Pack A — BUILD / COMBAT ✅

## SD-1 — Unique / Relic Build Identity
Reusable BREAK / GUARD / ANALYSIS identities connect equipment to actual combat behavior rather than another rarity tier.

Representative identities:
- 始祖竜骸刃 → BREAK
- 無名王冠 → GUARD
- 反転目録・未刊 → ANALYSIS

## SD-2 — Job Synergy Deepening
Existing Job 3.0 MASTER remains authoritative. Active MASTER routes provide lateral synergy with the same vocabulary:
- 剣聖 → BREAK
- 護剣 → GUARD
- 秘術師 → ANALYSIS

## SD-8 — Enemy Intent
Enemy tactical actions are reserved before resolution and the UI reads that same reservation. Intent remains inside existing enemy cards; battle command reachability is preserved.

Implementation:
- `js/data/systemDeepeningPackA.js`
- `js/patches/systemDeepeningPackA.js`

---

# Pack B — COLLECTION ✅

## SD-3 — Companion Individuality
Existing nature/talent remains authoritative. New recruits may receive a low-frequency modest Rare Trait and a cosmetic epithet. Old companions lazily default to null and are never rerolled on read/load.

## SD-5 — Codex Field Guide
Existing `monsterCodex` records derive a five-step knowledge ladder:
1. Seen
2. Observed
3. Studied
4. Known
5. Mastered

No second Codex database or screen was added.

## SD-11 — Rare Encounter Presentation
Real Phase12 rare waves receive a short first-sighting ecology prelude + `RARE ENCOUNTER`; repeat sightings collapse to one fast line inside the bounded battle log.

Implementation:
- `js/data/systemDeepeningPackB.js`
- `js/patches/systemDeepeningPackB.js`

---

# Pack C — EXPLORATION INTELLIGENCE ✅

## SD-6 — Rumor Notebook ✅

The Notebook reuses existing `world2.discoveries`; there is no new top-level save root.

Existing Phase12 rumors automatically become notebook entries and progress from:
- `unresolved` / 未解決
- `tracking` / 追跡中
- `resolved` / 解決済み

Progress is derived from existing World/Event flags, world traces and Secret Realm clears. The player does not manually maintain notes.

UI:
- existing Monster Codex surface only
- compact `RUMORS resolved/total` summary
- progressive-disclosure groups for 追跡中 / 未解決 / 解決済み
- no new Home button or Rumor screen

## SD-7 — Region Mastery Knowledge ✅

Existing Phase9 Region Mastery rewards remain unchanged and authoritative. Pack C attaches a lateral knowledge layer only:
- mastered regions expose clearer diegetic rumor wording
- known traces improve clue context
- rare-hunt guidance uses a tiny `1.05x relative` lead vocabulary, not a +5 percentage-point spawn jump

No mastery can be revoked and unfinished mastery is not punitive.

## SD-10 — Treasure Maps / Clue Items ✅

Five Phase12 rumor lines can produce textual clue records inside `world2.discoveries`:
- 欠けた王墓拓本
- 白角獣の踏査図
- 竜骸星図片
- 反転書庫の余白紙
- 無月観測紙

They are interpretive hints, not coordinate dumps. There is no treasure-map currency and no extra inventory screen.

## SD-9 — Secret Chain ✅

Representative multi-region chain is live:

```text
古王墓
  ↓ 王墓の欠けた石板
反転図書館
  ↓ 反転目録による解読
竜骸峡谷
  ↓ 竜骸の第零座標
三地点が同じ観測網の端末だと判明
  ↓
中央観測点への手掛かり（場所は未特定）
```

The chain changes existing discovery state at each step and remains optional. It does **not** bypass the existing Convergence Observatory / Apex gates and does not explicitly reveal Japan, Tokyo or the Modern World.

Implementation:
- `js/data/systemDeepeningPackC.js`
- `js/patches/systemDeepeningPackC.js`
- bootstrapped through `js/patches/homeNavigation.js`

---

# SD-4 — DEFERRED ⛔

Boss conditional Hidden Drop objectives remain deliberately postponed.

Until explicitly re-enabled:
- no timed-kill Hidden Drop requirements
- no no-death / Break-finisher special-drop conditions
- do not hide equivalent mechanics inside Content Pack II

Existing ordinary/rare/hidden loot remains unchanged.

---

# Live cross-system loop

```text
World Event / Lore
      ↓
Rumor automatically enters Notebook
      ↓
Region / Codex knowledge narrows the clue
      ↓
Explore / revisit location
      ↓
World trace / Rare encounter / clue item / Secret
      ↓
Companion / Unique / Relic / Codex discovery
      ↓
Job + equipment build changes
      ↓
Try harder content / revisit another lead
      ↺
```

# Validation / release gates

System Deepening is complete when:
- Unique/Relic identities create real build choices ✅
- MASTER Jobs provide lateral tactical synergies ✅
- Enemy Intent is actionable and truthful ✅
- companions have light non-punishing individuality ✅
- Codex works as a progressive field guide ✅
- rare encounters feel special ✅
- Rumor Notebook automatically accumulates/resolves clues ✅
- Region Mastery gives small local knowledge/convenience benefits ✅
- Treasure Maps use textual exploration ✅
- at least one multi-location Secret Chain works end-to-end ✅
- SD-4 remains absent ✅
- rotating challenges remain absent ✅
- battle commands remain reachable under maximum enemy pressure ✅
- save compatibility and both CI workflows pass ✅

## Claude / new-chat handoff

When resuming development with no conversation history:
1. read `ROADMAP.md`
2. read this file
3. **do not redo Pack A, B or C**
4. next major work is **Content Pack II**
5. new optional content should feed the live Rumor → Knowledge → Explore → Secret loop rather than create parallel menus/currencies
6. keep SD-4 deferred unless explicitly re-enabled
7. preserve the restrained external-world mystery
8. run both CI workflows and the permanent mobile battle-command regression before every merge
