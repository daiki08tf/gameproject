# Post-CP3 Vertical Extension Design

Status: **DESIGN READY / IMPLEMENTATION NOT YET ACTIVE**

This document is the contingency design that should be used only if manual Deep Survey play confirms that the current three-region apex becomes shallow after gearing.

It does not authorize implementation by itself. The existing Manual Feel Gate remains the trigger.

## 1. Design goal

Deepen the existing loop without creating another progression system.

Target loop:

`Deep Survey → choose authored pressure → clear harder replay → improve existing Gear/Options → unlock Convergence Apex → repeat for speed/safety/build variety`

Permanent constraints:

- no new currency,
- no new save root,
- no new Home button or parallel mode,
- no daily/weekly/FOMO cadence,
- no new gear rarity or Item Power cap,
- no mandatory Named Unique,
- no infinite modifier tree,
- no requirement that one build archetype be the only correct answer,
- brute-force stat/Option investment remains valid if sufficiently strong.

## 2. Layer A — Survey Conditions

Survey Conditions are **optional authored replay clauses attached to each existing Deep Survey**. They should reuse Abyss Challenge machinery wherever possible.

Each region exposes exactly three Conditions. The player can choose one at first. Clearing all three individually unlocks a two-Condition combination for that region. A three-Condition stack is intentionally not required for progression and is not part of the first implementation.

No new screen is added. Conditions appear inside the existing Deep Survey detail/start surface.

### 2.1 返信炉床・深層観測

Purpose: test sustain, guard timing, recovery and raw durability.

- **灰圧増幅** — enemy HP pressure increases further. Favors long-form sustain and efficient damage.
- **乾いた傷口** — healing is reduced further, but not disabled. Favors mitigation, guard, absorption and kill-speed alternatives.
- **反響打撃** — repeated direct hits from enemies gain pressure over time until interrupted by guard/defensive timing. Must be implemented through existing combat effect/challenge hooks, not a new resource meter.

Reward steering: keep the current DEF / HP / Guard-heal / Lifesteal regional Option bias, with a modest increase to existing Greater/Legendary opportunity. Do not create a new reward pool.

### 2.2 第九照準廊・深層観測

Purpose: test tempo, first-action value, target prioritization and burst consistency.

- **再照準短縮** — enemy speed/turn pressure increases.
- **精鋭連鎖** — Elite density or Elite pressure rises using existing challenge machinery.
- **照準固定** — leaving dangerous enemies alive for too long increases incoming pressure. This should be implemented as existing enemy/boss behavior pressure, not a timer UI or FOMO mechanic.

Reward steering: keep SPD / Crit / Attack Speed / Crit Damage bias, with modest Greater quality pressure only.

### 2.3 異記憶根室・深層観測

Purpose: test MP economy, skill/spell rotation and resistance to repetitive play.

- **記録飽和** — repeated use of the same action becomes less efficient temporarily; alternating actions avoids the penalty. No permanent stack resource should be saved.
- **根脈枯渇** — stronger MP/resource pressure using existing cost/recovery hooks.
- **生体再演** — boss technique frequency/variety increases using existing boss-technique challenge behavior.

Reward steering: keep MAG / MP / CDR / Crit-MP bias and existing mixed-chase loot.

## 3. Condition reward contract

Conditions should improve **quality density, not create exclusive power**.

Preferred reward adjustments:

- +small Greater chance or Greater-count weight,
- +small Legendary chance within existing caps,
- slightly stronger existing regional Option steering,
- optional increase to mixed-drop quantity if needed after simulation,
- never guarantee Ancient, Greater×3, Legendary Power, or a specific Option.

Hard caps for initial implementation:

- regional target Option steering: baseline 34%, one Condition <= 38%, two Conditions <= 42%,
- total additional Legendary chance from Conditions: <= +4 percentage points above the current region profile,
- no new Item Power above 10,000,
- max three random Options remains absolute for new gear.

Rejected drops must still remain useful Option Fusion material. Smart Loot must not auto-protect so much gear that Fusion supply collapses.

## 4. Layer B — Convergence Apex

Convergence Apex is one authored Secret Realm encounter revealed only after the player proves all three Deep Survey lessons.

### 4.1 Unlock

Minimum unlock contract:

- clear all three baseline Deep Surveys,
- clear at least one Survey Condition in each region.

Do **not** require all Conditions or two-Condition clears to unlock the Apex. Those remain optional mastery goals.

Use existing stage/discovery/clear records where possible. Avoid a new progression root.

### 4.2 Encounter structure

One encounter, three authored phases, one final convergence phase.

**Phase I — Ash / endurance**
- healing pressure,
- heavy but readable attacks,
- guard/mitigation/sustain valuable,
- pure damage can still skip portions if sufficiently invested.

**Phase II — Ninth / tempo**
- faster enemy cadence,
- Elite/add or target-priority pressure,
- burst and speed valuable,
- tank builds can survive through it with enough investment.

**Phase III — Root / rotation**
- MP/resource pressure,
- boss-technique variation,
- repeated-action inefficiency or alternating-response incentive,
- simple high-stat builds remain viable through raw reserves and durability.

**Final — Convergence**
- combines one readable mechanic from each prior phase,
- never stacks all maximum penalties simultaneously,
- mechanics cycle rather than randomly overlap,
- player should recognize the source of each pressure from the three regions.

The fight must feel like synthesis, not a fourth unrelated gimmick.

## 5. Apex rewards

Apex rewards should be distinctive but side-grade oriented.

Preferred first-clear reward:

- one existing-system cosmetic/title/codex-style distinction, and/or
- one deterministic high-quality existing gear drop whose power remains inside current Legendary/Greater/Option rules.

Repeat clears:

- strongest mixed-chase density in the game,
- no unique mandatory material,
- no new currency,
- no Apex-only gear tier,
- no guaranteed best-in-slot item.

Named Unique eligibility may be higher here, but no single Unique may be required to clear the encounter.

## 6. Mastery goals without a new system

Optional mastery can be expressed only through existing clear records/UI:

- baseline clear,
- each single Condition clear,
- one two-Condition clear per region,
- Convergence Apex clear.

Do not add a mastery currency, battle pass, rank ladder or infinite difficulty score.

If a visible completion indicator is useful, render it inside existing Exploration/Secret Realm detail surfaces from ordinary clear metadata.

## 7. Balance philosophy

The intended relationship is:

- counter-build = earlier/cheaper clear,
- balanced build = normal clear,
- brute-force build = later/more expensive but still valid clear.

No Condition should hard-disable healing, crits, magic, physical damage, guard, or one weapon family. Pressure may reduce efficiency, but never invalidate an entire build identity.

The permanent rule remains:

`「知らん、火力と耐久で押し切る」も正しい攻略法。`

## 8. Implementation order if activated

1. **V1 — Condition data contract**: authored Condition definitions, no UI expansion beyond existing stage detail.
2. **V2 — Region integration**: one-Condition selection, live Abyss challenge reuse, reward steering caps.
3. **V3 — Combination gate**: unlock two-Condition replays after all singles for that region; still optional.
4. **V4 — Convergence Apex encounter**: authored four-phase fight and existing-system reward wiring.
5. **V5 — Acceptance simulation**: confirm target Option rates, Smart Loot/Fusion supply, Greater/Legendary bounds and max-three Option contract.
6. **V6 — Polish/manual feel**: tune wording, encounter readability, mobile command pressure and reward feel.

Each step should be independently shippable and protected by tests before the next begins.

## 9. Activation gate

Implement this design only if manual Deep Survey play reveals one or more of these problems:

- three regions stop feeling meaningfully different after gearing,
- repeated clears have no reason to alter build choices,
- target farming becomes solved too quickly,
- returning with refined Gear does not create a satisfying mastery loop,
- the current apex lacks a final synthesis challenge.

If those problems are not observed, keep the current three-region Deep Survey as the apex and do not build this extension simply because the design exists.
