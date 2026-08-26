# Content Pack II — Horizontal World Expansion

> **Status: CURRENT — A+B ✅ / C+D ✅ / E NEXT**
>
> Parent source of truth: `ROADMAP.md`. System Deepening Pack A–C is complete and is infrastructure for this pack.

## Goal

Turn the System Deepening loop into a content-rich world where rumors create revisits, knowledge improves pursuit, hidden encounters reveal routes, routes join into secret chains, and those chains lead to Boss/Companion/Unique/Lore rewards.

```text
Rumor → Tracking → Revisit → Hidden Encounter / Clue
      → Hidden Route → Secret Chain → Hidden Boss
      → Companion / Unique / Codex / Lore → another lead
```

## Permanent guardrails

- Lv99,999 remains canonical
- no new mandatory currency
- no daily/weekly/FOMO loop
- no new Home button when existing surfaces work
- reuse `world2.discoveries`, Rumor Notebook, Codex, Region Mastery, Secret Realm, Ranch, Equipment and Job systems
- no ordinary UI showing exact hidden spawn percentages
- optional content does not gate Ch1–25 story completion
- no explicit Japan/Tokyo reveal in this pack
- SD-4 Boss conditional Hidden Drop objectives remain deferred
- mobile battle command reachability remains release-blocking

---

# Batch 1 — A+B ✅ COMPLETE

## CP2-A — Rumor & Hidden Encounter Expansion

Added 10 new rumors across the five Phase12 horizontal ecologies and five rumor-gated Hidden Encounters:

- 古王墓 — **逆歩近衛・RETROGRADE**
- 幻獣の森 — **季外銀鹿・ARGENT**
- 竜骸峡谷 — **無銘脈骨・PULSE**
- 反転図書館 — **頁外記録体・MARGIN**
- 黒月神殿 — **静止観測眼・STILL**

Rules:
- unresolved rumor = encounter chance 0
- tracking enables only a very low base chance
- Region Mastery / Codex knowledge add only small relative pursuit bonuses
- helper hard ceiling is 5%
- Hidden Encounter is a later one-enemy encounter, never part of the opening enemy pile

## CP2-B — Treasure / Hidden Route Expansion

Observing the hidden ecology creates five route discoveries using existing `world2.discoveries`:

- **空列の回廊**
- **無音の産室**
- **第八肋骨路**
- **逆棚回廊**
- **盲壁観測孔**

No map currency or new screen was created.

Implementation:
- `js/data/contentPackIIAB.js`
- `js/patches/contentPackIIAB.js`
- `tests/content-pack-ii-ab.test.js`

Final merged A+B validation:
- Blade Vale Tests #541 ✅
- Phase 8 Validation #132 ✅

---

# Batch 2 — C+D ✅ COMPLETE

## CP2-C — Secret Chain Expansion

Three authored multi-region chains now turn A+B route leads into real revisit paths.

### Chain Alpha — 声なき獣の系譜

`無音の産室 → 空列の回廊 → 盲壁観測孔`

Reveals that one lineage may be growing in multiple layers at the same time.

### Chain Beta — 第八肋骨の行先

`第八肋骨路 → 逆棚回廊 → 零番境界駅`

Reveals that the eighth rib may be a maintenance conduit connected to the Zero Boundary Station rather than an ordinary biological structure.

### Chain Gamma — 盲壁の二重観測

`盲壁観測孔 → 逆棚回廊 → 埋もれた観測座標`

Establishes two observation directions measuring the same still-unlocatable subject. It does **not** identify Japan, Tokyo or the Modern World.

All three chains:
- span 3 existing locations/records
- progress automatically in the existing Rumor Notebook
- persist in `world2.discoveries`
- remain optional for main story

## CP2-D — Hidden Boss & Reward Layer

### Hidden Bosses — 5

- **無鳴母獣・NEST-MOTHER**
- **灰角残響獣・CINDER-HART**
- **第八脈守・OCTAVE**
- **重記司書・PALIMPSEST**
- **双方向観測体・PARALLAX**

Bosses appear only after their chain resolves. They are appended as a **single-enemy encounter group** through the existing Text Battle queue, preserving the mobile command-area safety contract.

### Secret Companions — 6

- 無鳴銀仔
- 燼角仔
- 第八骨竜仔
- 余白精
- 視差灯
- 零線幼体

They reuse the existing Ranch/Companion system. Secret reward companions have no ordinary field recruitment chance.

### Special Breeding — 4

- 無鳴銀仔 × 灰喰らい → **灰月鹿**
- 第八骨竜仔 × 軌道猟犬・NULL → **零脈竜**
- 余白精 × 残響灯・ルクス → **余白残響灯**
- 視差灯 × 零響獣シグナル → **双観測獣**

These use the existing deterministic hybrid resolver; no new breeding currency or screen.

### Fixed Unique Rewards — 12

Representative rewards:
- 無音鈴
- 重層産室心核
- 灰角反響冠
- 空列守盾
- 第八脈断刀
- 零線脊柱核
- 重記余白帳
- 八脈外殻
- 視差観測眼
- 盲壁断片
- 二重信号核
- 未定義焦点片

Reward rule:
- completing a chain reveals the boss
- first successful boss clear grants its fixed rewards and secret companion
- **no random boss reward roll**
- **no timed kill / no-death / Break-finisher requirement**
- therefore SD-4 remains deferred

Implementation:
- `js/data/contentPackIICD.js`
- `js/patches/contentPackIICD.js`
- `js/data/uniqueEquipment.js`
- `js/data/companionBreeding.js`
- `tests/content-pack-ii-cd.test.js`

Initial C+D validation before handoff:
- Blade Vale Tests #543 ✅
- Phase 8 Validation #134 ✅

---

# Batch 3 — E ⏭ NEXT

## CP2-E — World Mystery Integration + Content Density Pass

This is the final Content Pack II integration pass, not another giant feature layer.

### E1 — Rumor / Chain Closure
- verify all A+B rumors progress correctly into C+D outcomes
- ensure solved Hidden Encounters and defeated Hidden Bosses update useful notebook text
- remove dead-end clues
- ensure no external notes are required

### E2 — Codex Ecology Integration
- add/verify Codex identity for the five Hidden Encounters and five Hidden Bosses
- make habitat/ecology text reflect routes and chains
- ensure Field Guide knowledge helps without exposing formulas

### E3 — Lore / World Mystery Integration
- connect the three chains to The Veil, observation network, Eighth Key and external-signal mystery
- preserve uncertainty: the unknown observed subject remains unlocated
- do not explicitly reveal Japan/Tokyo/Modern World

### E4 — Reward / Revisit Density Audit
- check whether each Hidden Route has a satisfying outcome
- check reward duplication / universal-BiS risk
- check Companion/breeding rewards create real party choices
- check old-region revisits do not become excessive grind

### E5 — UI / Mobile / Save Integration
- compact Rumor Notebook presentation with increased entry count
- no Home button proliferation
- verify Ranch/Equipment remain manageable with new entries
- save compatibility / lazy data behavior
- permanent many-enemies command reachability regression

### E6 — Full Pack Handoff
- run both CI workflows
- update `ROADMAP.md` and this file to Content Pack II COMPLETE
- hand off the next work to **Story Expansion I — Ch26–30**

Directional full-pack counts are design targets, not quotas. Connected content matters more than forcing numbers.

---

# After Content Pack II

```text
CONTENT PACK II COMPLETE
      ↓
STORY EXPANSION I — Ch26–30
      ↓
CONTENT PACK III
```

Story Expansion I should continue the Eighth Key / external signal / Veil anomaly arc while preserving the central question: **why are Blade Vale and the external modern world connected?**

## Claude / new-chat handoff

When resuming with no conversation history:
1. read `ROADMAP.md`
2. read `SYSTEM_DEEPENING_ROADMAP.md` for completed infrastructure
3. read this file
4. **do not redo A+B or C+D**
5. next work is **CP2-E World Mystery Integration + Content Density Pass**
6. leave Boss conditional Hidden Drops deferred
7. preserve automatic Rumor Notebook accumulation and `world2.discoveries`
8. do not add a new Home route/currency
9. preserve many-enemies mobile command reachability
10. run both CI workflows and update handoff before merge
