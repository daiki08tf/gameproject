# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Vertical Extension ACTIVE — V1/V2/V3 merged / V4 Convergence Apex complete candidate / V5 NEXT**

Gear Overhaul Phases 0–9 and the post-Gear Deep Survey quantitative acceptance gate are complete. The vertical extension is active.

## Deep Survey baseline

Three Lv99,999 / IP10,000 regions remain the foundation:

| Region | Combat pressure | Gear purpose |
|---|---|---|
| 返信炉床・深層観測 | HP + healing | DEF / HP / guard-heal / lifesteal |
| 第九照準廊・深層観測 | ATK + tempo | SPD / Crit / attack-speed / Crit-damage |
| 異記憶根室・深層観測 | HP + healing + Boss technique | MAG / MP / CDR / crit-MP |

Baseline Option steering is 34%. Existing Exploration / Secret Realm / CP3 discoveries / IP10,000 / max-three Options / Option Lv1–100 / Greater / Legendary / Curse / Smart Loot / Option Fusion stay authoritative.

## Vertical Extension

Authoritative design: `POST_CP3_VERTICAL_EXTENSION_DESIGN.md`.

### V1 — Condition data contract — ✅ main

Exactly 3 Conditions per region, encoded into existing Secret Realm stage IDs. No new progression root.

### V2 — one-Condition integration — ✅ main

- existing confirm surface only,
- `なし` or one Condition,
- transient BattleEngine hooks,
- Condition clear is ordinary `recordStageResult(encodedStageId)` metadata,
- Option steering 34% → max 38%,
- bounded Legendary contribution,
- no IP/rarity/Option-count change.

Conditions:
- 返信炉床: 灰圧増幅 / 乾いた傷口 / 反響打撃
- 第九照準廊: 再照準短縮 / 精鋭連鎖 / 照準固定
- 異記憶根室: 記録飽和 / 根脈枯渇 / 生体再演

`精鋭連鎖` does not set the Abyss `enemy.elite` flag, preventing accidental Abyss Shard rewards.

### V3 — Combination Gate — ✅ main

- derive mastery only from each region's 3 existing single-Condition stage-clear IDs,
- UI shows single-clear progress `0/3 ... 3/3`,
- at `3/3`, selection cap becomes 2 Conditions,
- two-Condition stage IDs encode both Condition IDs,
- builder hard-caps at 2 even for crafted IDs,
- Option steering max 42%,
- no three-Condition progression requirement,
- no mastery currency/rank/save root.

### V4 — Convergence Apex — ✅ complete candidate

Unlock contract:
- all 3 baseline Deep Surveys cleared,
- at least 1 single-Condition clear in each region,
- no requirement for all 9 Conditions,
- no requirement for any two-Condition clear,
- unlock is derived only from ordinary existing stage-clear records.

Encounter:
1. **Ash / endurance** — healing pressure + heavier incoming hits,
2. **Ninth / tempo** — enemy initiative/speed pressure,
3. **Root / rotation** — MP-cost pressure + repeated-action inefficiency,
4. **Convergence** — Ash → Ninth → Root pressure cycles every two rounds instead of stacking all maximum penalties simultaneously.

Implementation rules:
- one existing Secret Realm route,
- first phase keeps normal encounter-entry grace; later phases continue immediately,
- existing BattleEngine only; no second combat engine,
- Lv99,999 / IP10,000 remains absolute,
- existing Gear 9 target-farm wrapper remains authoritative,
- Apex mixed chase uses all three regional Option families with 36% steering,
- Legendary addition stays within +4 percentage points,
- first clear reuses existing `uq_cp3_boundary_echo`,
- repeat drops reuse existing CP3/Gear items only,
- no Apex currency, shard, gear rarity or new Item Power cap.

### V5 — Acceptance simulation — NEXT

Validate deterministically:
- baseline / one-Condition / two-Condition target steering at 34 / 38 / 42%,
- Greater / Legendary bounds,
- max-three Options,
- Smart Loot does not auto-protect all Fusion material,
- single/two-Condition mastery routing,
- Apex unlock from existing clear IDs,
- Apex mixed-chase reward compatibility,
- no new reward/save progression root.

### V6 — polish/manual feel

Tune wording, phase readability, mobile battle pressure and reward feel only. Do not add another progression layer.

## Permanent guardrails

- no new currency/save root/Home route,
- no daily/weekly/FOMO loop,
- no new rarity or IP cap,
- no infinite modifier tree,
- no 3-Condition requirement,
- no mandatory Named Unique/build lane,
- brute-force investment remains valid,
- old saved 4–5 Option gear remains untouched.

`「知らん、火力と耐久で押し切る」も正しい攻略法。`

## Supersession

Old PR #228 remains superseded. The post-Gear Deep Survey implementation, quantitative acceptance and vertical-extension design are current authority.
