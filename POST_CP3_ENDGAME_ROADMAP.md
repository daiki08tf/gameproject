# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Vertical Extension ACTIVE — V1–V4 merged / V5 Acceptance complete candidate / V6 NEXT**

Gear Overhaul Phases 0–9, post-Gear Deep Survey, Survey Conditions and Convergence Apex are implemented on the existing Gear/Exploration/Secret Realm stack.

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
- ordinary encoded stage-clear metadata is mastery history,
- Option steering 34% → max 38%,
- no IP/rarity/Option-count change.

### V3 — Combination Gate — ✅ main
- 3 single clears unlock max-two Condition selection,
- two-Condition stage IDs encode both Condition IDs,
- builder hard-caps at 2,
- Option steering max 42%,
- no 3-Condition progression requirement or mastery currency.

### V4 — Convergence Apex — ✅ main
Unlock:
- all 3 baseline Deep Surveys,
- at least 1 single-Condition clear in each region,
- no all-9 or two-Condition requirement.

Encounter:
1. Ash / endurance,
2. Ninth / tempo,
3. Root / resource + rotation,
4. Convergence cycling Ash → Ninth → Root every two rounds.

Apex stays Lv99,999 / IP10,000, reuses existing BattleEngine/Secret Realm/Gear 9 routing and existing CP3 rewards only.

### V5 — Acceptance simulation — ✅ complete candidate

`npm run sim:deep-survey` now validates the entire vertical extension rather than baseline only.

Deterministic acceptance covers:
- baseline / one-Condition / two-Condition configured steering at **34 / 38 / 42%**,
- observed steering within a bounded tolerance of those configured rates,
- Convergence Apex mixed steering at **36%** and still non-guaranteed,
- Condition Legendary contribution never more than **+4 percentage points above each region baseline**,
- Greater evaluation at IP10,000 boss pressure using the live Greater rules,
- Greater max-three contract,
- new gear max-three random Options,
- canonical Option 4.0 records only,
- Smart Loot leaves ordinary feedable gear instead of protecting everything,
- preferred regional families repeatedly produce positive same-family Option Fusion XP,
- Apex uses the same bounded Gear/CP3 reward ecosystem.

The acceptance suite is also wired into `node --test` through `tests/post-cp3-vertical-acceptance.test.js`.

### V6 — polish/manual feel — NEXT
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
