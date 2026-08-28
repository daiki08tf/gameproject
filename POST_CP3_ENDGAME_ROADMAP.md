# Post-CP3 Endgame Roadmap — Reconciled after Gear Overhaul

Status: **Deep Survey Quantitative Acceptance COMPLETE / Manual Feel Gate ACTIVE / Vertical Extension DESIGN READY**

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

## Quantitative Acceptance — complete

The post-Gear loop is exercised as:

`Deep Survey → mixed gear drops → evaluate max-three Options → Option Fusion / build refinement → return deeper/faster`

`npm run sim:deep-survey` now runs a deterministic acceptance simulation for all three regions using the live Option 4.0 quality bridge, regional steering, Smart Loot protection rules and Option Fusion XP.

Automated acceptance proves that:
- each region's 34% Option-family steering remains materially visible but non-guaranteed,
- every simulated Option remains canonical Option 4.0,
- no simulated item exceeds three random Options,
- valuable Ancient/protected outcomes remain present,
- ordinary drops remain available as Fusion material instead of everything being auto-protected,
- every preferred regional family repeatedly supplies positive same-family Fusion XP,
- Deep Survey remains on the existing IP10,000 / Option / Legendary / Greater loot stack,
- no parallel reward tier or progression root is introduced.

This closes the quantitative/plumbing gate. It does **not** pretend to replace human play feel.

## Manual Feel Gate — active

Before adding any new vertical layer, play the three regions and judge:
- whether the combat pressures feel meaningfully different,
- whether a desired regional Option appears often enough to make target farming readable without feeling guaranteed,
- whether rejected drops naturally feed Option Fusion,
- whether returning after build refinement produces a noticeable faster/safer clear,
- whether the three-region loop still feels rewarding after repeated clears.

If the answer is yes, keep Deep Survey as the current apex and spend the next work on polish/balance rather than another system.

If the answer is no because the loop becomes shallow after gearing, activate the contingency design in `POST_CP3_VERTICAL_EXTENSION_DESIGN.md`.

## Contingency vertical extension — designed, not active

The extension design is now fixed enough for implementation if the Manual Feel Gate justifies it.

It has two layers only:

1. **Survey Conditions** — three authored optional replay conditions per existing Deep Survey, reusing Abyss Challenge/combat hooks and existing reward systems.
2. **Convergence Apex** — one authored multi-phase Secret Realm that synthesizes the durability, tempo and rotation lessons from the three regions.

Key implementation rules are already specified in `POST_CP3_VERTICAL_EXTENSION_DESIGN.md`, including:
- one-condition entry before optional two-condition mastery,
- no three-condition requirement,
- target Option steering caps of 38% / 42%,
- no new rarity, currency, Item Power cap or save root,
- Apex unlock after baseline clears plus at least one Condition clear in each region,
- side-grade/distinctive rewards rather than mandatory BiS,
- acceptance simulation after implementation.

Design readiness must not be mistaken for implementation approval; the Manual Feel Gate is still the activation trigger.

## Permanent guardrails

- no new currency,
- no new save root,
- no new Home button or parallel mode,
- no daily/weekly/FOMO loop,
- no hard requirement for one Named Unique or one Phase 6 build lane,
- brute-force stat / Option investment remains a valid route,
- old saved 4–5 Option gear remains untouched.

## What comes after this

The next decision remains explicitly manual: **keep the three-region apex** or **activate the designed vertical extension because observed play shows the current loop becomes shallow**.

Do not implement Survey Conditions / Convergence Apex merely because the design now exists.

Any later expansion must deepen the existing loop rather than add a new currency, gear tier, Home route, timed loop, or mandatory single-build gate.

## Supersession

Old PR #228 was designed before Gear Overhaul. Its three-region world/combat concept is retained, but its reward assumptions and brittle tests are superseded by the post-Gear implementation and `POST_CP3_VERTICAL_EXTENSION_DESIGN.md`.
