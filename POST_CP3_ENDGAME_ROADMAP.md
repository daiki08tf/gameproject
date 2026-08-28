# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Deep Survey Loop Validation ACTIVE**

Gear Overhaul Phases 0–9 are complete. Post-CP3 high difficulty consumes that finished loot loop instead of creating parallel progression.

## Deep Survey — current implementation

Three existing CP3 hidden-route conclusions are Lv99,999 / IP10,000 Secret Realm targets:

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

## Loop Validation — active gate

The post-Gear loop is now regression-tested as:

`Deep Survey → mixed gear drops → evaluate max-three Options → Option Fusion / build refinement → return deeper/faster`

Automated validation must keep proving that:
- each region's 34% Option-family steering remains materially visible but non-guaranteed,
- target steering returns canonical Option 4.0 records,
- Greater status survives a steered Option identity,
- Deep Survey remains on the existing IP10,000 / Option / Legendary / Greater loot stack,
- no parallel reward tier or progression root is introduced.

This automated gate validates the plumbing and statistical intent. Manual feel testing still decides whether the three-region loop is deep enough to justify another vertical layer.

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

First exercise the three-region loop under the validation gate above. Only add another vertical layer if the regions prove too shallow after the Gear loop is actually played.

If a later expansion is justified, it must deepen the existing loop rather than add a new currency, gear tier, Home route, timed loop, or mandatory single-build gate.

## Supersession

Old PR #228 was designed before Gear Overhaul. Its three-region world/combat concept is retained, but its reward assumptions and brittle tests are superseded by the post-Gear implementation.
