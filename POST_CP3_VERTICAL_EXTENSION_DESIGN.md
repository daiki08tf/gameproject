# Post-CP3 Vertical Extension Design

Status: **ACTIVATED / V1+V2 IMPLEMENTED CANDIDATE / V3 NEXT**

The player explicitly activated this design after the design review. The former Manual Feel Gate is no longer an implementation blocker. Keep the original guardrails and ship each step behind regression tests.

## 1. Goal

Deepen the existing loop without creating another progression system:

`Deep Survey → choose authored pressure → clear harder replay → improve existing Gear/Options → unlock Convergence Apex → repeat for speed/safety/build variety`

Permanent constraints:

- no new currency or save root,
- no new Home button or parallel mode,
- no daily/weekly/FOMO cadence,
- no new gear rarity or Item Power cap,
- no mandatory Named Unique,
- no infinite modifier tree,
- no single correct build,
- brute-force stat/Option investment remains valid if sufficiently strong.

## 2. Layer A — Survey Conditions

Survey Conditions are optional authored replay clauses attached to each existing Deep Survey. No new screen is added; selection lives inside the existing Deep Survey confirm surface.

V1/V2 contract:
- exactly three Conditions per region,
- choose `なし` or one Condition,
- runtime selection itself is not saved,
- battle start encodes the chosen Condition into the existing Secret Realm stage ID,
- existing `recordStageResult(stage.id, ...)` therefore records Condition clear history,
- baseline Deep Survey remains unchanged when no Condition is selected.

V3 contract:
- clearing all three singles in a region unlocks optional two-Condition selection,
- no three-Condition progression requirement,
- no mastery currency/rank ladder.

### 2.1 返信炉床・深層観測

Purpose: sustain, guard timing, recovery and raw durability.

- **灰圧増幅** — additional enemy HP pressure.
- **乾いた傷口** — healing reduced further, never disabled.
- **反響打撃** — attacking continuously builds bounded incoming pressure; Guard breaks the chain.

Reward bias remains DEF / HP / Guard-heal / Lifesteal.

### 2.2 第九照準廊・深層観測

Purpose: tempo, first-action value, target prioritization and burst consistency.

- **再照準短縮** — enemy speed pressure increases.
- **精鋭連鎖** — enemy count rises and periodic enemies receive authored HP/ATK pressure. It intentionally does not set the Abyss `enemy.elite` flag, preventing accidental Abyss Shard rewards.
- **照準固定** — incoming pressure increases gradually with battle rounds, bounded and with no timer/FOMO UI.

Reward bias remains SPD / Crit / Attack Speed / Crit Damage.

### 2.3 異記憶根室・深層観測

Purpose: MP economy, skill/spell rotation and resistance to repetitive play.

- **記録飽和** — repeating attack/skill/spell gains a bounded damage-efficiency penalty; switching action family or guarding clears repetition.
- **根脈枯渇** — MP cost increases through the existing technique-cost hook.
- **生体再演** — Boss technique intervals shorten while keeping existing telegraphs.

Reward bias remains MAG / MP / CDR / Crit-MP.

## 3. Reward contract

Conditions improve quality density, not exclusive power.

Hard caps:
- baseline regional Option steering: 34%,
- one Condition: <= 38%,
- two Conditions: <= 42%,
- total Condition Legendary contribution: <= +4 percentage points above the region profile,
- Item Power <= 10,000,
- max three random Options remains absolute for new gear.

Never guarantee Ancient, Greater×3, Legendary Power or a specific Option. Rejected drops must remain useful Option Fusion material and Smart Loot must not protect everything.

## 4. Layer B — Convergence Apex

Unlock minimum:
- clear all three baseline Deep Surveys,
- clear at least one Survey Condition in each region.

Do not require all Conditions or a two-Condition clear to unlock Apex.

One existing-system Secret Realm encounter uses four readable phases:

1. **Ash / endurance** — healing pressure, heavy readable hits, guard/sustain value.
2. **Ninth / tempo** — faster cadence and target-priority pressure.
3. **Root / rotation** — MP pressure, Boss-technique variety and repetition pressure.
4. **Convergence** — cycles one recognizable mechanic from each region instead of stacking every maximum penalty at once.

Counter-builds should clear earlier/cheaper; balanced builds clear normally; sufficiently invested brute-force builds can still win.

## 5. Apex rewards

Side-grade/distinctive only:
- existing cosmetic/title/codex-style distinction and/or deterministic high-quality existing-system gear for first clear,
- strongest mixed-chase density for repeat clears,
- no new material/currency/tier,
- no guaranteed BiS,
- Named Unique eligibility may be higher but no Named Unique is required.

## 6. Mastery without a new system

Use ordinary stage clear metadata only:
- baseline clear,
- each single Condition clear,
- one two-Condition clear per region,
- Apex clear.

Any completion indicator belongs inside existing Exploration/Secret Realm detail surfaces.

## 7. Balance philosophy

- counter-build = earlier/cheaper clear,
- balanced build = normal clear,
- brute-force build = later/more expensive but valid clear.

No Condition may hard-disable healing, crits, magic, physical damage, guard or an entire weapon family.

`「知らん、火力と耐久で押し切る」も正しい攻略法。`

## 8. Implementation order

1. **V1 — Condition data contract** — implemented candidate.
2. **V2 — Region integration / one Condition** — implemented candidate; awaiting CI before merge.
3. **V3 — Combination gate** — next after V1/V2 green.
4. **V4 — Convergence Apex** — after V3.
5. **V5 — Acceptance simulation** — validate 34/38/42%, Smart Loot/Fusion supply, Greater/Legendary bounds and max-three contract.
6. **V6 — Polish/manual feel** — wording, readability, mobile pressure and reward feel.

Each step must remain independently shippable and regression-tested.
