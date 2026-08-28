# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Vertical Extension ACTIVE — V1/V2 merged / V3 Combination Gate complete candidate / V4 NEXT**

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

### V3 — Combination Gate — ✅ complete candidate

- derive mastery only from each region's 3 existing single-Condition stage-clear IDs,
- UI shows single-clear progress `0/3 ... 3/3`,
- at `3/3`, selection cap becomes 2 Conditions,
- two-Condition stage IDs encode both Condition IDs,
- builder hard-caps at 2 even for crafted IDs,
- Option steering max 42%,
- no three-Condition progression requirement,
- no mastery currency/rank/save root.

### V4 — Convergence Apex — NEXT

Unlock contract:
- all 3 baseline Deep Surveys cleared,
- at least 1 Condition clear in each region,
- do not require all 9 Conditions or any two-Condition clear.

Encounter contract:
1. Ash / endurance,
2. Ninth / tempo,
3. Root / resource + rotation,
4. final Convergence cycling one readable mechanic from each.

Use one existing Secret Realm route and existing stage-clear records. No new Home button, gear tier or mandatory Named Unique.

### V5 — Acceptance simulation

Validate:
- 34 / 38 / 42% steering,
- Greater / Legendary bounds,
- max-three Options,
- Smart Loot/Fusion-material supply,
- single/two-Condition mastery routing,
- Apex unlock/reward compatibility.

### V6 — polish/manual feel

Tune wording, readability, mobile battle pressure and reward feel only.

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
