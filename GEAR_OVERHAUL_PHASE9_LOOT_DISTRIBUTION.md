# Gear Overhaul Phase 9 — Loot Distribution / Endgame Return

Status: **9A Named Unique target-farm distribution ACTIVE / NEXT: 9B activity-role separation**

## Goal

Reconnect the completed Gear Overhaul to existing endgame content so the player can answer:

> **「この装備が欲しい。どこを掘ればいい？」**

No new activity, currency, save root, pity meter, daily/weekly loop or Home button is introduced.

## Phase 9A — Named Unique target farms

The six Phase 8C Named weapons are distributed through existing stage metadata and the canonical `dropTable` pipeline.

| Named Unique | Target farm | Condition | Weight |
|---|---|---|---:|
| 終王斧グリムヘッド | Abyss Armory | `armory` route, Boss floor, depth >= 1200 | 0.08 |
| 連星拳アルカ | Abyss Armory | `armory` route, depth >= 1800 | 0.07 |
| 残光弓アステリオン | Rift | Wind / Lightning key | 0.09 |
| 葬毒刃ミアズマ | Rift | Poison / Dark key | 0.09 |
| 戦律器カデンツァ | Secret Realm | `secret-inverted-library` | 0.11 |
| 反照錫セラフィム | Secret Realm | final Eighth Key stage | 0.12 |

### Why this shape

- **Abyss** remains the repeatable raw-gear / high-depth chase. Heavy melee chase belongs to the existing Armory route.
- **Rift** already exposes elemental key identity. Bow / poison-dagger chase therefore turns key element into a real target-farm decision.
- **Secret Realm** remains the authored discovery/build-identity chase. Cadenza and Seraphim have explicit authored destinations rather than generic random pools.
- The six weapons still enter the normal weapon-instance pipeline, so duplicate drops keep distinct max-three Options and remain useful for Option Fusion / god-roll hunting.

## Implementation contract

`js/data/gearOverhaulPhase9TargetFarm.js` is a thin distribution layer.

It may:
- inspect existing stage metadata,
- prepend a bounded Named Unique entry to the existing `dropTable`,
- expose `stage.unique2TargetFarm` as informational metadata.

It must not:
- directly grant an item outside the existing drop engine,
- reroll or trim existing saved gear,
- change Unique FIXED identities,
- create a new loot currency or vendor,
- make a Named Unique universally mandatory BiS.

## Phase 9B — NEXT: activity-role separation

Audit and strengthen the remaining endgame identities without inventing parallel progression:

- **Abyss** — high-depth Option quality / repeatable weapon pressure.
- **Rift / World Event** — Greater / Ancient / burst-quality opportunities.
- **Nemesis / EX Bounty** — enemy-themed Named / Unique chase where an authored enemy relationship exists.
- **Secret Realm** — authored Named / build-identity chase.
- **Deep Survey** — hardest mixed chase after the paused branch is reconciled.

9B should improve visible guidance and reward distinction first. It should not duplicate the six 9A target farms across every activity.

## Phase 9C — endgame loop validation

Regression / simulation target:

`high difficulty → target gear → evaluate max-three Options → Option Fusion/build refinement → deeper difficulty`

Validate that:
- each activity has a reason to exist,
- target farms do not become guaranteed handouts,
- brute-force farming remains viable,
- intended builds can reach the same content earlier and more efficiently,
- no single Unique becomes a hard progression gate.
