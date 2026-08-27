# Blade Vale — Gear Overhaul Roadmap

> Status: **ACTIVE / Phase 2C Option Fusion closeout**
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

Example ATK ladder:

`怪力 → 剛力 → 豪腕 → 鬼力 → 覇力 → 神力 → 天威`

All canonical families have authored rarity-name ladders and Lv curves.

## Option Lv / Fusion identity

Progression bands:

- Lv1–20: fast / ordinary play
- Lv21–40: normal investment
- Lv41–60: committed farming
- Lv61–80: endgame farming
- Lv81–100: extreme mastery / brute-force route

Visible checkpoints are Lv25 / 50 / 75 / 100. Lv100 displays **MASTER** and remains a chase target, not an intended-build requirement.

Full Fusion specification and tuning notes: `GEAR_OVERHAUL_PHASE2_FUSION.md`.

## Fusion / Option EXP

Implemented rules:

- select a target item and target Option
- consume another equipment instance containing the same canonical Option family
- material rarity and material Lv affect EXP yield
- rarity-gap efficiency remains 100 / 80 / 60 / 40 / 20%
- unrelated Options on the consumed material are lost
- rarity never auto-upgrades through Fusion
- Lv caps at 100
- locked / favorite / equipped / same-item material is blocked
- Fusion remains inside the existing Equipment screen
- no new currency / Home button / parallel inventory

Phase 2C tuning keeps the nonlinear ~62k total Lv1→100 EXP curve but increases material EXP so matching drops create visible progress even with a large Option family pool.

Smart Loot now protects especially valuable Fusion material by default: **Ancient Option or Option Lv80+**, including armor/accessory instances. Ordinary mid-tier materials remain available for continuous feeding.

## Existing-system consolidation

Equipment 3.0 still contains Item Power, Option rarity, weapon archetypes, Greater, Legendary/Curse, Temper, reroll, Smart Loot and crafting.

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

### Phase 3 review targets

- Greater — decide whether it remains a useful independent axis
- Temper — redefine around Option 4.0 or retire if redundant
- random roll width — largely absorbed by rarity + Option Lv
- reroll — keep only if it adds a distinct decision
- Legendary/Curse — preserve as special identity packages unless deliberately redesigned

## Weapon expansion rule

Do **not** add a ninth mastery family merely because a fantasy weapon sounds cool.

A candidate family must pass all of these:

1. Multiple jobs can plausibly use it.
2. It has a gameplay identity not already covered by an existing family/archetype.
3. It supports distinct Option weighting.
4. It has room for Named/Unique items.
5. It does not invalidate old mastery/save assumptions.

Current Equipment 3.0 already provides 24 sub-archetypes across 8 mastery families, including 大剣 / 刀 / 魔導書 / 双短剣 / 弩 / 大斧. Strengthen those first.

## Implementation checkpoint — 2026-08-27

Merged:

- PR #229 — audit/docs + Option 4.0 compatibility + Fusion `weapons[]` metadata + armor/accessory max-3 Options
- PR #230 — weapon drops normalized to max 3 Options; legacy saved 4–5 Affix weapons untouched
- PR #231 — `familyId / rarity / level / xp` persistence
- PR #234 — **Phase 1 complete**: all canonical families get rarity identity, Lv1–100 curves, rarity floors and authoritative rarity+Lv values
- PR #235 — **Phase 2A complete**: deterministic Option EXP core/runtime and protected equipment consumption
- PR #236 — **Phase 2B complete**: inline Equipment-screen Option Fusion UI

Current Phase 2C branch adds:

- material EXP tuning against the real large family pool
- Lv25 / 50 / 75 / 100 milestone reporting and MASTER feedback
- next-milestone progress in Equipment UI
- Smart Loot protection for Ancient / Lv80+ Fusion materials across equipment slots
- regression tests for the tuning contract
- `GEAR_OVERHAUL_PHASE2_FUSION.md` handoff document

## Work phases

### Phase 0A — System inventory ✅

Confirmed 8 mastery weapon families, 24 archetypes, 15 basic jobs, 105 Fusion Jobs, legacy Affix catalog, armor/accessory random Options, seven Option rarities and overlapping Equipment 3.0 systems.

### Phase 0B — Affix / Option audit ✅

Migration and consolidation are documented in `GEAR_OVERHAUL_AUDIT.md` and `GEAR_OVERHAUL_OPTION_CATALOG.md`. Legacy duplicate IDs remain readable through canonical `familyId` aliases.

### Phase 0C — Weapon × Job audit ✅

Documented in `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`. Current 8 families / 24 archetypes are sufficient for now; Fusion jobs expose parent affinities through `job.weapons[]` while retaining legacy `job.weapon`.

### Phase 1 — Option 4.0 ✅

Completed:
- max 3 random Options
- seven rarity identities
- source/IP starting Lv
- authored family curves and rarity floors
- rarity + Option Lv authoritative values
- `<rarity-authored name> LvXX` presentation
- legacy save compatibility

### Phase 2 — Option Fusion 🔄 CLOSEOUT

#### 2A Core/runtime ✅
Deterministic EXP, rarity-gap efficiency, alias-aware matching, Lv100 cap, equipment consumption and protection.

#### 2B Equipment UI ✅
Inline `OPTION育成`, target selection, material preview, destructive confirmation and immediate rerender.

#### 2C Tuning / UX 🔄
Current work:
- material EXP tuned upward while preserving long Lv80–100 mastery
- milestone feedback at 25 / 50 / 75 / 100
- Smart Loot valuable-material protection
- test and CI closeout

After green CI + merge, **Phase 2 is complete** and Phase 3 becomes active.

### Phase 3 — Existing-system consolidation

Resolve overlap with Greater / Temper / random roll width / reroll / Legendary/Curse. Goal: fewer axes, deeper decisions.

### Phase 4 — Equipment UI 3.x

Move toward compact list + selected-item detail layout with base stats, fixed effect, up to 3 Option rows, Option Lv/EXP, equipped delta, build tags and nearby actions.

### Phase 5 — Smart Loot 4.0

Expand player-facing filtering around Option family / rarity / Lv / synergy while preserving useful Fusion materials.

### Phase 6 — Weapon Identity audit/upgrade

Strengthen the existing 24 archetypes first.

### Phase 7 — Weapon Expansion decision

Only add mastery families that pass the documented gate.

### Phase 8 — Unique 2.0

Fixed Unique identity + up to 3 random Options; duplicate copies remain worth farming.

### Phase 9 — Loot distribution / endgame return

Give Abyss / Rift / Nemesis / Secret Realm / Deep Survey distinct farming purposes without new currencies, then resume Deep Survey expansion.

## AI handoff

Read before continuing:

1. `ROADMAP.md`
2. `GEAR_OVERHAUL_ROADMAP.md`
3. `GEAR_OVERHAUL_AUDIT.md`
4. `GEAR_OVERHAUL_OPTION_CATALOG.md`
5. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
6. `GEAR_OVERHAUL_PHASE2_FUSION.md`
7. `js/data/options4.js`
8. `js/data/options4Fusion.js`
9. `js/data/equipment3SmartLoot.js`
10. `js/patches/options4Fusion.js`
11. `js/screens/equipmentFusion.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity by leveling, or add weapon families before the documented gate is deliberately revisited.
