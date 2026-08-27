# Blade Vale — Gear Overhaul Roadmap

> Status: **ACTIVE / Phase 1 Option 4.0 foundation**
>
> This roadmap temporarily takes priority over further Deep Survey expansion. The reason is simple: high-difficulty content is more valuable after the loot loop itself becomes the main attraction.

## Core philosophy

### No Single Correct Build

Blade Vale must support both of these equally legitimate routes:

1. **Build route** — understand mechanics, combine job/weapon/affix synergies, and clear content earlier with lower raw stats.
2. **Brute-force route** — keep farming, feed duplicate options, raise Option Lv, stack raw offense/defense/sustain, and eventually win through accumulated power.

The second route is intentional, not an exploit.

> **「知らん、火力と耐久で押し切る」も正しい攻略法。**

Design consequence: high-difficulty mechanics should normally be **soft checks**, not hard gates. Counterplay should make fights dramatically easier, but extreme investment should still be able to overpower most encounters.

## Permanent Gear rules

1. Random options are capped at **3 per item**.
2. Named / Unique fixed effects are **separate from the 3 random option slots**.
3. Option rarity remains a separate axis from equipment rarity.
4. Option rarity remains seven tiers: `common / uncommon / rare / epic / legendary / mythic / ancient`.
5. Options gain persistent **Option Lv 1–100**.
6. Higher option rarity means a stronger Lv1 baseline and stronger per-level growth.
7. The same option family can be fed from unwanted weapon/armor/accessory drops to gain Option EXP.
8. Do not add a new currency for Option leveling. The consumed equipment itself is the material.
9. Low-rarity duplicate options must remain useful as reduced-efficiency EXP material for the same family.
10. Higher rarity must still matter as a drop. Option leveling does **not** automatically promote rarity.
11. A session without a jackpot drop should still create deterministic progress through Option EXP.
12. Existing Lv cap 99,999 and Item Power cap 10,000 remain unchanged.
13. Preserve save compatibility where practical; migrations must be explicit and tested.
14. Do not add a new Home button, parallel inventory, daily/weekly loop, or FOMO system.

## Target item model

```text
Equipment Base
  - equipment rarity
  - Item Power
  - base stats
  - weapon family / archetype when applicable

Fixed Identity (Named / Unique only)
  - fixed effect(s)

Random OPTION (max 3)
  - option family
  - option rarity
  - Option Lv 1–100
  - resulting effect value
```

Example:

```text
神話・断界の大剣 +146
固有: Finisher時にDEFの一部を無視

OPTION
- 覇力 Lv63   ATK +xx%
- 神眼 Lv41   Crit +xx%
- 吸命 Lv72   Lifesteal +xx%
```

## Option rarity identity

The option name should communicate rarity instead of merely appending a color label.

Example family — ATK%:

| Option rarity | Example display name | Meaning |
|---|---|---|
| Common | 怪力 | basic raw offense |
| Uncommon | 剛力 | stronger raw offense |
| Rare | 豪腕 | advanced raw offense |
| Epic | 鬼力 | high-tier raw offense |
| Legendary | 覇力 | endgame offense |
| Mythic | 神力 | extreme offense |
| Ancient | 天威 | chase-tier offense |

Exact names and values are authored per family during Option 4.0 implementation. The important rule is that rarity is mechanically meaningful: higher rarity starts stronger and scales harder per Option Lv.

## Option Lv 1–100

Target progression bands:

- Lv1–20: fast / ordinary play
- Lv21–40: normal investment
- Lv41–60: committed farming
- Lv61–80: endgame farming
- Lv81–100: extreme mastery / brute-force route

Milestone feedback is planned at Lv25 / 50 / 75 / 100. Milestones should be noticeable but must not make Lv100 mandatory for intended-build clears.

### Balance target

- A well-matched build should normally clear authored high difficulty with roughly mid-level options.
- A poorly matched but heavily invested build should still be able to clear by pushing important options toward Lv80–100.
- Knowledge saves time; time can compensate for imperfect knowledge.

## Fusion / Option EXP

Preferred rule:

- Consume equipment containing the **same option family**.
- Matching family grants Option EXP to the selected option.
- Same/higher rarity material is more efficient; lower rarity remains useful at reduced efficiency.
- Material item's unrelated options are lost with the item.
- Option rarity does not automatically upgrade through EXP.
- Option Lv caps at 100.

Initial efficiency target to tune later:

| Material rarity gap | EXP efficiency |
|---|---:|
| same / higher | 100% |
| -1 tier | 80% |
| -2 tiers | 60% |
| -3 tiers | 40% |
| -4 or worse | 20% |

Exact EXP curve is deliberately deferred until current drop density and inventory flow are measured.

## Existing-system consolidation

Equipment 3.0 already contains Item Power, Affix rarity, weapon archetypes, armor/accessory Affixes, Greater Affix, Legendary/Curse packages, Temper, Smart Loot and crafting.

The overhaul must **reuse and simplify**, not stack another independent layer on top.

### Keep

- Item Power 1–10,000
- equipment rarity
- seven option rarities
- existing combat effect plumbing
- slot-biased option pools
- weapon archetype identities
- Named / Unique fixed effects
- Smart Loot concept

### Convert / review

- current 4–5 Affix endgame counts -> max 3
- random roll width -> largely absorbed into rarity + Option Lv
- Greater Affix -> redesign/merge with new Option progression instead of keeping an extra opaque multiplier axis
- Temper -> redefine around the new Option model or retire if redundant
- current Affix naming -> option-family rarity names
- current weapon-only Smart Loot details -> all equipment slots

### Preserve separately unless explicitly redesigned

- Legendary Effect package
- Curse package
- Unique fixed identity

These are fixed/special identity layers, not ordinary random Option slots.

## Weapon expansion rule

Do **not** add a new mastery weapon family merely because a fantasy weapon sounds cool.

A candidate new weapon family must pass all of these:

1. Multiple jobs can plausibly use it.
2. It has a gameplay identity not already covered by an existing family/archetype.
3. It supports distinct option weighting.
4. It has room for Named/Unique items.
5. It does not invalidate old mastery/save assumptions.

Current Equipment 3.0 already provides 24 sub-archetypes across the 8 mastery families, including 大剣 / 刀 / 魔導書 / 双短剣 / 弩 / 大斧 etc. These must be audited before adding any ninth mastery family.

## Implementation checkpoint — 2026-08-27

Merged foundation work:

- PR #229 — audit/docs + Option 4.0 compatibility foundation + Fusion `weapons[]` metadata + armor/accessory max-3 Options
- PR #230 — new weapon drops normalized to max 3 Options while legacy saved 4–5 Affix weapons remain untouched
- PR #231 — new weapon/armor/accessory Options persist `familyId / rarity / level / xp`; existing `roll` remains authoritative during migration

Current live data contract for **new drops**:

```text
optionSchemaVersion: 1
familyId: stable Affix/Option family ID
rarity: common..ancient
level: 1 (Phase 1 bridge default)
xp: 0
roll: existing combat value, still authoritative for now
```

This is deliberately staged. The next Phase 1 step is to replace raw roll-band authority with authored **rarity + Option Lv value curves**, then define drop-time starting Option Lv ranges before Option Fusion is enabled.

## Work phases

### Phase 0A — System inventory ✅

Document the live gear architecture and overlapping systems.

Confirmed:
- 8 mastery weapon families
- 24 weapon archetypes
- 15 basic jobs
- 105 Fusion Jobs
- 77 current Affixes
- armor/accessory Affix generation already exists
- seven Affix rarities already exist
- existing Item Power / Greater / Legendary / Curse / Temper / Smart Loot layers exist

### Phase 0B — Affix audit 🔄

First-pass family audit is documented in `GEAR_OVERHAUL_AUDIT.md`. Exact 77-ID migration/value-curve mapping remains in progress.

Classification vocabulary:
- KEEP
- RENAME
- MERGE
- RARE-LOCK
- BUILD
- REVIEW

### Phase 0C — Weapon × Job audit ✅

Audit completed in `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`.

Key result:
- current 8 mastery families / 24 archetypes are sufficient for now
- no new mastery family is justified yet
- generated Fusion jobs previously inherited only the first canonical parent weapon
- compatibility foundation now exposes all parent affinities through `job.weapons[]` while retaining legacy `job.weapon`

New mastery families remain gated until this model is fully consumed by affinity/UI callers.

### Phase 1 — Option 4.0 foundation 🔄

Completed:
- max 3 random Options on new weapon/armor/accessory drops
- Option family metadata
- seven-rarity compatibility
- Lv1–100 schema bounds
- `familyId / level / xp` persisted on new drops
- old `roll` retained as compatibility combat value
- legacy saved weapon Affixes are not destructively trimmed

Remaining:
- exact 77-family migration table
- authored rarity display-name ladders beyond the ATK example
- curve classes per family
- rarity + Option Lv -> authoritative value calculation
- drop-time starting Option Lv distribution by source/IP
- explicit migration policy for old saved options if/when value authority moves

No fusion UI yet; first make drops and application stable.

### Phase 2 — Option Fusion

Implement equipment-as-material Option EXP:
- select target item/option
- consume unwanted item with matching family
- gain EXP
- level up deterministically
- no new currency
- lock/favorite protection required

### Phase 3 — Existing-system consolidation

Resolve overlap with:
- Greater Affix
- Temper
- random roll width
- reroll
- Legendary/Curse packages

Goal: fewer axes, deeper decisions.

### Phase 4 — Equipment UI 3.x

Move toward compact inventory + selected-item detail layout.

Required readability:
- base stats
- fixed Unique effect
- exactly up to 3 Option rows
- rarity-colored option name + Lv
- current-equipped delta
- compact build tags
- lock / equip / material protection
- mobile first; avoid long-scroll regressions

### Phase 5 — Smart Loot 4.0

Extend filter/auto-lock to all equipment slots and new Option data:
- option family query
- minimum option rarity
- minimum Option Lv
- 3-option synergy filters where useful
- preserve valuable fusion materials

### Phase 6 — Weapon Identity audit/upgrade

Strengthen the existing 24 archetypes before adding families.

### Phase 7 — Weapon Expansion decision

Only add new mastery weapon families that pass the audit. Candidate ideas are not commitments.

### Phase 8 — Unique 2.0

Standardize:
- fixed Unique effect(s)
- up to 3 random Options
- repeated copies remain worth farming because their Option package differs

### Phase 9 — Loot distribution / endgame return

Use the finished gear loop to give Abyss / Rift / Nemesis / Secret Realm / Deep Survey distinctive farming purposes without adding currencies.

Then resume Deep Survey Survey Conditions / Convergence Apex development.

## AI handoff

Any ChatGPT / Claude Code session working on Gear Overhaul must read:

1. `ROADMAP.md`
2. `GEAR_OVERHAUL_ROADMAP.md`
3. `GEAR_OVERHAUL_AUDIT.md`
4. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
5. `js/data/options4.js`
6. `js/data/affixes.js`
7. `js/data/equipment3.js`
8. `js/data/equipment3Gear.js`
9. `js/data/equipment3Archetypes.js`
10. `js/data/equipment3AffixQuality.js`
11. `js/data/equipment3Crafting.js`
12. `js/data/equipment3SmartLoot.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity by leveling, or add weapon families before the documented weapon/job/archetype gate is deliberately revisited.
