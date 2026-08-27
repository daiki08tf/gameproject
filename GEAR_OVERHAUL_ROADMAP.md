# Blade Vale — Gear Overhaul Roadmap

> Status: **ACTIVE / Phase 2 Option Fusion**
>
> Gear Overhaul continues to take priority over further Deep Survey expansion. High-difficulty content becomes more valuable after the loot loop itself is worth farming.

## Core philosophy

### No Single Correct Build

Blade Vale must support two equally valid routes:

1. **Build route** — understand mechanics, combine job / weapon / Option synergies, and clear content earlier with lower raw stats.
2. **Brute-force route** — keep farming, feed duplicate Options, raise Option Lv, stack offense / defense / sustain, and eventually overpower most encounters.

> **「知らん、火力と耐久で押し切る」も正しい攻略法。**

High-difficulty mechanics should therefore be soft checks rather than hard build gates wherever possible.

## Permanent Gear rules

1. Random Options are capped at **3 per item**.
2. Named / Unique fixed effects are **separate from the 3 random Option slots**.
3. Option rarity is separate from equipment rarity.
4. Option rarity remains seven tiers: `common / uncommon / rare / epic / legendary / mythic / ancient`.
5. Options have persistent **Option Lv 1–100**.
6. Higher Option rarity means a stronger baseline and stronger per-level growth.
7. Same-family Options on unwanted equipment can be consumed for Option EXP.
8. Option leveling uses **no new currency**. The consumed equipment itself is the material.
9. Low-rarity same-family materials remain useful at reduced efficiency.
10. Option leveling does **not** promote rarity.
11. A session without a jackpot drop should still create deterministic progress through Option EXP.
12. Character Lv cap remains 99,999 and Item Power cap remains 10,000.
13. Existing saves must not be destructively rerolled or trimmed during migration.
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
  - Option EXP
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

Rarity is communicated through the Option name itself rather than only a label/color.

Example family — ATK%:

| Option rarity | Display name |
|---|---|
| Common | 怪力 |
| Uncommon | 剛力 |
| Rare | 豪腕 |
| Epic | 鬼力 |
| Legendary | 覇力 |
| Mythic | 神力 |
| Ancient | 天威 |

All canonical families now have authored rarity-name ladders and Lv curves.

## Option Lv 1–100

Progression bands:

- Lv1–20: fast / ordinary play
- Lv21–40: normal investment
- Lv41–60: committed farming
- Lv61–80: endgame farming
- Lv81–100: extreme mastery / brute-force route

Milestone bonuses exist at Lv25 / 50 / 75 / 100. Lv100 is a chase target, not a requirement for intended-build clears.

## Fusion / Option EXP

Implemented rule:

- Select a target item and target Option.
- Consume another equipment instance containing the **same canonical Option family**.
- Matching material grants deterministic Option EXP.
- Material Option rarity and material Option Lv affect EXP yield.
- Same/higher rarity uses full efficiency; lower rarity remains useful.
- Material item's unrelated Options are lost with the item.
- Option rarity never auto-upgrades through Fusion.
- Option Lv hard-caps at 100.
- Locked, favorite, equipped, same-item, and invalid materials are blocked.
- Material candidates are sorted by useful EXP and UI only shows a compact top slice.

Efficiency table:

| Material rarity gap | EXP efficiency |
|---|---:|
| same / higher | 100% |
| -1 tier | 80% |
| -2 tiers | 60% |
| -3 tiers | 40% |
| -4 or worse | 20% |

Current EXP curve lives in `js/data/options4Fusion.js` and should be tuned later against real drop density rather than replaced with a second progression system.

## Existing-system consolidation

Equipment 3.0 already contains Item Power, Option/Affix rarity, weapon archetypes, armor/accessory Options, Greater, Legendary/Curse packages, Temper, Smart Loot and crafting.

The overhaul must **reuse and simplify**, not stack another independent layer.

### Keep

- Item Power 1–10,000
- equipment rarity
- seven Option rarities
- existing combat effect plumbing
- slot-biased Option pools
- weapon archetype identities
- Named / Unique fixed effects
- Smart Loot concept

### Convert / review

- old 4–5 random Affix endgame counts -> max 3 new Options
- random roll width -> rarity + Option Lv authority
- Greater -> review whether it remains a useful separate axis
- Temper -> redefine around the new Option model or retire if redundant
- old Affix wording -> Option wording
- weapon-centric Smart Loot -> all equipment slots

### Preserve separately unless explicitly redesigned

- Legendary Effect package
- Curse package
- Unique fixed identity

These are special identity layers, not ordinary random Option slots.

## Weapon expansion rule

Do **not** add a ninth mastery family only because a fantasy weapon sounds cool.

A candidate family must pass all of these:

1. Multiple jobs can plausibly use it.
2. It has a gameplay identity not already covered by an existing family/archetype.
3. It supports distinct Option weighting.
4. It has room for Named/Unique items.
5. It does not invalidate old mastery/save assumptions.

Current Equipment 3.0 already provides 24 sub-archetypes across 8 mastery families, including 大剣 / 刀 / 魔導書 / 双短剣 / 弩 / 大斧. Strengthen those first.

## Implementation checkpoint — 2026-08-27

Merged foundation work:

- PR #229 — audit/docs + Option 4.0 compatibility foundation + Fusion `weapons[]` metadata + armor/accessory max-3 Options
- PR #230 — new weapon drops normalized to max 3 Options while legacy saved 4–5 Affix weapons remain untouched
- PR #231 — new weapon/armor/accessory Options persist `familyId / rarity / level / xp`
- PR #234 — **Phase 1 complete**: all canonical Option families receive rarity identity, Lv1–100 curves, rarity floors, canonical family aliases and authoritative rarity+Lv values
- PR #235 — **Phase 2A complete**: deterministic Option EXP core/runtime, equipment-as-material consumption, Lv100 cap, alias-aware family matching, lock/favorite/equipped protection

Current new-drop Option contract:

```text
optionSchemaVersion: 1
familyId: canonical Option family ID
rarity: common..ancient
level: source/IP-derived starting Lv
xp: persistent Option EXP progress
roll: derived from rarity + Option Lv for authored families
optionValueVersion: 2
```

Phase 2B adds the usable Equipment-screen Fusion flow without a new screen or Home route.

## Work phases

### Phase 0A — System inventory ✅

Confirmed:
- 8 mastery weapon families
- 24 weapon archetypes
- 15 basic jobs
- 105 Fusion Jobs
- 77 legacy Affix IDs feeding the canonical Option catalog
- armor/accessory random Option generation
- seven Option rarities
- Item Power / Greater / Legendary / Curse / Temper / Smart Loot layers

### Phase 0B — Affix / Option audit ✅

Migration and consolidation are documented in `GEAR_OVERHAUL_AUDIT.md` and `GEAR_OVERHAUL_OPTION_CATALOG.md`.

Duplicate concepts are preserved by old ID but grouped through canonical `familyId` aliases instead of destructive save migration.

### Phase 0C — Weapon × Job audit ✅

Audit completed in `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`.

Key result:
- current 8 mastery families / 24 archetypes are sufficient for now
- no new mastery family is justified yet
- Fusion jobs preserve all parent affinities through `job.weapons[]` while keeping legacy `job.weapon`

### Phase 1 — Option 4.0 foundation ✅

Completed:
- max 3 random Options on new weapon/armor/accessory drops
- stable family metadata and aliases
- seven rarity identities
- Lv1–100 schema and source/IP starting Lv
- authored value curves for canonical families
- rarity floors for unusual utility / trigger / build families
- rarity + Option Lv authoritative combat values
- generated/presentation naming as `<rarity-authored name> LvXX`
- old save IDs preserved; legacy saved gear is not rerolled or trimmed

### Phase 2 — Option Fusion 🔄 ACTIVE

#### Phase 2A — Core/runtime ✅

Completed:
- `optionXpToNext()` progression
- material EXP based on family / rarity / material Lv
- 100/80/60/40/20% rarity-gap efficiency
- same-family alias matching
- deterministic level-up and roll recalculation
- Lv100 hard cap
- equipment instance consumption
- lock / favorite / equipped / same-item protection
- no new currency / save root

#### Phase 2B — Equipment UI 🔄

Current target:
- inline `OPTION育成` disclosure on existing equipment rows
- target Option selection
- compact matching-material list
- EXP preview / efficiency display
- explicit destructive-use confirmation
- rerender target level/value after Fusion
- no separate Fusion inventory or Home button

#### Phase 2C — Tuning / UX closeout

After UI is stable:
- tune XP curve using real drop density
- add clearer milestone feedback at Lv25/50/75/100 if needed
- verify high-IP unwanted drops remain valuable without trivializing Lv100
- verify Smart Loot does not accidentally hide desirable Fusion material

### Phase 3 — Existing-system consolidation

Resolve overlap with:
- Greater Affix
- Temper
- random roll width
- reroll
- Legendary/Curse packages

Goal: fewer axes, deeper decisions.

### Phase 4 — Equipment UI 3.x

Move toward the compact list + selected-item detail layout.

Required readability:
- base stats
- fixed Unique effect
- up to 3 Option rows
- rarity-colored Option name + Lv
- Option EXP progress
- current-equipped delta
- compact build tags
- lock / equip / material protection
- mobile first; avoid long-scroll regressions

### Phase 5 — Smart Loot 4.0

Extend filter/auto-lock to all equipment slots and new Option data:
- Option family query
- minimum Option rarity
- minimum Option Lv
- synergy filters where useful
- preserve valuable Fusion materials

### Phase 6 — Weapon Identity audit/upgrade

Strengthen the existing 24 archetypes before adding mastery families.

### Phase 7 — Weapon Expansion decision

Only add new mastery weapon families that pass the documented gate.

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
4. `GEAR_OVERHAUL_OPTION_CATALOG.md`
5. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
6. `js/data/options4.js`
7. `js/data/options4Fusion.js`
8. `js/data/affixes.js`
9. `js/data/equipment3.js`
10. `js/data/equipment3Gear.js`
11. `js/data/equipment3Archetypes.js`
12. `js/data/equipment3AffixQuality.js`
13. `js/data/equipment3Crafting.js`
14. `js/data/equipment3SmartLoot.js`
15. `js/patches/options4Fusion.js`
16. `js/screens/equipmentFusion.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity by leveling, or add weapon families before the documented weapon/job/archetype gate is deliberately revisited.
