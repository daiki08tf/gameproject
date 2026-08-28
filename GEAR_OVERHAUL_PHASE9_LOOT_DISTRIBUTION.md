# Gear Overhaul Phase 9 — Loot Distribution / Endgame Return

Status: **9A Named Unique target farms ✅ / 9B activity-role separation ✅ / 9C endgame loop validation ✅ COMPLETE**

## Goal

Reconnect the completed Gear Overhaul to existing endgame content so the player can answer:

> **「この装備が欲しい。どこを掘ればいい？」**

No new activity, currency, save root, pity meter, daily/weekly loop or Home button is introduced.

## Phase 9A — Named Unique target farms ✅

The six Phase 8C Named weapons are distributed through existing stage metadata and the canonical equipment-instance pipeline.

| Named Unique | Target farm | Condition | Delivery |
|---|---|---|---|
| 終王斧グリムヘッド | Abyss Armory | `armory` route, Boss floor, depth >= 1200 | dropTable weight 0.08 |
| 連星拳アルカ | Abyss Armory | `armory` route, depth >= 1800 | dropTable weight 0.07 |
| 残光弓アステリオン | Rift | Wind / Lightning key | one 6% roll per clear |
| 葬毒刃ミアズマ | Rift | Poison / Dark key | one 6% roll per clear |
| 戦律器カデンツァ | Secret Realm | `secret-inverted-library` | dropTable weight 0.11 |
| 反照錫セラフィム | Secret Realm | final Eighth Key stage | dropTable weight 0.12 |

PR #256 introduced the target map. Phase 9C corrected Rift delivery after validating the live `_rollDrop()` behavior: Rift had an empty base `dropTable`, so placing one Named entry there would make every successful table roll choose that Named. Rift now performs one bounded clear roll instead of one eligible table roll per enemy.

All six weapons still enter `state.addItem()` and the normal weapon-instance pipeline, so duplicate drops keep distinct max-three Options and remain useful for Option Fusion / god-roll hunting.

## Phase 9B — activity-role separation ✅

`js/data/endgameLootRoles.js` defines one readable loot purpose for each existing activity instead of adding another reward system:

| Activity | Primary loot identity | Secondary purpose |
|---|---|---|
| Abyss | Option / raw equipment | Armory weapon / Set / Named chase |
| Rift | Greater / Ancient burst quality | element-key target farms |
| Nemesis / EX | rival / enemy-themed high-risk rewards | intel + hunt-mode efficiency |
| Secret Realm | Named / Build Identity | authored discovery / Set chase |

The existing Home `NEXT` guidance card shows one compact **目的別ファーム** line once endgame opens. It reuses the existing card and adds no Home button or new screen.

This phase intentionally does **not** copy every Named weapon into Nemesis or every endgame activity.

## Phase 9C — endgame loop validation ✅

Regression / simulation target:

`high difficulty → target gear → evaluate max-three Options → Option Fusion/build refinement → deeper difficulty`

Validation now covers:
- actual Abyss / Rift / Secret Realm stage builders,
- wrong-route / wrong-element exclusion,
- low Named share inside existing Abyss / Secret Realm tables,
- Rift Named chase as one clear roll rather than per-enemy table monopoly,
- deterministic 20,000-trial simulation around the authored 6% Rift clear rate,
- explicit activity-role data for Abyss / Rift / Nemesis-EX / Secret Realm,
- existing Phase 8 duplicate-instance regression for max-three random Options.

Permanent constraints:
- target farms stay chase rewards, not guaranteed handouts,
- Greater / Ancient / Named signals remain economically distinct,
- duplicate Named drops remain useful,
- brute-force farming remains viable,
- intended builds can reach content earlier and more efficiently,
- no single Unique becomes a hard progression gate.

## Next

Gear Overhaul Phases 0–9 are now closed. The next default task is to reconcile the paused Deep Survey branch against the finished Gear Overhaul before expanding it.

Do not revive the old Deep Survey implementation unchanged if it assumes pre-Option4 loot behavior or generic endgame rewards. Deep Survey should become the hardest **mixed chase** built on the now-final gear loop, not a new currency or parallel progression track.
