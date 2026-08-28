# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Vertical Extension V1–V6 IMPLEMENTED / automated acceptance green candidate / manual feel tuning remains**

Gear Overhaul Phases 0–9, post-Gear Deep Survey, Survey Conditions, Convergence Apex and automated acceptance are implemented on the existing Gear/Exploration/Secret Realm stack.

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

Apex stays Lv99,999 / IP10,000 and reuses existing BattleEngine/Secret Realm/Gear 9 routing and existing CP3 rewards only.

### V5 — Acceptance simulation — ✅ main

`npm run sim:deep-survey` validates the entire vertical extension:
- configured steering **34 / 38 / 42%** for baseline / one / two Conditions,
- Apex mixed steering **36%** and non-guaranteed,
- Condition Legendary contribution <= **+4pp over regional baseline**,
- live Greater rules at IP10,000 boss pressure,
- Greater max-three,
- new gear max-three random Options,
- canonical Option 4.0 only,
- Smart Loot leaves Fusion material,
- preferred families repeatedly provide same-family Option Fusion XP,
- Apex remains inside existing Gear/CP3 reward rules.

### V6 — readability / mobile polish — ✅ complete candidate

No systems or reward numbers are added. Existing surfaces are clarified for portrait/mobile play:
- Survey Condition controls use a compact **2-column** button grid,
- touch targets have a minimum 42px height and pressed-state semantics,
- single-clear progress and 34/38/42% steering are shortened into one readable line,
- Apex list card explicitly shows **APEX / 4-PHASE** and `ASH → NINTH → ROOT → CONVERGENCE`,
- Apex confirm explicitly shows **36% mixed chase**, first-clear reward and repeat-reward identity,
- Text Battle title shows the current Apex phase,
- Final phase shows the currently active Ash/Ninth/Root sub-cycle,
- no new Home button, screen or navigation route.

## Remaining manual feel gate

Automated implementation is complete. The remaining work is play-feel tuning only:
- are Condition buttons understandable on an actual phone,
- do 38/42% target rates feel rewarding without feeling guaranteed,
- are Ash/Ninth/Root pressures distinguishable without reading docs,
- does the 4-phase Apex feel long enough to be climactic but not exhausting,
- are Final sub-cycle changes readable during real command selection,
- does rejected loot still feel naturally useful for Option Fusion.

Any adjustment after this gate should tune numbers/wording/layout only unless a concrete gameplay failure is observed.

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
Old PR #228 remains superseded. The post-Gear Deep Survey implementation, vertical-extension implementation and current acceptance suite are authoritative.
