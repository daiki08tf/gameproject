# Blade Vale — Observed Branches M0 Authority Audit

> Status: **COMPLETE — READY FOR M1 BRANCH DATA MODEL**
>
> Baseline: `59a97ce51532f115b7c65da2ed9d909a1ce63d96` (`main`, Content Pack IV complete)
>
> Scope: authority/foundation audit only. M0 adds no Branch traversal, battle, reward, currency, save root, Home entry, or player-facing Branch runtime.

## Purpose

M0 fixes the ownership boundaries that Observed Branches M1+ must extend. The system remains a horizontal extension of existing World / Story / Secret Realm / Gear / Codex authorities rather than a parallel game mode.

## Authority matrix

| Audit area | Existing authority / extension point | M1+ rule |
| --- | --- | --- |
| World 4 Region authority | `js/data/adventureWorld4Regions.js`, existing Adventure/Region presentation, and the CP4 Chapter 2 Region anchor in `js/patches/contentPackIVD.js` | A Branch references a Prime Region and extends that Region context. Do not add a top-level Home mode. |
| Story / CHAPTERS authority | `js/data/chapters.js`, chapter extension files, `js/data/stages.js`, and persistent `stageProgress` in `js/state.js` | Prime Story remains authoritative. Branch definitions may reference Story facts/regions but cannot gate or rewrite Ch1–35 progression. |
| Secret Realm / Deep Survey routing | `js/data/secretRealms.js`, `js/data/secretRealmExpansion.js`, `js/data/postCp3DeepSurvey.js`, `js/data/postCp3SurveyConditions.js` | Reuse existing routing/eligibility concepts where Branch content needs secret or survey-style access. Do not create a second portal/energy/stamina router. |
| World Tier derived state | `js/data/worldTiers.js` and existing persisted `worldTierId` ownership | World Tier remains pressure/difficulty inside the selected history. It never selects, discovers, or reveals a Branch. |
| Discovery / Codex / Chronicle ownership | CP4 discovery state under existing `world2.discoveries`; `js/data/codex.js`; `js/data/settlementChronicle.js`; CP4 horizontal reactions | Discovery owns evidence/unlocks. Codex/Chronicle present discovered records only; they do not create a parallel Branch progression save root. |
| Equipment / Fixed Identity / Unique2 / Rune2 / Option4 | `js/data/equipment.js`, `js/data/equipmentFixedIdentity.js`, `js/data/unique2IdentityLibrary.js`, `js/data/uniqueEquipment.js`, `js/data/runes2.js`, `js/data/rune2SpecialRules.js`, `js/data/options4.js`; inventory mutation stays on `state.addItem()` | Branch Origin may be read-only metadata. Fixed identities/Unique2/Rune2/Option4 remain canonical. No Branch rarity, fourth random Option, Branch-only Option levels, second inventory, or Item Power override. |
| Enemy 2/3 variants | `js/data/enemies.js`, `js/data/regionalEnemies2.js`, `js/data/enemyRankVariants2.js`, `js/data/enemyAffinity2.js`, `js/data/enemyCombat3.js`, `js/data/enemy3*` behavior modules, `js/data/enemyCodex2Discovery.js` | Branch ecology is authored through existing species/role/behavior/encounter extension points. Do not create a second enemy database or duplicate Codex authority. |
| Save / migration ownership | `js/state.js` (`bladevale_save_v1`, `defaultSave()`, load-merge migration) plus existing nested system state such as `world2` | M1+ must extend existing nested ownership and migration patterns. No `branchSave`, Branch currency wallet, Branch level, Branch stamina/energy, or separate save key. |

## Confirmed reuse contracts

### Region and navigation

- A Branch is a variation of an existing Region context.
- The first known anchor is `観測分岐：王樹領`, attached to the familiar Chapter 2 / 深緑の森 context by CP4.
- CP4 intentionally leaves the anchor non-traversable; M0 does not change that.
- No new Home button is permitted.
- Unknown Branch identities and total count remain hidden until authored discovery conditions are satisfied.

### Story and discovery

- `stageProgress` remains the Prime Story clear-state authority.
- `CHAPTERS` / stage data remain the canonical Story/stage source.
- Existing `world2.discoveries` remains the narrative evidence/unlock location used by CP4 for contradictory records, Branch Sight, the first Branch anchor, and the CP4 reward record.
- Branch Sight remains a non-numeric, non-trainable, non-equippable, non-combat perception state.

### Secret Realm / Deep Survey / World Tier

- Secret Realm and Deep Survey remain existing horizontal/endgame systems; Observed Branches must not replace their routing or unlock state.
- World Tier remains derived pressure inside one history and is orthogonal to Branch identity/discovery.
- No mandatory Branch discovery may depend on World Tier, RNG, gear score, Unique ownership, Companion, Job, Rune, or equipment gate.

### Gear

The roadmap's permanent Gear contracts remain authoritative:

- max 3 random Options,
- existing Option rarity and Lv1–100 rules,
- existing Item Power cap,
- fixed/Unique identity separate from random Options,
- existing inventory,
- no Branch currency,
- no universal rarity above the existing rarity set.

CP4-6 already demonstrates the correct integration pattern: register through the existing Unique authority and grant through `state.addItem()` with deterministic, one-time, duplicate-safe discovery ownership.

### Enemy / Codex

- Branch ecology should compose existing regional enemy, rank/affinity, Enemy 3 behavior/AI, boss, and encounter foundations.
- Enemy/Codex differences must be authored consequences of the divergence, not palette swaps or a parallel enemy registry.
- Codex/Chronicle may record Prime Region, Branch name, divergence, consequences, technology profile, altered species and discovered Branch equipment only after discovery.

## Explicit non-goals for M0

M0 does **not** implement:

- a Branch data registry,
- Branch traversal,
- a Branch selector UI,
- 王樹領 stages/scenes/bosses,
- Branch loot or Origin metadata,
- Branch combat modifiers,
- a Branch currency/level/stamina/energy,
- daily/weekly rotation or FOMO,
- a new Home entry,
- a new save root or save key.

Those belong to later roadmap milestones and must stay on the authorities above.

## M1 handoff — Branch data model

M1 may now introduce authored, data-driven Branch definitions containing only the roadmap-approved descriptive/reference fields:

- Prime Region reference,
- Branch ID/name,
- divergence point,
- historical summary,
- technology profile,
- ecology profile,
- route/scene references,
- discovery conditions.

The Branch definition itself must contain **no combat or reward logic**. Discovery remains external authority, traversal remains external routing/presentation authority, and reward generation remains existing Gear/inventory authority.

## Acceptance

- [x] World 4 Region authority identified.
- [x] Story / CHAPTERS authority identified.
- [x] Secret Realm and Deep Survey routing identified.
- [x] World Tier ownership kept orthogonal to Branch selection.
- [x] Discovery / Codex / Chronicle ownership fixed.
- [x] Equipment / Fixed Identity / Unique2 / Rune2 / Option4 extension points fixed.
- [x] Enemy 2/3 variant extension points fixed.
- [x] Save / migration ownership fixed.
- [x] No M0 runtime feature or parallel progression system added.

**NEXT: M1 — Branch data model.**
