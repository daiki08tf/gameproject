# Gear Overhaul Phase 9 — Loot Distribution / Endgame Return

Status: **9A Named Unique target farms ✅ / 9B activity-role separation ACTIVE / NEXT: 9C endgame loop validation**

## Goal

Reconnect the completed Gear Overhaul to existing endgame content so the player can answer:

> **「この装備が欲しい。どこを掘ればいい？」**

No new activity, currency, save root, pity meter, daily/weekly loop or Home button is introduced.

## Phase 9A — Named Unique target farms ✅

The six Phase 8C Named weapons are distributed through existing stage metadata and the canonical `dropTable` pipeline.

| Named Unique | Target farm | Condition | Weight |
|---|---|---|---:|
| 終王斧グリムヘッド | Abyss Armory | `armory` route, Boss floor, depth >= 1200 | 0.08 |
| 連星拳アルカ | Abyss Armory | `armory` route, depth >= 1800 | 0.07 |
| 残光弓アステリオン | Rift | Wind / Lightning key | 0.09 |
| 葬毒刃ミアズマ | Rift | Poison / Dark key | 0.09 |
| 戦律器カデンツァ | Secret Realm | `secret-inverted-library` | 0.11 |
| 反照錫セラフィム | Secret Realm | final Eighth Key stage | 0.12 |

PR #256. The six weapons still enter the normal weapon-instance pipeline, so duplicate drops keep distinct max-three Options and remain useful for Option Fusion / god-roll hunting.

## Phase 9B — activity-role separation 🔄

`js/data/endgameLootRoles.js` defines one readable loot purpose for each existing activity instead of adding another reward system:

| Activity | Primary loot identity | Secondary purpose |
|---|---|---|
| Abyss | Option / raw equipment | Armory weapon / Set / Named chase |
| Rift | Greater / Ancient burst quality | element-key target farms |
| Nemesis / EX | rival / enemy-themed high-risk rewards | intel + hunt-mode efficiency |
| Secret Realm | Named / Build Identity | authored discovery / Set chase |

The existing Home `NEXT` guidance card now shows a compact **目的別ファーム** line once endgame opens. It reuses the existing card and adds no Home button or new screen.

This phase intentionally does **not** copy every Named weapon into Nemesis or every endgame activity. Role clarity is achieved by exposing and reusing rewards that already exist.

## Implementation contract

`js/data/gearOverhaulPhase9TargetFarm.js` is the thin Phase 9A distribution layer.

It may:
- inspect existing stage metadata,
- prepend a bounded Named Unique entry to the existing `dropTable`,
- expose `stage.unique2TargetFarm` as informational metadata.

`js/data/endgameLootRoles.js` is the Phase 9B guidance contract.

It may:
- describe the existing activity's loot purpose,
- expose compact role summaries to existing UI.

Neither layer may:
- directly grant an item outside the existing drop engine,
- reroll or trim existing saved gear,
- change Unique FIXED identities,
- create a new loot currency or vendor,
- make a Named Unique universally mandatory BiS.

## Phase 9C — NEXT: endgame loop validation

Regression / simulation target:

`high difficulty → target gear → evaluate max-three Options → Option Fusion/build refinement → deeper difficulty`

Validate that:
- each activity has a reason to exist,
- target farms do not become guaranteed handouts,
- Greater / Ancient / Named signals stay economically distinct,
- duplicate Named drops remain useful rather than dead drops,
- brute-force farming remains viable,
- intended builds can reach the same content earlier and more efficiently,
- no single Unique becomes a hard progression gate.

After 9C, reconcile the paused Deep Survey branch against the finished Gear Overhaul instead of reviving an old parallel progression design.
