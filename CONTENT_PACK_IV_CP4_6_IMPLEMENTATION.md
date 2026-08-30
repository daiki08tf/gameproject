# Content Pack IV — CP4-6 Implementation Record

Status: **IMPLEMENTED — Rewards / Identity**

## Purpose

CP4-6 gives the first observed Branch anchor a tangible identity reward without turning Branch Sight into a combat progression system and without handing out mature Branch technology before traversal exists.

## Prerequisite

The only authored prerequisite is the existing discovery:

- `cp4:branch-anchor:tree-sovereign`

No level, difficulty, World Tier, gear score, RNG, side-system completion or equipment requirement is added.

## Reward

**視差残響章** (`uq_cp4_parallax_echo_emblem`)

- slot: existing `accessory`
- rarity: existing `mythic`
- authority: existing Unique Equipment registry / `state.addItem()` inventory pipeline
- fixed existing effect kind: `actionDiversityBuff`
- no random Option generation
- no fourth Option
- no Item Power override

The item is explicitly a **Prime-side keepsake**. It is formed from observation residue left after Parallax Core synchronization and is not equipment manufactured in `王樹領`.

This preserves the Observed Branches roadmap boundary: mature Branch-specific technology gear begins only after actual Branch traversal exists.

## Grant semantics

`js/patches/contentPackIVF.js` registers the authored item into the live existing `BOUNTY_UNIQUES` list so `equipment.js` continues to resolve it through `bountyUniqueById()` and `allItems()`.

`syncCP4IdentityReward()`:

1. checks `cp4:branch-anchor:tree-sovereign`,
2. exits if `cp4:reward:parallax-echo-emblem` is already recorded,
3. checks existing inventory/equipped slots to avoid duplicate recovery grants,
4. calls the existing `state.addItem()` pipeline only when the item is not already owned,
5. records the one-time reward under existing `world2.discoveries`,
6. saves through existing state authority.

The sync runs on load for older saves and is also called immediately after the CP4-4 anchor observation so the current session receives the reward without requiring a reload.

## Progression contract

The reward record explicitly carries:

- `progressionGate:false`
- `mandatoryEquipment:false`
- `branchTechnology:false`

Owning, equipping, selling or otherwise interacting with `視差残響章` cannot activate Branch Sight, reveal a Branch, or gate CP4-7 / Observed Branches progression.

## Guardrails

- No Branch rarity.
- No multiverse token/currency.
- No new save root.
- No Branch XP, level, skill tree or stamina.
- No fourth Option.
- No Item Power cap override or Item Power above 10,000.
- No mandatory Branch Sight weapon.
- No Branch Sight combat stat.
- No mature `王樹領` technology gear before traversal.
- `深緑消失域` remains hidden.
- Total Branch count remains hidden.
- No Transcendent / Japan / Tokyo / Earth reveal.

## Handoff

CP4-7 owns the final integration audit and handoff to `OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md` M0–M4.
