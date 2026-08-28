# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Deep Survey Reconciliation ACTIVE**

Gear Overhaul Phases 0–9 are complete. Post-CP3 high difficulty now consumes that finished loot loop instead of creating parallel progression.

## Deep Survey — current implementation

Three existing CP3 hidden-route conclusions become Lv99,999 / IP10,000 Secret Realm targets:

| Region | Combat pressure | Gear purpose |
|---|---|---|
| 返信炉床・深層観測 | HP pressure + healing restriction | high Option gear; DEF / HP / guard-heal / lifesteal bias |
| 第九照準廊・深層観測 | ATK + Elite pressure | high-quality gear; SPD / Crit / attack-speed / Crit-damage bias |
| 異記憶根室・深層観測 | HP + healing + Boss-technique pressure | high Option gear; MAG / MP / CDR / crit-MP bias |

Unlock authority remains existing CP3 `world2.discoveries`. The existing Exploration root and Secret Realm routing are reused.

## Loot contract

Deep Survey is the hardest **mixed chase**, not a new loot tier.

It reuses:
- Item Power up to 10,000,
- max-three random Options,
- seven Option rarities,
- Option Lv1–100,
- Greater / Legendary / Curse systems already present,
- Option Fusion for non-jackpot drops,
- existing Loot3 target-Affix steering through `loot3Profile`.

Regional Option steering is bounded at 34%; it is a bias, never a guaranteed roll. Small Legendary chance additions are capped at +3–4 percentage points.

## Permanent guardrails

- no new currency,
- no new save root,
- no new Home button or parallel mode,
- no daily/weekly/FOMO loop,
- no hard requirement for one Named Unique or one Phase 6 build lane,
- brute-force stat / Option investment remains a valid route,
- old saved 4–5 Option gear remains untouched.

## What comes after this

Do not automatically add Survey Conditions / Convergence Apex merely because they existed in the old pre-Gear plan.

First playtest the three-region loop:

`Deep Survey → mixed gear drops → evaluate max-three Options → Option Fusion / build refinement → return deeper/faster`

Only add another vertical layer if these three regions prove too shallow after the Gear loop is actually exercised.

## Supersession

Old PR #228 was designed before Gear Overhaul. Its three-region world/combat concept is retained, but its reward assumptions and brittle tests are superseded by the post-Gear implementation.
