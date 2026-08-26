# Content Pack II — Horizontal World Expansion

> **Status: CURRENT — A+B ✅ / C+D NEXT / E FINAL**
>
> Parent source of truth: `ROADMAP.md`. System Deepening Pack A–C is complete and is now infrastructure for this pack.

## Goal

Turn the System Deepening loop into a content-rich world where rumors create revisits, knowledge improves pursuit, hidden encounters reveal routes, routes join into secret chains, and those chains lead to Boss/Companion/Unique/Lore rewards.

Core loop:

```text
Rumor → Tracking → Revisit → Hidden Encounter / Clue
      → Hidden Route → Secret Chain → Boss / Companion / Reward
      → Codex / Build / Rumor update → another lead
```

## Permanent guardrails

- no new level cap; Lv99,999 remains canonical
- no new mandatory currency
- no daily/weekly/FOMO loop
- no new Home button when Codex/Adventure/World/Secret Realm can host content
- reuse `world2.discoveries`, Rumor Notebook, Codex, Region Mastery, Secret Realm, Ranch, Equipment and Job systems
- secrets stay diegetic; no ordinary UI showing exact hidden spawn percentages
- optional content does not gate Ch1–25 story completion
- Modern World remains restrained: no explicit Japan/Tokyo reveal unless a later story decision authorizes it
- SD-4 Boss conditional Hidden Drop objectives remain deferred
- mobile battle command reachability remains release-blocking

---

# Batch 1 — A+B ✅ COMPLETE

## CP2-A — Rumor & Hidden Encounter Expansion

Added **10 new rumors**, two for each Phase12 horizontal ecology:

### 古王墓
- 後ろ向きに巡回する近衛
- 空位の玉座に残る影

### 幻獣の森
- 季節を外れた銀鹿
- 鳴かない巣

### 竜骸峡谷
- 名のない竜骨の脈動
- 八本目の肋骨

### 反転図書館
- 頁の外を歩く記録体
- 過去を持たない本

### 黒月神殿
- 瞬きをしない観測眼
- 二つ目の周期信号

Rumors reuse the automatic Rumor Notebook. They become visible from existing Phase12 rumor/trace/clear knowledge and progress through the existing unresolved / tracking / resolved language.

### Five new Hidden Encounters

- 古王墓 — **逆歩近衛・RETROGRADE**
- 幻獣の森 — **季外銀鹿・ARGENT**
- 竜骸峡谷 — **無銘脈骨・PULSE**
- 反転図書館 — **頁外記録体・MARGIN**
- 黒月神殿 — **静止観測眼・STILL**

Rules:
- unresolved rumor = encounter chance 0
- tracking enables the encounter at a very low base frequency
- Region Mastery gives only a tiny relative pursuit benefit
- Codex knowledge gives only a small relative benefit
- hard helper ceiling remains 5%
- no exact percentages are exposed in player-facing rumor text
- Hidden Encounter is inserted as the **next one-enemy encounter after the initial group**, never into the opening enemy pile

## CP2-B — Treasure / Hidden Route Expansion

Seeing the associated Hidden Encounter creates an in-world route lead using existing `world2.discoveries`:

- **空列の回廊** — Old King Tomb
- **無音の産室** — Phantom Beast Forest
- **第八肋骨路** — Dragonbone Canyon
- **逆棚回廊** — Inverted Library
- **盲壁観測孔** — Black Moon Temple

These are textual hidden-route discoveries, not a new map currency or menu. Their current reward hints deliberately point toward later C+D content rather than awarding an unrelated new progression token.

Implementation:
- `js/data/contentPackIIAB.js`
- `js/patches/contentPackIIAB.js`
- `tests/content-pack-ii-ab.test.js`

Initial validation:
- Blade Vale Tests **#539 ✅**
- Phase 8 Validation **#130 ✅**

---

# Batch 2 — C+D ⏭ NEXT

## CP2-C — Secret Chain Expansion

Turn the five A+B Hidden Routes into **2–3 authored multi-region chains**.

Target chains:

### Chain Alpha — Silent Beast Route

`無音の産室 → 灰燼/幻獣側の追加痕跡 → 黒月側の観測記録 → Rare Companion / breeding lead`

Purpose:
- connect Companion/Ranch to rumor exploration
- make a Rare Companion feel discovered, not selected from a list
- avoid IV grind; individuality remains light

### Chain Beta — Eighth Rib Route

`第八肋骨路 → 反転図書館の解読 → 零番境界駅 / boundary trace → hidden observation site`

Purpose:
- deepen the observation-network mystery
- connect Pack C's 第零座標 to a new optional location
- do not resolve the central Modern World question

### Chain Gamma — Blind Wall Route

`盲壁観測孔 → 二つ目の周期信号 → multiple region records → hidden high-end encounter`

Purpose:
- establish that two observation directions may be measuring the same unknown subject
- seed later Story Expansion I without saying Japan/Tokyo

Requirements:
- at least two chains span 3+ existing locations
- old cleared regions gain a real revisit reason
- each step is represented by in-game clues, not source-code-only conditions
- no chain is mandatory for main story

## CP2-D — Hidden Boss & Reward Layer

Add rewards to the chains rather than create a new shop/currency.

Target directional scale for this batch:
- ~4–6 Hidden/elite Boss encounters
- ~6–10 new recruitable/secret/breeding Companion additions
- ~10–15 Unique/Relic/content rewards
- authored Codex entries and lore fragments

Reward principles:
- build-changing > raw universal BiS
- Companion rewards should create party options, not mandatory stat superiority
- use existing Job synergy tags (BREAK / GUARD / ANALYSIS etc.) where appropriate
- SD-4 remains deferred: **do not use timed kill / no-death / Break-finisher conditions to gate Boss drops**

---

# Batch 3 — E FINAL

## CP2-E — World Mystery Integration + Content Density Pass

After C+D works end-to-end:

- connect all CP2 rumors to resolved/tracking states
- make Codex records reflect the new ecology
- add remaining Lore fragments
- connect region mastery knowledge to the new leads
- ensure Hidden Routes have satisfying outcomes
- audit reward density and revisit value
- audit repeated-grind friction
- verify no content requires external notes
- preserve mystery restraint
- run full save/mobile/CI regressions

Directional full-pack scale remains:
- ~5–8 optional major locations/routes/dungeons
- ~30–40 authored enemies/variants when C+D/E are finished
- ~8–12 Boss/elite encounters total
- ~15–20 companion additions total
- ~20–30 meaningful Unique/Relic/content rewards total

These are directional targets, not quotas. Connected content is more important than count.

---

# After Content Pack II

```text
CONTENT PACK II COMPLETE
      ↓
STORY EXPANSION I — Ch26–30
      ↓
CONTENT PACK III
```

Story Expansion I should continue the Eighth Key / external signal / Veil anomaly arc while preserving the question: **why are Blade Vale and the external modern world connected?**

## Claude / new-chat handoff

When resuming with no conversation history:
1. read `ROADMAP.md`
2. read `SYSTEM_DEEPENING_ROADMAP.md` for completed infrastructure
3. read this file
4. **do not redo Content Pack II A+B**
5. start with **CP2-C Secret Chain Expansion**, then batch CP2-D Hidden Boss & Reward Layer with it where shared data makes sense
6. leave Boss conditional Hidden Drops deferred
7. preserve Rumor Notebook automatic accumulation and `world2.discoveries` persistence
8. do not add a new Home route/currency
9. preserve the many-enemies mobile command regression
10. run both CI workflows, then update this handoff before merge
