# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Vertical Extension ACTIVE — V1/V2 Survey Conditions implementation**

Gear Overhaul Phases 0–9 and the post-Gear Deep Survey quantitative acceptance gate are complete. The player explicitly activated the designed vertical extension after the design review, so the former Manual Feel Gate is no longer an implementation blocker.

## Deep Survey — baseline complete

Three CP3 hidden-route conclusions remain the Lv99,999 / IP10,000 apex foundations:

| Region | Combat pressure | Gear purpose |
|---|---|---|
| 返信炉床・深層観測 | HP + healing pressure | DEF / HP / guard-heal / lifesteal bias |
| 第九照準廊・深層観測 | ATK + tempo pressure | SPD / Crit / attack-speed / Crit-damage bias |
| 異記憶根室・深層観測 | HP + healing + Boss-technique pressure | MAG / MP / CDR / crit-MP bias |

Baseline regional Option steering remains 34%. The existing Exploration root, Secret Realm route, CP3 `world2.discoveries`, Item Power 10,000, max-three Options, Option Lv1–100, Greater / Legendary / Curse, Smart Loot and Option Fusion remain authoritative.

`npm run sim:deep-survey` is the quantitative regression gate for the baseline mixed-chase loop.

## Vertical Extension implementation

The authoritative design is `POST_CP3_VERTICAL_EXTENSION_DESIGN.md`.

### V1 — Condition data contract — COMPLETE candidate

- exactly three authored Conditions per Deep Survey region,
- stable Condition IDs and encoded Secret Realm stage IDs,
- no new currency/save root/Home route,
- reward steering helpers enforce the one-Condition 38% and future two-Condition 42% caps.

### V2 — one-Condition region integration — COMPLETE candidate

- Condition selector appears only inside the existing Deep Survey confirm surface,
- player may choose `なし` or one of the region's three Conditions,
- the selection is runtime-only; the battle stage gets an encoded condition stage ID,
- existing `recordStageResult(stage.id, ...)` therefore stores Condition clear history without a new progression root,
- combat hooks are transient BattleEngine state only,
- one Condition raises regional Option steering from 34% to at most 38%,
- Condition Legendary contribution stays bounded to +4 percentage points above the region profile,
- no Item Power / rarity / Option-count cap changes.

Implemented single-Condition pressures:

- **返信炉床**: 灰圧増幅 / 乾いた傷口 / 反響打撃
- **第九照準廊**: 再照準短縮 / 精鋭連鎖 / 照準固定
- **異記憶根室**: 記録飽和 / 根脈枯渇 / 生体再演

`精鋭連鎖` deliberately does not set the existing Abyss `enemy.elite` flag, because that flag also awards Abyss Shards. Deep Survey Conditions must not become a new Abyss-currency source.

### V3 — Combination gate — NEXT

After V1/V2 CI and play-safety are green:

- use existing Condition stage clear IDs to detect all three single clears for a region,
- unlock optional two-Condition selection for that region,
- never require a three-Condition stack,
- two Conditions cap regional Option steering at 42%,
- no new mastery currency or rank ladder.

### V4 — Convergence Apex

After V3:

- unlock after all three baseline Deep Surveys plus at least one Condition clear in each region,
- one authored Secret Realm encounter with Ash → Ninth → Root → Convergence phases,
- no mandatory Named Unique or new gear tier,
- first-clear/repeat rewards remain inside existing Gear systems.

### V5 — Acceptance simulation

Add deterministic validation for:

- 34% / 38% / 42% target-steering bounds,
- Greater / Legendary bounds,
- max-three Options,
- Smart Loot not protecting all Fusion material,
- encoded Condition clear/mastery routing,
- Apex reward compatibility.

### V6 — polish/manual feel

Tune wording, battle readability, mobile pressure and reward feel without adding another progression layer.

## Permanent guardrails

- no new currency,
- no new save root,
- no new Home button or parallel mode,
- no daily/weekly/FOMO loop,
- no new rarity or Item Power cap,
- no hard requirement for one Named Unique or one Phase 6 build lane,
- no infinite modifier tree,
- no three-Condition progression requirement,
- brute-force stat / Option investment remains a valid route,
- old saved 4–5 Option gear remains untouched.

The balance rule remains:

`「知らん、火力と耐久で押し切る」も正しい攻略法。`

## Supersession

Old PR #228 remains superseded. The post-Gear Deep Survey implementation, quantitative acceptance, and `POST_CP3_VERTICAL_EXTENSION_DESIGN.md` are the current authority.
